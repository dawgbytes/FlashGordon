/**
 * Flash Gordon - Setup Verification
 * Checks if everything is configured for real trading
 */

import { ethers } from 'ethers';
import { config } from './src/config.js';

async function verifySetup() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  FLASH GORDON - SETUP VERIFICATION');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  let allGood = true;
  const issues = [];

  // 1. Check Alchemy API
  console.log('1. Alchemy API Key');
  if (config.alchemyApiKey && config.alchemyApiKey !== 'your_alchemy_api_key_here') {
    console.log('   ✅ Configured');
    
    // Test connection
    try {
      const provider = new ethers.JsonRpcProvider(config.networks[config.network].rpcUrl);
      const block = await provider.getBlockNumber();
      console.log(`   ✅ Connected to ${config.network} (block ${block})`);
    } catch (e) {
      console.log(`   ❌ Connection failed: ${e.message}`);
      allGood = false;
      issues.push('Alchemy connection failed');
    }
  } else {
    console.log('   ❌ Not configured');
    allGood = false;
    issues.push('Add ALCHEMY_API_KEY to .env');
  }

  // 2. Check Private Key
  console.log('');
  console.log('2. Wallet (Private Key)');
  if (process.env.PRIVATE_KEY) {
    try {
      const provider = new ethers.JsonRpcProvider(config.networks[config.network].rpcUrl);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const balance = await provider.getBalance(wallet.address);
      const balanceFormatted = ethers.formatEther(balance);
      
      console.log(`   ✅ Wallet: ${wallet.address}`);
      console.log(`   ✅ Balance: ${balanceFormatted} ${config.networks[config.network].nativeCurrency}`);
      
      if (parseFloat(balanceFormatted) < 0.01) {
        console.log('   ⚠️  Low balance - add funds for gas');
        issues.push('Add funds to wallet for gas');
      }
    } catch (e) {
      console.log(`   ❌ Invalid private key: ${e.message}`);
      allGood = false;
      issues.push('Invalid PRIVATE_KEY in .env');
    }
  } else {
    console.log('   ❌ Not configured (running in MONITOR-ONLY mode)');
    allGood = false;
    issues.push('Add PRIVATE_KEY to .env');
  }

  // 3. Check Flashloan Contract
  console.log('');
  console.log('3. Flashloan Contract');
  if (config.flashloanContractAddress) {
    console.log(`   ✅ Address: ${config.flashloanContractAddress}`);
    
    // Verify contract exists
    try {
      const provider = new ethers.JsonRpcProvider(config.networks[config.network].rpcUrl);
      const code = await provider.getCode(config.flashloanContractAddress);
      
      if (code === '0x') {
        console.log('   ❌ No contract at this address');
        allGood = false;
        issues.push('Deploy the FlashloanExecutor contract');
      } else {
        console.log('   ✅ Contract verified on-chain');
      }
    } catch (e) {
      console.log(`   ❌ Could not verify: ${e.message}`);
    }
  } else {
    console.log('   ❌ Not configured');
    allGood = false;
    issues.push('Deploy contract and add FLASHLOAN_CONTRACT_ADDRESS to .env');
  }

  // 4. Check Gasless
  console.log('');
  console.log('4. Gasless (Gelato)');
  if (config.gasless?.enabled) {
    console.log(`   ✅ Enabled`);
    console.log(`   ✅ API Key: ...${config.gasless.gelatoApiKey.slice(-4)}`);
  } else {
    console.log('   ⚠️  Not enabled (will use wallet gas)');
  }

  // 5. Network
  console.log('');
  console.log('5. Network Configuration');
  console.log(`   Network: ${config.network}`);
  console.log(`   Min Profit: $${config.trading.minProfitUsd}`);
  console.log(`   Max Gas: ${config.trading.maxGasPriceGwei} gwei`);
  console.log(`   DEXs: ${Object.keys(config.dexes[config.network] || {}).join(', ')}`);

  // Summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  
  if (allGood && issues.length === 0) {
    console.log('');
    console.log('  🎉 ALL SYSTEMS GO! Ready for trading.');
    console.log('');
    console.log('  Run: npm run start');
    console.log('');
  } else {
    console.log('');
    console.log('  ⚠️  SETUP INCOMPLETE - Action needed:');
    console.log('');
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    console.log('');
    console.log('  See DEPLOYMENT-CHECKLIST.md for instructions.');
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
}

verifySetup().catch(console.error);

