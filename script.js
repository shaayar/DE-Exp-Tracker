// DOM Elements
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');

// Dashboard sections
const dashboardOverview = document.getElementById('dashboard-overview');
const expensesSection = document.getElementById('expenses-section');
const reportsSection = document.getElementById('reports-section');
const categoriesSection = document.getElementById('categories-section');

// Navigation links
const expensesLink = document.getElementById('expenses-link');
const reportsLink = document.getElementById('reports-link');
const categoriesLink = document.getElementById('categories-link');

// Expense related elements
const addExpenseBtn = document.getElementById('add-expense-btn');
const expenseModal = document.getElementById('expense-modal');
const saveExpenseBtn = document.getElementById('save-expense-btn');
const cancelExpenseBtn = document.getElementById('cancel-expense-btn');
const expenseForm = document.getElementById('expense-form');
const expensesTableBody = document.getElementById('expenses-table-body');

// Category related elements
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryModal = document.getElementById('category-modal');
const saveCategoryBtn = document.getElementById('save-category-btn');
const cancelCategoryBtn = document.getElementById('cancel-category-btn');
const categoryForm = document.getElementById('category-form');

// Report related elements
const reportPeriod = document.getElementById('report-period');
const customDateRange = document.getElementById('custom-date-range');
const generateReportBtn = document.getElementById('generate-report-btn');
const reportSummary = document.getElementById('report-summary');

// Dashboard stats
const totalExpenses = document.getElementById('total-expenses');
const monthExpenses = document.getElementById('month-expenses');
const topCategory = document.getElementById('top-category');
const recentExpenses = document.getElementById('recent-expenses');

// Charts
let categoryChart;
let timeChart;
let categoryReportChart;

// Current user
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const loggedInUser = localStorage.getItem('currentUser');
  if (loggedInUser) {
    currentUser = JSON.parse(loggedInUser);
    showDashboard();
  }

  // Set up event listeners
  setupEventListeners();

  // Initialize default categories if they don't exist
  initializeDefaultCategories();
});

function setupEventListeners() {
  // Auth form toggling
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('text-indigo-600', 'border-indigo-600');
    loginTab.classList.remove('text-gray-500', 'border-transparent');
    signupTab.classList.add('text-gray-500', 'border-transparent');
    signupTab.classList.remove('text-indigo-600', 'border-indigo-600');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('text-indigo-600', 'border-indigo-600');
    signupTab.classList.remove('text-gray-500', 'border-transparent');
    loginTab.classList.add('text-gray-500', 'border-transparent');
    loginTab.classList.remove('text-indigo-600', 'border-indigo-600');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Login form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      showDashboard();
    } else {
      alert('Invalid email or password');
    }
  });

  // Signup form submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(u => u.email === email)) {
      alert('Email already in use');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showDashboard();
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    authContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  });

  // Navigation
  expensesLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('expenses');
  });

  reportsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('reports');
  });

  categoriesLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('categories');
  });

  // Expense modal
  addExpenseBtn.addEventListener('click', () => {
    expenseModal.classList.remove('hidden');
    // Set default date to today
    document.getElementById('expense-date').valueAsDate = new Date();
  });

  saveExpenseBtn.addEventListener('click', saveExpense);

  cancelExpenseBtn.addEventListener('click', () => {
    expenseModal.classList.add('hidden');
    expenseForm.reset();
  });

  // Category modal
  addCategoryBtn.addEventListener('click', () => {
    categoryModal.classList.remove('hidden');
  });

  saveCategoryBtn.addEventListener('click', saveCategory);
  cancelCategoryBtn.addEventListener('click', () => {
    categoryModal.classList.add('hidden');
    categoryForm.reset();
  });

  // Report period change
  reportPeriod.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      customDateRange.classList.remove('hidden');
    } else {
      customDateRange.classList.add('hidden');
    }
  });

  // Generate report
  generateReportBtn.addEventListener('click', generateReport);
}

function showDashboard() {
  authContainer.classList.add('hidden');
  dashboardContainer.classList.remove('hidden');

  // Set user name
  userName.textContent = currentUser.name;

  // Load dashboard data
  loadDashboardData();
  loadExpenses();
  loadCategories();

  // Show dashboard by default
  showSection('dashboard');
}

function showSection(section) {
  // Hide all sections
  dashboardOverview.classList.add('hidden');
  expensesSection.classList.add('hidden');
  reportsSection.classList.add('hidden');
  categoriesSection.classList.add('hidden');

  // Update active nav link
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('text-white', 'bg-indigo-600');
    link.classList.add('text-indigo-200', 'hover:text-white', 'hover:bg-indigo-600');
  });

  // Show selected section and update nav link
  switch (section) {
    case 'dashboard':
      dashboardOverview.classList.remove('hidden');
      document.getElementById('dashboard-title').textContent = 'Dashboard';
      break;
    case 'expenses':
      expensesSection.classList.remove('hidden');
      document.getElementById('dashboard-title').textContent = 'Expenses';
      expensesLink.classList.remove('text-indigo-200', 'hover:text-white', 'hover:bg-indigo-600');
      expensesLink.classList.add('text-white', 'bg-indigo-600');
      break;
    case 'reports':
      reportsSection.classList.remove('hidden');
      document.getElementById('dashboard-title').textContent = 'Reports';
      reportsLink.classList.remove('text-indigo-200', 'hover:text-white', 'hover:bg-indigo-600');
      reportsLink.classList.add('text-white', 'bg-indigo-600');
      generateReport(); // Generate default report
      break;
    case 'categories':
      categoriesSection.classList.remove('hidden');
      document.getElementById('dashboard-title').textContent = 'Categories';
      categoriesLink.classList.remove('text-indigo-200', 'hover:text-white', 'hover:bg-indigo-600');
      categoriesLink.classList.add('text-white', 'bg-indigo-600');
      break;
  }
}

function loadDashboardData() {
  const expenses = getExpenses();

  // Calculate total expenses
  const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  totalExpenses.textContent = `$${total.toFixed(2)}`;

  // Calculate this month's expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExp = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  monthExpenses.textContent = `$${monthExp.toFixed(2)}`;

  // Find top category
  const categoryTotals = {};
  expenses.forEach(expense => {
    if (categoryTotals[expense.category]) {
      categoryTotals[expense.category] += parseFloat(expense.amount);
    } else {
      categoryTotals[expense.category] = parseFloat(expense.amount);
    }
  });

  let topCat = '-';
  let maxAmount = 0;
  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCat = category;
    }
  }

  if (topCat !== '-') {
    topCategory.textContent = `${topCat} ($${maxAmount.toFixed(2)})`;
  } else {
    topCategory.textContent = topCat;
  }

  // Show recent expenses (last 5)
  recentExpenses.innerHTML = '';
  const recent = expenses.slice(0, 5);

  if (recent.length === 0) {
    recentExpenses.innerHTML = '<p class="text-sm text-gray-500">No recent expenses</p>';
  } else {
    recent.forEach(expense => {
      const expenseEl = document.createElement('div');
      expenseEl.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';

      const leftDiv = document.createElement('div');
      leftDiv.className = 'flex items-center';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'p-2 mr-3 rounded-full bg-indigo-100 text-indigo-600';
      iconDiv.innerHTML = '<i class="fas fa-receipt"></i>';

      const textDiv = document.createElement('div');
      const descP = document.createElement('p');
      descP.className = 'text-sm font-medium text-gray-900';
      descP.textContent = expense.description;

      const catP = document.createElement('p');
      catP.className = 'text-xs text-gray-500';
      catP.textContent = expense.category;

      textDiv.appendChild(descP);
      textDiv.appendChild(catP);

      leftDiv.appendChild(iconDiv);
      leftDiv.appendChild(textDiv);

      const rightDiv = document.createElement('div');
      rightDiv.className = 'text-right';

      const amountP = document.createElement('p');
      amountP.className = 'text-sm font-medium text-gray-900';
      amountP.textContent = `$${parseFloat(expense.amount).toFixed(2)}`;

      const dateP = document.createElement('p');
      dateP.className = 'text-xs text-gray-500';
      dateP.textContent = new Date(expense.date).toLocaleDateString();

      rightDiv.appendChild(amountP);
      rightDiv.appendChild(dateP);

      expenseEl.appendChild(leftDiv);
      expenseEl.appendChild(rightDiv);

      recentExpenses.appendChild(expenseEl);
    });
  }

  // Create/update category chart
  updateCategoryChart();
}

function getExpenses() {
  const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser.id}`)) || [];
  // Sort by date (newest first)
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveExpense() {
  const amount = document.getElementById('expense-amount').value;
  const description = document.getElementById('expense-description').value;
  const category = document.getElementById('expense-category').value;
  const date = document.getElementById('expense-date').value;

  if (!amount || !description || !category || !date) {
    alert('Please fill all fields');
    return;
  }

  const expenses = getExpenses();

  const newExpense = {
    id: Date.now().toString(),
    amount,
    description,
    category,
    date,
    createdAt: new Date().toISOString()
  };

  expenses.unshift(newExpense); // Add to beginning of array
  localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(expenses));

  // Close modal and reset form
  expenseModal.classList.add('hidden');
  expenseForm.reset();

  // Reload data
  loadDashboardData();
  loadExpenses();
}

function loadExpenses() {
  const expenses = getExpenses();
  expensesTableBody.innerHTML = '';

  if (expenses.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No expenses recorded yet</td>
                `;
    expensesTableBody.appendChild(row);
    return;
  }

  expenses.forEach(expense => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(expense.date).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${expense.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${parseFloat(expense.amount).toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-expense" data-id="${expense.id}">Edit</button>
                        <button class="text-red-600 hover:text-red-900 delete-expense" data-id="${expense.id}">Delete</button>
                    </td>
                `;
    expensesTableBody.appendChild(row);
  });

  // Add event listeners to edit and delete buttons
  document.querySelectorAll('.edit-expense').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const expenseId = e.target.getAttribute('data-id');
      editExpense(expenseId);
    });
  });

  document.querySelectorAll('.delete-expense').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const expenseId = e.target.getAttribute('data-id');
      deleteExpense(expenseId);
    });
  });
}

function editExpense(expenseId) {
  const expenses = getExpenses();
  const expense = expenses.find(e => e.id === expenseId);

  if (!expense) return;

  // Fill the form with expense data
  document.getElementById('expense-amount').value = expense.amount;
  document.getElementById('expense-description').value = expense.description;
  document.getElementById('expense-category').value = expense.category;
  document.getElementById('expense-date').value = expense.date.split('T')[0];

  // Show the modal
  expenseModal.classList.remove('hidden');

  // Change save button to update
  saveExpenseBtn.textContent = 'Update Expense';
  saveExpenseBtn.setAttribute('data-id', expenseId);

  // Remove previous event listener and add new one for update
  saveExpenseBtn.replaceWith(saveExpenseBtn.cloneNode(true));
  const newSaveBtn = document.getElementById('save-expense-btn');
  newSaveBtn.addEventListener('click', () => updateExpense(expenseId));
}

function updateExpense(expenseId) {
  const amount = document.getElementById('expense-amount').value;
  const description = document.getElementById('expense-description').value;
  const category = document.getElementById('expense-category').value;
  const date = document.getElementById('expense-date').value;

  if (!amount || !description || !category || !date) {
    alert('Please fill all fields');
    return;
  }

  const expenses = getExpenses();
  const expenseIndex = expenses.findIndex(e => e.id === expenseId);

  if (expenseIndex === -1) return;

  expenses[expenseIndex] = {
    ...expenses[expenseIndex],
    amount,
    description,
    category,
    date
  };

  localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(expenses));

  // Close modal and reset form
  expenseModal.classList.add('hidden');
  expenseForm.reset();

  // Reset save button
  saveExpenseBtn.textContent = 'Save Expense';
  saveExpenseBtn.removeAttribute('data-id');
  saveExpenseBtn.removeEventListener('click', updateExpense);
  saveExpenseBtn.addEventListener('click', saveExpense);

  // Reload data
  loadDashboardData();
  loadExpenses();
}

function deleteExpense(expenseId) {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  const expenses = getExpenses();
  const filteredExpenses = expenses.filter(e => e.id !== expenseId);

  localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(filteredExpenses));

  // Reload data
  loadDashboardData();
  loadExpenses();
}

function initializeDefaultCategories() {
  const defaultCategories = [
    { id: '1', name: 'Food', color: 'bg-red-500' },
    { id: '2', name: 'Transportation', color: 'bg-blue-500' },
    { id: '3', name: 'Housing', color: 'bg-green-500' },
    { id: '4', name: 'Entertainment', color: 'bg-purple-500' },
    { id: '5', name: 'Utilities', color: 'bg-yellow-500' },
    { id: '6', name: 'Healthcare', color: 'bg-pink-500' },
    { id: '7', name: 'Shopping', color: 'bg-indigo-500' },
    { id: '8', name: 'Other', color: 'bg-gray-500' }
  ];

  // Only initialize if categories don't exist
  if (!localStorage.getItem(`categories_${currentUser?.id}`) && currentUser) {
    localStorage.setItem(`categories_${currentUser.id}`, JSON.stringify(defaultCategories));
  }

  // Populate category dropdown
  populateCategoryDropdown();
}

function populateCategoryDropdown() {
  const categorySelect = document.getElementById('expense-category');
  categorySelect.innerHTML = '<option value="">Select a category</option>';

  if (!currentUser) return;

  const categories = JSON.parse(localStorage.getItem(`categories_${currentUser.id}`)) || [];

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

function loadCategories() {
  const categoriesContainer = document.querySelector('#categories-section .grid');
  categoriesContainer.innerHTML = '';

  if (!currentUser) return;

  const categories = JSON.parse(localStorage.getItem(`categories_${currentUser.id}`)) || [];

  if (categories.length === 0) {
    categoriesContainer.innerHTML = '<p class="text-gray-500">No categories added yet</p>';
    return;
  }

  categories.forEach(category => {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'p-4 bg-white rounded-lg shadow card-shadow';

    categoryEl.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full ${category.color} flex items-center justify-center text-white mr-3">
                                <i class="fas fa-tag"></i>
                            </div>
                            <h3 class="font-medium text-gray-900">${category.name}</h3>
                        </div>
                        <div>
                            <button class="text-red-600 hover:text-red-900 delete-category" data-id="${category.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;

    categoriesContainer.appendChild(categoryEl);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-category').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const categoryId = e.target.closest('button').getAttribute('data-id');
      deleteCategory(categoryId);
    });
  });
}

function saveCategory() {
  const name = document.getElementById('category-name').value;
  const color = document.getElementById('category-color').value;

  if (!name) {
    alert('Please enter a category name');
    return;
  }

  const categories = JSON.parse(localStorage.getItem(`categories_${currentUser.id}`)) || [];

  // Check if category already exists
  if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
    alert('Category already exists');
    return;
  }

  const newCategory = {
    id: Date.now().toString(),
    name,
    color
  };

  categories.push(newCategory);
  localStorage.setItem(`categories_${currentUser.id}`, JSON.stringify(categories));

  // Close modal and reset form
  categoryModal.classList.add('hidden');
  categoryForm.reset();

  // Reload categories and update dropdown
  loadCategories();
  populateCategoryDropdown();
  updateCategoryChart();
}

function deleteCategory(categoryId) {
  if (!confirm('Are you sure you want to delete this category? Any expenses in this category will be moved to "Other".')) return;

  const categories = JSON.parse(localStorage.getItem(`categories_${currentUser.id}`)) || [];
  const filteredCategories = categories.filter(cat => cat.id !== categoryId);

  // Update expenses that use this category
  const expenses = getExpenses();
  const updatedExpenses = expenses.map(expense => {
    if (expense.category === categories.find(c => c.id === categoryId)?.name) {
      return { ...expense, category: 'Other' };
    }
    return expense;
  });

  localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(updatedExpenses));
  localStorage.setItem(`categories_${currentUser.id}`, JSON.stringify(filteredCategories));

  // Reload data
  loadCategories();
  populateCategoryDropdown();
  loadDashboardData();
  loadExpenses();
  updateCategoryChart();
}

function updateCategoryChart() {
  const expenses = getExpenses();
  const categories = JSON.parse(localStorage.getItem(`categories_${currentUser.id}`)) || [];

  // Calculate totals by category
  const categoryTotals = {};
  categories.forEach(category => {
    categoryTotals[category.name] = 0;
  });

  expenses.forEach(expense => {
    if (categoryTotals[expense.category] !== undefined) {
      categoryTotals[expense.category] += parseFloat(expense.amount);
    } else {
      // If category doesn't exist (maybe was deleted), add to "Other"
      categoryTotals['Other'] = (categoryTotals['Other'] || 0) + parseFloat(expense.amount);
    }
  });

  // Filter out categories with 0 total
  const filteredCategories = categories.filter(category => categoryTotals[category.name] > 0);

  // Prepare data for chart
  const labels = filteredCategories.map(category => category.name);
  const data = filteredCategories.map(category => categoryTotals[category.name]);
  const backgroundColors = filteredCategories.map(category => {
    // Extract RGB values from Tailwind color classes
    const colorMap = {
      'bg-red-500': 'rgba(239, 68, 68, 0.7)',
      'bg-blue-500': 'rgba(59, 130, 246, 0.7)',
      'bg-green-500': 'rgba(16, 185, 129, 0.7)',
      'bg-yellow-500': 'rgba(234, 179, 8, 0.7)',
      'bg-purple-500': 'rgba(168, 85, 247, 0.7)',
      'bg-pink-500': 'rgba(236, 72, 153, 0.7)',
      'bg-indigo-500': 'rgba(99, 102, 241, 0.7)',
      'bg-gray-500': 'rgba(156, 163, 175, 0.7)'
    };
    return colorMap[category.color] || 'rgba(156, 163, 175, 0.7)';
  });

  const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

  // Get or create chart
  const ctx = document.getElementById('category-chart').getContext('2d');

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function generateReport() {
  const period = reportPeriod.value;
  let startDate, endDate;
  const now = new Date();

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    case 'custom':
      const startInput = document.getElementById('start-date').value;
      const endInput = document.getElementById('end-date').value;

      if (!startInput || !endInput) {
        alert('Please select both start and end dates');
        return;
      }

      startDate = new Date(startInput);
      endDate = new Date(endInput);
      break;
  }

  // Filter expenses for the selected period
  const expenses = getExpenses().filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Calculate total for the period
  const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Group by category
  const categories = JSON.parse(localStorage.getItem(`categories_${currentUser.id}`)) || [];
  const categoryTotals = {};

  categories.forEach(category => {
    categoryTotals[category.name] = 0;
  });

  expenses.forEach(expense => {
    if (categoryTotals[expense.category] !== undefined) {
      categoryTotals[expense.category] += parseFloat(expense.amount);
    } else {
      categoryTotals['Other'] = (categoryTotals['Other'] || 0) + parseFloat(expense.amount);
    }
  });

  // Filter out categories with 0 total
  const filteredCategories = categories.filter(category => categoryTotals[category.name] > 0);

  // Prepare data for category chart
  const categoryLabels = filteredCategories.map(category => category.name);
  const categoryData = filteredCategories.map(category => categoryTotals[category.name]);
  const categoryColors = filteredCategories.map(category => {
    const colorMap = {
      'bg-red-500': 'rgba(239, 68, 68, 0.7)',
      'bg-blue-500': 'rgba(59, 130, 246, 0.7)',
      'bg-green-500': 'rgba(16, 185, 129, 0.7)',
      'bg-yellow-500': 'rgba(234, 179, 8, 0.7)',
      'bg-purple-500': 'rgba(168, 85, 247, 0.7)',
      'bg-pink-500': 'rgba(236, 72, 153, 0.7)',
      'bg-indigo-500': 'rgba(99, 102, 241, 0.7)',
      'bg-gray-500': 'rgba(156, 163, 175, 0.7)'
    };
    return colorMap[category.color] || 'rgba(156, 163, 175, 0.7)';
  });

  // Group by time (day/week/month)
  const timeData = {};
  const timeLabels = [];
  let timeFormat;

  if (period === 'week') {
    // Group by day
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      timeData[dateStr] = 0;
      timeLabels.push(new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }));
    }

    timeFormat = 'MMM d';
  } else if (period === 'month') {
    // Group by week
    const weeks = [];
    let currentWeekStart = new Date(startDate);

    while (currentWeekStart <= endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > endDate) weekEnd = new Date(endDate);

      weeks.push({
        start: new Date(currentWeekStart),
        end: new Date(weekEnd)
      });

      timeLabels.push(`Week ${weeks.length}`);

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    weeks.forEach((week, i) => {
      timeData[`Week ${i + 1}`] = 0;
    });

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      for (let i = 0; i < weeks.length; i++) {
        if (expenseDate >= weeks[i].start && expenseDate <= weeks[i].end) {
          timeData[`Week ${i + 1}`] += parseFloat(expense.amount);
          break;
        }
      }
    });

    timeFormat = 'Week';
  } else {
    // Group by month
    for (let m = new Date(startDate.getFullYear(), startDate.getMonth(), 1); m <= endDate; m.setMonth(m.getMonth() + 1)) {
      const monthStr = m.toLocaleString('default', { month: 'short' });
      timeData[monthStr] = 0;
      timeLabels.push(monthStr);
    }

    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
      timeData[month] += parseFloat(expense.amount);
    });

    timeFormat = 'MMM';
  }

  const timeValues = timeLabels.map(label => timeData[label]);

  // Update time chart
  const timeCtx = document.getElementById('time-chart').getContext('2d');

  if (timeChart) {
    timeChart.destroy();
  }

  timeChart = new Chart(timeCtx, {
    type: 'bar',
    data: {
      labels: timeLabels,
      datasets: [{
        label: 'Expenses',
        data: timeValues,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `$${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '$' + value;
            }
          }
        }
      }
    }
  });

  // Update category chart
  const categoryReportCtx = document.getElementById('category-report-chart').getContext('2d');

  if (categoryReportChart) {
    categoryReportChart.destroy();
  }

  categoryReportChart = new Chart(categoryReportCtx, {
    type: 'doughnut',
    data: {
      labels: categoryLabels,
      datasets: [{
        data: categoryData,
        backgroundColor: categoryColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = Math.round((value / total) * 100);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Update report summary
  reportSummary.innerHTML = `
                <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="font-medium">Total Expenses:</span>
                    <span class="font-semibold">$${total.toFixed(2)}</span>
                </div>
                <div class="flex justify-between p-3">
                    <span class="font-medium">Period:</span>
                    <span>${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="font-medium">Number of Expenses:</span>
                    <span>${expenses.length}</span>
                </div>
            `;

  // Add top categories to summary
  const sortedCategories = filteredCategories
    .map(category => ({
      name: category.name,
      amount: categoryTotals[category.name],
      percentage: (categoryTotals[category.name] / total) * 100
    }))
    .sort((a, b) => b.amount - a.amount);

  if (sortedCategories.length > 0) {
    const topCategoriesDiv = document.createElement('div');
    topCategoriesDiv.className = 'mt-4';
    topCategoriesDiv.innerHTML = '<h4 class="font-medium mb-2">Top Categories:</h4>';

    sortedCategories.slice(0, 3).forEach((category, index) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'flex justify-between items-center p-2';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${index + 1}. ${category.name}`;

      const amountSpan = document.createElement('span');
      amountSpan.className = 'font-semibold';
      amountSpan.textContent = `$${category.amount.toFixed(2)} (${Math.round(category.percentage)}%)`;

      categoryDiv.appendChild(nameSpan);
      categoryDiv.appendChild(amountSpan);
      topCategoriesDiv.appendChild(categoryDiv);
    });

    reportSummary.appendChild(topCategoriesDiv);
  }
}