/**
 * Price Monitor - Watches for arbitrage opportunities across DEXs
 * 
 * This monitors price differences between decentralized exchanges
 * and alerts when profitable opportunities are found.
 */

import { ethers } from 'ethers';
import { config } from './config.js';
import { logger } from './utils/logger.js';

// Uniswap V3 Quoter ABI (simplified)
const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
];

// Uniswap V2 Router ABI (for SushiSwap, QuickSwap)
const ROUTER_V2_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
];

class PriceMonitor {
  constructor(executor = null) {
    this.networkConfig = config.networks[config.network];
    this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);
    this.tokens = config.tokens[config.network];
    this.dexes = config.dexes[config.network];
    this.opportunities = [];
    this.executor = executor; // Optional executor for auto-execution
    this.isExecuting = false; // Prevent concurrent executions
  }

  async initialize() {
    logger.info(`Initializing Price Monitor on ${config.network}...`);
    
    // Verify connection
    const blockNumber = await this.provider.getBlockNumber();
    logger.info(`Connected to ${config.network} at block ${blockNumber}`);

    // Initialize DEX contracts
    this.initializeContracts();
  }

  initializeContracts() {
    // SushiSwap Router (V2 style)
    if (this.dexes.sushiswapRouter) {
      this.sushiRouter = new ethers.Contract(
        this.dexes.sushiswapRouter,
        ROUTER_V2_ABI,
        this.provider
      );
    }

    // QuickSwap Router (Polygon)
    if (this.dexes.quickswapRouter) {
      this.quickswapRouter = new ethers.Contract(
        this.dexes.quickswapRouter,
        ROUTER_V2_ABI,
        this.provider
      );
    }

    logger.info('DEX contracts initialized');
  }

  /**
   * Get price from a V2-style DEX (SushiSwap, QuickSwap)
   */
  async getV2Price(router, tokenIn, tokenOut, amountIn) {
    try {
      const path = [tokenIn, tokenOut];
      const amounts = await router.getAmountsOut(amountIn, path);
      return amounts[1];
    } catch (error) {
      logger.debug(`V2 price fetch failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Compare prices across DEXs for a token pair
   */
  async comparePrices(tokenInSymbol, tokenOutSymbol, amountIn) {
    const tokenIn = this.tokens[tokenInSymbol];
    const tokenOut = this.tokens[tokenOutSymbol];

    if (!tokenIn || !tokenOut) {
      logger.warn(`Token not found: ${tokenInSymbol} or ${tokenOutSymbol}`);
      return null;
    }

    const prices = {};

    // Get SushiSwap price
    if (this.sushiRouter) {
      const sushiPrice = await this.getV2Price(this.sushiRouter, tokenIn, tokenOut, amountIn);
      if (sushiPrice) {
        prices.sushiswap = sushiPrice;
      }
    }

    // Get QuickSwap price (Polygon only)
    if (this.quickswapRouter) {
      const quickPrice = await this.getV2Price(this.quickswapRouter, tokenIn, tokenOut, amountIn);
      if (quickPrice) {
        prices.quickswap = quickPrice;
      }
    }

    return prices;
  }

  /**
   * Find arbitrage opportunities
   */
  async findArbitrageOpportunity(tokenA, tokenB, amountIn) {
    const prices = await this.comparePrices(tokenA, tokenB, amountIn);
    
    if (!prices || Object.keys(prices).length < 2) {
      return null;
    }

    const dexNames = Object.keys(prices);
    let bestBuy = { dex: null, price: BigInt(0) };
    let bestSell = { dex: null, price: BigInt(Number.MAX_SAFE_INTEGER) };

    // Find best buy (highest output) and best sell (lowest output)
    for (const dex of dexNames) {
      const price = prices[dex];
      if (price > bestBuy.price) {
        bestBuy = { dex, price };
      }
      if (price < bestSell.price) {
        bestSell = { dex, price };
      }
    }

    // Calculate potential profit (buy low on one DEX, sell high on another)
    // For arbitrage: we want to buy where price is lower, sell where price is higher
    const maxPrice = bestBuy.price;
    const minPrice = bestSell.price;
    
    // If we buy at minPrice and sell at maxPrice, that's our profit
    const priceDiff = maxPrice - minPrice;

    const profitPercent = Number(priceDiff) / Number(amountIn) * 100;

    if (profitPercent > config.monitoring.minPriceDifferencePercent) {
      return {
        tokenA,
        tokenB,
        amountIn: amountIn.toString(),
        prices: Object.fromEntries(
          Object.entries(prices).map(([k, v]) => [k, v.toString()])
        ),
        buyDex: bestBuy.dex,
        sellDex: bestSell.dex,
        buyPrice: bestBuy.price.toString(),
        sellPrice: bestSell.price.toString(),
        profitPercent: profitPercent.toFixed(4),
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  /**
   * Monitor prices continuously
   */
  async startMonitoring() {
    logger.info('Starting price monitoring...');
    logger.info(`Minimum profit threshold: ${config.trading.minProfitUsd} USD`);
    logger.info(`Checking every ${config.monitoring.priceCheckIntervalMs}ms`);

    // Token pairs to monitor
    const pairs = [
      ['WETH', 'USDC'],
      ['WMATIC', 'USDC'],
      ['WETH', 'USDT'],
      ['WBTC', 'WETH'],
      ['DAI', 'USDC'],
    ];

    // Amount to check (in wei - this would be the flashloan amount)
    // Use appropriate decimals based on token (18 for ETH/MATIC, 6 for USDC, etc.)
    // For now, using 1 token unit (will need to adjust per token pair)
    const testAmount = ethers.parseUnits('1000', 6); // 1000 USDC (6 decimals) as test amount

    const checkPrices = async () => {
      for (const [tokenA, tokenB] of pairs) {
        try {
          const opportunity = await this.findArbitrageOpportunity(tokenA, tokenB, testAmount);
          
          if (opportunity) {
            logger.info('🚨 ARBITRAGE OPPORTUNITY FOUND!');
            logger.info(JSON.stringify(opportunity, null, 2));
            this.opportunities.push(opportunity);
            
            // Auto-execute if executor is available
            if (this.executor && !this.isExecuting) {
              await this.handleOpportunity(opportunity);
            }
          }
        } catch (error) {
          logger.debug(`Error checking ${tokenA}/${tokenB}: ${error.message}`);
        }
      }
    };

    // Initial check
    await checkPrices();

    // Continuous monitoring
    setInterval(checkPrices, config.monitoring.priceCheckIntervalMs);

    logger.info('Price monitoring active. Press Ctrl+C to stop.');
  }

  /**
   * Handle a found opportunity - check profitability and execute
   */
  async handleOpportunity(opportunity) {
    if (this.isExecuting) {
      logger.debug('Already executing, skipping opportunity');
      return;
    }

    this.isExecuting = true;
    
    try {
      logger.info('📊 Analyzing opportunity for execution...');
      
      // Calculate flashloan amount (use a reasonable amount)
      const flashloanAmount = 10000; // $10,000 USD equivalent
      
      // Check if profitable after gas and fees
      const isProfitable = await this.executor.isProfitable(opportunity, flashloanAmount);
      
      if (isProfitable) {
        logger.info('✅ Opportunity is profitable! Executing arbitrage...');
        
        // Execute the arbitrage
        const result = await this.executor.executeArbitrage(opportunity);
        
        if (result && !result.simulated) {
          logger.info('🎉 Arbitrage executed successfully!');
          logger.info(`Profit: $${result.profit || 'calculated'}`);
        } else if (result && result.simulated) {
          logger.info('⚠️ Simulation mode - trade not actually executed');
        }
      } else {
        logger.info('❌ Opportunity not profitable after fees. Skipping.');
      }
    } catch (error) {
      logger.error(`Error handling opportunity: ${error.message}`);
    } finally {
      this.isExecuting = false;
    }
  }
}

// Run if called directly (monitor-only mode)
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PriceMonitor();
  await monitor.initialize();
  await monitor.startMonitoring();
}

export { PriceMonitor };

