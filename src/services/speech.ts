import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export { useSpeechRecognitionEvent };

export async function requestSpeechPermission(): Promise<boolean> {
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return result.granted;
}

export function startSpeechRecognition(): void {
  ExpoSpeechRecognitionModule.start({
    lang: 'en-US',
    interimResults: true,
    continuous: false,
  });
}

export function stopSpeechRecognition(): void {
  ExpoSpeechRecognitionModule.stop();
}
