import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Flag, X } from 'lucide-react-native';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TodoService } from '../../services/todoService';
import { Todo } from '../../types/todo';
import { TodoCard } from '../../components/TodoCard';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { NotificationService } from '../../services/notificationService';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';

const categories = ['Personal', 'Work', 'Shopping', 'Health', 'Study'];
const priorities: Todo['priority'][] = ['low', 'medium', 'high'];

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    category: 'Personal',
    priority: 'medium' as Todo['priority'],
    dueDate: null as Date | null,
  });

  useEffect(() => {
    if (user) {
      const todoService = TodoService.getInstance();
      const unsubscribe = todoService.subscribeToTodos(setTodos);
      return unsubscribe;
    }
  }, [user]);

  const handleCreateTodo = async () => {
    if (!newTodo.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const todoService = TodoService.getInstance();
    const todo = await todoService.createTodo({
      title: newTodo.title,
      description: newTodo.description,
      category: newTodo.category,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate || undefined,
      completed: false,
      userId: user!.uid,
    });

    // Schedule notification if due date is set
    if (newTodo.dueDate) {
      const notificationDate = new Date(
        newTodo.dueDate.getTime() - 30 * 60 * 1000
      ); // 30 minutes before
      if (notificationDate > new Date()) {
        await NotificationService.scheduleNotification(
          'Task Reminder',
          `Don't forget: ${newTodo.title}`,
          notificationDate
        );
      }
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo || !newTodo.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const todoService = TodoService.getInstance();
    await todoService.updateTodo(editingTodo.id, {
      title: newTodo.title,
      description: newTodo.description,
      category: newTodo.category,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate || undefined,
    });

    resetForm();
    setEditingTodo(null);
    setShowAddModal(false);
  };

  const handleToggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
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
    setEditingTodo(todo);
    setNewTodo({
      title: todo.title,
      description: todo.description || '',
      category: todo.category,
      priority: todo.priority,
      dueDate: todo.dueDate || null,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewTodo({
      title: '',
      description: '',
      category: 'Personal',
      priority: 'medium',
      dueDate: null,
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTodo(null);
    resetForm();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayTodos = todos.filter(
    (todo) => !todo.completed && todo.dueDate && isToday(todo.dueDate)
  );

  const upcomingTodos = todos.filter(
    (todo) =>
      !todo.completed &&
      todo.dueDate &&
      !isToday(todo.dueDate) &&
      todo.dueDate > new Date()
  );

  const overdueTodos = todos.filter(
    (todo) =>
      !todo.completed &&
      todo.dueDate &&
      todo.dueDate < new Date() &&
      !isToday(todo.dueDate)
  );

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
    greeting: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 4,
    },
    userName: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginLeft: 8,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginVertical: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      width: '100%',
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    closeButton: {
      padding: 8,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    pickerContainer: {
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    picker: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
    },
    pickerItem: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pickerItemSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    pickerItemText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    pickerItemTextSelected: {
      color: '#FFFFFF',
    },
    dateButton: {
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      marginLeft: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
      marginBottom: insets.bottom > 0 ? insets.bottom : 16,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: theme.primary,
      marginLeft: 8,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 8,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    primaryButtonText: {
      color: '#FFFFFF',
    },
    secondaryButtonText: {
      color: theme.text,
    },
    modalScroll: {
      flex: 1,
      width: '100%',
      backgroundColor: 'transparent',
    },
    modalWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>{user?.displayName || user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {todos.filter((t) => !t.completed).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {todos.filter((t) => t.completed).length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{overdueTodos.length}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {overdueTodos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Flag color={theme.error} size={20} />
              <Text style={[styles.sectionTitle, { color: theme.error }]}>
                Overdue
              </Text>
            </View>
            {overdueTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </View>
        )}

        {todayTodos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar color={theme.primary} size={20} />
              <Text style={styles.sectionTitle}>Today</Text>
            </View>
            {todayTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </View>
        )}

        {upcomingTodos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar color={theme.textSecondary} size={20} />
              <Text style={styles.sectionTitle}>Upcoming</Text>
            </View>
            {upcomingTodos.slice(0, 5).map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </View>
        )}

        {todos.length === 0 && (
          <Text style={styles.emptyText}>
            No tasks yet. Tap the + button to create your first task!
          </Text>
        )}
      </ScrollView>

      <FloatingActionButton onPress={() => setShowAddModal(true)} />

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1, width: '100%' }}
            keyboardVerticalOffset={insets.top + 64}
          >
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={{ paddingBottom: insets.bottom || 24 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingTodo ? 'Edit Task' : 'New Task'}
                  </Text>
                  <Pressable
                    style={styles.closeButton}
                    onPress={handleCloseModal}
                  >
                    <X color={theme.textSecondary} size={24} />
                  </Pressable>
                </View>

                {/* Title Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={newTodo.title}
                    onChangeText={(text) =>
                      setNewTodo({ ...newTodo, title: text })
                    }
                    placeholder="Enter task title"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={newTodo.description}
                    onChangeText={(text) =>
                      setNewTodo({ ...newTodo, description: text })
                    }
                    placeholder="Enter description (optional)"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                  />
                </View>

                {/* Category Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.pickerContainer}>
                    <View style={styles.picker}>
                      {categories.map((category) => (
                        <Pressable
                          key={category}
                          style={[
                            styles.pickerItem,
                            newTodo.category === category &&
                              styles.pickerItemSelected,
                          ]}
                          onPress={() => setNewTodo({ ...newTodo, category })}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              newTodo.category === category &&
                                styles.pickerItemTextSelected,
                            ]}
                          >
                            {category}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Priority Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Priority</Text>
                  <View style={styles.pickerContainer}>
                    <View style={styles.picker}>
                      {priorities.map((priority) => (
                        <Pressable
                          key={priority}
                          style={[
                            styles.pickerItem,
                            newTodo.priority === priority &&
                              styles.pickerItemSelected,
                          ]}
                          onPress={() => setNewTodo({ ...newTodo, priority })}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              newTodo.priority === priority &&
                                styles.pickerItemTextSelected,
                            ]}
                          >
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Date Picker */}
                <View style={styles.inputGroup}>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => {
                      try {
                        interface DatePickerEvent {
                          type: 'set' | 'dismissed';
                        }

                        interface DatePickerOptions {
                          value: Date;
                          onChange: (
                            event: DatePickerEvent,
                            selectedDate?: Date
                          ) => void;
                          mode: 'date' | 'time';
                          is24Hour: boolean;
                        }

                        setShowAddModal(false);
                        setTimeout(() => {
                          Alert.alert(
                            'Select Date',
                            '',
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel',
                              },
                              {
                                text: 'OK',
                                onPress: () => {
                                  setNewTodo({
                                    ...newTodo,
                                    dueDate: new Date(),
                                  });
                                },
                              },
                            ],
                            { cancelable: true }
                          );
                        }, 100);
                      } catch (error) {
                        console.error('Error opening date picker:', error);
                        const fallback = addDays(new Date(), 1);
                        setNewTodo({ ...newTodo, dueDate: fallback });
                      }
                    }}
                  >
                    <Calendar color={theme.textSecondary} size={20} />
                    <Text style={styles.dateButtonText}>
                      {newTodo.dueDate
                        ? format(newTodo.dueDate, 'MMM dd, yyyy')
                        : 'Select date'}
                    </Text>
                  </Pressable>
                </View>

                {/* Buttons */}
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleCloseModal}
                  >
                    <Text
                      style={[styles.buttonText, styles.secondaryButtonText]}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.primaryButton]}
                    onPress={editingTodo ? handleUpdateTodo : handleCreateTodo}
                  >
                    <Text style={[styles.buttonText, styles.primaryButtonText]}>
                      {editingTodo ? 'Update' : 'Create'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
