// Voice → text for the AI agronom: receives a short audio clip and returns its
// transcription via Groq Whisper (large-v3), which handles Uzbek and Russian.
// Lets farmers who don't type comfortably just speak their question.
//
// The client POSTs the raw audio bytes; ?lang=uz|ru hints the language.
import { cors } from './_ai.mjs';
import { rateLimit } from './_ratelimit.mjs';

const GROQ_URL = (process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1') + '/audio/transcriptions';
const WHISPER_MODEL = process.env.AI_WHISPER_MODEL || 'whisper-large-v3';

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { headers: cors });

  // Paid upstream call — cap how fast one caller can spend it.
  const limited = rateLimit(req, { perMinute: 12, cors });
  if (limited) return limited;
  const key = process.env.AI_API_KEY;
  if (!key) return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503, headers: cors });

  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get('lang') === 'ru' ? 'ru' : 'uz';
    const type = req.headers.get('content-type') || 'audio/webm';
    const bytes = await req.arrayBuffer();
    if (bytes.byteLength < 500) return new Response(JSON.stringify({ text: '' }), { headers: cors });
    if (bytes.byteLength > 8_000_000) {
      return new Response(JSON.stringify({ error: 'too_large' }), { status: 413, headers: cors });
    }

    const ext = type.includes('ogg') ? 'ogg' : type.includes('mp4') || type.includes('mpeg') ? 'm4a' : 'webm';
    const form = new FormData();
    form.append('file', new Blob([bytes], { type }), `audio.${ext}`);
    form.append('model', WHISPER_MODEL);
    form.append('language', lang);
    form.append('response_format', 'json');
    // Nudge Whisper toward farming vocabulary so crop/pest terms transcribe well.
    form.append('prompt', lang === 'ru'
      ? 'Вопрос фермера об орошении, поливе, удобрениях, болезнях и вредителях культур.'
      : 'Dehqonning sug‘orish, o‘g‘it, kasallik va zararkunandalar haqidagi savoli.');

    const res = await fetch(GROQ_URL, { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `stt_${res.status}` }), { status: 502, headers: cors });
    }
    const json = await res.json();
    return new Response(JSON.stringify({ text: (json.text || '').trim() }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: cors });
  }
};
