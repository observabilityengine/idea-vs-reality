import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export { useSpeechRecognitionEvent };

export type SpeechErrorCode = 'permission-denied' | 'start-failed' | 'stop-failed';

export class SpeechError extends Error {
  constructor(
    public readonly code: SpeechErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'SpeechError';
  }
}

export async function requestSpeechPermission(): Promise<boolean> {
  try {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      throw new SpeechError('permission-denied', 'Speech recognition permission was not granted.');
    }
    return true;
  } catch (error) {
    if (error instanceof SpeechError) throw error;
    throw new SpeechError('permission-denied', 'Unable to request speech recognition permission.');
  }
}

export function startSpeechRecognition(): void {
  try {
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
    });
  } catch {
    throw new SpeechError('start-failed', 'Speech recognition could not be started.');
  }
}

export function stopSpeechRecognition(): void {
  try {
    ExpoSpeechRecognitionModule.stop();
  } catch {
    throw new SpeechError('stop-failed', 'Speech recognition could not be stopped.');
  }
}
