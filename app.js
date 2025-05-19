// DOM Elements
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authTabs = document.querySelectorAll('.auth-tab');
const taskInput = document.getElementById('taskInput');
const daySelect = document.getElementById('daySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const weekContainer = document.querySelector('.week-container');
const weeklyProgressFill = document.getElementById('weeklyProgressFill');
const weeklyProgressText = document.getElementById('weeklyProgressText');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// API URL
const API_URL = 'http://localhost:3000/api';

// Days of the week in order
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Initialize tasks from localStorage or create empty object
let tasks = JSON.parse(localStorage.getItem('weeklyTasks')) || {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
};

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        showApp();
        loadTasks();
    } else {
        showAuth();
    }
}

// Show authentication forms
function showAuth() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
}

// Show main app
function showApp() {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
}

// Handle tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tabName === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        }
    });
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            userName.textContent = data.user.name;
            showApp();
            loadTasks();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error logging in');
    }
});

// Handle signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    // Clear previous error messages
    clearErrors();

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            userName.textContent = data.user.name;
            showApp();
            loadTasks();
        } else {
            showError(data.message || 'Error signing up');
            if (data.details) {
                // Show specific field errors
                Object.entries(data.details).forEach(([field, isMissing]) => {
                    if (isMissing) {
                        showFieldError(field, 'This field is required');
                    }
                });
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('Network error. Please check your connection and try again.');
    }
});

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Add error message to both forms
    loginForm.insertBefore(errorDiv.cloneNode(true), loginForm.firstChild);
    signupForm.insertBefore(errorDiv, signupForm.firstChild);
}

// Show field-specific error
function showFieldError(field, message) {
    const input = document.getElementById(`${field}Input`);
    if (input) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }
}

// Clear all error messages
function clearErrors() {
    // Remove general error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Remove field-specific errors
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    
    // Remove error classes from inputs
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

// Handle logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
});

// Load tasks from server
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            tasks = await response.json();
            renderTasks();
            updateProgress();
            updatePastDays();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Get current day of week (0-6, where 0 is Sunday)
function getCurrentDayIndex() {
    return new Date().getDay();
}

// Check if a day is in the past
function isPastDay(dayIndex) {
    const currentDayIndex = getCurrentDayIndex();
    return dayIndex < currentDayIndex;
}

// Check if all tasks for a day are completed
function areAllTasksCompleted(day) {
    const dayTasks = tasks[day];
    return dayTasks.length > 0 && dayTasks.every(task => task.completed);
}

// Update past days styling
function updatePastDays() {
    DAYS_OF_WEEK.forEach((day, index) => {
        const dayProgress = document.getElementById(`${day}-progress`);
        const dayColumn = document.getElementById(day);
        
        // Remove all past-day classes first
        dayProgress.classList.remove('past-day-incomplete', 'past-day-complete');
        dayColumn.classList.remove('past-day-incomplete', 'past-day-complete');
        
        if (isPastDay(index)) {
            if (areAllTasksCompleted(day)) {
                dayProgress.classList.add('past-day-complete');
                dayColumn.classList.add('past-day-complete');
            } else {
                dayProgress.classList.add('past-day-incomplete');
                dayColumn.classList.add('past-day-incomplete');
            }
        }
    });
}

// Calculate progress for a specific day
function calculateDayProgress(day) {
    const dayTasks = tasks[day];
    if (dayTasks.length === 0) return 0;
    
    const completedTasks = dayTasks.filter(task => task.completed).length;
    return (completedTasks / dayTasks.length) * 100;
}

// Update progress indicators
function updateProgress() {
    let totalProgress = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    // Update each day's progress
    Object.keys(tasks).forEach(day => {
        const dayProgress = calculateDayProgress(day);
        const progressIndicator = document.querySelector(`#${day}-progress .progress-indicator`);
        
        if (tasks[day].length > 0) {
            if (dayProgress === 100) {
                progressIndicator.className = 'progress-indicator completed';
            } else if (dayProgress > 0) {
                progressIndicator.className = 'progress-indicator partial';
            } else {
                progressIndicator.className = 'progress-indicator';
            }
        } else {
            progressIndicator.className = 'progress-indicator';
        }

        // Calculate overall progress
        totalTasks += tasks[day].length;
        completedTasks += tasks[day].filter(task => task.completed).length;
    });

    // Update overall progress
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    weeklyProgressFill.style.width = `${overallProgress}%`;
    weeklyProgressText.textContent = `${Math.round(overallProgress)}% Complete`;
}

// Create a new task element
function createTaskElement(task, day) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(day, task.id));

    const span = document.createElement('span');
    span.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(day, task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
}

// Add a new task
function addTask() {
    const text = taskInput.value.trim();
    const day = daySelect.value;

    if (text) {
        const task = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks[day].push(task);
        saveTasks();
        renderTasks();
        updateProgress();
        updatePastDays();
        taskInput.value = '';
    }
}

// Delete a task
function deleteTask(day, taskId) {
    tasks[day] = tasks[day].filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    updateProgress();
    updatePastDays();
}

// Toggle task completion
function toggleTask(day, taskId) {
    tasks[day] = tasks[day].map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
    updateProgress();
    updatePastDays();
}

// Render all tasks
function renderTasks() {
    // Clear all task lists
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

    // Render tasks for each day
    Object.keys(tasks).forEach(day => {
        const dayColumn = document.getElementById(day);
        const taskList = dayColumn.querySelector('.task-list');
        
        tasks[day].forEach(task => {
            const taskElement = createTaskElement(task, day);
            taskList.appendChild(taskElement);
        });
    });
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initialize app
checkAuth();

// Initial render
renderTasks();
updateProgress();
updatePastDays();

// Update past days every minute
setInterval(updatePastDays, 60000); 