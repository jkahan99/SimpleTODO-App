import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  return (
    <View style={styles.todoRow}>
      <TouchableOpacity onPress={() => onToggle(item.id)}>
        <View style={[styles.circle, isCompleted && styles.circleCompleted]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      
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

