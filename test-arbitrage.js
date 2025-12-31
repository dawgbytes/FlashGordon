/**
 * Flash Gordon - ROUND-TRIP Arbitrage Accuracy Test
 * 
 * This test verifies ACTUAL arbitrage profitability by:
 * 1. Buying token B on DEX A
 * 2. Selling token B on DEX B to get token A back
 * 3. Calculating if we end up with more than we started
 */

import { ethers } from 'ethers';
import { config } from './src/config.js';

const ROUTER_V2_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
];

async function testRoundTripArbitrage() {
  const networkConfig = config.networks[config.network];
  const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
  const tokens = config.tokens[config.network];
  const dexes = config.dexes[config.network];
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('FLASH GORDON - ROUND-TRIP ARBITRAGE TEST');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Network:', config.network);
  console.log('Gasless enabled:', config.gasless?.enabled);
  console.log('Min profit threshold: $' + config.trading.minProfitUsd);
  console.log('');
  console.log('This test simulates ACTUAL round-trip arbitrage:');
  console.log('  1. Start with Token A');
  console.log('  2. Buy Token B on one DEX');
  console.log('  3. Sell Token B on another DEX');
  console.log('  4. Check if we have more Token A than we started');
  console.log('');
  
  const sushiRouter = new ethers.Contract(dexes.sushiswapRouter, ROUTER_V2_ABI, provider);
  const quickRouter = new ethers.Contract(dexes.quickswapRouter, ROUTER_V2_ABI, provider);
  
  const dexList = [
    { name: 'SushiSwap', router: sushiRouter },
    { name: 'QuickSwap', router: quickRouter },
  ];
  
  // Test pairs: [tokenA, tokenB, amount, inputDecimals]
  const pairs = [
    ['USDC', 'WETH', '5000', 6],
    ['USDC', 'WMATIC', '5000', 6],
    ['WMATIC', 'USDC', '10000', 18],
    ['USDT', 'WETH', '5000', 6],
  ];
  
  // Token prices for USD calculation
  const tokenPrices = { 
    'WETH': 3400, 
    'WMATIC': 0.45, 
    'USDC': 1, 
    'USDT': 1,
    'DAI': 1,
    'WBTC': 95000,
  };
  
  let opportunitiesFound = 0;
  
  for (const [tokenA, tokenB, amount, inputDecimals] of pairs) {
    const testAmount = ethers.parseUnits(amount, inputDecimals);
    const outputDecimals = ['USDC', 'USDT'].includes(tokenB) ? 6 : 18;
    const tokenADecimals = ['USDC', 'USDT'].includes(tokenA) ? 6 : 18;
    
    console.log('───────────────────────────────────────────────────────');
    console.log(`Testing: ${tokenA} → ${tokenB} → ${tokenA}`);
    console.log(`Start amount: ${amount} ${tokenA} (~$${(parseFloat(amount) * tokenPrices[tokenA]).toFixed(0)})`);
    console.log('');
    
    let bestResult = null;
    
    // Test all DEX combinations
    for (const buyDex of dexList) {
      for (const sellDex of dexList) {
        if (buyDex.name === sellDex.name) continue;
        
        try {
          // Step 1: Buy tokenB on buyDex
          const buyPath = [tokens[tokenA], tokens[tokenB]];
          const buyResult = await buyDex.router.getAmountsOut(testAmount, buyPath);
          const tokenBReceived = buyResult[1];
          const tokenBFormatted = Number(tokenBReceived) / Math.pow(10, outputDecimals);
          
          // Step 2: Sell tokenB on sellDex
          const sellPath = [tokens[tokenB], tokens[tokenA]];
          const sellResult = await sellDex.router.getAmountsOut(tokenBReceived, sellPath);
          const tokenAReceived = sellResult[1];
          const tokenAFormatted = Number(tokenAReceived) / Math.pow(10, tokenADecimals);
          
          // Calculate profit
          const startAmount = parseFloat(amount);
          const grossProfit = tokenAFormatted - startAmount;
          const grossProfitPercent = (grossProfit / startAmount) * 100;
          
          // Fees
          const flashloanFee = startAmount * 0.0009;
          const gasCostTokenA = 0.02 / tokenPrices[tokenA]; // Convert $0.02 gas to tokenA
          const netProfit = grossProfit - flashloanFee - gasCostTokenA;
          const netProfitUsd = netProfit * tokenPrices[tokenA];
          
          console.log(`  ${buyDex.name} → ${sellDex.name}:`);
          console.log(`    Buy: ${tokenBFormatted.toFixed(6)} ${tokenB}`);
          console.log(`    Sell: ${tokenAFormatted.toFixed(6)} ${tokenA}`);
          console.log(`    Gross: ${grossProfitPercent >= 0 ? '+' : ''}${grossProfitPercent.toFixed(4)}%`);
          console.log(`    Net profit: $${netProfitUsd.toFixed(4)}`);
          
          if (netProfitUsd > 0 && (!bestResult || netProfitUsd > bestResult.netProfitUsd)) {
            bestResult = {
              buyDex: buyDex.name,
              sellDex: sellDex.name,
              netProfitUsd,
              grossProfitPercent,
            };
          }
          
        } catch (e) {
          console.log(`  ${buyDex.name} → ${sellDex.name}: Error - ${e.message}`);
        }
      }
    }
    
    console.log('');
    if (bestResult && bestResult.netProfitUsd >= config.trading.minProfitUsd) {
      console.log('🚨 PROFITABLE ARBITRAGE FOUND!');
      console.log(`   Route: Buy on ${bestResult.buyDex}, sell on ${bestResult.sellDex}`);
      console.log(`   Net profit: $${bestResult.netProfitUsd.toFixed(4)}`);
      opportunitiesFound++;
    } else if (bestResult && bestResult.netProfitUsd > 0) {
      console.log('⚠️  Small profit (below threshold)');
      console.log(`   Best: $${bestResult.netProfitUsd.toFixed(4)} < min $${config.trading.minProfitUsd}`);
    } else {
      console.log('✅ No profitable arbitrage opportunity');
      console.log('   (This is normal - real arb opportunities are rare)');
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Pairs tested: ${pairs.length}`);
  console.log(`Profitable opportunities: ${opportunitiesFound}`);
  console.log('');
  if (opportunitiesFound === 0) {
    console.log('💡 No opportunities found - this is EXPECTED!');
    console.log('   Real arbitrage is captured by MEV bots in milliseconds.');
    console.log('   The bot will continue monitoring for rare opportunities.');
  }
  console.log('═══════════════════════════════════════════════════════');
}

testRoundTripArbitrage().catch(console.error);

