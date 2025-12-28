/**
 * Flashloan Arbitrage Bot - Main Entry Point
 * 
 * This bot monitors DEX prices and executes flashloan arbitrage
 * when profitable opportunities are found.
 * 
 * Key Features:
 * - Real-time price monitoring across DEXs
 * - Automatic opportunity detection
 * - Flashloan execution via Aave V3
 * - Gasless options via Gelato/Biconomy
 * - Profit reinvestment
 */

import { ethers } from 'ethers';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { PriceMonitor } from './priceMonitor.js';
import { ArbitrageExecutor } from './executor.js';

class FlashloanArbitrageBot {
  constructor() {
    this.priceMonitor = null;
    this.executor = null;
    this.isRunning = false;
    this.stats = {
      opportunitiesFound: 0,
      tradesExecuted: 0,
      totalProfit: 0,
      startTime: null,
    };
  }

  async initialize() {
    logger.info('='.repeat(60));
    logger.info('  FLASHLOAN ARBITRAGE BOT');
    logger.info('='.repeat(60));
    logger.info(`Network: ${config.network}`);
    logger.info(`Min Profit: $${config.trading.minProfitUsd}`);
    logger.info('='.repeat(60));

    // Check for required API key
    if (!config.alchemyApiKey || config.alchemyApiKey === 'your_alchemy_api_key_here') {
      logger.error('❌ ALCHEMY_API_KEY not configured!');
      logger.info('');
      logger.info('To get started:');
      logger.info('1. Go to https://alchemy.com and create a free account');
      logger.info('2. Create a new app for Polygon or Arbitrum');
      logger.info('3. Copy the API key');
      logger.info('4. Create a .env file (copy from .env.example)');
      logger.info('5. Add your API key to ALCHEMY_API_KEY');
      logger.info('');
      process.exit(1);
    }

    this.stats.startTime = new Date();
    logger.info('Bot initialized successfully');
    logger.info('');
    logger.info('📋 Execution Mode:');
    if (process.env.PRIVATE_KEY) {
      logger.info('   ✅ AUTO-EXECUTION: Enabled (will execute profitable trades)');
    } else {
      logger.info('   ⚠️  MONITOR-ONLY: No PRIVATE_KEY set (monitoring only)');
    }
    logger.info('');
  }

  async start() {
    this.isRunning = true;
    
    logger.info('Starting arbitrage monitoring with AUTO-EXECUTION...');
    logger.info('Press Ctrl+C to stop');
    logger.info('');

    try {
      // Initialize executor
      this.executor = new ArbitrageExecutor();
      const executorReady = await this.executor.initialize();
      
      if (!executorReady) {
        logger.warn('⚠️ Executor not ready - running in MONITOR-ONLY mode');
        logger.warn('To enable auto-execution:');
        logger.warn('1. Add PRIVATE_KEY to .env file');
        logger.warn('2. Deploy FlashloanExecutor.sol contract');
        logger.warn('3. Add contract address to config');
        logger.info('');
      } else {
        logger.info('✅ Executor ready - AUTO-EXECUTION ENABLED');
        logger.info('Bot will automatically execute profitable opportunities!');
        logger.info('');
      }

      // Initialize price monitor with executor
      this.priceMonitor = new PriceMonitor(this.executor);
      await this.priceMonitor.initialize();
      
      // Start monitoring (will auto-execute if executor is ready)
      await this.priceMonitor.startMonitoring();
      
      // Update stats periodically
      setInterval(() => {
        this.stats.opportunitiesFound = this.priceMonitor.opportunities.length;
        this.displayStats();
      }, 60000); // Every minute

    } catch (error) {
      logger.error(`Error: ${error.message}`);
      logger.info('');
      logger.info('Common issues:');
      logger.info('- Invalid API key');
      logger.info('- Network connectivity');
      logger.info('- Rate limiting');
      logger.info('- Missing contract deployment');
    }
  }

  displayStats() {
    const uptime = (new Date() - this.stats.startTime) / 1000 / 60; // minutes
    
    logger.info('');
    logger.info('📊 Bot Statistics:');
    logger.info(`   Uptime: ${uptime.toFixed(1)} minutes`);
    logger.info(`   Opportunities found: ${this.stats.opportunitiesFound}`);
    logger.info(`   Trades executed: ${this.stats.tradesExecuted}`);
    logger.info(`   Total profit: $${this.stats.totalProfit.toFixed(2)}`);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('');
  logger.info('Shutting down...');
  process.exit(0);
});

// Main
async function main() {
  const bot = new FlashloanArbitrageBot();
  await bot.initialize();
  await bot.start();
}

main().catch((error) => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

