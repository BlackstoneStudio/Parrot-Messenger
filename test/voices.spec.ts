import { voices } from '../src/constants/voices';

describe('voices', () => {
  it('should export a voices object', () => {
    expect(voices).toBeDefined();
    expect(typeof voices).toBe('object');
  });

  it('should contain voice entries with correct structure', () => {
    const voiceKeys = Object.keys(voices);
    expect(voiceKeys.length).toBeGreaterThan(0);

    voiceKeys.forEach((key) => {
      expect(voices[key]).toHaveProperty('voice');
      expect(voices[key]).toHaveProperty('language');
      expect(typeof voices[key].voice).toBe('string');
      expect(typeof voices[key].language).toBe('string');
    });
  });

  it('should contain specific voices', () => {
    expect(voices).toHaveProperty('Salli');
    expect(voices.Salli).toEqual({
      voice: 'Salli',
      language: 'English (US) (en-US)',
    });

    expect(voices).toHaveProperty('Amy');
    expect(voices.Amy).toEqual({
      voice: 'Amy',
      language: 'English (British) (en-GB)',
    });

    expect(voices).toHaveProperty('Mizuki');
    expect(voices.Mizuki).toEqual({
      voice: 'Mizuki',
      language: 'Japanese (ja-JP)',
    });
  });

  it('should contain all expected languages', () => {
    const languages = Object.values(voices).map((v) => v.language);

    expect(languages).toContain('English (US) (en-US)');
    expect(languages).toContain('Spanish (Castilian) (es-ES)');
    expect(languages).toContain('French (fr-FR)');
    expect(languages).toContain('German (de-DE)');
    expect(languages).toContain('Italian (it-IT)');
    expect(languages).toContain('Japanese (ja-JP)');
    expect(languages).toContain('Chinese (Mandarin) (zh-CN)');
  });
});
