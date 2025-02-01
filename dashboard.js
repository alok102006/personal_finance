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
function addTransaction(type, amount, description) {
    const transaction = {
        type,
        amount,
        description,
        date: new Date().toLocaleString()
    };

    // Add transaction to the array
    transactions.push(transaction);

    // Update the transaction history list
    renderTransactions();
}

// Function to render transactions
function renderTransactions() {
    // Clear the list
    transactionList.innerHTML = '';

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

    // Update totals based on transaction type
    if (type === 'income') {
        totalIncome += amount;
    } else if (type === 'expense') {
        totalExpenses += amount;
    }

    // Add the transaction to the history
    addTransaction(type, amount, description);

    // Update the summary
    updateSummary();

    // Clear the form inputs
    amountInput.value = '';
    descriptionInput.value = '';
});