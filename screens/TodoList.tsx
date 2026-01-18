import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Todo } from '../types/Todo';
export default function TodoList() {

//make an array of ToDo items
const [todos, setTodos] = useState<Todo[]>([]);
const [modalVisible, setModalVisible] = useState(false);  // Add this
const [todoText, setTodoText] = useState('');  

const addTodo = (title: string) => {
  const newTodo: Todo = {
    id: Date.now(),
    title,
    completed: false,
  };
  setTodos([...todos, newTodo]);
}

const toggleComplete = (id: number) => {
  setTodos(todos.map(todo => {
    if (todo.id === id) {
      return {...todo, completed: !todo.completed};
    }
    return todo;
  }));
};





 return (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My List</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text>+ New</Text>
      </TouchableOpacity>
    </View>

    <FlatList
      data={todos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.todoRow}
          onPress={() => toggleComplete(item.id)}
        >
          <View style={styles.circle}>
            {item.completed && <Text>✓</Text>}
          </View>
          
          <Text style={styles.todoTitle}>
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
    />

    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Reminder</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="What do you want to do?"
            value={todoText}
            onChangeText={setTodoText}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                if (todoText.trim() !== '') {
                  addTodo(todoText);
                  setModalVisible(false);
                  setTodoText('');
                }
              }}
            >
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

  </View>
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
  todoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'white',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e5ea',
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
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
  },
});
