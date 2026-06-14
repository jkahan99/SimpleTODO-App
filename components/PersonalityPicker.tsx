import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';
import { PERSONALITIES, Personality } from '../utils/personality';

type PersonalityPickerProps = {
  selected: Personality;
  onSelect: (personality: Personality) => void;
};

export default function PersonalityPicker({ selected, onSelect }: PersonalityPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Personality</Text>
      <View style={styles.row}>
        {PERSONALITIES.map(({ id, label, icon }) => {
          const isSelected = selected === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon as any}
                size={13}
                color={isSelected ? Colors.surface : Colors.textSecondary}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.surface,
  },
});
