document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let transactions = [];
    let totalIncome = 0;
    let totalExpenses = 0;
    let balance = 0;

    // Get user ID and token from localStorage (set during login)
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    // If no user ID or token is found, redirect to login page
    if (!userId || !token) {
        window.location.href = 'loginpage.html';
        return;
    }

    // Welcome the user
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.querySelector('header h1').innerHTML = `Financial Overview <span class="welcome-text">Welcome, ${userName}</span>`;
    }

    // Get DOM elements
    const financeForm = document.getElementById('financeForm');
    const typeSelect = document.getElementById('type');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const totalIncomeElement = document.getElementById('totalIncome');
    const totalExpensesElement = document.getElementById('totalExpenses');
    const balanceElement = document.getElementById('balance');
    const transactionList = document.getElementById('transactionList');

    // Add transaction
    financeForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const type = typeSelect.value;
        const amount = parseFloat(amountInput.value.trim());
        const description = descriptionInput.value.trim();

        if (isNaN(amount) || amount <= 0 || !description) {
            alert('Please enter a valid amount and description');
            return;
        }

        // Create transaction object
        const transaction = { userId, type, amount, description };

        try {
            const response = await fetch('http://localhost:5000/transactions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Add token for authentication
                },
                body: JSON.stringify(transaction),
            });

            if (!response.ok) {
                throw new Error('Failed to save transaction');
            }

            const data = await response.json();
            transactions.unshift(data); // Add to local array

            calculateTotals();
            updateUI();

            financeForm.reset();
            amountInput.focus();
        } catch (error) {
            console.error('Transaction Error:', error);
            alert('Failed to save transaction. Please try again.');
        }
    });

    // Fetch transactions from server
    async function fetchTransactions() {
        try {
            const response = await fetch(`http://localhost:5000/transactions/${userId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` } // Add token for authentication
            });
            if (!response.ok) {
                throw new Error('Failed to load transactions');
            }

            transactions = await response.json();
            calculateTotals();
            updateUI();
        } catch (error) {
            console.error('Fetch Transactions Error:', error);
            alert(error.message);
        }
    }

    // Calculate totals
    function calculateTotals() {
        totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        balance = totalIncome - totalExpenses;
    }

    // Update UI function
    function updateUI() {
        totalIncomeElement.textContent = formatCurrency(totalIncome);
        totalExpensesElement.textContent = formatCurrency(totalExpenses);
        balanceElement.textContent = formatCurrency(balance);

        transactionList.innerHTML = transactions.length === 0
            ? '<li>No transactions yet</li>'
            : transactions.slice(0, 5).map(transaction => `
                <li class="${transaction.type}">
                    <div class="transaction-details">
                        <div>${transaction.description}</div>
                        <div class="transaction-description">${new Date(transaction.date || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div class="transaction-amount">${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}</div>
                    <button class="delete-btn" data-id="${transaction._id}">×</button>
                </li>
            `).join('');

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => deleteTransaction(button.dataset.id));
        });
    }

    // Delete transaction
    async function deleteTransaction(transactionId) {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            const response = await fetch(`http://localhost:5000/transactions/${transactionId}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` } // Add token for authentication
            });

            if (!response.ok) {
                throw new Error('Failed to delete transaction');
            }

            transactions = transactions.filter(t => t._id !== transactionId);
            calculateTotals();
            updateUI();
        } catch (error) {
            console.error('Delete Error:', error);
            alert(error.message);
        }
    }

    // Format currency function
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    // Add logout button
    function addLogoutButton() {
        const header = document.querySelector('header');
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'logout-btn';
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'loginpage.html';
        });
        header.appendChild(logoutBtn);
    }

    // Initialize
    fetchTransactions();
    addLogoutButton();
});
