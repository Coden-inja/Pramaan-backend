import hre from 'hardhat';

async function main() {
  console.log('⏳ Establishing sandbox connection...');
  const connection = await hre.network.create() as any;
  console.log('🔌 Ethers plugin present on connection:', 'ethers' in connection);
  if (connection.ethers) {
    console.log('⚡ Ethers methods:', Object.keys(connection.ethers).filter(k => typeof connection.ethers[k] === 'function'));
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
