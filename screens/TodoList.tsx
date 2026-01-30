import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddTodoModal from '../components/AddTodoModal';
import CompletedModal from '../components/CompletedModal';
import EditTodoModal from '../components/EditTodoModal';
import { Todo } from '../types/Todo';
import { generateWittyNotification } from '../utils/aiNotifications';
import { cancelNotification, requestNotificationPermissions, scheduleNotification } from '../utils/notifications';
export default function TodoList() {

//make an array of ToDo items
const [todos, setTodos] = useState<Todo[]>([]);
const [modalVisible, setModalVisible] = useState(false);  // Add this
const [todoText, setTodoText] = useState('');  
const [showCompleted, setShowCompleted] = useState(false);
const [editingId, setEditingId] = useState<number | null>(null);  // ADD THIS
const [editText, setEditText] = useState('');            
const [justCompleted, setJustCompleted] = useState<number | null>(null);
useEffect(() => {
  loadTodos();
}, []);

useEffect(() => {
  saveTodos();
}, [todos]);
useEffect(() => {
  requestNotificationPermissions();
}, []);



const addTodo = async (title: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
  const newTodo: Todo = {
    id: Date.now(),
    title,
    completed: false,
  };
  
  // Add to state IMMEDIATELY (user sees it right away)
  setTodos([...todos, newTodo]);
  
  // THEN do the slow AI stuff in background
  const aiMessage = await generateWittyNotification(title);
  console.log('AI message for "' + title + '":', aiMessage);

  const notificationId = await scheduleNotification(newTodo.id, aiMessage, 15);
  console.log('Notification scheduled for 15 seconds!');
  
  // Update the todo with notification ID
  setTodos(prevTodos => prevTodos.map(todo => 
    todo.id === newTodo.id 
      ? {...todo, notificationId} 
      : todo
  ));
}

const toggleComplete = (id: number) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  const todo = todos.find(t => t.id === id);
  if (todo && !todo.completed) {
    setJustCompleted(id);

    if (todo.notificationId) {
      cancelNotification(todo.notificationId);
      console.log('Notification cancelled!');
    }
    setTimeout(() => {
      setTodos(todos.map(todo => {
        if (todo.id === id) {
          return {...todo, completed: true};
        }
        return todo;
      }));
      
      // Clear justCompleted so it disappears from active list
      setTimeout(() => {
        setJustCompleted(null);
      }, 700);
      
    }, 100);
  } else {
    setJustCompleted(null);
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        return {...todo, completed: false};
      }
      return todo;
    }));
  }
};

const deleteTodo = (id: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const todo = todos.find(t => t.id === id);
  if (todo?.notificationId) {
    cancelNotification(todo.notificationId);
    console.log('Notification cancelled!');
  }
  setTodos(todos.filter(todo => todo.id !== id));
};

const editTodo = (id: number, newTitle: string) => {
  setTodos(todos.map(todo => {
    if (todo.id === id) {
      return {...todo, title: newTitle};
    }
    return todo;
  }));
};

const openEditModal = (id: number) => {
  const todoToEdit = todos.find(todo => todo.id === id);
  if (todoToEdit) {
    setEditText(todoToEdit.title);
    setEditingId(id);
    setShowCompleted(false);  // Closes completed modal

  }
};

const saveTodos = async () => {
  try {
    await AsyncStorage.setItem('todos', JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
};

const loadTodos = async () => {
  try {
    const savedTodos = await AsyncStorage.getItem('todos');
    if (savedTodos !== null) {
      setTodos(JSON.parse(savedTodos));
    }
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
};

const activeTodos = todos.filter(todo => !todo.completed || todo.id === justCompleted);
const completedTodos = todos.filter(todo => todo.completed);
// Animated circle component
// Animated circle component with green flash
// Animated circle component with animated checkmark
const AnimatedTodoCircle = ({ item, onToggle }: { item: Todo; onToggle: () => void }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const checkScale = React.useRef(new Animated.Value(0)).current;
  const checkOpacity = React.useRef(new Animated.Value(0)).current;

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

  const handlePress = () => {
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
    
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
        <View style={item.completed ? styles.circleCompleted : styles.circle}>
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
  );
};
return (
  <>
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SimpleTODO</Text>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* TODO LIST */}
      <FlatList
        data={activeTodos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
  <View style={styles.todoRow}>
    {/* CIRCLE - Click to toggle complete */}
    {/*<TouchableOpacity onPress={() => toggleComplete(item.id)}>
      <View style={item.completed ? styles.circleCompleted : styles.circle}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>*/}
    {/* CIRCLE - Click to toggle complete */}
<AnimatedTodoCircle item={item} onToggle={() => toggleComplete(item.id)} />
    
    {/* TEXT - Click to edit */}
    <TouchableOpacity 
      style={styles.todoContent}
      onPress={() => openEditModal(item.id)}
    >
      <Text style={styles.todoTitle}>
  {item.title}
</Text>
    </TouchableOpacity>
    
    {/* DELETE BUTTON */}
    <TouchableOpacity onPress={() => deleteTodo(item.id)}>
      <Text style={styles.deleteButton}>🗑️</Text>
    </TouchableOpacity>
  </View>
)}
        ListEmptyComponent={
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>✨</Text>
    <Text style={styles.emptyTitle}>All clear!</Text>
    <Text style={styles.emptyText}>Tap "New" to add a task</Text>
  </View>
}
      />

      {/* COMPLETED BUTTON */}
      <TouchableOpacity 
        style={styles.completedButton}
        onPress={() => setShowCompleted(!showCompleted)}
      >
        <Text style={styles.completedButtonText}>
          ✓ {completedTodos.length}
        </Text>
      </TouchableOpacity>
    </View>

    {/* MODALS */}
    <AddTodoModal
      visible={modalVisible}
      todoText={todoText}
      onChangeText={setTodoText}
      onAdd={() => {
        if (todoText.trim() !== '') {
          addTodo(todoText);
          setModalVisible(false);
          setTodoText('');
        }
      }}
      onCancel={() => setModalVisible(false)}
    />

    <CompletedModal
      visible={showCompleted}
      completedTodos={completedTodos}
      onClose={() => setShowCompleted(false)}
      onToggle={toggleComplete}
      onDelete={deleteTodo}
      onEdit={openEditModal}
    />

    <EditTodoModal
      visible={editingId !== null}
      editText={editText}
      onChangeText={setEditText}
      onSave={() => {
        if (editText.trim() !== '' && editingId !== null) {
          editTodo(editingId, editText);
          setEditingId(null);
          setEditText('');
        }
      }}
      onCancel={() => {
        setEditingId(null);
        setEditText('');
      }}
    />
  </>
);

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {  // Add this
    color: 'blue',
    fontSize: 40,  // This is how you change text size
  },
  header: {
    flexDirection: 'row',           // Makes items go left-to-right
    justifyContent: 'space-between', // Pushes title left, button right
    alignItems: 'center',            // Vertically centers items
    paddingHorizontal: 20,           // Space on left and right
    paddingTop: 40,                  // Space from top (for status bar)
    paddingBottom: 20,
    backgroundColor: 'white',
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
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
todoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'white',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e5ea',
  justifyContent: 'space-between',  // Add this
},
emptyState: {
  alignItems: 'center',
  marginTop: 100,
},
emptyIcon: {
  fontSize: 48,
  marginBottom: 16,
},
emptyTitle: {
  fontSize: 24,
  fontWeight: '600',
  color: '#000',
  marginBottom: 8,
},
// Keep your existing emptyText but update it:
emptyText: {
  textAlign: 'center',
  color: '#8e8e93',
  fontSize: 17,
},
todoContent: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
deleteButton: {
  fontSize: 20,
  marginLeft: 10,
},
modalContent: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 20,
  width: '80%',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 15,
  textAlign: 'center',
},
modalInput: {
  borderWidth: 1,
  borderColor: '#e5e5ea',
  borderRadius: 8,
  padding: 12,
  fontSize: 17,
  marginBottom: 20,
},
modalButtons: {
  flexDirection: 'row',
  gap: 10,
},
modalButton: {
  flex: 1,
  backgroundColor: '#007AFF',
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
},
cancelButton: {
  backgroundColor: '#8e8e93',
},
modalButtonText: {
  color: 'white',
  fontSize: 17,
  fontWeight: '600',
},
todoTitle: {
  fontSize: 17,
  color: '#000',
},
newButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: '#007AFF',
  borderRadius: 8,
},
newButtonText: {
  fontSize: 17,
  color: 'white',
  fontWeight: '600',
},
completedButton: {
  position: 'absolute',
  bottom: 30,
  left: 30,
  backgroundColor: '#34C759',
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
},
completedButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  circleCompleted: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#34C759',
  borderColor: '#34C759',
  borderWidth: 2,
  marginRight: 12,
  justifyContent: 'center',
  alignItems: 'center',
},
checkmark: {
  color: 'white',
  fontSize: 14,
  fontWeight: 'bold',
},
todoTitleCompleted: {
  fontSize: 17,
  color: '#8e8e93',
  textDecorationLine: 'line-through',
},
});
