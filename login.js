// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const financeForm = document.getElementById('financeForm');
const totalIncome = document.getElementById('totalIncome');
const totalExpenses = document.getElementById('totalExpenses');
const balance = document.getElementById('balance');
const transactionList = document.getElementById('transactionList');
const financeChartCanvas = document.getElementById('financeChart');

// API URLs
const API_URL = 'http://localhost:5000';

// Check if user is already logged in when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  // Debug output of all DOM elements
  console.log('Login Section:', loginSection);
  console.log('Dashboard Section:', dashboardSection);
  console.log('Login Form:', loginForm);
  console.log('Username Element:', userName);
  console.log('Finance Form:', financeForm);
  
  // Check if all DOM elements are correctly defined
  if (!loginSection || !dashboardSection || !loginForm) {
    console.error('Some DOM elements were not found. Check your HTML.');
    return;
  }
  
  checkAuthStatus();
});

// Helper functions
function showSection(section) {
  console.log('Showing section:', section);
  if (section === 'login') {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
  } else if (section === 'dashboard') {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Authentication Functions
async function checkAuthStatus() {
  console.log('Checking authentication status...');
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Found' : 'Not found');
  
  if (!token) {
    console.log('No token found, showing login section');
    showSection('login');
    return;
  }
  
  try {
    console.log('Fetching user data with token...');
    const userData = await fetchUserData(token);
    console.log('User data received:', userData);
    
    if (userData) {
      console.log('Loading dashboard with user data:', userData);
      await loadDashboardData(userData);
      showSection('dashboard');
    } else {
      console.log('User data is null, removing token and showing login');
      localStorage.removeItem('token');
      showSection('login');
    }
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('token');
    showSection('login');
  }
}

async function fetchUserData(token) {
  console.log('Fetching user data from API...');
  try {
    console.log('Making request to /user endpoint');
    const response = await fetch(`${API_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to fetch user data. Status:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    console.log('User data parsed successfully:', userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Dashboard Functions
async function loadDashboardData(userData) {
  console.log('Loading dashboard data for user:', userData);
  
  // Check if userName element exists before setting content
  if (userName) {
    userName.textContent = userData.name || userData.email;
    console.log('Set username to:', userName.textContent);
  } else {
    console.error('userName element not found in the DOM');
  }
  
  await loadTransactions();
}

async function loadTransactions() {
  console.log('Loading transactions...');
  const token = localStorage.getItem('token');
  
  try {
    console.log('Making request to /transactions endpoint');
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Transactions response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch transactions. Status:', response.status, errorText);
      throw new Error('Failed to fetch transactions');
    }
    
    const transactions = await response.json();
    console.log('Transactions retrieved:', transactions.length);
    updateFinancialSummary(transactions);
    renderTransactionList(transactions);
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

function updateFinancialSummary(transactions) {
  console.log('Updating financial summary with', transactions.length, 'transactions');
  
  // Check if summary elements exist
  if (!totalIncome || !totalExpenses || !balance) {
    console.error('Financial summary elements not found in DOM');
    return;
  }
  
  let incomeSum = 0;
  let expenseSum = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      incomeSum += parseFloat(transaction.amount);
    } else {
      expenseSum += parseFloat(transaction.amount);
    }
  });
  
  const balanceAmount = incomeSum - expenseSum;
  
  console.log('Income sum:', incomeSum);
  console.log('Expense sum:', expenseSum);
  console.log('Balance:', balanceAmount);
  
  totalIncome.textContent = formatCurrency(incomeSum);
  totalExpenses.textContent = formatCurrency(expenseSum);
  balance.textContent = formatCurrency(balanceAmount);
  
  // Apply color based on balance
  if (balanceAmount > 0) {
    balance.classList.add('positive');
    balance.classList.remove('negative');
  } else if (balanceAmount < 0) {
    balance.classList.add('negative');
    balance.classList.remove('positive');
  } else {
    balance.classList.remove('positive', 'negative');
  }
}

function renderTransactionList(transactions) {
  console.log('Rendering transaction list');
  
  if (!transactionList) {
    console.error('transactionList element not found in DOM');
    return;
  }
  
  transactionList.innerHTML = '';
  
  if (transactions.length === 0) {
    console.log('No transactions to display');
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No transactions yet. Add your first transaction above.';
    emptyMessage.className = 'empty-message';
    transactionList.appendChild(emptyMessage);
    return;
  }
  
  console.log('Sorting transactions by date');
  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  console.log('Creating transaction elements');
  transactions.forEach(transaction => {
    const li = document.createElement('li');
    li.className = `transaction ${transaction.type}`;
    
    const amount = parseFloat(transaction.amount);
    const formattedAmount = formatCurrency(amount);
    
    const date = new Date(transaction.createdAt);
    const formattedDate = date.toLocaleDateString();
    
    li.innerHTML = `
      <div class="transaction-info">
        <span class="description">${transaction.description}</span>
        <span class="date">${formattedDate}</span>
        <span class="amount">${formattedAmount}</span>
      </div>
      <div class="transaction-type">${transaction.type}</div>
    `;
    
    transactionList.appendChild(li);
  });
  
  console.log('Transaction list rendering complete');
}

async function addTransaction(transactionData) {
  console.log('Adding new transaction:', transactionData);
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData)
    });
    
    console.log('Add transaction response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to add transaction');
    }
    
    console.log('Transaction added successfully');
    await loadTransactions();
    return true;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return false;
  }
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('Login form submitted');
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('Login attempt for email:', email);
  
  try {
    loginMessage.textContent = 'Logging in...';
    loginMessage.className = 'message info';
    
    console.log('Sending login request to server');
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login response status:', response.status);
    const data = await response.json();
    console.log('Login response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Invalid email or password');
    }
    
    console.log('Login successful, saving token');
    localStorage.setItem('token', data.token);
    loginMessage.textContent = 'Login successful!';
    loginMessage.className = 'message success';
    loginForm.reset();
    
    console.log('Fetching user data after login');
    const userData = await fetchUserData(data.token);
    if (userData) {
      console.log('User data received, loading dashboard');
      await loadDashboardData(userData);
      showSection('dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    loginMessage.textContent = error.message;
    loginMessage.className = 'message error';
  }
});

logoutBtn.addEventListener('click', () => {
  console.log('Logout button clicked');
  localStorage.removeItem('token');
  showSection('login');
  loginMessage.textContent = '';
  loginMessage.className = 'message';
});
document.getElementById("toolsBtn").addEventListener("click", function() {
  window.location.href = "tools.html"; // Change this to the correct URL
});

document.getElementById("chatbotBtn").addEventListener("click", function() {
  window.location.href = "chatbot.html"; 
});

// Add event listener for the finance form
if (financeForm) {
  financeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Finance form submitted');
    
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const type = document.getElementById('type').value;
    
    console.log('Transaction details:', { description, amount, type });
    
    if (!description || !amount) {
      console.warn('Missing required fields');
      alert('Please fill all fields');
      return;
    }
    
    const transactionData = {
      description,
      amount: parseFloat(amount),
      type
    };
    
    console.log('Submitting transaction data:', transactionData);
    const success = await addTransaction(transactionData);
    if (success) {
      console.log('Transaction added successfully, resetting form');
      financeForm.reset();
    }
  });
} else {
  console.error('Finance form element not found in DOM');
}
let financeChart; // Store the chart instance globally

function updateFinancialSummary(transactions) {
  console.log('Updating financial summary with', transactions.length, 'transactions');
  
  if (!totalIncome || !totalExpenses || !balance) {
    console.error('Financial summary elements not found in DOM');
    return;
  }
  
  let incomeSum = 0;
  let expenseSum = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      incomeSum += parseFloat(transaction.amount);
    } else {
      expenseSum += parseFloat(transaction.amount);
    }
  });

  const balanceAmount = incomeSum - expenseSum;

  totalIncome.textContent = formatCurrency(incomeSum);
  totalExpenses.textContent = formatCurrency(expenseSum);
  balance.textContent = formatCurrency(balanceAmount);

  // Update the Chart
  updateFinanceChart(incomeSum, expenseSum);
}

function updateFinanceChart(income, expenses) {
  if (financeChart) {
    financeChart.destroy(); // Destroy existing chart before creating a new one
  }

  financeChart = new Chart(financeChartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [income, expenses],
        backgroundColor: ['#4CAF50', '#F44336']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Add this to check HTML structure
console.log('HTML Body structure:', document.body.innerHTML);