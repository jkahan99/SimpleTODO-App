import React from 'react';
import { Animated, FlatList, Modal, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function CompletedModal({ visible, completedTodos, onClose, onToggle, onDelete, onEdit }: CompletedModalProps) {
  const translateX = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger on right swipe (going back/left)
        return gestureState.dx > 20 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow positive values (swiping right to go back)
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          // Swipe far enough - close the modal
          Animated.timing(translateX, {
            toValue: 400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            translateX.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
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
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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