import { defineChain } from "thirdweb";

// Torus Mainnet configuration
export const torusMainnetConfig = {
  id: 8192,
  name: "Torus Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Torus Ether",
    symbol: "TQF",
  },
  rpcUrls: {
    default: { http: ["https://rpc.toruschain.com/"] },
  },
  blockExplorers: {
    default: { name: "Torus Explorer", url: "https://toruscan.com" },
  },
  testnet: false,
  custom: {
    maxRPS: 3,
    tokens: {
      UnrealToken: {
        address: "0xA409B5E5D34928a0F1165c7a73c8aC572D1aBCDB" as const,
        symbol: "UNREAL",
        name: "Unreal Token",
        decimals: 18,
      },
    },
  },
};

// Titan AI Testnet configuration
export const titanAITestnetConfig = {
  id: 1020352220,
  name: "Titan AI",
  nativeCurrency: {
    decimals: 18,
    name: "Skale Fuel",
    symbol: "FUEL",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/aware-fake-trim-testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "Titan AI Explorer",
      url: "https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com/",
    },
  },
  testnet: true,
  custom: {
    tokens: {
      UnrealToken: {
        address: "0x8bcEac95cb3AAF12358Dde73c16bB293f4b028C1" as const,
        symbol: "UNREAL",
        name: "Unreal Token",
        decimals: 18,
      },
    },
  },
};

// Polygon Amoy Testnet configuration
export const amoyTestnetConfig = {
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: {
    decimals: 18,
    name: "POL",
    symbol: "POL",
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-amoy.polygon.technology",
        "https://polygon-amoy.drpc.org",
        "https://polygon-amoy-bor-rpc.publicnode.com",
      ],
    },
    public: {
      http: [
        "https://rpc-amoy.polygon.technology",
        "https://polygon-amoy-bor-rpc.publicnode.com",
      ],
    },
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://amoy.polygonscan.com" },
  },
  testnet: true,
  custom: {
    tokens: {
      UnrealToken: {
        address: "0x535D9D557f15ff50E46D51a6726C1Eb5FAf9D326" as const,
        symbol: "UNREAL",
        name: "Unreal Token",
        decimals: 18,
      },
    },
  },
};

// Somnia Shanon Testnet configuration
export const somniaShanonTestnetConfig = {
  id: 50312,
  name: "Somnia Shanon Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Somnia Testnet Token",
    symbol: "STT",
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.ankr.com/somnia_testnet/b538dd90abf174d5a5e91e686b9a0d2bcb80c0531c5d99fe61aa7b2a9720d453",
      ],
    },
    public: {
      http: [
        "https://rpc.ankr.com/somnia_testnet/b538dd90abf174d5a5e91e686b9a0d2bcb80c0531c5d99fe61aa7b2a9720d453",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Shanon Explorer",
      url: "https://shannon-explorer.somnia.network/",
    },
  },
  testnet: true,
  custom: {
    maxRPS: 3,
    tokens: {
      UnrealToken: {
        address: "0xd1fB2a15545032a8170370d7eC47C0FC69A00eed" as const,
        symbol: "UNREAL",
        name: "Unreal Token",
        decimals: 18,
      },
    },
  },
};

export const torusMainnet = defineChain(torusMainnetConfig);
export const titanAITestnet = defineChain(titanAITestnetConfig);
export const amoyTestnet = defineChain(amoyTestnetConfig);
export const somniaShanonTestnet = defineChain(somniaShanonTestnetConfig);

// Map of chain IDs to defined chain objects
const chainsById = {
  [torusMainnet.id]: torusMainnet,
  [titanAITestnet.id]: titanAITestnet,
  [amoyTestnet.id]: amoyTestnet,
  [somniaShanonTestnet.id]: somniaShanonTestnet,
} as const;

// Map of chain IDs to configuration objects
const chainConfigsById = {
  [torusMainnetConfig.id]: torusMainnetConfig,
  [titanAITestnetConfig.id]: titanAITestnetConfig,
  [amoyTestnetConfig.id]: amoyTestnetConfig,
  [somniaShanonTestnetConfig.id]: somniaShanonTestnetConfig,
} as const;

// Function to get chain by ID
export function getChainById(chainId: number) {
  return chainsById[chainId] ?? null;
}

// Function to get chain configuration by ID
export function getChainConfigById(chainId: number) {
  return chainConfigsById[chainId] ?? null;
}

// Control which chain the app uses globally via .env
const ACTIVE_CHAIN_KEY =
  (process.env.NEXT_PUBLIC_ACTIVE_CHAIN as
    | "torusMainnet"
    | "titanAI"
    | "amoy"
    | "somniaShanon"
    | undefined) ?? "somniaShanon";

export const chainMap = {
  torusMainnet: {
    chain: torusMainnet,
    config: torusMainnetConfig,
  },
  titanAI: {
    chain: titanAITestnet,
    config: titanAITestnetConfig,
  },
  amoy: {
    chain: amoyTestnet,
    config: amoyTestnetConfig,
  },
  somniaShanon: {
    chain: somniaShanonTestnet,
    config: somniaShanonTestnetConfig,
  },
} as const;

// The currently active chain (based on env)
export const activeChain = chainMap[ACTIVE_CHAIN_KEY].chain;
export const activeChainConfig = chainMap[ACTIVE_CHAIN_KEY].config;
