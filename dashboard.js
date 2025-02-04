// Initialize variables to store financial data
let totalIncome = 0;
let totalExpenses = 0;
let transactions = [];

// Get references to DOM elements
const financeForm = document.getElementById('financeForm');
const typeInput = document.getElementById('type');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const totalIncomeDisplay = document.getElementById('totalIncome');
const totalExpensesDisplay = document.getElementById('totalExpenses');
const balanceDisplay = document.getElementById('balance');
const transactionList = document.getElementById('transactionList');

// Set up API URL (Update with your backend URL if hosted)
const API_URL = 'http://localhost:3000';  // Local development, change if deploying

// Function to update the financial summary
function updateSummary() {
    // Calculate balance
    const balance = totalIncome - totalExpenses;

    // Update the DOM with new values
    totalIncomeDisplay.textContent = `${totalIncome}`;
    totalExpensesDisplay.textContent = `${totalExpenses}`;
    balanceDisplay.textContent = `${balance}`;
}

// Function to add a transaction to the history
async function addTransaction(type, amount, description) {
    const username = 'user1'; // Replace with the logged-in user

    const transaction = {
        type,
        amount,
        description,
        date: new Date().toLocaleString()
    };

    // Update the totals based on the transaction type
    if (type === 'income') {
        totalIncome += amount;
    } else if (type === 'expense') {
        totalExpenses += amount;
    }

    // Send transaction data to the backend (MongoDB)
    try {
        const response = await fetch(`${API_URL}/addTransaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, type, amount, description })
        });
        const result = await response.text();
        if (result === 'Transaction added successfully') {
            transactions.push(transaction);  // Add transaction to local state
            updateSummary();  // Update the financial summary
            renderTransactions();  // Re-render transactions
        } else {
            alert('Failed to add transaction: ' + result);
        }
    } catch (error) {
        alert('Error while adding transaction: ' + error);
    }
}

// Function to render transactions from MongoDB
async function renderTransactions() {
    // Clear the list
    transactionList.innerHTML = '';

    // Fetch transactions from the backend
    const username = 'user1'; // Replace with the logged-in user
    try {
        const response = await fetch(`${API_URL}/getTransactions/${username}`);
        const data = await response.json();
        transactions = data; // Update the local state with fetched transactions

        // Loop through transactions and add them to the list
        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.classList.add(transaction.type); // Add class for styling (income/expense)
            li.innerHTML = `
                <span>${transaction.description}</span>
                <span>$${transaction.amount}</span>
                <span>${transaction.date}</span>
            `;
            transactionList.appendChild(li);
        });
    } catch (error) {
        alert('Error while fetching transactions: ' + error);
    }
}

// Handle form submission
financeForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting

    // Get input values
    const type = typeInput.value;
    const amount = parseFloat(amountInput.value) || 0;
    const description = descriptionInput.value.trim();

    // Validate inputs
    if (amount <= 0 || !description) {
        alert('Please enter a valid amount and description.');
        return;
    }

    // Add the transaction and send it to the backend
    addTransaction(type, amount, description);

    // Clear the form inputs
    amountInput.value = '';
    descriptionInput.value = '';
});

// Fetch initial transaction data when the page loads
window.addEventListener('load', function () {
    renderTransactions();
});
async function fetchTransactions() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in first!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5501/get-transactions", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            const transactionList = document.getElementById("transaction-list");
            transactionList.innerHTML = ""; // Clear existing entries

            data.forEach(transaction => {
                const listItem = document.createElement("li");
                listItem.textContent = `${transaction.type.toUpperCase()}: ₹${transaction.amount} - ${transaction.description} (${new Date(transaction.date).toLocaleString()})`;
                transactionList.appendChild(listItem);
            });
        } else {
            alert("Error fetching transactions: " + data.error);
        }
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

// Call this function when the page loads to show previous transactions
document.addEventListener("DOMContentLoaded", fetchTransactions);
