// Part 4: Add your Supabase details here
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';

// Initialize the Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Get references to HTML elements
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');

// --- FUNCTIONS ---

// Function to fetch all todos from the database
const fetchTodos = async () => {
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching todos:', error);
    else {
        todoList.innerHTML = ''; // Clear the list before rendering
        data.forEach(todo => {
            renderTodo(todo);
        });
    }
};

// Function to render a single todo item in the list
const renderTodo = (todo) => {
    const li = document.createElement('li');
    if (todo.is_complete) {
        li.classList.add('completed');
    }

    li.innerHTML = `
        <input type="checkbox" ${todo.is_complete ? 'checked' : ''}>
        <span>${todo.task}</span>
        <button class="delete-button">×</button>
    `;

    // Event listener for the checkbox
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async () => {
        await updateTodoStatus(todo.id, checkbox.checked);
        fetchTodos(); // Refresh the list
    });

    // Event listener for the delete button
    const deleteButton = li.querySelector('.delete-button');
    deleteButton.addEventListener('click', async () => {
        await deleteTodo(todo.id);
        fetchTodos(); // Refresh the list
    });

    todoList.appendChild(li);
};

// Function to add a new todo to the database
const addTodo = async () => {
    const taskText = taskInput.value.trim();
    if (taskText === '') return; // Don't add empty tasks

    const { error } = await supabase
        .from('todos')
        .insert({ task: taskText, is_complete: false });

    if (error) console.error('Error adding todo:', error);
    else {
        taskInput.value = ''; // Clear the input field
        fetchTodos(); // Refresh the list
    }
};

// Function to update a todo's completion status
const updateTodoStatus = async (id, isComplete) => {
    const { error } = await supabase
        .from('todos')
        .update({ is_complete: isComplete })
        .eq('id', id);

    if (error) console.error('Error updating todo:', error);
};

// Function to delete a todo
const deleteTodo = async (id) => {
    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

    if (error) console.error('Error deleting todo:', error);
};

// --- EVENT LISTENERS ---

// Add a new task when the button is clicked
addButton.addEventListener('click', addTodo);

// Add a new task when "Enter" is pressed in the input field
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initial fetch of todos when the page loads
fetchTodos();