import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.POLYGON_TESTNET_RPC_URL || 'https://rpc-amoy.polygon.technology';

if (!privateKey) {
  console.error('❌ PRIVATE_KEY is missing in your .env file!');
  process.exit(1);
}

async function main() {
  console.log('🚀 Connecting to Polygon Amoy Testnet...');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`🔑 Deploying from wallet address: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`💳 Wallet Balance: ${ethers.formatEther(balance)} POL`);

  if (balance === 0n) {
    console.error('❌ Wallet has 0 POL! Please fund your wallet using the Amoy Faucet first.');
    process.exit(1);
  }

  // Load contract artifact
  const artifactPath = path.resolve('src', 'abi', 'PramaamGITag.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('❌ Compiled contract artifact not found. Please run the compile script first.');
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  console.log('⏳ Sending deployment transaction...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  // Deploying contract
  const contract = await factory.deploy();
  
  console.log('⏳ Waiting for block confirmation (takes ~5-10 seconds on Amoy)...');
  await contract.waitForDeployment();
  
  const deployedAddress = await contract.getAddress();
  console.log(`\n🎉 Smart Contract Deployed Successfully!`);
  console.log(`📍 Deployed Contract Address: ${deployedAddress}`);
  console.log(`🔗 View on Polygonscan Amoy: https://amoy.polygonscan.com/address/${deployedAddress}`);

  // Auto-update .env file
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace CONTRACT_ADDRESS
    const regex = /CONTRACT_ADDRESS=([^\r\n]*)/;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `CONTRACT_ADDRESS=${deployedAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${deployedAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('📝 Auto-updated CONTRACT_ADDRESS in your backend .env file!');
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
