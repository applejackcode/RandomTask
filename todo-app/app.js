const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');

const STORAGE_KEY = 'todos';

function saveTodos(todos){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos || []));
}

function loadTodos(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}

function createTodoItem(todo){
  // todo: { text: string, completed: boolean }
  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = !!todo.completed;

  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;
  if(todo.completed) span.classList.add('completed');

  // toggle by clicking text or checkbox
  span.addEventListener('click', () => {
    checkbox.checked = !checkbox.checked;
    toggleCompleted(span, checkbox);
  });
  // edit-in-place: double-click the text to edit
  span.addEventListener('dblclick', () => startEditing(span));

  // helper to start editing a span (used by dblclick and edit button)
  function startEditing(spanElement){
    const prev = spanElement.textContent;
    const inputEdit = document.createElement('input');
    inputEdit.type = 'text';
    inputEdit.className = 'edit-input';
    inputEdit.value = prev;
    spanElement.replaceWith(inputEdit);
    inputEdit.focus();
    inputEdit.select();

    const finish = (save) => {
      if(save){
        const newVal = inputEdit.value.trim();
        spanElement.textContent = newVal || prev;
      }
      inputEdit.replaceWith(spanElement);
      saveAllFromDOM();
    };

    inputEdit.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') finish(true);
      else if(e.key === 'Escape') finish(false);
    });
    inputEdit.addEventListener('blur', () => finish(true));
  }
  checkbox.addEventListener('change', () => toggleCompleted(span, checkbox));

  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.textContent = 'Delete';
  del.addEventListener('click', ()=>{
    li.remove();
    saveAllFromDOM();
  });

  const edit = document.createElement('button');
  edit.className = 'edit-btn';
  edit.textContent = 'Edit';
  edit.addEventListener('click', () => startEditing(span));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(edit);
  li.appendChild(del);
  return li;
}

function toggleCompleted(span, checkbox){
  span.classList.toggle('completed', checkbox.checked);
  saveAllFromDOM();
}

function saveAllFromDOM(){
  const items = Array.from(list.querySelectorAll('li')).map(li=>{
    const text = li.querySelector('.todo-text').textContent;
    const completed = li.querySelector('.todo-checkbox').checked;
    return {text, completed};
  });
  saveTodos(items);
}

function renderTodos(){
  list.innerHTML = '';
  const todos = loadTodos();
  todos.forEach(t => list.appendChild(createTodoItem(t)));
}

function addTodo(){
  const val = input.value.trim();
  if(!val) return;
  const todo = {text: val, completed: false};
  const item = createTodoItem(todo);
  list.prepend(item);
  saveAllFromDOM();
  input.value = '';
  input.focus();
}

addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') addTodo(); });

// initial render
renderTodos();
