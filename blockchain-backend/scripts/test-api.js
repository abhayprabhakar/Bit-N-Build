const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
    console.log("🧪 Testing MoneyLens API...\n");

    try {
        // Test 1: Health check
        console.log("1️⃣ Testing health endpoint...");
        const health = await axios.get(`${API_BASE}/health`);
        console.log("✅ Health check:", health.data.message);

        // Test 2: Get all transactions
        console.log("\n2️⃣ Getting all transactions...");
        const allTx = await axios.get(`${API_BASE}/transactions`);
        console.log(`✅ Found ${allTx.data.count} transactions`);

        // Test 3: Add new transaction
        console.log("\n3️⃣ Adding new transaction...");
        const newTx = await axios.post(`${API_BASE}/transactions`, {
            fromDept: "Marketing Department",
            toDept: "Event Management",
            amount: "250000",
            purpose: "Conference Organization"
        });
        console.log("✅ Transaction added:", newTx.data.message);

        // Test 4: Get updated transactions
        console.log("\n4️⃣ Getting updated transactions...");
        const updatedTx = await axios.get(`${API_BASE}/transactions`);
        console.log(`✅ Now have ${updatedTx.data.count} transactions`);

        // Test 5: Get specific transaction
        console.log("\n5️⃣ Getting specific transaction...");
        const specificTx = await axios.get(`${API_BASE}/transactions/0`);
        console.log("✅ Transaction 0:", specificTx.data.transaction.fromDept, "→", specificTx.data.transaction.toDept);

        // Test 6: Get stats
        console.log("\n6️⃣ Getting stats...");
        const stats = await axios.get(`${API_BASE}/stats`);
        console.log("✅ Total transactions:", stats.data.totalTransactions);

        console.log("\n🎉 All API tests completed successfully!");

    } catch (error) {
        console.error("❌ API test failed:", error.message);
        if (error.response) {
            console.error("Response:", error.response.data);
        }
    }
}

testAPI();
