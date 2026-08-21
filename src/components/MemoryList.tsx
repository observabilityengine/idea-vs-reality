import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Memory } from '../domain/memory';
import { MemoryItem } from './MemoryItem';
interface Props { memories: Memory[]; onComplete: (id: string) => void; history?: boolean; }
export function MemoryList({ memories, onComplete, history = false }: Props) {
  return <View style={styles.container}><FlatList data={memories} keyExtractor={item => item.id} renderItem={({ item }) => <MemoryItem memory={item} onComplete={onComplete} />} ListEmptyComponent={<View style={styles.empty}><Text style={styles.title}>{history ? 'No completed memories yet.' : 'Nothing to keep in your head.'}</Text><Text style={styles.subtitle}>{history ? 'Completed memories will appear here.' : 'Capture a thought, reminder, or appointment below.'}</Text></View>} contentContainerStyle={memories.length === 0 ? styles.emptyList : undefined} keyboardShouldPersistTaps="handled" /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1 }, emptyList: { flexGrow: 1 }, empty: { flex: 1, minHeight: 220, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }, title: { color: '#242422', fontSize: 22, fontWeight: '500', textAlign: 'center', marginBottom: 8 }, subtitle: { color: '#77766F', fontSize: 16, lineHeight: 23, textAlign: 'center' } });
