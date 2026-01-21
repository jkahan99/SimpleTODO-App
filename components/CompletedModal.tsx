import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo } from '../types/Todo';
import TodoItem from './TodoItem';

type CompletedModalProps = {
  visible: boolean;
  completedTodos: Todo[];
  onClose: () => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
};
function CompletedModal({ visible, completedTodos, onClose, onToggle, onDelete, onEdit }: CompletedModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Completed</Text>
          <TouchableOpacity style={styles.newButton} onPress={onClose}>
            <Text style={styles.newButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={completedTodos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TodoItem 
              item={item}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isCompleted={true}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No completed tasks yet</Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
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
  emptyText: {
    textAlign: 'center',
    color: '#8e8e93',
    fontSize: 17,
    marginTop: 50,
  },
});
export default CompletedModal;