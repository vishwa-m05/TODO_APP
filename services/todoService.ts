import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { Todo } from '../types/todo';

const STORAGE_KEY = '@todos';

export class TodoService {
  private static instance: TodoService;
  private todos: Todo[] = [];
  private listeners: ((todos: Todo[]) => void)[] = [];

  static getInstance(): TodoService {
    if (!TodoService.instance) {
      TodoService.instance = new TodoService();
    }
    return TodoService.instance;
  }

  async initializeOfflineStorage(): Promise<void> {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        this.todos = JSON.parse(storedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading offline todos:', error);
    }
  }

  async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
    } catch (error) {
      console.error('Error saving todos to storage:', error);
    }
  }

  subscribeToTodos(callback: (todos: Todo[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.todos);

    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.todos]));
  }

  async createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<Todo> {
    const id = Date.now().toString();
    const now = new Date();
    
    const newTodo: Todo = {
      ...todoData,
      id,
      createdAt: now,
      updatedAt: now,
      synced: false,
    };

    this.todos.push(newTodo);
    await this.saveToStorage();
    this.notifyListeners();

    // Try to sync with Firebase
    this.syncTodoToFirebase(newTodo);

    return newTodo;
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) return;

    this.todos[index] = {
      ...this.todos[index],
      ...updates,
      updatedAt: new Date(),
      synced: false,
    };

    await this.saveToStorage();
    this.notifyListeners();

    // Try to sync with Firebase
    this.syncTodoToFirebase(this.todos[index]);
  }

  async deleteTodo(id: string): Promise<void> {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) return;

    const todo = this.todos[index];
    this.todos.splice(index, 1);
    
    await this.saveToStorage();
    this.notifyListeners();

    // Try to delete from Firebase
    if (todo.synced) {
      try {
        await deleteDoc(doc(db, 'todos', id));
      } catch (error) {
        console.error('Error deleting todo from Firebase:', error);
      }
    }
  }

  private async syncTodoToFirebase(todo: Todo): Promise<void> {
    try {
      if (todo.synced) {
        // Update existing document
        await updateDoc(doc(db, 'todos', todo.id), {
          title: todo.title,
          description: todo.description,
          completed: todo.completed,
          priority: todo.priority,
          category: todo.category,
          dueDate: todo.dueDate,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new document
        await addDoc(collection(db, 'todos'), {
          ...todo,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // Mark as synced locally
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) {
          this.todos[index].synced = true;
          await this.saveToStorage();
        }
      }
    } catch (error) {
      console.error('Error syncing todo to Firebase:', error);
    }
  }

  async syncWithFirebase(userId: string): Promise<void> {
    try {
      // Sync unsynchronized todos
      const unsyncedTodos = this.todos.filter(todo => !todo.synced);
      for (const todo of unsyncedTodos) {
        await this.syncTodoToFirebase(todo);
      }

      // Listen to Firebase changes
      const q = query(collection(db, 'todos'), where('userId', '==', userId));
      onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const firebaseTodo: Todo = {
            id: change.doc.id,
            title: data.title,
            description: data.description,
            completed: data.completed,
            priority: data.priority,
            category: data.category,
            dueDate: data.dueDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            userId: data.userId,
            synced: true,
          };

          if (change.type === 'added' || change.type === 'modified') {
            const index = this.todos.findIndex(todo => todo.id === firebaseTodo.id);
            if (index === -1) {
              this.todos.push(firebaseTodo);
            } else {
              this.todos[index] = firebaseTodo;
            }
          } else if (change.type === 'removed') {
            this.todos = this.todos.filter(todo => todo.id !== firebaseTodo.id);
          }
        });

        this.saveToStorage();
        this.notifyListeners();
      });
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
    }
  }
}