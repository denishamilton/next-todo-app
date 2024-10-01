// src/app/page.tsx

'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';


interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {

  const [todos, setTodos] = useState<Todo[]>([]);
const [newTodo, setNewTodo] = useState('');
const [editTodoId, setEditTodoId] = useState<number | null>(null);
const [editTodoTitle, setEditTodoTitle] = useState('');

  // Получение всех задач
  useEffect(() => {
    fetch('/api/todos')
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);

  // Добавление новой задачи
  const addTodo = async () => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newTodo }),
    });

    const todo = await res.json();
    setTodos((prev) => [...prev, todo]);
    setNewTodo('');
  };

  // Удаление задачи
  const deleteTodo = async (id: number) => {
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Начало редактирования задачи
  const startEditTodo = (todo: Todo) => {
    setEditTodoId(todo.id);
    setEditTodoTitle(todo.title);
  };

  // Сохранение изменений задачи
  const saveEditTodo = async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: editTodoTitle }),
    });

    if (res.ok) {
      const updatedTodo = await res.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      setEditTodoId(null);
      setEditTodoTitle('');
    }
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditTodoId(null);
    setEditTodoTitle('');
  };

  // Отображение списка задач и интерфейса для создания новых
  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {editTodoId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editTodoTitle}
                  onChange={(e) => setEditTodoTitle(e.target.value)}
                />
                <button onClick={() => saveEditTodo(todo.id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
            <Link href={`/todos/${todo.id}`}>
              {todo.title}
            </Link>{' '}
                <button onClick={() => startEditTodo(todo)}>Edit</button>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
      />
      <button onClick={addTodo}>Add Todo</button>
    </div>
  );
}

