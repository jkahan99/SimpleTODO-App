import * as React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  item: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit?: (id: number) => void;
  isCompleted?: boolean;
}

export default function TodoItem({ item, onToggle, onDelete, onEdit, isCompleted }: TodoItemProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const checkScale = React.useRef(new Animated.Value(item.completed ? 1 : 0)).current;
  const checkOpacity = React.useRef(new Animated.Value(item.completed ? 1 : 0)).current;

  // Animate checkmark in when item becomes completed
  React.useEffect(() => {
    if (item.completed) {
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      checkScale.setValue(0);
      checkOpacity.setValue(0);
    }
  }, [item.completed]);

  const handleToggle = () => {
    // Bounce the whole circle
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onToggle(item.id);
  };

  return (
    <View style={styles.todoRow}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity onPress={handleToggle} activeOpacity={0.6}>
          <View style={[styles.circle, isCompleted && styles.circleCompleted]}>
            {item.completed && (
              <Animated.Text 
                style={[
                  styles.checkmark,
                  { 
                    transform: [{ scale: checkScale }],
                    opacity: checkOpacity 
                  }
                ]}
              >
                ✓
              </Animated.Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.todoContent}
        onPress={() => onEdit?.(item.id)}
      >
        <Text style={[styles.todoTitle, isCompleted && styles.todoTitleCompleted]}>
          {item.title}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Text style={styles.deleteButton}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    justifyContent: 'space-between',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c7c7cc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 17,
    color: '#000',
  },
  todoTitleCompleted: {
    color: '#8e8e93',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    fontSize: 20,
    marginLeft: 10,
  },
});