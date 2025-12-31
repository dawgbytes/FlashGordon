# ⚡ Flash Gordon - Arbitrage Dashboard

<div align="center">

![Flash Gordon](https://img.shields.io/badge/Flash-Gordon-00d4ff?style=for-the-badge&logo=lightning&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![DeFi](https://img.shields.io/badge/DeFi-Arbitrage-a855f7?style=for-the-badge)

**Automated flash loan arbitrage monitoring with a beautiful web dashboard.**

[Live Demo](#) • [Deploy to Netlify](#-deploy-to-netlify) • [Documentation](#-documentation)

</div>

---

## 🎯 What is Flash Loan Arbitrage?

Flash loans let you **borrow millions with zero collateral** – as long as you repay in the same transaction. This enables:

```
┌─────────────────────────────────────────────────────────────────┐
│  BORROW → BUY LOW → SELL HIGH → REPAY → PROFIT                 │
│                                                                  │
│  1. Borrow $10,000 USDC from Aave (no collateral needed)        │
│  2. Buy ETH on SushiSwap at lower price                          │
│  3. Sell ETH on QuickSwap at higher price                        │
│  4. Repay $10,009 (loan + 0.09% fee)                            │
│  5. Keep the difference as profit!                               │
└─────────────────────────────────────────────────────────────────┘
```

**All happens in ONE atomic transaction** – if any step fails, the entire transaction reverts.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **Web Dashboard** | Beautiful, real-time monitoring interface |
| 📊 **Multi-DEX Scanning** | SushiSwap, QuickSwap, Uniswap V3 |
| ⛓️ **Multi-Chain** | Polygon, Arbitrum, Optimism |
| ⚡ **Real-Time Prices** | Live price updates every 3 seconds |
| 🚨 **Opportunity Alerts** | Instant notification when arbitrage found |
| 💰 **Profit Calculator** | Auto-calculates net profit after fees |
| 🔒 **Secure** | API keys stored locally, never sent to servers |
| ☁️ **Netlify Ready** | One-click deploy to Netlify |

---

## 🚀 Deploy to Netlify

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Manual Deploy

```powershell
# Clone/download the project
cd "C:\Flash Gordon"

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

📖 See [NETLIFY-DEPLOYMENT.md](./NETLIFY-DEPLOYMENT.md) for detailed instructions.

---

## 💻 Local Development

### Prerequisites

- Node.js 18+
- Alchemy API key (free at [alchemy.com](https://alchemy.com))

### Quick Start

```powershell
# Install dependencies
npm install

# Copy environment file
copy env-example.txt .env

# Add your Alchemy API key to .env
notepad .env

# Start local server
npm run dev
```

Open http://localhost:8888 to view the dashboard.

---

## 📁 Project Structure

```
Flash Gordon/
├── public/                  # Web Dashboard (Netlify static)
│   ├── index.html          # Main dashboard page
│   ├── styles.css          # Beautiful dark theme UI
│   └── app.js              # Frontend logic
│
├── netlify/functions/       # Serverless API Functions
│   ├── test-connection.js  # Test blockchain connection
│   ├── check-prices.js     # Fetch DEX prices
│   └── execute-arbitrage.js # Simulate/execute trades
│
├── src/                     # CLI Bot (Node.js)
│   ├── index.js            # Main entry point
│   ├── priceMonitor.js     # Price monitoring
│   ├── executor.js         # Trade execution
│   └── config.js           # Configuration
│
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
└── NETLIFY-DEPLOYMENT.md   # Deployment guide
```

---

## 🌐 Supported Networks

| Network | Gas Cost | Recommended |
|---------|----------|-------------|
| **Polygon** | ~$0.01 | ⭐ Best for starting |
| **Arbitrum** | ~$0.10 | ✅ Good option |
| **Optimism** | ~$0.05 | ✅ Good option |
| Ethereum | $5-50+ | ❌ Too expensive |

---

## 🛠️ Configuration

### Environment Variables

```env
# Required
ALCHEMY_API_KEY=your_alchemy_key_here

# Network selection
NETWORK=polygon

# Trading parameters
MIN_PROFIT_USD=0.50
MAX_GAS_PRICE_GWEI=100

# For CLI trading (optional)
PRIVATE_KEY=your_private_key
FLASHLOAN_CONTRACT_ADDRESS=0x...
```

---

## 📊 Dashboard Features

### Real-Time Price Monitoring
- Live prices from multiple DEXs
- Automatic spread calculation
- Visual indicators for opportunities

### Opportunity Detection
- Alerts when profitable arbitrage found
- Calculates net profit after fees
- Shows buy/sell DEX routing

### Activity Log
- Timestamped event log
- Color-coded messages
- Exportable history

---

## ⚠️ Important Disclaimers

1. **Competition is fierce** – Professional bots capture most opportunities in milliseconds
2. **This is experimental** – Start with testnet, then small amounts
3. **Gas fees apply** – You still need ~$5-10 for gas (on Polygon)
4. **No guarantees** – DeFi is risky, only use funds you can afford to lose

---

## 🔒 Security

- **Web dashboard is for MONITORING only**
- **Never enter private keys in the web interface**
- **Use CLI (`npm start`) for real trades**
- **API keys stored in browser localStorage (never sent to servers)**

---

## 📚 Documentation

- [GETTING-STARTED.md](./GETTING-STARTED.md) - Setup guide
- [NETLIFY-DEPLOYMENT.md](./NETLIFY-DEPLOYMENT.md) - Deploy to Netlify
- [AUTO-EXECUTION-SETUP.md](./AUTO-EXECUTION-SETUP.md) - Enable auto-trading
- [ERROR-FIXES.md](./ERROR-FIXES.md) - Troubleshooting

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ⚡ for DeFi enthusiasts**

[Report Bug](https://github.com/issues) • [Request Feature](https://github.com/issues)

</div>
