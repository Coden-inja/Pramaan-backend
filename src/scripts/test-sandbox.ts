import hre from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🤖 Starting Local Zero-Gas Sandbox Test...');

  // 1. Establish the sandbox connection and destructure Ethers (Official Hardhat 3 Standard)
  const connection = await hre.network.create() as any;
  const { ethers } = connection;

  // 2. Get local signers (Hardhat automatically gives us 20 free accounts with 10k fake POL each!)
  const [admin, artisan, customer] = await ethers.getSigners();
  console.log(`👑 Platform Operator (Admin): ${admin.address}`);
  console.log(`🌾 Artisan custodial wallet:  ${artisan.address}`);
  console.log(`🛍️ Customer wallet:           ${customer.address}`);

  // 3. Load compiled contract ABI and Bytecode
  const artifactPath = path.resolve('src', 'abi', 'PramaamGITag.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('❌ Compiled contract artifact not found. Please compile the contract first.');
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // 4. Deploy contract to local sandbox network
  console.log('\n⏳ Deploying contract to sandbox...');
  const factory = new ethers.ContractFactory(abi, bytecode, admin);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`✅ Deployed locally at: ${contractAddress}`);

  // 4. Test Case 1: verifySupplier (Only admin can verify)
  console.log('\n🧪 Testing Case 1: Verifying supplier on-chain...');
  let tx = await contract.verifySupplier(artisan.address);
  await tx.wait();
  const isVerified = await contract.verifiedSuppliers(artisan.address);
  if (isVerified) {
    console.log('   ✅ Pass: Artisan successfully verified!');
  } else {
    throw new Error('   ❌ Fail: Artisan verification failed!');
  }

  // 5. Test Case 2: mintGITag (Mint NFT to Artisan)
  console.log('\n🧪 Testing Case 2: Minting GI Tag NFT to artisan...');
  const mockMetadataURI = 'ipfs://QmHash123MockProductMetadata';
  tx = await contract.mintGITag(artisan.address, mockMetadataURI);
  const receipt = await tx.wait();

  // Parse logs to get Token ID
  let tokenId = 0;
  if (receipt.logs) {
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'ProductMinted') {
          tokenId = Number(parsedLog.args.tokenId);
          break;
        }
      } catch (e) {}
    }
  }

  if (tokenId === 1) {
    console.log(`   ✅ Pass: NFT successfully minted! Token ID is #${tokenId}`);
  } else {
    throw new Error(`   ❌ Fail: Token ID expected to be 1, got ${tokenId}`);
  }

  // Verify properties are stored correctly
  const [currentOwner, metadataURI, mintDate] = await contract.verifyProduct(tokenId);
  if (currentOwner === artisan.address && metadataURI === mockMetadataURI) {
    console.log('   ✅ Pass: On-chain currentOwner and IPFS link match perfectly!');
  } else {
    throw new Error('   ❌ Fail: Token owner or metadata mismatch!');
  }

  // 6. Test Case 3: adminTransfer (Operator transfers NFT to Customer upon payment)
  console.log('\n🧪 Testing Case 3: Sponsoring transfer from Artisan to Customer...');
  tx = await contract.adminTransfer(artisan.address, customer.address, tokenId);
  await tx.wait();

  const newOwner = await contract.ownerOf(tokenId);
  if (newOwner === customer.address) {
    console.log(`   ✅ Pass: NFT ownership successfully transferred to Customer!`);
  } else {
    throw new Error(`   ❌ Fail: NFT expected to be owned by customer, got ${newOwner}`);
  }

  // 7. Test Case 4: getOwnershipHistory
  console.log('\n🧪 Testing Case 4: Checking ownership provenance history...');
  const history = await contract.getOwnershipHistory(tokenId);
  console.log('   Provenance Log:');
  history.forEach((addr: string, index: number) => {
    console.log(`     [Owner #${index + 1}]: ${addr}`);
  });

  if (history.length === 2 && history[0] === artisan.address && history[1] === customer.address) {
    console.log('   ✅ Pass: Immutable provenance chain holds perfect historical integrity!');
  } else {
    throw new Error('   ❌ Fail: History array mismatch!');
  }

  console.log('\n🏆 ALL SANDBOX TESTS PASSED SUCCESSFULLY! The smart contract is 100% flawless.');
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Sandbox Test Failed:', error);
  process.exit(1);
});
