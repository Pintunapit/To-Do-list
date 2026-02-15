document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const taskInput = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input'); // New
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const dateDisplay = document.getElementById('date-display');
    const themeToggle = document.getElementById('theme-toggle'); // New
    const filterBtns = document.querySelectorAll('.filter-btn'); // New

    // State
    let tasks = [];
    let filterMode = 'all'; // 'all', 'active', 'completed'
    let darkMode = localStorage.getItem('darkMode') === 'true';

    // Initialize
    init();

    function init() {
        // Load tasks
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }

        // Apply Theme
        if (darkMode) {
            document.body.classList.add('dark-mode');
            updateThemeIcon();
        }

        // Show current date
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

        renderTasks();
    }

    // Save to LocalStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateCount();
    }

    // Filter Tasks
    function getFilteredTasks() {
        switch (filterMode) {
            case 'active': return tasks.filter(t => !t.completed);
            case 'completed': return tasks.filter(t => t.completed);
            default: return tasks;
        }
    }

    // Render all tasks
    function renderTasks() {
        taskList.innerHTML = '';
        const filtered = getFilteredTasks();

        filtered.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority || 'low'}`;
            li.dataset.id = task.id;

            // Checkbox/Status Circle
            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox-custom';
            checkbox.addEventListener('click', () => toggleTask(task.id));

            // Task Text
            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            span.addEventListener('click', () => toggleTask(task.id));

            // Priority Badge (Optional: if we want text indication too, but border is good)

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            `;
            deleteBtn.ariaLabel = 'Delete task';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });

        updateCount();
    }

    // Add new task
    function addTask() {
        const text = taskInput.value.trim();
        const priority = priorityInput.value;
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: priority
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();

        taskInput.value = '';
        taskInput.focus();
    }

    // Toggle task completion
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    // Delete task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    // Update task count
    function updateCount() {
        const remaining = tasks.filter(t => !t.completed).length;
        taskCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
    }

    // Clear completed tasks
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    // Toggle Theme
    function toggleTheme() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', darkMode);
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        if (darkMode) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    themeToggle.addEventListener('click', toggleTheme);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            // Set filter
            filterMode = btn.dataset.filter;
            renderTasks();
        });
    });
});
