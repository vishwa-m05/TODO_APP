export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  synced: boolean;
}

export interface TodoCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}