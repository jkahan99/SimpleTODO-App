import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddTodoModal from '../components/AddTodoModal';
import CompletedModal from '../components/CompletedModal';
import EditTodoModal from '../components/EditTodoModal';
import PersonalitySettingsModal from '../components/PersonalitySettingsModal';
import TodoItem from '../components/TodoItem';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { Todo } from '../types/Todo';
import { generateWittyNotification } from '../utils/aiNotifications';
import { cancelNotification, requestNotificationPermissions, scheduleNotification } from '../utils/notifications';
import { DEFAULT_PERSONALITY, loadPersonality, Personality, savePersonality } from '../utils/personality';

export default function TodoList() {

const insets = useSafeAreaInsets();
const [todos, setTodos] = useState<Todo[]>([]);
const [modalVisible, setModalVisible] = useState(false);
const [todoText, setTodoText] = useState('');
const [showCompleted, setShowCompleted] = useState(false);
const [editingId, setEditingId] = useState<number | null>(null);
const [editText, setEditText] = useState('');
const [justCompleted, setJustCompleted] = useState<number | null>(null);
const [newNotificationDate, setNewNotificationDate] = useState<Date | null>(null);
const [editNotificationDate, setEditNotificationDate] = useState<Date | null>(null);
const [personality, setPersonality] = useState<Personality>(DEFAULT_PERSONALITY);
const [settingsVisible, setSettingsVisible] = useState(false);

useEffect(() => {
  loadTodos();
}, []);

useEffect(() => {
  loadPersonality().then(setPersonality);
}, []);

const changePersonality = (next: Personality) => {
  setPersonality(next);
  savePersonality(next);
};

useEffect(() => {
  saveTodos();
}, [todos]);

useEffect(() => {
  requestNotificationPermissions();
}, []);

const addTodo = async (title: string, notificationDate: Date | null) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  const newTodo: Todo = {
    id: Date.now(),
    title,
    completed: false,
  };

  setTodos(prev => [...prev, newTodo]);

  if (!notificationDate) return;

  const message = await generateWittyNotification(title, personality);
  const nId = await scheduleNotification(newTodo.id, message, notificationDate);

  setTodos(prev => prev.map(t =>
    t.id === newTodo.id
      ? { ...t, notificationIds: [nId], notificationDate: notificationDate.toISOString() }
      : t
  ));
};

const toggleComplete = async (id: number) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  const todo = todos.find(t => t.id === id);
  if (todo && !todo.completed) {
    setJustCompleted(id);

    if (todo.notificationIds) {
      todo.notificationIds.forEach(nId => cancelNotification(nId));
    }
    setTimeout(() => {
      setTodos(todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: true };
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
        return { ...todo, completed: false };
      }
      return todo;
    }));

    if (todo?.notificationDate) {
      const notificationDate = new Date(todo.notificationDate);
      if (notificationDate > new Date()) {
        const message = await generateWittyNotification(todo.title, personality);
        const nId = await scheduleNotification(id, message, notificationDate);
        setTodos(prev => prev.map(t =>
          t.id === id ? { ...t, notificationIds: [nId] } : t
        ));
      }
    }
  }
};

const deleteTodo = (id: number) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const todo = todos.find(t => t.id === id);
  if (todo?.notificationIds) {
    todo.notificationIds.forEach(nId => cancelNotification(nId));
  }
  setTodos(todos.filter(todo => todo.id !== id));
};

const editTodo = async (id: number, newTitle: string, notificationDate: Date | null) => {
  setTodos(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));

  const existing = todos.find(t => t.id === id);
  if (existing?.notificationIds) {
    existing.notificationIds.forEach(nId => cancelNotification(nId));
  }

  let notificationIds: string[] = [];
  let notificationDateStr: string | undefined;

  if (notificationDate) {
    const message = await generateWittyNotification(newTitle, personality);
    const nId = await scheduleNotification(id, message, notificationDate);
    notificationIds = [nId];
    notificationDateStr = notificationDate.toISOString();
  }

  setTodos(prev => prev.map(t =>
    t.id === id
      ? { ...t, notificationIds, notificationDate: notificationDateStr }
      : t
  ));
};

const openEditModal = (id: number) => {
  const todoToEdit = todos.find(todo => todo.id === id);
  if (todoToEdit) {
    setEditText(todoToEdit.title);
    setEditingId(id);
    setShowCompleted(false);
    setEditNotificationDate(
      todoToEdit.notificationDate ? new Date(todoToEdit.notificationDate) : null
    );
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


return (
  <View style={styles.outer}>
    <View style={styles.container}>

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top - 12 }]}>
        <Text style={styles.headerTitle}>Get It Done</Text>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && { opacity: 0.6 }]}
          onPress={() => setSettingsVisible(true)}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* TODO LIST */}
      <FlatList
        data={activeTodos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TodoItem
            item={item}
            onToggle={toggleComplete}
            onDelete={deleteTodo}
            onEdit={openEditModal}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={Colors.border} />
            <View style={{ height: 16 }} />
            <Text style={styles.emptyTitle}>All clear ✨</Text>
            <View style={{ height: 8 }} />
            <Text style={styles.emptySubtitle}>Add your first task to get started</Text>
          </View>
        }
      />

      {/* COMPLETED BUTTON */}
      <Pressable
        style={({ pressed }) => [styles.completedButton, pressed && { opacity: 0.8 }]}
        onPress={() => setShowCompleted(!showCompleted)}
      >
        <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
        <Text style={styles.completedButtonText}>{completedTodos.length} Done</Text>
      </Pressable>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { backgroundColor: Colors.primaryPressed }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color={Colors.surface} />
      </Pressable>

    </View>

    {/* MODALS */}
    <AddTodoModal
      visible={modalVisible}
      todoText={todoText}
      onChangeText={setTodoText}
      notificationDate={newNotificationDate}
      onNotificationChange={setNewNotificationDate}
      onAdd={() => {
        if (todoText.trim() !== '') {
          addTodo(todoText, newNotificationDate);
          setModalVisible(false);
          setTodoText('');
          setNewNotificationDate(null);
        }
      }}
      onCancel={() => {
        setModalVisible(false);
        setTodoText('');
        setNewNotificationDate(null);
      }}
    />

    <CompletedModal
      visible={showCompleted}
      completedTodos={completedTodos}
      onClose={() => setShowCompleted(false)}
      onToggle={toggleComplete}
      onDelete={deleteTodo}
      onEdit={openEditModal}
    />

    <PersonalitySettingsModal
      visible={settingsVisible}
      personality={personality}
      onSelect={changePersonality}
      onClose={() => setSettingsVisible(false)}
    />

    <EditTodoModal
      visible={editingId !== null}
      editText={editText}
      onChangeText={setEditText}
      notificationDate={editNotificationDate}
      onNotificationChange={setEditNotificationDate}
      onSave={() => {
        if (editText.trim() !== '' && editingId !== null) {
          editTodo(editingId, editText, editNotificationDate);
          setEditingId(null);
          setEditText('');
          setEditNotificationDate(null);
        }
      }}
      onCancel={() => {
        setEditingId(null);
        setEditText('');
        setEditNotificationDate(null);
      }}
    />
  </View>
);

}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,                   // 20
    paddingBottom: Spacing.lg,                       // 16
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.display,               // 34
    fontWeight: Typography.weight.heavy,             // '800'
    fontFamily: Typography.fontFamily,
    letterSpacing: Typography.letterSpacing.display, // -0.5
    color: Colors.textPrimary,
  },
  settingsButton: {
    // floated to the far right, out of flow so the title stays centered
    position: 'absolute',
    right: Spacing.xl,                                // 20
    bottom: Spacing.lg + 7,                           // 23 — 7px higher
  },

  listContent: {
    paddingHorizontal: Spacing.xl,                   // 20
    paddingBottom: 120,                              // clear the FABs
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: Typography.size.title,                 // 22
    fontWeight: Typography.weight.bold,              // '700'
    fontFamily: Typography.fontFamily,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.size.body,                  // 15
    fontWeight: Typography.weight.regular,           // '400'
    fontFamily: Typography.fontFamily,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  completedButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,                                 // 4
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    height: 52,
    paddingHorizontal: Spacing['2xl'],               // 24
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  completedButtonText: {
    fontSize: Typography.size.body,                  // 15
    fontWeight: Typography.weight.semibold,          // '600'
    fontFamily: Typography.fontFamily,
    color: Colors.textPrimary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});
