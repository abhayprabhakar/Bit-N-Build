const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("Deploying MoneyLensLedger contract...");
    
    // Get the ContractFactory
    const MoneyLensLedger = await ethers.getContractFactory("MoneyLensLedger");
    
    // Deploy the contract
    const moneyLensLedger = await MoneyLensLedger.deploy();
    await moneyLensLedger.deployed();
    
    console.log("✅ MoneyLensLedger deployed to:", moneyLensLedger.address);
    // Auto-update .env file with new contract address
    const envPath = '../.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${moneyLensLedger.address}`);
    } else {
        envContent += `\nCONTRACT_ADDRESS=${moneyLensLedger.address}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Contract address updated in .env file");
    
    console.log("🔗 Transaction hash:", moneyLensLedger.deployTransaction.hash);
    console.log("⛽ Gas used:", (await moneyLensLedger.deployTransaction.wait()).gasUsed.toString());
    
    return moneyLensLedger.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });