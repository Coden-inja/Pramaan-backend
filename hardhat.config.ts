import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun", // Enable Cancun hard fork for mcopy support
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
});
