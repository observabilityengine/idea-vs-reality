import { Pressable, StyleSheet, Text } from 'react-native';
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
  const sameDay = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (sameDay) return `${memory.text}, ${time}`;
  if (isTomorrow) return `${memory.text} tomorrow`;
  return `${memory.text}, ${date.toLocaleDateString([], { month: 'long', day: 'numeric' })} at ${time}`;
}

export function MemoryItem({ memory, onComplete }: Props) {
  const complete = () => onComplete(memory.id);
  const gesture = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .onEnd(event => {
      if (event.translationX > 90 || event.translationX < -90) {
        runOnJS(complete)();
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <Pressable
        style={styles.container}
        accessibilityRole="button"
        accessibilityLabel={`${appointmentText(memory)}. Swipe to complete.`}
      >
        <Text style={styles.text}>{appointmentText(memory)}</Text>
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.itemVertical,
    paddingHorizontal: theme.spacing.page,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.memory,
    lineHeight: 32,
    fontWeight: '400',
  },
});
