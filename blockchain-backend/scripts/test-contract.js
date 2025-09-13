const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing MoneyLensLedger Contract...\n");
    
    // Connect to deployed contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const MoneyLensLedger = await ethers.getContractFactory("MoneyLensLedger");
    const contract = MoneyLensLedger.attach(contractAddress);
    
    console.log("📊 Contract connected at:", contractAddress);
    
    // Test 1: Add first transaction
    console.log("\n💰 Adding Transaction 1...");
    const tx1 = await contract.addTransaction(
        "Finance Department",
        "Engineering Department", 
        ethers.utils.parseUnits("1000000", 18), // 10 Lakh (in wei)
        "Lab Equipment Purchase"
    );
    await tx1.wait();
    console.log("✅ Transaction 1 added!");
    
    // Test 2: Add second transaction
    console.log("\n💰 Adding Transaction 2...");
    const tx2 = await contract.addTransaction(
        "Engineering Department",
        "ABC Vendor",
        ethers.utils.parseUnits("500000", 18), // 5 Lakh
        "Hardware Procurement"
    );
    await tx2.wait();
    console.log("✅ Transaction 2 added!");
    
    // Test 3: Get transaction count
    const count = await contract.getTransactionCount();
    console.log("\n📈 Total Transactions:", count.toString());
    
    // Test 4: Retrieve first transaction
    console.log("\n🔍 Retrieving Transaction 0:");
    const transaction = await contract.getTransaction(0);
    console.log("From:", transaction.fromDept);
    console.log("To:", transaction.toDept);
    console.log("Amount:", ethers.utils.formatUnits(transaction.amount, 18));
    console.log("Purpose:", transaction.purpose);
    console.log("Timestamp:", new Date(transaction.timestamp * 1000).toLocaleString());
    
    // Test 5: Get all transactions
    console.log("\n📋 All Transactions:");
    const allTx = await contract.getAllTransactions();
    allTx.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.fromDept} → ${tx.toDept}: ₹${ethers.utils.formatUnits(tx.amount, 18)} (${tx.purpose})`);
    });
    
    console.log("\n🎉 All tests completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });