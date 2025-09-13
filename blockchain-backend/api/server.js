const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' }); // Look for .env in root directory
const host = process.env.BLOCKCHAIN_HOST || "localhost";
const port = process.env.BLOCKCHAIN_PORT || "8545";

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Blockchain connection setup
let provider;
let contract;
let contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your deployed contract

// Contract ABI (from your artifacts)
const contractABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "_fromDept", "type": "string"},
            {"internalType": "string", "name": "_toDept", "type": "string"},
            {"internalType": "uint256", "name": "_amount", "type": "uint256"},
            {"internalType": "string", "name": "_purpose", "type": "string"}
        ],
        "name": "addTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllTransactions",
        "outputs": [
            {
                "components": [
                    {"internalType": "string", "name": "fromDept", "type": "string"},
                    {"internalType": "string", "name": "toDept", "type": "string"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"},
                    {"internalType": "string", "name": "purpose", "type": "string"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "address", "name": "recorder", "type": "address"}
                ],
                "internalType": "struct MoneyLensLedger.Transaction[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_index", "type": "uint256"}],
        "name": "getTransaction",
        "outputs": [
            {"internalType": "string", "name": "fromDept", "type": "string"},
            {"internalType": "string", "name": "toDept", "type": "string"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "string", "name": "purpose", "type": "string"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "address", "name": "recorder", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTransactionCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Initialize blockchain connection
async function initBlockchain() {
    try {
        provider = new ethers.providers.JsonRpcProvider(`http://${host}:${port}`);
        const signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("✅ Connected to blockchain at:", contractAddress);
    } catch (error) {
        console.error("❌ Failed to connect to blockchain:", error.message);
    }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MoneyLens API is running',
        timestamp: new Date().toISOString(),
        contract: contractAddress
    });
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        console.log("📋 Fetching all transactions...");
        const transactions = await contract.getAllTransactions();
        
        const formattedTransactions = transactions.map((tx, index) => ({
            id: index,
            fromDept: tx.fromDept,
            toDept: tx.toDept,
            amount: ethers.utils.formatUnits(tx.amount, 18),
            purpose: tx.purpose,
            timestamp: new Date(tx.timestamp * 1000).toISOString(),
            recorder: tx.recorder
        }));

        res.json({
            success: true,
            count: formattedTransactions.length,
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error("❌ Error fetching transactions:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get transaction by ID
app.get('/api/transactions/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log(`🔍 Fetching transaction ${id}...`);
        
        const tx = await contract.getTransaction(id);
        
        const formattedTransaction = {
            id: id,
            fromDept: tx.fromDept,
            toDept: tx.toDept,
            amount: ethers.utils.formatUnits(tx.amount, 18),
            purpose: tx.purpose,
            timestamp: new Date(tx.timestamp * 1000).toISOString(),
            recorder: tx.recorder
        };

        res.json({
            success: true,
            transaction: formattedTransaction
        });
    } catch (error) {
        console.error("❌ Error fetching transaction:", error.message);
        res.status(404).json({
            success: false,
            error: "Transaction not found"
        });
    }
});

// Add new transaction
app.post('/api/transactions', async (req, res) => {
    try {
        const { fromDept, toDept, amount, purpose } = req.body;

        // Validation
        if (!fromDept || !toDept || !amount || !purpose) {
            return res.status(400).json({
                success: false,
                error: "All fields are required: fromDept, toDept, amount, purpose"
            });
        }

        console.log("💰 Adding new transaction...");
        console.log(`From: ${fromDept} → To: ${toDept} | Amount: ₹${amount} | Purpose: ${purpose}`);

        // Convert amount to wei (blockchain format)
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

        // Add transaction to blockchain
        const tx = await contract.addTransaction(fromDept, toDept, amountInWei, purpose);
        const receipt = await tx.wait();

        console.log("✅ Transaction added successfully!");
        console.log("🔗 Transaction hash:", receipt.transactionHash);

        res.json({
            success: true,
            message: "Transaction added successfully",
            transactionHash: receipt.transactionHash,
            gasUsed: receipt.gasUsed.toString()
        });
    } catch (error) {
        console.error("❌ Error adding transaction:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get transaction count
app.get('/api/stats', async (req, res) => {
    try {
        const count = await contract.getTransactionCount();
        res.json({
            success: true,
            totalTransactions: count.toString(),
            contractAddress: contractAddress
        });
    } catch (error) {
        console.error("❌ Error getting stats:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
async function startServer() {
    await initBlockchain();
    
    app.listen(PORT, () => {
        console.log("\n🚀 MoneyLens API Server Started!");
        console.log(`📡 Server running on: http://localhost:${PORT}`);
        console.log(`🔗 Blockchain contract: ${contractAddress}`);
        console.log(`📋 API endpoints:`);
        console.log(`   GET  /api/health`);
        console.log(`   GET  /api/transactions`);
        console.log(`   GET  /api/transactions/:id`);
        console.log(`   POST /api/transactions`);
        console.log(`   GET  /api/stats`);
        console.log("\n✅ Ready to serve requests!\n");
    });
}

startServer();
