/**
 * Flash Gordon - Wallet Generator
 * Creates a new Ethereum/Polygon wallet
 */

import { ethers } from 'ethers';

console.log('');
console.log('='.repeat(60));
console.log('  FLASH GORDON - NEW WALLET GENERATOR');
console.log('='.repeat(60));
console.log('');

const wallet = ethers.Wallet.createRandom();

console.log('NEW WALLET CREATED SUCCESSFULLY!');
console.log('');
console.log('-'.repeat(60));
console.log('PUBLIC ADDRESS (safe to share, use to receive funds):');
console.log('');
console.log('  ' + wallet.address);
console.log('');
console.log('-'.repeat(60));
console.log('PRIVATE KEY (ADD TO .env - NEVER share!):');
console.log('');
console.log('  ' + wallet.privateKey);
console.log('');
console.log('-'.repeat(60));
console.log('RECOVERY PHRASE (write down, store offline):');
console.log('');
console.log('  ' + wallet.mnemonic.phrase);
console.log('');
console.log('-'.repeat(60));
console.log('');
console.log('NEXT STEPS:');
console.log('1. Copy the PRIVATE KEY above');
console.log('2. Open .env file and add: PRIVATE_KEY=<paste key>');
console.log('3. Send ~1 MATIC to the PUBLIC ADDRESS for gas');
console.log('4. Deploy the smart contract');
console.log('');
console.log('WARNING: Save this information NOW!');
console.log('         It will NOT be shown again.');
console.log('');
console.log('='.repeat(60));

