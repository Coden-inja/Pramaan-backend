import fs from 'fs';
import path from 'path';
import solc from 'solc';

// Resolve paths
const contractPath = path.resolve('contracts', 'PramaamGITag.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Input configuration for Solc
const input = {
  language: 'Solidity',
  sources: {
    'PramaamGITag.sol': {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object']
      }
    }
  }
};

// Callback to handle OpenZeppelin imports
function findImports(importPath: string) {
  let fullPath = importPath;
  if (importPath.startsWith('@openzeppelin/')) {
    fullPath = path.resolve('node_modules', importPath);
  } else {
    fullPath = path.resolve('contracts', importPath);
  }
  
  try {
    return { contents: fs.readFileSync(fullPath, 'utf8') };
  } catch (error: any) {
    return { error: 'File not found: ' + fullPath };
  }
}

// Compile
console.log('⏳ Compiling smart contract with solc...');
const output = JSON.parse(
  solc.compile(JSON.stringify(input), { import: findImports })
);

if (output.errors) {
  let hasErrors = false;
  output.errors.forEach((err: any) => {
    console.log(err.formattedMessage);
    if (err.severity === 'error') {
      hasErrors = true;
    }
  });
  if (hasErrors) {
    console.error('❌ Smart contract compilation failed.');
    process.exit(1);
  }
}

const contract = output.contracts['PramaamGITag.sol']['PramaamGITag'];

// Save ABI and Bytecode
const abiDir = path.resolve('src', 'abi');
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

fs.writeFileSync(
  path.join(abiDir, 'PramaamGITag.json'),
  JSON.stringify({
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  }, null, 2)
);

console.log('✅ Contract compiled successfully! Output saved to src/abi/PramaamGITag.json');
process.exit(0);
