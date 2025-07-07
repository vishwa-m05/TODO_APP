import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Check, Edit, Trash2, Calendar, Clock } from 'lucide-react-native';
import { Todo } from '../types/todo';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const actionTriggered = useRef(false);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      actionTriggered.current = false;
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD && !actionTriggered.current) {
        actionTriggered.current = true;
        
        if (event.translationX > 0) {
          // Swipe right - mark complete/incomplete
          runOnJS(onToggleComplete)(todo.id);
        } else {
          // Swipe left - delete
          runOnJS(onDelete)(todo.id);
        }
      }
      
      translateX.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > SWIPE_THRESHOLD ? 1 : 0,
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -SWIPE_THRESHOLD ? 1 : 0,
  }));

  const getPriorityColor = (priority: Todo['priority']) => {
    return theme.priority[priority];
  };

  const isOverdue = todo.dueDate && todo.dueDate < new Date() && !todo.completed;

  const styles = StyleSheet.create({
    container: {
      marginVertical: 4,
      marginHorizontal: 16,
    },
    actionsContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: screenWidth,
      paddingHorizontal: 24,
    },
    rightAction: {
      backgroundColor: theme.success,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftAction: {
      backgroundColor: theme.error,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderLeftWidth: 4,
      borderLeftColor: getPriorityColor(todo.priority),
    },
    completedCard: {
      opacity: 0.7,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
      marginRight: 8,
      textDecorationLine: todo.completed ? 'line-through' : 'none',
    },
    description: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    category: {
      backgroundColor: theme.primary + '20',
      color: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      fontSize: 12,
      fontWeight: '500',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 12,
      color: isOverdue ? theme.error : theme.textSecondary,
      marginLeft: 4,
    },
    editButton: {
      padding: 8,
    },
    priorityIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: getPriorityColor(todo.priority),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        <Animated.View style={[styles.rightAction, rightActionStyle]}>
          <Check color="#FFFFFF" size={24} />
        </Animated.View>
        <Animated.View style={[styles.leftAction, leftActionStyle]}>
          <Trash2 color="#FFFFFF" size={24} />
        </Animated.View>
      </View>
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[animatedStyle]}>
          <View style={[styles.card, todo.completed && styles.completedCard]}>
            <View style={styles.header}>
              <Text style={styles.title}>{todo.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.priorityIndicator} />
                <Pressable style={styles.editButton} onPress={() => onEdit(todo)}>
                  <Edit color={theme.textSecondary} size={20} />
                </Pressable>
              </View>
            </View>
            
            {todo.description && (
              <Text style={styles.description}>{todo.description}</Text>
            )}
            
            <View style={styles.footer}>
              <Text style={styles.category}>{todo.category}</Text>
              
              {todo.dueDate && (
                <View style={styles.dateContainer}>
                  {isOverdue ? (
                    <Clock color={theme.error} size={14} />
                  ) : (
                    <Calendar color={theme.textSecondary} size={14} />
                  )}
                  <Text style={styles.dateText}>
                    {format(todo.dueDate, 'MMM dd')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};