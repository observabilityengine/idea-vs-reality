import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { Memory } from '../domain/memory';
import { theme } from '../theme/theme';

interface Props {
  memory: Memory;
  onComplete: (id: string) => void;
}

function appointmentText(memory: Memory): string {
  if (!memory.appointmentAt) return memory.text;
  const date = new Date(memory.appointmentAt);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const sameDay = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `${memory.text} · ${time}`;
  if (isTomorrow) return `${memory.text} · Tomorrow · ${time}`;
  return `${memory.text} · ${date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} · ${time}`;
}

export function MemoryItem({ memory, onComplete }: Props) {
  const complete = () => onComplete(memory.id);
  const gesture = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-18, 18])
    .onEnd(event => {
      if (Math.abs(event.translationX) >= 90 && Math.abs(event.velocityX) >= 250) runOnJS(complete)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <Pressable
        style={[styles.container, memory.isImportant && styles.important]}
        accessibilityRole="button"
        accessibilityLabel={`${appointmentText(memory)}. Swipe left or right to complete.`}
      >
        <View style={styles.row}>
          {memory.isImportant && <View style={styles.marker} accessibilityLabel="Important" />}
          <View style={styles.copy}>
            {memory.appointmentAt && <Text style={styles.label}>APPOINTMENT</Text>}
            <Text style={styles.text}>{appointmentText(memory)}</Text>
          </View>
        </View>
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: theme.spacing.itemVertical, paddingHorizontal: theme.spacing.page, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D8D6D0' },
  important: { backgroundColor: '#E9E7E0' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  marker: { width: 5, minHeight: 32, borderRadius: 3, backgroundColor: theme.colors.text },
  copy: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: theme.colors.secondaryText, marginBottom: 4 },
  text: { color: theme.colors.text, fontSize: theme.typography.memory, lineHeight: 32, fontWeight: '400' },
});
