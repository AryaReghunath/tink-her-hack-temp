// Global variables
let allocationChart, expensePieChart, monthlyComparisonChart;
let currentMonth;
let monthsData = {};
let userData = {};

// Initialize
window.onload = function() {
    checkAuth();
    loadUserData();
    loadMonthsData();
    initializeMonthSelector();
    initCharts();
    updateDashboard();
};

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('budgetShieldUser');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
}

// Load user data
function loadUserData() {
    const stored = localStorage.getItem('budgetShieldUser');
    if (stored) {
        userData = JSON.parse(stored);
        document.getElementById('userName').textContent = userData.fullName.split(' ')[0];
        document.getElementById('userAvatar').textContent = userData.fullName.charAt(0).toUpperCase();
        document.getElementById('monthlyBudget').textContent = '₹' + userData.monthlyBudget.toFixed(0);
    }
}

// Load months data
function loadMonthsData() {
    const stored = localStorage.getItem('budgetShieldMonths');
    if (stored) {
        monthsData = JSON.parse(stored);
    } else {
        // Initialize with current month
        const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        monthsData = {
            [monthName]: {
                food: 0,
                travel: 0,
                college: 0,
                other: 0,
                isEditable: true
            }
        };
        saveMonthsData();
    }
}

// Save months data
function saveMonthsData() {
    localStorage.setItem('budgetShieldMonths', JSON.stringify(monthsData));
}

// Initialize month selector
function initializeMonthSelector() {
    const select = document.getElementById('monthSelect');
    select.innerHTML = '';
    
    const monthKeys = Object.keys(monthsData).reverse();
    monthKeys.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        select.appendChild(option);
    });
    
    currentMonth = monthKeys[0];
    select.value = currentMonth;
}

// Change month
function changeMonth() {
    currentMonth = document.getElementById('monthSelect').value;
    updateDashboard();
}

// Add new month
function addNewMonth() {
    const monthName = prompt('Enter month name (e.g., "January 2024"):');
    if (monthName && !monthsData[monthName]) {
        monthsData[monthName] = {
            food: 0,
            travel: 0,
            college: 0,
            other: 0,
            isEditable: true
        };
        saveMonthsData();
        initializeMonthSelector();
        document.getElementById('monthSelect').value = monthName;
        changeMonth();
    } else if (monthsData[monthName]) {
        alert('This month already exists!');
    }
}

// Toggle edit mode
function toggleEdit() {
    const inputs = document.querySelectorAll('.expense-form input');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    inputs.forEach(input => input.disabled = false);
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
}

// Save expenses
function saveExpenses() {
    const food = parseFloat(document.getElementById('foodExpense').value) || 0;
    const travel = parseFloat(document.getElementById('travelExpense').value) || 0;
    const college = parseFloat(document.getElementById('collegeExpense').value) || 0;
    const other = parseFloat(document.getElementById('otherExpense').value) || 0;
    
    monthsData[currentMonth] = {
        food: food,
        travel: travel,
        college: college,
        other: other,
        isEditable: true
    };
    
    saveMonthsData();
    
    const inputs = document.querySelectorAll('.expense-form input');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    inputs.forEach(input => input.disabled = true);
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    
    updateDashboard();
}

// Update dashboard
function updateDashboard() {
    const data = monthsData[currentMonth];
    if (!data) return;
    
    // Update expense inputs
    document.getElementById('foodExpense').value = data.food;
    document.getElementById('travelExpense').value = data.travel;
    document.getElementById('collegeExpense').value = data.college;
    document.getElementById('otherExpense').value = data.other;
    
    // Calculate totals
    const totalExpenses = data.food + data.travel + data.college + data.other;
    const balance = userData.monthlyBudget - totalExpenses;
    
    // Update summary cards
    document.getElementById('totalExpenses').textContent = '₹' + totalExpenses.toFixed(0);
    document.getElementById('currentBalance').textContent = '₹' + balance.toFixed(0);
    
    // Update percentages for allocation
    if (totalExpenses > 0) {
        document.getElementById('foodPercent').textContent = ((data.food / totalExpenses) * 100).toFixed(0) + '%';
        document.getElementById('travelPercent').textContent = ((data.travel / totalExpenses) * 100).toFixed(0) + '%';
        document.getElementById('collegePercent').textContent = ((data.college / totalExpenses) * 100).toFixed(0) + '%';
        document.getElementById('otherPercent').textContent = ((data.other / totalExpenses) * 100).toFixed(0) + '%';
    } else {
        document.getElementById('foodPercent').textContent = '0%';
        document.getElementById('travelPercent').textContent = '0%';
        document.getElementById('collegePercent').textContent = '0%';
        document.getElementById('otherPercent').textContent = '0%';
    }
    
    // Update budget comparison
    const savingRate = ((balance / userData.monthlyBudget) * 100).toFixed(0);
    const budgetUsed = ((totalExpenses / userData.monthlyBudget) * 100).toFixed(0);
    
    document.getElementById('savingRateText').textContent = savingRate + '%';
    document.getElementById('budgetUsedText').textContent = budgetUsed + '%';
    document.getElementById('savingRateBar').style.width = Math.min(savingRate, 100) + '%';
    document.getElementById('budgetUsedBar').style.width = Math.min(budgetUsed, 100) + '%';
    
    // Update highest expenses list
    updateHighestExpenses(data);
    
    // Update charts
    updateAllCharts(data, totalExpenses);
}

// Update highest expenses list
function updateHighestExpenses(data) {
    const expenses = [
        { name: '🍔 Food', amount: data.food },
        { name: '🚗 Travel', amount: data.travel },
        { name: '🎓 College', amount: data.college },
        { name: '📦 Other', amount: data.other }
    ];
    
    expenses.sort((a, b) => b.amount - a.amount);
    
    const list = document.getElementById('highestExpensesList');
    list.innerHTML = '';
    
    expenses.forEach(expense => {
        if (expense.amount > 0) {
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <span class="expense-name">${expense.name}</span>
                <span class="expense-amount">₹${expense.amount.toFixed(0)}</span>
            `;
            list.appendChild(item);
        }
    });
    
    if (list.children.length === 0) {
        list.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">No expenses yet</p>';
    }
}

// Initialize all charts
function initCharts() {
    // Allocation Donut Chart
    const ctxAllocation = document.getElementById('allocationChart').getContext('2d');
    allocationChart = new Chart(ctxAllocation, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Travel', 'College', 'Other'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Actual Allocation Of The Income',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: { size: 14 }
                }
            },
            cutout: '70%'
        }
    });
    
    // Expense Pie Chart
    const ctxPie = document.getElementById('expensePieChart').getContext('2d');
    expensePieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Travel', 'College', 'Other'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                title: {
                    display: true,
                    text: 'Actual Expenses Payments',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: { size: 14 }
                }
            }
        }
    });
    
    // Monthly Comparison Bar Chart
    const ctxComparison = document.getElementById('monthlyComparisonChart').getContext('2d');
    monthlyComparisonChart = new Chart(ctxComparison, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Food',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderRadius: 8
                },
                {
                    label: 'Travel',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderRadius: 8
                },
                {
                    label: 'College',
                    data: [],
                    backgroundColor: 'rgba(255, 206, 86, 0.8)',
                    borderRadius: 8
                },
                {
                    label: 'Other',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false,
                    grid: { display: false, color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.8)' }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Previous Months vs Current Month Expenses',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: { size: 15 }
                }
            }
        }
    });
}

// Update all charts
function updateAllCharts(data, totalExpenses) {
    // Update allocation and pie charts
    const chartData = totalExpenses > 0 ? [data.food, data.travel, data.college, data.other] : [0, 0, 0, 0];
    
    allocationChart.data.datasets[0].data = chartData;
    allocationChart.update();
    
    expensePieChart.data.datasets[0].data = chartData;
    expensePieChart.update();
    
    // Update monthly comparison
    const months = Object.keys(monthsData).slice(-5);
    const foodData = months.map(m => monthsData[m].food);
    const travelData = months.map(m => monthsData[m].travel);
    const collegeData = months.map(m => monthsData[m].college);
    const otherData = months.map(m => monthsData[m].other);
    
    monthlyComparisonChart.data.labels = months;
    monthlyComparisonChart.data.datasets[0].data = foodData;
    monthlyComparisonChart.data.datasets[1].data = travelData;
    monthlyComparisonChart.data.datasets[2].data = collegeData;
    monthlyComparisonChart.data.datasets[3].data = otherData;
    monthlyComparisonChart.update();
}

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('budgetShieldUser');
        localStorage.removeItem('budgetShieldMonths');
        window.location.href = 'login.html';
    }
}

// Profile dropdown toggle (placeholder)
function toggleProfileDropdown() {
    alert('Profile settings coming soon!');
}
