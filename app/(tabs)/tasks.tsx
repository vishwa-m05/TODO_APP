import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Filter, Search } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TodoService } from '../../services/todoService';
import { Todo } from '../../types/todo';
import { TodoCard } from '../../components/TodoCard';

const categories = ['All', 'Personal', 'Work', 'Shopping', 'Health', 'Study'];
const priorities: (Todo['priority'] | 'all')[] = ['all', 'high', 'medium', 'low'];

export default function TasksScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState<Todo['priority'] | 'all'>('all');

  useEffect(() => {
    if (user) {
      const todoService = TodoService.getInstance();
      const unsubscribe = todoService.subscribeToTodos(setTodos);
      return unsubscribe;
    }
  }, [user]);

  const handleToggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const todoService = TodoService.getInstance();
      await todoService.updateTodo(id, { completed: !todo.completed });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const todoService = TodoService.getInstance();
    await todoService.deleteTodo(id);
  };

  const handleEditTodo = (todo: Todo) => {
    // Navigate to edit screen or open modal
    console.log('Edit todo:', todo);
  };

  const filteredTodos = todos.filter(todo => {
    if (todo.completed) return false;
    
    const categoryMatch = selectedCategory === 'All' || todo.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || todo.priority === selectedPriority;
    
    return categoryMatch && priorityMatch;
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: insets.top,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    filtersContainer: {
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    filterLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginRight: 12,
      width: 60,
    },
    filterOptions: {
      flex: 1,
    },
    filterScroll: {
      flexDirection: 'row',
    },
    filterItem: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterItemSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterItemText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    filterItemTextSelected: {
      color: '#FFFFFF',
    },
    content: {
      flex: 1,
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.primary,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 48,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Tasks</Text>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Category</Text>
          <View style={styles.filterOptions}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {categories.map(category => (
                <Pressable
                  key={category}
                  style={[
                    styles.filterItem,
                    selectedCategory === category && styles.filterItemSelected
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.filterItemText,
                    selectedCategory === category && styles.filterItemTextSelected
                  ]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Priority</Text>
          <View style={styles.filterOptions}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {priorities.map(priority => (
                <Pressable
                  key={priority}
                  style={[
                    styles.filterItem,
                    selectedPriority === priority && styles.filterItemSelected
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <Text style={[
                    styles.filterItemText,
                    selectedPriority === priority && styles.filterItemTextSelected
                  ]}>
                    {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredTodos.length}</Text>
          <Text style={styles.statLabel}>Active Tasks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredTodos.filter(t => t.priority === 'high').length}</Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredTodos.filter(t => t.dueDate && t.dueDate < new Date()).length}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredTodos.length > 0 ? (
          filteredTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tasks found matching your filters. Try adjusting your selection or create a new task.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}