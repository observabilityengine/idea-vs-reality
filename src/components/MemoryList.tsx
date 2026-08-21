import { FlatList, StyleSheet, View } from 'react-native';
import type { Memory } from '../domain/memory';
import { MemoryItem } from './MemoryItem';

interface Props {
  memories: Memory[];
  onComplete: (id: string) => void;
}

export function MemoryList({ memories, onComplete }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={memories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MemoryItem memory={item} onComplete={onComplete} />}
        contentContainerStyle={memories.length === 0 ? styles.empty : undefined}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { minHeight: 120 },
});
