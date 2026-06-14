import AsyncStorage from '@react-native-async-storage/async-storage';

export type Personality = 'friendly' | 'funny' | 'mean' | 'hype';

export const DEFAULT_PERSONALITY: Personality = 'funny';

const STORAGE_KEY = 'personality';

export const PERSONALITIES: { id: Personality; label: string; icon: string }[] = [
  { id: 'friendly', label: 'Friendly', icon: 'heart-outline' },
  { id: 'funny', label: 'Funny', icon: 'happy-outline' },
  { id: 'mean', label: 'Mean', icon: 'flame-outline' },
  { id: 'hype', label: 'Hype', icon: 'megaphone-outline' },
];

function isPersonality(value: string | null): value is Personality {
  return value === 'friendly' || value === 'funny' || value === 'mean' || value === 'hype';
}

export async function loadPersonality(): Promise<Personality> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (isPersonality(stored)) {
      return stored;
    }
  } catch (error) {
    console.error('Failed to load personality:', error);
  }
  return DEFAULT_PERSONALITY;
}

export async function savePersonality(personality: Personality): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, personality);
  } catch (error) {
    console.error('Failed to save personality:', error);
  }
}
