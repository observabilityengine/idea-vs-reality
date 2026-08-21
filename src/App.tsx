import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
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

  const refresh = useCallback(async () => {
    const active = await listActiveMemories();
    setMemories(orderMemories(active));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addMemory = async (input: string) => {
    const parsed = parseMemory(input);
    const validated = parsed ? validateMemory(parsed) : null;
    if (!validated) return;
    await createMemory(validated);
    await refresh();
  };

  const finishMemory = async (id: string) => {
    await completeMemory(id);
    await refresh();
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <MemoryList memories={memories} onComplete={id => void finishMemory(id)} />
          <AddMemory onSubmit={addMemory} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1 },
});
