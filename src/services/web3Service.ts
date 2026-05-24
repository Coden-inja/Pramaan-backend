import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.POLYGON_TESTNET_RPC_URL || 'https://rpc-amoy.polygon.technology';
const contractAddress = process.env.CONTRACT_ADDRESS;

export interface GITagMintResponse {
  tokenId: number;
  transactionHash: string;
  blockNumber: number;
  blockchainHash: string;
  timestamp: string;
}

export interface ProductVerification {
  productId: string;
  supplier: string;
  giTag: string;
  isVerified: boolean;
  mintDate: number;
  metadataURI: string;
}

export class Web3Service {
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private contract: ethers.Contract | null = null;

  constructor() {
    if (!privateKey) {
      console.warn('⚠️ Web3Service Warning: PRIVATE_KEY is missing in env!');
      return;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Initialize contract if address exists in env
    if (contractAddress && contractAddress.startsWith('0x') && !contractAddress.includes('your_deployed_contract_address')) {
      this.initContract();
    }
  }

  private initContract() {
    try {
      const artifactPath = path.resolve('src', 'abi', 'PramaamGITag.json');
      if (!fs.existsSync(artifactPath)) {
        console.warn('⚠️ Web3Service Warning: Contract ABI artifact not found. Please compile the contract.');
        return;
      }

      const { abi } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi, this.wallet);
      console.log(`🔌 Web3Service connected to smart contract at: ${process.env.CONTRACT_ADDRESS}`);
    } catch (error) {
      console.error('❌ Failed to initialize smart contract in Web3Service:', error);
    }
  }

  // Ensure contract is initialized (loads dynamically if CONTRACT_ADDRESS was just written during deployment)
  private getContract(): ethers.Contract {
    if (!this.contract) {
      this.initContract();
    }
    if (!this.contract) {
      throw new Error('❌ Web3Service: Smart contract is not deployed or initialized yet!');
    }
    return this.contract;
  }

  // Pin JSON metadata to Pinata IPFS
  async pinJSONToIPFS(metadata: any): Promise<string> {
    try {
      const jwtToken = process.env.IPFS_JWT_TOKEN;
      if (!jwtToken) {
        throw new Error('❌ Pinata IPFS Token (IPFS_JWT_TOKEN) is missing in environment variables!');
      }

      console.log('⏳ Uploading product metadata to decentralized IPFS via Pinata...');
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: `Pramaan_GI_Tag_${Date.now()}`
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          }
        }
      );

      const cid = response.data.IpfsHash;
      console.log(`✅ Metadata successfully pinned to IPFS! Address: ipfs://${cid}`);
      return `ipfs://${cid}`;
    } catch (error: any) {
      console.error('❌ Error pinning to IPFS via Pinata:', error.response?.data || error.message);
      throw new Error(`IPFS Upload failed: ${error.message}`);
    }
  }

  // Admin verifies a supplier (artisan) on-chain
  async verifySupplierOnChain(supplierAddress: string): Promise<string> {
    try {
      const contract = this.getContract();
      
      // Check if already verified to save gas
      const isVerified = await contract.verifiedSuppliers(supplierAddress);
      if (isVerified) {
        console.log(`ℹ️ Supplier ${supplierAddress} is already verified on-chain.`);
        return 'already_verified';
      }

      console.log(`⏳ Verifying supplier address ${supplierAddress} on-chain...`);
      const tx = await contract.verifySupplier(supplierAddress);
      const receipt = await tx.wait();
      
      console.log(`✅ Supplier verified on-chain. TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      console.error('❌ Error verifying supplier on-chain:', error);
      throw error;
    }
  }

  // Mint a GI Tag NFT directly to the artisan's address (optimized)
  async mintGITag(
    productId: string,
    supplierAddress: string,
    giTag: string,
    metadataURI: string
  ): Promise<GITagMintResponse> {
    try {
      const contract = this.getContract();

      // 1. Ensure supplier is verified on-chain first
      await this.verifySupplierOnChain(supplierAddress);

      console.log(`⏳ Minting GI Tag NFT to artisan address ${supplierAddress}...`);
      
      // 2. Call the optimized contract mintGITag function (only 2 parameters now!)
      const tx = await contract.mintGITag(supplierAddress, metadataURI);
      const receipt = await tx.wait();

      // 3. Find the ProductMinted event to extract Token ID
      let tokenId = 0;
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'ProductMinted') {
              tokenId = Number(parsedLog.args.tokenId);
              break;
            }
          } catch (e) {
            // Ignore logs that can't be parsed
          }
        }
      }

      console.log(`🎉 GI Tag NFT Minted successfully! Token ID: #${tokenId}`);

      return {
        tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockchainHash: receipt.hash,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error minting GI Tag on-chain:', error);
      throw error;
    }
  }

  // Admin Transfer: Transfers NFT from artisan to buyer without requiring artisan's signature
  async transferProductOwnership(
    tokenId: number,
    fromAddress: string,
    toAddress: string
  ): Promise<string> {
    try {
      const contract = this.getContract();
      
      console.log(`⏳ Executing platform-sponsored admin transfer of Token #${tokenId} from ${fromAddress} to ${toAddress}...`);
      const tx = await contract.adminTransfer(fromAddress, toAddress, tokenId);
      const receipt = await tx.wait();
      
      console.log(`✅ On-chain ownership transfer completed! TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      console.error(`❌ Error executing admin transfer for Token #${tokenId}:`, error);
      throw error;
    }
  }

  // Read verified product data directly from smart contract
  async verifyProduct(tokenId: number): Promise<ProductVerification> {
    try {
      const contract = this.getContract();
      const result = await contract.verifyProduct(tokenId);
      
      return {
        productId: '', // Retrievable from IPFS metadata URI
        supplier: result[0], // currentOwner
        giTag: '', // Retrievable from IPFS metadata URI
        isVerified: true,
        mintDate: Number(result[2]), // mintDate
        metadataURI: result[1] // metadataURI
      };
    } catch (error) {
      console.error(`❌ Error verifying token #${tokenId} on-chain:`, error);
      throw error;
    }
  }
}

export const web3Service = new Web3Service();
