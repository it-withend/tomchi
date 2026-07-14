import { useCallback, useRef, useState } from 'react';
import type { Lang } from '../i18n';
import { transcribe } from './ai';

export type VoiceStatus = 'idle' | 'listening' | 'working';

function pickMime(): string {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  const MR = typeof MediaRecorder !== 'undefined' ? MediaRecorder : undefined;
  return (MR && types.find((t) => MR.isTypeSupported(t))) || '';
}

/** Record a spoken question, transcribe it (Whisper), hand back the text. */
export function useVoiceInput(lang: Lang, onText: (text: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const supported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

  const stop = useCallback(() => {
    recRef.current?.state === 'recording' && recRef.current.stop();
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        if (blob.size < 800) { setStatus('idle'); return; } // too short to be speech
        setStatus('working');
        try {
          const text = await transcribe(blob, lang);
          if (text) onText(text); else setError('empty');
        } catch {
          setError('stt');
        } finally {
          setStatus('idle');
        }
      };
      recRef.current = rec;
      rec.start();
      setStatus('listening');
    } catch {
      setError('denied');
      setStatus('idle');
    }
  }, [lang, onText]);

  const toggle = useCallback(() => {
    if (status === 'listening') stop();
    else if (status === 'idle') void start();
  }, [status, start, stop]);

  return { status, error, supported, toggle, clearError: () => setError(null) };
}

// ---- Text-to-speech (best effort): read an answer aloud for farmers who ----
// prefer listening. Uzbek voices are rare in browsers; we fall back gracefully.
let speaking = false;

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, lang: Lang): void {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const want = lang === 'ru' ? 'ru' : 'uz';
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang?.toLowerCase().startsWith(want))
    ?? (lang === 'uz' ? voices.find((x) => x.lang?.toLowerCase().startsWith('tr')) : undefined); // Turkish ≈ Uzbek phonetics
  if (v) u.voice = v;
  u.lang = v?.lang ?? (lang === 'ru' ? 'ru-RU' : 'uz-UZ');
  u.rate = 0.95;
  u.onend = () => { speaking = false; };
  speaking = true;
  window.speechSynthesis.speak(u);
}

export function stopSpeak(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
  speaking = false;
}

export function isSpeaking(): boolean {
  return speaking;
}
