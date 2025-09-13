// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MoneyLensLedger {
    // Transaction structure
    struct Transaction {
        string fromDept;
        string toDept;
        uint256 amount;
        string purpose;
        uint256 timestamp;
        address recorder;
    }
    
    // Array to store all transactions
    Transaction[] public transactions;
    
    // Events for transparency
    event TransactionRecorded(
        uint256 indexed transactionId,
        string fromDept,
        string toDept,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );
    
    // Add a new transaction
    function addTransaction(
        string memory _fromDept,
        string memory _toDept,
        uint256 _amount,
        string memory _purpose
    ) public {
        Transaction memory newTransaction = Transaction({
            fromDept: _fromDept,
            toDept: _toDept,
            amount: _amount,
            purpose: _purpose,
            timestamp: block.timestamp,
            recorder: msg.sender
        });
        
        transactions.push(newTransaction);
        
        emit TransactionRecorded(
            transactions.length - 1,
            _fromDept,
            _toDept,
            _amount,
            _purpose,
            block.timestamp
        );
    }
    
    // Get transaction by index
    function getTransaction(uint256 _index) public view returns (
        string memory fromDept,
        string memory toDept,
        uint256 amount,
        string memory purpose,
        uint256 timestamp,
        address recorder
    ) {
        require(_index < transactions.length, "Transaction does not exist");
        
        Transaction memory txn = transactions[_index];
        return (
            txn.fromDept,
            txn.toDept,
            txn.amount,
            txn.purpose,
            txn.timestamp,
            txn.recorder
        );
    }
    
    // Get total number of transactions
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    
    // Get all transactions (for frontend)
    function getAllTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
}