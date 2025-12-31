# 🚀 Netlify Deployment Guide

## Flash Gordon - Arbitrage Dashboard

Deploy your flash loan arbitrage dashboard to Netlify in minutes!

---

## 📋 Prerequisites

1. **GitHub/GitLab/Bitbucket Account** - For connecting your repo
2. **Netlify Account** - Free at [netlify.com](https://netlify.com)
3. **Alchemy API Key** - Free at [alchemy.com](https://alchemy.com)
4. **Node.js 18+** - For local development

---

## 🎯 Quick Deploy (One-Click)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Click the button above
2. Connect your Git repository
3. Configure build settings (auto-detected from `netlify.toml`)
4. Deploy!

---

## 📦 Manual Deployment Steps

### Step 1: Prepare Your Repository

```powershell
# Navigate to project
cd "C:\Flash Gordon"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Flash Gordon Arbitrage Dashboard"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/flash-gordon.git

# Push
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select the `flash-gordon` repository
5. Configure build settings:

| Setting | Value |
|---------|-------|
| Base directory | (leave empty) |
| Build command | `echo 'Static site - no build needed'` |
| Publish directory | `public` |
| Functions directory | `netlify/functions` |

6. Click **"Deploy site"**

### Step 3: Configure Environment Variables (Optional)

For enhanced security, set API keys as environment variables:

1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   ALCHEMY_API_KEY=your_alchemy_key_here
   ```

---

## 🏗️ Project Structure for Netlify

```
C:\Flash Gordon\
├── public/                    # Static files (deployed as-is)
│   ├── index.html            # Main dashboard page
│   ├── styles.css            # Styling
│   └── app.js                # Frontend JavaScript
│
├── netlify/
│   └── functions/            # Serverless functions
│       ├── test-connection.js    # API: Test blockchain connection
│       ├── check-prices.js       # API: Check DEX prices
│       └── execute-arbitrage.js  # API: Execute trades (simulation)
│
├── src/                      # Node.js CLI tools (not deployed)
│   ├── index.js              # Bot entry point
│   ├── priceMonitor.js       # Price monitoring
│   ├── executor.js           # Trade execution
│   ├── config.js             # Configuration
│   └── utils/
│       └── logger.js         # Logging utility
│
├── netlify.toml              # Netlify configuration
├── package.json              # Dependencies
└── README.md                 # Documentation
```

---

## 🔧 Local Development

### Run the Dashboard Locally

```powershell
# Install dependencies
npm install

# Install Netlify CLI globally
npm install -g netlify-cli

# Start local development server
netlify dev
```

This starts:
- **Frontend**: http://localhost:8888
- **Functions**: http://localhost:8888/.netlify/functions/

### Test Functions Locally

```powershell
# Test connection function
curl -X POST http://localhost:8888/.netlify/functions/test-connection ^
  -H "Content-Type: application/json" ^
  -d "{\"network\": \"polygon\", \"alchemyKey\": \"your_key\"}"
```

---

## 🌐 Live URLs After Deployment

After deploying, your site will be available at:

- **Dashboard**: `https://your-site-name.netlify.app`
- **API - Test Connection**: `https://your-site-name.netlify.app/.netlify/functions/test-connection`
- **API - Check Prices**: `https://your-site-name.netlify.app/.netlify/functions/check-prices`

---

## 🔒 Security Best Practices

### ⚠️ IMPORTANT

1. **Never commit private keys** to Git
2. **Use environment variables** for sensitive data
3. **The web dashboard is for MONITORING only** - Real trades should use the CLI

### Secure Configuration

```env
# In Netlify Environment Variables (Site settings → Environment variables)
ALCHEMY_API_KEY=your_key_here

# NEVER add these to environment variables on Netlify:
# PRIVATE_KEY=  ← Keep this LOCAL only!
```

---

## 🔄 Continuous Deployment

Once connected, Netlify automatically:

1. Watches for Git pushes
2. Rebuilds on every commit
3. Deploys instantly
4. Provides deploy previews for PRs

---

## 📊 Monitoring & Analytics

### Netlify Analytics

Enable in: **Site settings** → **Analytics**

Tracks:
- Page views
- Unique visitors
- Top pages
- Bandwidth usage

### Function Logs

View function logs in: **Functions** → Select function → **Logs**

---

## 🐛 Troubleshooting

### "Function invocation failed"

1. Check function logs in Netlify dashboard
2. Verify `node_bundler = "esbuild"` in `netlify.toml`
3. Ensure all dependencies are in `package.json`

### "CORS error"

Functions include CORS headers. If issues persist:
- Check browser console for specific errors
- Verify function is returning proper headers

### "Connection timeout"

1. Verify Alchemy API key is valid
2. Check Alchemy dashboard for rate limits
3. Try a different network (polygon → arbitrum)

### Build Fails

```powershell
# Test locally first
netlify build

# Check for errors in build log
```

---

## 🚀 Deploy Commands

```powershell
# Preview deploy (creates temporary URL)
netlify deploy

# Production deploy
netlify deploy --prod

# Open site in browser
netlify open

# View deploy logs
netlify deploy --json
```

---

## 📈 Scaling Considerations

### Free Tier Limits (Netlify)

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Function invocations | 125,000/month |
| Function runtime | 10 seconds/invocation |
| Build minutes | 300/month |

### For High-Volume Usage

1. Upgrade to Netlify Pro
2. Or use serverless functions as API gateway only
3. Move intensive operations to dedicated backend

---

## ✅ Deployment Checklist

- [ ] Git repository initialized and pushed
- [ ] Netlify account created
- [ ] Site connected to repository
- [ ] Build settings configured
- [ ] Environment variables set (if using)
- [ ] Custom domain configured (optional)
- [ ] SSL enabled (automatic)
- [ ] Test connection working
- [ ] Price monitoring working
- [ ] Dashboard loading correctly

---

## 🎉 You're Live!

Your Flash Gordon arbitrage dashboard is now deployed and accessible worldwide!

**Dashboard URL**: `https://your-site-name.netlify.app`

Remember:
- Use the web dashboard for **monitoring**
- Use the CLI (`npm start`) for **real trading**
- Start with **small amounts** on testnet first!

---

## Need Help?

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Alchemy Docs**: [docs.alchemy.com](https://docs.alchemy.com)
- **Ethers.js Docs**: [docs.ethers.org](https://docs.ethers.org)

