// src/app/page.tsx

"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// Функция для получения списка задач с использованием axios
async function fetchTodos() {
  const { data } = await axios.get<Todo[]>('/api/todos');
  return data;
}

// Функция для удаления задачи с использованием axios
async function deleteTodo(id: number) {
  await axios.delete(`/api/todos/${id}`);
}

// Функция для добавления новой задачи с использованием axios
async function addTodo(title: string) {
  const { data } = await axios.post<Todo>('/api/todos', { title, completed: false });
  return data;
}

// Обновленная функция для обновления статуса задачи
async function updateTodoStatus({ id, completed }: { id: number; completed: boolean }) {
  try {
    // Логируем, что отправляем
    console.log(`Updating todo with id ${id}, completed: ${completed}`);

    // Отправляем PATCH запрос с объектом, содержащим только поле completed
    const { data } = await axios.patch<Todo>(`/api/todos/${id}`, { completed });
    
    return data;
  } catch (error) {
    console.error('Error updating todo status', error);
    throw error;
  }
}

export default function Home() {
  const queryClient = useQueryClient();

    // Состояние для отслеживания, какая задача обновляется
    const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);

  // Хук useQuery для получения списка задач
  const { isLoading, error, data } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  // Мутация для добавления новой задачи
  const mutationAddTodo = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

  // Мутация для удаления задачи
  const mutationDeleteTodo = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

    // Мутация для обновления статуса задачи
    const mutationUpdateTodoStatus = useMutation({
      mutationFn: updateTodoStatus,
      onMutate: (variables) => {
        // Устанавливаем ID задачи, которая сейчас обновляется
        setUpdatingTodoId(variables.id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['todos'] });
      },
      onSettled: () => {
        // Сбрасываем ID задачи после завершения мутации
        setUpdatingTodoId(null);
      }
    });

  // Состояние для новой задачи
  const [newTodo, setNewTodo] = useState('');

  // Обработка состояний запроса
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  const todos = data as Todo[];

  // Обработчик отправки новой задачи
  const handleAddTodo = () => {
    if (newTodo.trim() === '') return;
    mutationAddTodo.mutate(newTodo);
    setNewTodo('');
  };

  const handleToggleTodo = (todo: Todo) => {
    mutationUpdateTodoStatus.mutate(
      { id: todo.id, completed: !todo.completed }, // Отправляем id и новое значение completed
      {
        onSuccess: (updatedTodo) => {
          console.log('Todo updated successfully', updatedTodo);
        },
        onError: (error) => {
          console.error('Error updating todo status', error);
        }
      }
    );
  };
  
  return (
    <div>
      <h2>Todo List</h2>

      {/* Форма для добавления новой задачи */}
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter new todo"
        />
        <button onClick={handleAddTodo}>
          {mutationAddTodo.isPending ? 'Adding...' : 'Add Todo'}
        </button>
      </div>

      {/* Список задач */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <Link href={`/todos/${todo.id}`}>
              {todo.title} - {todo.completed ? 'Completed' : 'Not completed'}
            </Link>
            {/* Чекбокс для изменения статуса задачи */}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo)}
              disabled={updatingTodoId === todo.id}
            />
            <button onClick={() => mutationDeleteTodo.mutate(todo.id)} disabled={mutationDeleteTodo.isPending}>
              {mutationDeleteTodo.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
