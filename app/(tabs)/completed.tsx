import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, RotateCcw, Trash2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TodoService } from '../../services/todoService';
import { Todo } from '../../types/todo';

export default function CompletedScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (user) {
      const todoService = TodoService.getInstance();
      const unsubscribe = todoService.subscribeToTodos(setTodos);
      return unsubscribe;
    }
  }, [user]);

  const handleRestoreTodo = async (id: string) => {
    const todoService = TodoService.getInstance();
    await todoService.updateTodo(id, { completed: false });
  };

  const handleDeleteTodo = async (id: string) => {
    const todoService = TodoService.getInstance();
    await todoService.deleteTodo(id);
  };

  const completedTodos = todos.filter(todo => todo.completed);

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
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    statsContainer: {
      backgroundColor: theme.surface,
      marginHorizontal: 24,
      marginBottom: 24,
      borderRadius: 16,
      padding: 20,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.success,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    todoCard: {
      backgroundColor: theme.surface,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      opacity: 0.8,
    },
    todoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    todoTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      flex: 1,
      marginRight: 12,
      textDecorationLine: 'line-through',
    },
    todoActions: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: 8,
      marginLeft: 4,
    },
    todoDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    todoFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    todoCategory: {
      backgroundColor: theme.success + '20',
      color: theme.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
    },
    todoDate: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 48,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
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
        <Text style={styles.title}>Completed</Text>
        <Text style={styles.subtitle}>{completedTodos.length} tasks completed</Text>
      </View>

      {completedTodos.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedTodos.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {completedTodos.filter(t => t.category === 'Work').length}
              </Text>
              <Text style={styles.statLabel}>Work</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {completedTodos.filter(t => t.category === 'Personal').length}
              </Text>
              <Text style={styles.statLabel}>Personal</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {completedTodos.length > 0 ? (
          completedTodos.map(todo => (
            <View key={todo.id} style={styles.todoCard}>
              <View style={styles.todoHeader}>
                <Text style={styles.todoTitle}>{todo.title}</Text>
                <View style={styles.todoActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleRestoreTodo(todo.id)}
                  >
                    <RotateCcw color={theme.primary} size={20} />
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 color={theme.error} size={20} />
                  </Pressable>
                </View>
              </View>

              {todo.description && (
                <Text style={styles.todoDescription}>{todo.description}</Text>
              )}

              <View style={styles.todoFooter}>
                <Text style={styles.todoCategory}>{todo.category}</Text>
                <Text style={styles.todoDate}>
                  Completed {format(todo.updatedAt, 'MMM dd')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CheckCircle color={theme.textSecondary} size={64} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No completed tasks yet</Text>
            <Text style={styles.emptyText}>
              Complete some tasks to see them here. Your achievements will be displayed in this section.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}