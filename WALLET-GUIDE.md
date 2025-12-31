# Flash Gordon - Wallet Guide

## Your Wallet

| Field | Value |
|-------|-------|
| **Address** | `0xE364D758375F09773867Ebab1313B10b37A84C14` |
| **Network** | Polygon (MATIC) |
| **Recovery Phrase** | `glue picnic lobster average short debris short settle response humble neck violin` |

⚠️ **NEVER share your recovery phrase with anyone!**

---

## Access Your Wallet

### MetaMask (Desktop Browser)
1. Install: https://metamask.io/download/
2. Click "Import Wallet"
3. Enter recovery phrase
4. Add Polygon Network manually:
   - Settings → Networks → Add Network
   - Network Name: `Polygon Mainnet`
   - RPC URL: `https://polygon-rpc.com`
   - Chain ID: `137`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://polygonscan.com`

### Trust Wallet (Mobile)
1. Download from App Store / Play Store
2. Import Wallet → Enter recovery phrase
3. Polygon is supported by default

---

## Deposit Money

### Buy MATIC with Debit Card
1. Go to https://www.moonpay.com/ or https://transak.com/
2. Select MATIC (Polygon)
3. Enter amount (minimum usually $30)
4. Paste your address: `0xE364D758375F09773867Ebab1313B10b37A84C14`
5. Pay with debit card
6. MATIC arrives in ~5 minutes

### Transfer from Exchange
1. Buy MATIC on Coinbase/Binance
2. Withdraw to: `0xE364D758375F09773867Ebab1313B10b37A84C14`
3. **Important:** Select Polygon Network (not Ethereum!)

---

## Withdraw to Debit Card

### Method 1: Crypto Debit Card (Recommended)
Best option - spend crypto directly without converting!

**Coinbase Card (US)**
- Apply: https://www.coinbase.com/card
- 0% fees when spending
- Works like regular debit card
- Converts crypto → USD automatically at purchase

**How to use:**
1. Sign up for Coinbase
2. Transfer MATIC from your wallet to Coinbase
3. Apply for Coinbase Card
4. Spend anywhere Visa is accepted

### Method 2: Exchange → Bank
1. Send crypto from wallet to exchange (Coinbase/Kraken)
2. Sell for USD
3. Withdraw to bank account (free ACH)
4. Use your regular debit card

### Method 3: Send to Someone Who Pays Cash
Use Paxful or LocalCryptos to find buyers who will pay via:
- Bank transfer
- PayPal
- Cash App
- Venmo

---

## View Your Balance

### Online
- https://polygonscan.com/address/0xE364D758375F09773867Ebab1313B10b37A84C14

### In MetaMask
- Open MetaMask → Switch to Polygon → See balance

### Command Line
```powershell
cd "C:\Flash Gordon"
node -e "
import { ethers } from 'ethers';
import { config } from './src/config.js';
const provider = new ethers.JsonRpcProvider(config.networks.polygon.rpcUrl);
const balance = await provider.getBalance('0xE364D758375F09773867Ebab1313B10b37A84C14');
console.log('Balance:', ethers.formatEther(balance), 'MATIC');
"
```

---

## Fee Comparison

| Action | Cost |
|--------|------|
| Receive MATIC | Free |
| Send MATIC | ~$0.001 |
| Swap tokens on Polygon | ~$0.01 |
| Bridge to Ethereum | ~$5-20 |
| Sell on Coinbase | 0.5-1.5% |
| Coinbase Card purchase | 0% |
| Bank withdrawal (ACH) | Free |

---

## Security Tips

1. ✅ Never share your recovery phrase
2. ✅ Store recovery phrase offline (paper)
3. ✅ Use a hardware wallet for large amounts (Ledger/Trezor)
4. ✅ Enable 2FA on all exchanges
5. ❌ Never enter recovery phrase on websites
6. ❌ Never screenshot your recovery phrase

