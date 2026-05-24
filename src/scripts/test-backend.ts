import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
// Dynamically generate a unique email on every run to guarantee a clean DB state
const testEmail = `artisan.test_${Date.now()}@pramaan.com`;
const testPassword = 'securePassword123';

async function runIntegrationTest() {
  console.log('🚀 ==================================================');
  console.log('🚀 STARTING AUTOMATED BACKEND INTEGRATION TEST...');
  console.log('🚀 ==================================================\n');
  console.log(`📧 Test Runner Identity: ${testEmail}\n`);

  let token = '';

  // -------------------------------------------------------------
  // STEP 1: REGISTER TEST SUPPLIER (FULLY AUDITED PAYLOAD)
  // -------------------------------------------------------------
  try {
    console.log('🔑 [Step 1/5] Registering new test supplier...');
    const regPayload = {
      name: "Master Weaver Dev",
      email: testEmail,
      password: testPassword,
      role: "supplier",
      businessName: "Kashmiri Heritage Weavers Ltd",
      location: "Srinagar, Jammu & Kashmir",
      craftType: "Pashmina Weaving",
      region: "North India",
      state: "J&K",
      phone: "+919876543210",
      latitude: 34.0837,
      longitude: 74.7973,
      bio: "Master artisan weaver preserving the ancestral heritage of pure Pashmina fabrics in the Kashmir Valley."
    };

    const response = await axios.post(`${API_BASE}/auth/register`, regPayload);
    token = response.data.token;
    console.log('   ✅ Registration successful!');
    console.log(`   📌 Assigned Mongo User ID: ${response.data.user.id}`);
  } catch (error: any) {
    console.error('   ❌ Registration failed:', JSON.stringify(error.response?.data || error.message, null, 2));
    process.exit(1);
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // -------------------------------------------------------------
  // STEP 2: RETRIEVE AUTO-GENERATED CUSTODIAL WALLET
  // -------------------------------------------------------------
  let supplierAddress = '';
  try {
    console.log('\n🌾 [Step 2/5] Fetching supplier profile & custodial wallet address...');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, authHeaders);
    supplierAddress = profileResponse.data.supplier?.blockchainAddress;

    if (!supplierAddress) {
      throw new Error('No blockchain address returned in supplier profile!');
    }

    console.log('   ✅ Profile fetched successfully!');
    console.log(`   📍 Artisan Custodial Wallet: ${supplierAddress}`);
  } catch (error: any) {
    console.error('   ❌ Profile retrieval failed:', JSON.stringify(error.response?.data || error.message, null, 2));
    process.exit(1);
  }

  // -------------------------------------------------------------
  // STEP 3: CREATE DRAFT PRODUCT IN DATABASE (FULLY AUDITED SCHEMA)
  // -------------------------------------------------------------
  let productId = '';
  try {
    console.log('\n📦 [Step 3/5] Creating draft product in MongoDB...');
    const productPayload = {
      title: "Royal Pashmina Kani Shawl",
      description: "A heritage Kani shawl crafted with premium hand-spun Pashmina wool and organic dyes.",
      category: "Textiles",
      materials: ["Pashmina Wool", "Indigo Dye", "Saffron Dye"],
      timeTaken: "8 Months",
      price: 1500,
      images: ["https://images.unsplash.com/photo-1606744824163-985d376605aa"],
      craftDetails: {
        technique: "Kani Weaving",
        region: "Kashmir Valley",
        heritage: "Traditional Mughal court styling"
      }
    };

    const response = await axios.post(`${API_BASE}/products`, productPayload, authHeaders);
    productId = response.data.product._id;
    console.log('   ✅ Draft product created successfully!');
    console.log(`   📌 MongoDB Product ID: ${productId}`);
  } catch (error: any) {
    console.error('   ❌ Product creation failed:', JSON.stringify(error.response?.data || error.message, null, 2));
    process.exit(1);
  }

  // -------------------------------------------------------------
  // STEP 4: MINT GI TAG NFT ON LIVE POLYGON AMOY TESTNET
  // -------------------------------------------------------------
  try {
    console.log('\n⚡ [Step 4/5] Initiating IPFS pinning & on-chain Polygon Amoy minting...');
    console.log('   ⏳ (This takes ~15-20 seconds for Pinata IPFS + blockchain block confirmation)...');
    
    const mintPayload = {
      giTag: "Kashmir Pashmina",
      giNumber: "GI-IND-462"
    };

    // Corrected to use the validated /mint-gi-tag endpoint
    const response = await axios.post(`${API_BASE}/products/${productId}/mint-gi-tag`, mintPayload, authHeaders);
    const data = response.data;

    console.log('   🎉 SUCCESS! Smart Contract minted GI Tag NFT!');
    console.log('   --------------------------------------------------');
    console.log(`   🎨 Token ID Assigned  : #${data.product.tokenId}`);
    console.log(`   🛡️ Transaction Hash   : ${data.product.transactionHash}`);
    console.log(`   ⛓️ Block Number        : ${data.product.blockNumber}`);
    console.log(`   📝 On-chain Status    : ${data.product.status.toUpperCase()}`);
    console.log('   --------------------------------------------------');
  } catch (error: any) {
    console.error('   ❌ Minting failed:', JSON.stringify(error.response?.data || error.message, null, 2));
    process.exit(1);
  }

  // -------------------------------------------------------------
  // STEP 5: VERIFY IMMUTABLE HISTORY PROVENANCE
  // -------------------------------------------------------------
  try {
    console.log('\n🔍 [Step 5/5] Fetching finalized product timeline from MongoDB...');
    const response = await axios.get(`${API_BASE}/products/${productId}`);
    const product = response.data;

    console.log('   ✅ Product verified in DB!');
    console.log('   📜 Provenance Timeline History:');
    product.timeline.forEach((event: any, index: number) => {
      console.log(`     [${index + 1}] ${event.event} (${new Date(event.date).toLocaleDateString()}):`);
      console.log(`         "${event.description}"`);
    });

    console.log('\n🏆 ==================================================');
    console.log('🏆 END-TO-END INTEGRATION TEST COMPLETED SUCCESSFULLY!');
    console.log('🏆 ==================================================');
  } catch (error: any) {
    console.error('   ❌ Provenance history verification failed:', JSON.stringify(error.response?.data || error.message, null, 2));
    process.exit(1);
  }
}

runIntegrationTest();
