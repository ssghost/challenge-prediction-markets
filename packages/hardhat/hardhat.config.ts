import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import generateTsAbis from "./scripts/generateTsAbis";

// 引入代理庫 (確保已安裝 undici 和 https-proxy-agent)
import { ProxyAgent, setGlobalDispatcher } from "undici";
import { HttpsProxyAgent } from "https-proxy-agent";
import http from "http";
import https from "https";

// ========================================================
// 1. 初始化與網絡代理配置
// ========================================================
dotenv.config();

// 定義您的代理地址
const PROXY_URL = "http://127.0.0.1:9910";

// [A] 配置 Undici 代理 (修復 Hardhat 部署與核心請求)
try {
  const undiciAgent = new ProxyAgent(PROXY_URL);
  setGlobalDispatcher(undiciAgent);
} catch {
  // 忽略重複設置的錯誤
}

// [B] 配置 Node 全局代理 (修復 驗證插件/Axios)
// 強制將 Node.js 底層的 HTTP/HTTPS 發送器指向代理隧道
const nodeProxyAgent = new HttpsProxyAgent(PROXY_URL);
http.globalAgent = nodeProxyAgent;
https.globalAgent = nodeProxyAgent;

console.log(`✅ [Network] Proxy initialized at: ${PROXY_URL}`);

// ========================================================
// 2. 變數讀取
// ========================================================
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";

// ========================================================
// 3. Hardhat 主配置
// ========================================================
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "sepolia",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/" + providerApiKey,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    mainnet: {
      url: "https://eth-mainnet.alchemyapi.io/v2/" + providerApiKey,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/" + providerApiKey,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
    arbitrumSepolia: {
      url: "https://arb-sepolia.g.alchemy.com/v2/" + providerApiKey,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
    optimismSepolia: {
      url: "https://opt-sepolia.g.alchemy.com/v2/" + providerApiKey,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
    ],
  },
  verify: {
    etherscan: {
      apiKey: etherscanApiKey,
    },
  },
  sourcify: {
    enabled: false,
  },
};

task("deploy").setAction(async (args, hre, runSuper) => {
  await runSuper(args);
  await generateTsAbis(hre);
});

export default config;
