const mockModule = {
  requestPermissionsAsync: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
};

jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: mockModule,
  useSpeechRecognitionEvent: jest.fn(),
}));

import {
  requestSpeechPermission,
  SpeechError,
  startSpeechRecognition,
  stopSpeechRecognition,
} from '../src/services/speech';

describe('speech service', () => {
  beforeEach(() => jest.resetAllMocks());

  it('allows speech when permission is granted', async () => {
    mockModule.requestPermissionsAsync.mockResolvedValue({ granted: true });
    await expect(requestSpeechPermission()).resolves.toBe(true);
  });

  it('surfaces denied permission', async () => {
    mockModule.requestPermissionsAsync.mockResolvedValue({ granted: false });
    await expect(requestSpeechPermission()).rejects.toMatchObject({
      code: 'permission-denied',
    } satisfies Partial<SpeechError>);
  });

  it('surfaces permission API failures', async () => {
    mockModule.requestPermissionsAsync.mockRejectedValue(new Error('native failure'));
    await expect(requestSpeechPermission()).rejects.toMatchObject({
      code: 'permission-denied',
    });
  });

  it('surfaces start and stop failures', () => {
    mockModule.start.mockImplementation(() => {
      throw new Error('start failed');
    });
    expect(() => startSpeechRecognition()).toThrow(SpeechError);

    mockModule.stop.mockImplementation(() => {
      throw new Error('stop failed');
    });
    expect(() => stopSpeechRecognition()).toThrow(SpeechError);
  });

  it('passes the expected recognition configuration', () => {
    startSpeechRecognition();
    expect(mockModule.start).toHaveBeenCalledWith({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
    });
  });
});
