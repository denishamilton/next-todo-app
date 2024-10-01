'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Импортируем хук useRouter для навигации

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoPage({ params }: { params: { id: string } }) {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const router = useRouter(); // Вызов useRouter один раз в теле компонента
  const { id } = params;

  // Получение данных о задаче при загрузке страницы
  useEffect(() => {
    const fetchTodo = async () => {
      const res = await fetch(`/api/todos/${id}`);
      const data = await res.json();
      setTodo(data);
      setEditTitle(data.title);
    };

    fetchTodo();
  }, [id]);

  // Сохранение изменений задачи
  const saveEditTodo = async () => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: editTitle }),
    });

    if (res.ok) {
      const updatedTodo = await res.json();
      setTodo(updatedTodo);
      alert('Todo updated successfully');
    } else {
      alert('Failed to update todo');
    }
  };

  // Удаление задачи
  const deleteTodo = async () => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      alert('Todo deleted');
      router.push('/'); // Используем router.push для навигации после удаления
    } else {
      alert('Failed to delete todo');
    }
  };

  if (!todo) return <div>Loading...</div>;

  return (
    <div>
      <h1>Todo Details</h1>
      <h2>Todo ID: {todo.id}</h2>
      <div>
        <label>
          Title:
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </label>
        <button onClick={saveEditTodo}>Save</button>
      </div>
      <div>
        <p>Status: {todo.completed ? 'Completed' : 'Not Completed'}</p>
        <button onClick={deleteTodo}>Delete Todo</button>
      </div>
      <button onClick={() => router.back()}>Go Back</button> {/* Возвращаемся назад */}
    </div>
  );
}
