// src/app/todos/[id]/page.tsx

'use client';
import { useRouter } from 'next/navigation'; // Импортируем хук useRouter для навигации
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function fetchTodo(id: number) {
  const { data } = await axios.get<Todo>(`/api/todos/${id}`);
  return data;
}

// Функция для обновления заголовка задачи
async function updateTodoTitle({ id, title }: { id: number; title: string }) {
  const { data } = await axios.patch<Todo>(`/api/todos/${id}`, { title });
  return data;
}

async function deleteTodo(id: number) {
  await axios.delete(`/api/todos/${id}`);
}

export default function TodoPage({ params }: { params: { id: number } }) {
  const { id } = params;
  const router = useRouter(); // Вызов useRouter один раз в теле компонента
  const queryClient = useQueryClient();

  const [editTitle, setEditTitle] = useState('');

  const { isLoading, error, data: todo } = useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),
  });

  const mutationUpdateTodoTitle = useMutation({
    mutationFn: updateTodoTitle,
    onSuccess: () => {
      // Инвалидируем кэш, чтобы обновить задачу в useQuery
      queryClient.invalidateQueries({ queryKey: ['todo', id] });
      alert('Todo updated successfully');
    },
    onError: () => {
      alert('Failed to update todo');
    },
  });

  const mutationDeleteTodo = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      // Инвалидируем кэш, чтобы удалить задачу в useQuery
      queryClient.invalidateQueries({ queryKey: ['todo', id] });
      alert('Todo deleted successfully');
      router.push('/');
    },
    onError: () => {
      alert('Failed to delete todo');
    },
  });

  // Устанавливаем начальное значение для editTitle, когда загружаем данные задачи
  useEffect(() => {
    if (todo) {
      setEditTitle(todo.title);
    }
  }, [todo]);

  // Функция для сохранения измененного заголовка
  const saveEditTodo = () => {
    mutationUpdateTodoTitle.mutate({ id, title: editTitle });
  };

  // Если данные загружаются или произошла ошибка
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading todo</div>;

  return (
    <div>
      <h1>Todo Details</h1>
      <h2>Todo ID: {todo?.id}</h2>
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
        <p>Status: {todo?.completed ? 'Completed' : 'Not Completed'}</p>
        <button onClick={() => mutationDeleteTodo.mutate(id)}>Delete Todo</button>
      </div>
      <button onClick={() => router.back()}>Go Back</button> {/* Возвращаемся назад */}
    </div>
  );
}
