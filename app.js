// DOM Elements
const taskInput = document.getElementById('taskInput');
const daySelect = document.getElementById('daySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const weekContainer = document.querySelector('.week-container');

// Initialize tasks from localStorage or create empty object
let tasks = JSON.parse(localStorage.getItem('weeklyTasks')) || {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
};

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
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
        taskInput.value = '';
    }
}

// Delete a task
function deleteTask(day, taskId) {
    tasks[day] = tasks[day].filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
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

// Initial render
renderTasks(); 