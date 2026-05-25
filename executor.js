/**
 * Arbitrage Executor - Executes flashloan arbitrage trades
 * 
 * This module handles the actual execution of arbitrage opportunities
 * found by the price monitor.
 */

import { ethers } from 'ethers';
import { config } from './config.js';
import { logger } from './utils/logger.js';

// Import AbiCoder for encoding parameters
const { AbiCoder } = ethers;

// Simplified ABI for the FlashloanArbitrage contract
const FLASHLOAN_ARBITRAGE_ABI = [
  'function executeArbitrage(address asset, uint256 amount, bytes calldata params) external',
  'function owner() view returns (address)',
  'event ArbitrageExecuted(address indexed token, uint256 amount, uint256 profit, address buyDex, address sellDex)',
];

class ArbitrageExecutor {
  constructor() {
    this.networkConfig = config.networks[config.network];
    this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);
    this.wallet = null;
    this.contract = null;
    this.contractAddress = process.env.FLASHLOAN_CONTRACT_ADDRESS;
  }

  async initialize() {
    logger.info(`Initializing Arbitrage Executor on ${config.network}...`);

    // Check for private key
    if (!process.env.PRIVATE_KEY) {
      logger.warn('No PRIVATE_KEY set. Running in simulation mode.');
      return false;
    }

    // Initialize wallet
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    const balance = await this.provider.getBalance(this.wallet.address);
    
    logger.info(`Wallet: ${this.wallet.address}`);
    logger.info(`Balance: ${ethers.formatEther(balance)} ${this.networkConfig.nativeCurrency}`);

    // Check if contract is deployed
    if (this.contractAddress) {
      try {
        this.contract = new ethers.Contract(
          this.contractAddress,
          FLASHLOAN_ARBITRAGE_ABI,
          this.wallet
        );
        
        // Verify contract owner
        const owner = await this.contract.owner();
        if (owner.toLowerCase() !== this.wallet.address.toLowerCase()) {
          logger.warn(`⚠️ Contract owner mismatch! Expected ${this.wallet.address}, got ${owner}`);
          logger.warn('You may not be able to execute trades.');
        } else {
          logger.info(`✅ Flashloan contract connected: ${this.contractAddress}`);
        }
      } catch (error) {
        logger.warn(`Could not connect to contract: ${error.message}`);
        logger.warn('Will run in simulation mode');
      }
    } else {
      logger.warn('⚠️ FLASHLOAN_CONTRACT_ADDRESS not set');
      logger.warn('Contract deployment required for real execution');
    }

    return true;
  }

  /**
   * Estimate gas cost for a transaction
   */
  async estimateGasCost() {
    const gasData = await this.provider.getFeeData();
    const gasPrice = gasData.gasPrice || gasData.maxFeePerGas || 0n;
    const estimatedGas = 300000n; // Approximate gas for flashloan + 2 swaps
    const gasCost = gasPrice * estimatedGas;
    
    return {
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      gasCostWei: gasCost,
      gasCostEth: ethers.formatEther(gasCost),
      gasData: gasData, // Keep full gas data for transaction
    };
  }

  /**
   * Check if an arbitrage opportunity is profitable after gas
   */
  async isProfitable(opportunity, flashloanAmount) {
    const gasCost = await this.estimateGasCost();
    
    // Calculate expected profit
    const profitPercent = parseFloat(opportunity.profitPercent);
    const flashloanFee = config.trading.flashloanFee * 100; // 0.09%
    
    const netProfitPercent = profitPercent - flashloanFee;
    const grossProfitUsd = (netProfitPercent / 100) * flashloanAmount;
    
    // Get current native token price (simplified - would use price oracle in production)
    const nativeTokenPrice = config.network === 'polygon' ? 0.8 : 2000; // MATIC ~$0.80, ETH ~$2000
    const gasCostUsd = parseFloat(gasCost.gasCostEth) * nativeTokenPrice;
    const netProfitUsd = grossProfitUsd - gasCostUsd;

    logger.info(`Profit Analysis:`);
    logger.info(`  Gross profit: ${profitPercent}%`);
    logger.info(`  Flashloan fee: ${flashloanFee}%`);
    logger.info(`  Net profit %: ${netProfitPercent.toFixed(4)}%`);
    logger.info(`  Gas cost: ~$${gasCostUsd.toFixed(4)}`);
    logger.info(`  Net profit USD: ~$${netProfitUsd.toFixed(4)}`);

    return netProfitUsd > config.trading.minProfitUsd;
  }

  /**
   * Execute an arbitrage trade
   */
  async executeArbitrage(opportunity) {
    if (!this.wallet) {
      logger.warn('No wallet configured. Running in simulation mode.');
      return {
        simulated: true,
        opportunity,
        timestamp: new Date().toISOString(),
        message: 'No PRIVATE_KEY set - would execute here',
      };
    }

    logger.info('='.repeat(60));
    logger.info('🚀 EXECUTING ARBITRAGE TRADE');
    logger.info('='.repeat(60));
    logger.info(`Token Pair: ${opportunity.tokenA} / ${opportunity.tokenB}`);
    logger.info(`Buy on: ${opportunity.buyDex}`);
    logger.info(`Sell on: ${opportunity.sellDex}`);
    logger.info(`Expected Profit: ${opportunity.profitPercent}%`);
    logger.info('='.repeat(60));

    try {
      // Step 1: Calculate flashloan amount
      const flashloanAmount = this.calculateOptimalFlashloanAmount(opportunity);
      logger.info(`Flashloan amount: $${flashloanAmount.toLocaleString()}`);

      // Step 2: Get current gas price
      const gasData = await this.provider.getFeeData();
      const currentGasPrice = gasData.gasPrice;
      logger.info(`Current gas price: ${ethers.formatUnits(currentGasPrice, 'gwei')} gwei`);

      // Step 3: Check if gas price is acceptable
      const maxGasPrice = ethers.parseUnits(config.trading.maxGasPriceGwei.toString(), 'gwei');
      if (currentGasPrice > maxGasPrice) {
        logger.warn(`Gas price too high: ${ethers.formatUnits(currentGasPrice, 'gwei')} gwei > ${config.trading.maxGasPriceGwei} gwei`);
        return {
          success: false,
          reason: 'Gas price too high',
          opportunity,
        };
      }

      // Step 4: Prepare transaction parameters
      const txParams = await this.prepareTransaction(opportunity, flashloanAmount);
      
      if (!txParams) {
        return {
          success: false,
          reason: 'Failed to prepare transaction',
          opportunity,
        };
      }

      // Step 5: Execute the transaction
      if (this.contract) {
        logger.info('📤 Sending transaction to blockchain...');
        
        try {
          // Execute the flashloan arbitrage
          const tx = await this.contract.executeArbitrage(
            txParams.asset,
            txParams.amount,
            txParams.params,
            {
              gasLimit: 500000n, // Adjust based on network
              maxFeePerGas: gasData.maxFeePerGas,
              maxPriorityFeePerGas: gasData.maxPriorityFeePerGas,
            }
          );
          
          logger.info(`Transaction sent: ${tx.hash}`);
          logger.info(`Waiting for confirmation...`);
          
          const receipt = await tx.wait();
          
          if (receipt.status === 1) {
            logger.info('✅ Transaction confirmed!');
            logger.info(`Block: ${receipt.blockNumber}`);
            logger.info(`Gas used: ${receipt.gasUsed.toString()}`);
            
            // Parse events to get profit
            const events = receipt.logs.filter(log => {
              try {
                const parsed = this.contract.interface.parseLog(log);
                return parsed.name === 'ArbitrageExecuted';
              } catch {
                return false;
              }
            });
            
            let profit = null;
            if (events.length > 0) {
              const parsed = this.contract.interface.parseLog(events[0]);
              profit = parsed.args.profit.toString();
              logger.info(`💰 Profit: ${ethers.formatEther(profit)} tokens`);
            }
            
            return {
              success: true,
              simulated: false,
              txHash: tx.hash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString(),
              profit: profit,
              opportunity,
              timestamp: new Date().toISOString(),
            };
          } else {
            logger.error('❌ Transaction failed!');
            return {
              success: false,
              reason: 'Transaction reverted',
              txHash: tx.hash,
              opportunity,
            };
          }
          
        } catch (error) {
          logger.error(`Transaction error: ${error.message}`);
          
          // Check for common errors
          if (error.message.includes('insufficient funds')) {
            logger.error('Insufficient funds for gas');
          } else if (error.message.includes('revert')) {
            logger.error('Transaction reverted - arbitrage may no longer be profitable');
          }
          
          return {
            success: false,
            error: error.message,
            opportunity,
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        // Simulation mode
        logger.info('⚠️ SIMULATION MODE: Transaction not actually sent');
        logger.info('To enable real execution:');
        logger.info('1. Deploy FlashloanExecutor.sol contract');
        logger.info('2. Add FLASHLOAN_CONTRACT_ADDRESS to .env');
        logger.info('3. Test with small amounts first!');
        
        return {
          simulated: true,
          success: true,
          opportunity,
          txParams,
          timestamp: new Date().toISOString(),
          message: 'Simulated execution - contract not deployed',
        };
      }

    } catch (error) {
      logger.error(`Execution error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        opportunity,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Calculate optimal flashloan amount based on opportunity
   */
  calculateOptimalFlashloanAmount(opportunity) {
    // Start with a base amount
    let amount = 10000; // $10,000 USD
    
    // Adjust based on profit percentage
    const profitPercent = parseFloat(opportunity.profitPercent);
    
    // Higher profit = can use larger amounts
    if (profitPercent > 1.0) {
      amount = 50000; // $50k for >1% profit
    } else if (profitPercent > 0.5) {
      amount = 20000; // $20k for >0.5% profit
    }
    
    return amount;
  }

  /**
   * Prepare transaction parameters for flashloan execution
   */
  async prepareTransaction(opportunity, flashloanAmount) {
    try {
      const tokenIn = config.tokens[config.network][opportunity.tokenA];
      const tokenOut = config.tokens[config.network][opportunity.tokenB];
      
      if (!tokenIn || !tokenOut) {
        logger.error(`Token addresses not found for ${opportunity.tokenA}/${opportunity.tokenB}`);
        return null;
      }

      // Get DEX router addresses
      const buyDexRouter = this.getDexRouter(opportunity.buyDex);
      const sellDexRouter = this.getDexRouter(opportunity.sellDex);
      
      if (!buyDexRouter || !sellDexRouter) {
        logger.error(`DEX router not found: ${opportunity.buyDex} or ${opportunity.sellDex}`);
        return null;
      }

      // Encode swap paths
      const buyPath = [tokenIn, tokenOut];
      const sellPath = [tokenOut, tokenIn];

      // Encode parameters for flashloan contract
      const abiCoder = AbiCoder.defaultAbiCoder();
      const params = abiCoder.encode(
        ['address', 'address', 'address[]', 'address[]'],
        [buyDexRouter, sellDexRouter, buyPath, sellPath]
      );

      // Convert amount to wei (assuming 18 decimals for now)
      const amountWei = ethers.parseEther(flashloanAmount.toString());

      return {
        asset: tokenIn,
        amount: amountWei,
        params: params,
        buyDex: buyDexRouter,
        sellDex: sellDexRouter,
      };

    } catch (error) {
      logger.error(`Error preparing transaction: ${error.message}`);
      return null;
    }
  }

  /**
   * Get DEX router address by name
   */
  getDexRouter(dexName) {
    const dexes = config.dexes[config.network];
    
    const routerMap = {
      'sushiswap': dexes.sushiswapRouter,
      'quickswap': dexes.quickswapRouter,
      'uniswap': dexes.uniswapV3Router,
      'camelot': dexes.camelotRouter,
    };

    return routerMap[dexName.toLowerCase()] || null;
  }

  /**
   * Using 1inch API for better routing (gasless option)
   */
  async get1inchQuote(tokenIn, tokenOut, amount) {
    const network = config.network === 'polygon' ? 137 : 42161;
    const url = `https://api.1inch.dev/swap/v5.2/${network}/quote?src=${tokenIn}&dst=${tokenOut}&amount=${amount}`;
    
    try {
      // Note: 1inch API requires authentication in production
      // This is a simplified example
      logger.info(`Fetching 1inch quote for ${amount} ${tokenIn} -> ${tokenOut}`);
      return null; // Would return quote data
    } catch (error) {
      logger.error(`1inch quote error: ${error.message}`);
      return null;
    }
  }
}

// Main execution
async function main() {
  const executor = new ArbitrageExecutor();
  const initialized = await executor.initialize();

  if (!initialized) {
    logger.info('Running in simulation mode - no real trades will be executed');
  }

  // Example: Check gas costs
  const gasCost = await executor.estimateGasCost();
  logger.info(`Current gas price: ${gasCost.gasPrice} gwei`);
  logger.info(`Estimated tx cost: ${gasCost.gasCostEth} ETH`);

  // Example opportunity (would come from price monitor)
  const exampleOpportunity = {
    tokenA: 'WETH',
    tokenB: 'USDC',
    profitPercent: '0.75',
    buyDex: 'sushiswap',
    sellDex: 'quickswap',
  };

  const profitable = await executor.isProfitable(exampleOpportunity, 10000);
  logger.info(`Is profitable: ${profitable}`);
}

main().catch(console.error);

export { ArbitrageExecutor };

