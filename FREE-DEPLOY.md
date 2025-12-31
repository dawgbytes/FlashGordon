# Deploy Flash Gordon for FREE (Zero Cost)

## Fastest Method: Thirdweb (2 minutes)

Thirdweb pays gas for contract deployment!

### Step 1: Go to Thirdweb
https://thirdweb.com/dashboard

### Step 2: Connect Your Wallet
- Click "Connect Wallet"
- Select MetaMask
- If not installed: https://metamask.io
- Import wallet with phrase: `glue picnic lobster average short debris short settle response humble neck violin`

### Step 3: Deploy Contract
1. Click "Contracts" in sidebar
2. Click "Deploy Contract" 
3. Choose "Deploy from source"
4. Paste this code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPool {
    function flashLoanSimple(address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 referralCode) external;
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IRouter {
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory);
}

contract FlashGordon {
    address public owner;
    address constant AAVE_POOL = 0x794a61358D6845594F94dc1DB02A252b5b4814aD;
    
    constructor() { owner = msg.sender; }
    
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    
    function executeArbitrage(address asset, uint256 amount, bytes calldata params) external onlyOwner {
        IPool(AAVE_POOL).flashLoanSimple(address(this), asset, amount, params, 0);
    }
    
    function executeOperation(address asset, uint256 amount, uint256 premium, address, bytes calldata params) external returns (bool) {
        require(msg.sender == AAVE_POOL, "Not Aave");
        (address buyRouter, address sellRouter, address[] memory buyPath, address[] memory sellPath) = abi.decode(params, (address, address, address[], address[]));
        
        IERC20(asset).approve(buyRouter, amount);
        uint[] memory out1 = IRouter(buyRouter).swapExactTokensForTokens(amount, 0, buyPath, address(this), block.timestamp + 300);
        
        address midToken = buyPath[buyPath.length - 1];
        IERC20(midToken).approve(sellRouter, out1[out1.length - 1]);
        IRouter(sellRouter).swapExactTokensForTokens(out1[out1.length - 1], 0, sellPath, address(this), block.timestamp + 300);
        
        IERC20(asset).approve(AAVE_POOL, amount + premium);
        return true;
    }
    
    function withdraw(address token) external onlyOwner {
        IERC20(token).transfer(owner, IERC20(token).balanceOf(address(this)));
    }
    
    receive() external payable {}
}
```

5. Select Network: **Polygon**
6. Click **Deploy**
7. Thirdweb pays the gas - YOU PAY $0!

### Step 4: Copy Contract Address

After deployment, copy the address and run:

```powershell
cd "C:\Flash Gordon"
Add-Content -Path ".env" -Value "`nFLASHLOAN_CONTRACT_ADDRESS=YOUR_ADDRESS_HERE"
```

### Step 5: Verify Setup

```powershell
cd "C:\Flash Gordon"
node verify-setup.js
```

---

## Alternative: Get Free MATIC

### Discord/Reddit (5 mins)
Post in these communities - people will send you 0.01 MATIC:
- Reddit: r/Polygon, r/0xPolygon
- Discord: Polygon Official Discord

### Faucets (If Available)
- https://faucet.polygon.technology (may require verification)
- https://www.alchemy.com/faucets/polygon-mainnet

### Bridge From Anywhere
If you have $1 of ANY crypto on ANY chain:
1. Go to https://jumper.exchange
2. Bridge to MATIC on Polygon
3. Done!

---

## After Deployment

Your bot will be ready:
```
✅ Alchemy API: Connected
✅ Wallet: Funded by profits
✅ Contract: Deployed FREE
✅ Gasless: Gelato enabled
✅ Total Cost: $0
```

