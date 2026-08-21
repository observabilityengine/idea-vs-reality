import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  requestSpeechPermission,
  startSpeechRecognition,
  stopSpeechRecognition,
  useSpeechRecognitionEvent,
} from '../services/speech';
import { MEMORY_LIMITS } from '../domain/validation';
import { theme } from '../theme/theme';

interface Props {
  onSubmit: (text: string) => Promise<void>;
}

export function AddMemory({ onSubmit }: Props) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', event => {
    const transcript = event.results[0]?.transcript ?? '';
    if (transcript) setText(transcript.slice(0, MEMORY_LIMITS.maxTextLength));
    if (event.isFinal) setListening(false);
  });
  useSpeechRecognitionEvent('error', () => setListening(false));

  const submit = async () => {
    const value = text.trim();
    if (!value) return;
    await onSubmit(value);
    setText('');
  };

  const toggleVoice = async () => {
    if (listening) {
      stopSpeechRecognition();
      return;
    }
    const granted = await requestSpeechPermission();
    if (granted) startSpeechRecognition();
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={value => setText(value.slice(0, MEMORY_LIMITS.maxTextLength))}
        onSubmitEditing={() => void submit()}
        placeholder="Remember..."
        placeholderTextColor={theme.colors.secondaryText}
        style={styles.input}
        returnKeyType="done"
        multiline
        maxLength={MEMORY_LIMITS.maxTextLength}
        accessibilityLabel="Memory"
      />
      <View style={styles.actions}>
        <Pressable
          onPress={() => void toggleVoice()}
          accessibilityLabel={listening ? 'Stop speaking' : 'Speak'}
          style={styles.action}
        >
          <Text style={styles.actionText}>{listening ? 'Stop' : 'Speak'}</Text>
        </Pressable>
        <Pressable onPress={() => void submit()} accessibilityLabel="Add memory" style={styles.action}>
          <Text style={styles.actionText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.input,
    paddingBottom: 8,
  },
  input: {
    minHeight: 56,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: theme.typography.input,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    paddingTop: 8,
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionText: {
    color: theme.colors.secondaryText,
    fontSize: 16,
  },
});
