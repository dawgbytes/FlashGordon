/**
 * Quick test to verify Alchemy API connection
 */

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

async function testConnection() {
  console.log('Testing Alchemy API connection...\n');

  const apiKey = process.env.ALCHEMY_API_KEY;
  const network = process.env.NETWORK || 'polygon';

  if (!apiKey || apiKey === 'your_alchemy_api_key_here') {
    console.error('❌ ALCHEMY_API_KEY not configured!');
    console.log('Please check your .env file');
    process.exit(1);
  }

  // Construct RPC URL
  const networkMap = {
    polygon: 'polygon-mainnet',
    arbitrum: 'arb-mainnet',
    optimism: 'opt-mainnet',
  };

  const networkName = networkMap[network] || 'polygon-mainnet';
  const rpcUrl = `https://${networkName}.g.alchemy.com/v2/${apiKey}`;

  console.log(`Network: ${network}`);
  console.log(`RPC URL: ${rpcUrl.substring(0, 50)}...\n`);

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const blockNumber = await provider.getBlockNumber();
    const networkInfo = await provider.getNetwork();

    console.log('✅ Connection successful!');
    console.log(`   Current block: ${blockNumber}`);
    console.log(`   Chain ID: ${networkInfo.chainId}`);
    console.log(`   Network name: ${networkInfo.name}`);
    console.log('\n🎉 Your Alchemy API is working correctly!');
    console.log('You can now run: npm run monitor');

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    console.log('\nTroubleshooting:');
    console.log('1. Check your API key is correct');
    console.log('2. Verify the network is enabled in Alchemy dashboard');
    console.log('3. Check your internet connection');
    process.exit(1);
  }
}

testConnection();

