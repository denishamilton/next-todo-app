// src/app/api/todos/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получение задачи по ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  try {
    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching todo' }, { status: 500 });
  }
}

// Обновление задачи по ID
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();

  // Получаем title и completed из тела запроса
  const { title, completed } = body;

  // Проверяем наличие title и completed, если нужно
  if (!title && typeof completed !== 'boolean') {
    return NextResponse.json({ error: 'Title or completed status is required' }, { status: 400 });
  }

  try {
    // Обновляем только предоставленные поля (title или completed)
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        ...(title && { title }), // Обновляем title, если он предоставлен
        ...(typeof completed === 'boolean' && { completed }), // Обновляем completed, если он предоставлен
      },
    });

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating todo' }, { status: 500 });
  }
}


// Удаление задачи по ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  try {
    await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Todo deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting todo' }, { status: 500 });
  }
}
