// DOM Elements
const taskInput = document.getElementById('taskInput');
const daySelect = document.getElementById('daySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const weekContainer = document.querySelector('.week-container');
const weeklyProgressFill = document.getElementById('weeklyProgressFill');
const weeklyProgressText = document.getElementById('weeklyProgressText');

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

// Theme handling
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle click handler
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Create a new task element
function createTaskElement(task, day) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(day, task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
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
        
        if (dayProgress && dayColumn) {
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
        
        if (progressIndicator) {
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
        }

        // Calculate overall progress
        totalTasks += tasks[day].length;
        completedTasks += tasks[day].filter(task => task.completed).length;
    });

    // Update overall progress
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    if (weeklyProgressFill && weeklyProgressText) {
        weeklyProgressFill.style.width = `${overallProgress}%`;
        weeklyProgressText.textContent = `${Math.round(overallProgress)}% Complete`;
    }
}

// Render all tasks
function renderTasks() {
    // Clear all task lists
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

    // Render tasks for each day
    Object.keys(tasks).forEach(day => {
        const dayColumn = document.getElementById(day);
        if (dayColumn) {
            const taskList = dayColumn.querySelector('.task-list');
            if (taskList) {
                tasks[day].forEach(task => {
                    const taskElement = createTaskElement(task, day);
                    taskList.appendChild(taskElement);
                });
            }
        }
    });
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initial render
renderTasks();
updateProgress();
updatePastDays();

// Update past days every minute
setInterval(updatePastDays, 60000); 