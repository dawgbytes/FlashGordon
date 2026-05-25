import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Network Configuration
  network: process.env.NETWORK || 'polygon',
  
  // Alchemy
  alchemyApiKey: process.env.ALCHEMY_API_KEY,
  
  // Networks
  networks: {
    polygon: {
      chainId: 137,
      rpcUrl: process.env.ALCHEMY_POLYGON_URL || `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      nativeCurrency: 'MATIC',
      blockExplorer: 'https://polygonscan.com',
      avgGasPrice: 30, // gwei
      avgGasCost: 0.01, // USD
    },
    arbitrum: {
      chainId: 42161,
      rpcUrl: process.env.ALCHEMY_ARBITRUM_URL || `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      nativeCurrency: 'ETH',
      blockExplorer: 'https://arbiscan.io',
      avgGasPrice: 0.1,
      avgGasCost: 0.10,
    },
    optimism: {
      chainId: 10,
      rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      nativeCurrency: 'ETH',
      blockExplorer: 'https://optimistic.etherscan.io',
      avgGasPrice: 0.001,
      avgGasCost: 0.05,
    }
  },

  // DEX Addresses
  dexes: {
    polygon: {
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      sushiswapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      quickswapRouter: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    },
    arbitrum: {
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      sushiswapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      camelotRouter: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
    },
    optimism: {
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      sushiswapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    }
  },

  // Aave V3 Addresses
  aave: {
    polygon: {
      poolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    },
    arbitrum: {
      poolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    },
    optimism: {
      poolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    }
  },

  // Common Token Addresses
  tokens: {
    polygon: {
      WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    },
    arbitrum: {
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    },
    optimism: {
      WETH: '0x4200000000000000000000000000000000000006',
      USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    }
  },

  // Trading Parameters
  trading: {
    minProfitUsd: parseFloat(process.env.MIN_PROFIT_USD) || 0.50,
    maxGasPriceGwei: parseInt(process.env.MAX_GAS_PRICE_GWEI) || 100,
    slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE) || 0.5, // 0.5%
    flashloanFee: 0.0009, // Aave V3 fee: 0.09%
  },

  // Monitoring Settings
  monitoring: {
    priceCheckIntervalMs: 1000, // Check prices every 1 second
    minPriceDifferencePercent: 0.5, // Minimum 0.5% difference to consider
  }
};

export default config;

