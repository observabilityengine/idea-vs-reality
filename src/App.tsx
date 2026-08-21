import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Memory } from './domain/memory';
import { orderMemories } from './domain/ordering';
import { parseMemory } from './domain/parser';
import { validateMemory } from './domain/validation';
import { completeMemory, createMemory, listActiveMemories } from './db/database';
import { AddMemory } from './components/AddMemory';
import { MemoryList } from './components/MemoryList';
import { theme } from './theme/theme';

export default function App() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const active = await listActiveMemories();
      setMemories(orderMemories(active));
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to load memories.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addMemory = async (input: string) => {
    setError(null);
    const parsed = parseMemory(input);
    const validated = parsed ? validateMemory(parsed) : null;
    if (!validated) {
      setError('Memory must contain text and be 500 characters or fewer.');
      return;
    }
    await createMemory(validated);
    await refresh();
  };

  const finishMemory = async (id: string) => {
    try {
      setError(null);
      await completeMemory(id);
      await refresh();
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : 'Unable to complete memory.');
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {error ? (
            <View accessibilityRole="alert" style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <MemoryList memories={memories} onComplete={id => void finishMemory(id)} />
          <AddMemory onSubmit={addMemory} onError={setError} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1 },
  errorBanner: {
    marginHorizontal: theme.spacing.page,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.inputBackground,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: 15,
  },
});
