import { writeFile, readFile, unlink } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sh } from './shell.mjs';
import { OPENROUTER_API_KEY, OPENROUTER_HTTP_REFERER, OPENROUTER_X_TITLE } from './env.mjs';

const STATE_FILE = join(process.cwd(), 'logs', 'voice-state.json');

function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function saveState(patch = {}) {
  try {
    const dir = dirname(STATE_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const current = loadState();
    const merged = { ...current, ...patch };
    writeFileSync(STATE_FILE, JSON.stringify(merged, null, 2));
    return merged;
  } catch (e) {
    return null;
  }
}

export const TTS_MODEL = process.env.BUDDY_TTS_MODEL || 'openai/gpt-4o-mini-tts-2025-12-15';
export const STT_MODEL = process.env.BUDDY_STT_MODEL || 'openai/whisper-1';
export const STT_TIMEOUT = parseInt(process.env.BUDDY_STT_TIMEOUT_MS || '30000', 10);
export const SUPPORTED_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];

const _persisted = loadState();
let _selectedVoice = (_persisted.voice || process.env.BUDDY_TTS_VOICE || 'alloy').toLowerCase();
if (!SUPPORTED_VOICES.includes(_selectedVoice)) _selectedVoice = 'alloy';
let _voiceAuto = typeof _persisted.autoSpeak === 'boolean'
  ? _persisted.autoSpeak
  : String(process.env.BUDDY_VOICE_AUTO || 'false').toLowerCase() === 'true';
let _voiceLive = typeof _persisted.liveTranscript === 'boolean'
  ? _persisted.liveTranscript
  : String(process.env.BUDDY_STT_LIVE || 'false').toLowerCase() === 'true';

function safeText(s = '') {
  return String(s).replace(/"/g, '\\"');
}

export function setVoice(voice = 'alloy') {
  const v = String(voice).toLowerCase();
  if (!SUPPORTED_VOICES.includes(v)) {
    return { ok: false, error: `Unsupported voice '${voice}'`, supported: SUPPORTED_VOICES };
  }
  _selectedVoice = v;
  saveState({ voice: _selectedVoice });
  return { ok: true, voice: _selectedVoice, supported: SUPPORTED_VOICES };
}

export function getVoice() {
  return {
    ok: true,
    voice: _selectedVoice,
    supported: SUPPORTED_VOICES,
    model: TTS_MODEL,
    autoSpeak: _voiceAuto,
    liveTranscript: _voiceLive
  };
}

export function setVoiceAuto(enabled = false) {
  _voiceAuto = !!enabled;
  saveState({ autoSpeak: _voiceAuto });
  return { ok: true, autoSpeak: _voiceAuto };
}

export function getVoiceAuto() {
  return { ok: true, autoSpeak: _voiceAuto };
}

export function setVoiceLive(enabled = false) {
  _voiceLive = !!enabled;
  saveState({ liveTranscript: _voiceLive });
  return { ok: true, liveTranscript: _voiceLive };
}

export function getVoiceLive() {
  return { ok: true, liveTranscript: _voiceLive };
}

export async function speak(text, { voice } = {}) {
  if (!OPENROUTER_API_KEY) {
    return { ok: false, error: 'Missing OPENROUTER_API_KEY' };
  }

  const useVoice = (voice || _selectedVoice || 'alloy').toLowerCase();
  const chosen = SUPPORTED_VOICES.includes(useVoice) ? useVoice : 'alloy';

  // Create lockfile to prevent daemon from capturing TTS output
  const lockFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'logs', 'tts-speaking.lock');
  try { await writeFile(lockFile, String(Date.now())); } catch {}

  try {
    const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': OPENROUTER_HTTP_REFERER || 'http://localhost',
        'X-OpenRouter-Title': OPENROUTER_X_TITLE || 'Buddy',
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: String(text || ''),
        voice: chosen
      })
    });

    if (!response.ok) {
      throw new Error(`TTS error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const generationId = response.headers.get('X-Generation-Id') || '';
    const ct = (response.headers.get('content-type') || '').toLowerCase();
    const isPcm = ct.includes('audio/pcm');
    const isWav = ct.includes('wav');
    const ext = isWav ? 'wav' : (isPcm ? 'pcm' : 'mp3');
    const temp = `/tmp/buddy-tts-${Date.now()}.${ext}`;
    await writeFile(temp, Buffer.from(audioBuffer));

    let playable = temp;
    let converted = false;

    // Convert raw PCM to WAV when provider sends audio/pcm
    if (isPcm) {
      const wavOut = temp.replace(/\.pcm$/, '.wav');
      const conv = await sh(`command -v ffmpeg >/dev/null 2>&1 && ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${temp}" "${wavOut}" >/dev/null 2>&1`);
      if (conv.ok) {
        playable = wavOut;
        converted = true;
      } else {
        // Try afconvert fallback
        const conv2 = await sh(`command -v afconvert >/dev/null 2>&1 && afconvert -f WAVE -d LEI16 -r 24000 "${temp}" "${wavOut}" >/dev/null 2>&1`);
        if (conv2.ok) {
          playable = wavOut;
          converted = true;
        }
      }
    }

    // Playback with fallback order
    let play = await sh(`afplay "${playable}"`);
    if (!play.ok) {
      play = await sh(`command -v ffplay >/dev/null 2>&1 && ffplay -nodisp -autoexit -loglevel quiet "${playable}" || true`);
    }

    // Remove lockfile after playback completes
    try { await unlink(lockFile); } catch {}

    return {
      ok: true,
      provider: 'openrouter-tts',
      voice: chosen,
      model: TTS_MODEL,
      temp,
      playable,
      generationId,
      contentType: ct || null,
      converted,
      playbackOk: !!play.ok
    };
  } catch (e) {
    // Remove lockfile on error too
    try { await unlink(lockFile); } catch {}
    const fallback = await sh(`say -v Alex "${safeText(String(text || ''))}"`);
    return { ok: !!fallback.ok, provider: 'macos-say-fallback', error: e.message, stdout: fallback.stdout };
  }
}

export async function listen({ timeoutMs = STT_TIMEOUT, live = _voiceLive, durationSec = 5, audioDevice = process.env.BUDDY_MIC_DEVICE ?? '0' } = {}) {
  try {
    const hasFfmpeg = await sh('command -v ffmpeg >/dev/null 2>&1 && echo yes || echo no');
    const hasSox = await sh('command -v sox >/dev/null 2>&1 && echo yes || echo no');

    // Default recorder selection
    const useFfmpeg = (hasFfmpeg.stdout || '').trim() === 'yes';
    const useSox = !useFfmpeg && (hasSox.stdout || '').trim() === 'yes';
    if (!useFfmpeg && !useSox) {
      return {
        ok: false,
        error: 'No recorder found. Install ffmpeg or sox for mic capture.',
        hint: 'brew install ffmpeg'
      };
    }

    const outWav = '/tmp/buddy-stt.wav';
    const recCmd = useFfmpeg
      ? `ffmpeg -y -f avfoundation -i ":${audioDevice}" -t ${durationSec} -ac 1 -ar 16000 "${outWav}" 2>/tmp/buddy-stt.err`
      : `sox -d -c 1 -r 16000 "${outWav}" trim 0 ${durationSec} 2>/tmp/buddy-stt.err`;

    const recResult = await sh(recCmd, { timeoutMs });
    if (!recResult.ok) {
      let ffErr = '';
      try { ffErr = (await readFile('/tmp/buddy-stt.err', 'utf8')).slice(-500); } catch {}
      return {
        ok: false,
        error: 'Recording failed. Check mic permissions for Terminal/Node in System Settings → Privacy & Security → Microphone.',
        diagnostics: { exit: recResult.code, stderrTail: ffErr }
      };
    }

    // Verify the file exists and is non-trivial
    let fileSize = 0;
    try { fileSize = (await readFile(outWav)).length; } catch {}
    if (fileSize < 1024) {
      let ffErr = '';
      try { ffErr = (await readFile('/tmp/buddy-stt.err', 'utf8')).slice(-500); } catch {}
      return {
        ok: false,
        error: 'Recorded audio is empty or too small. Mic may be blocked or no input device.',
        diagnostics: { fileSize, stderrTail: ffErr }
      };
    }

    // Try OpenRouter transcription first (may be unreliable)
    if (OPENROUTER_API_KEY) {
      try {
        const transcribe = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': OPENROUTER_HTTP_REFERER || 'http://localhost',
            'X-OpenRouter-Title': OPENROUTER_X_TITLE || 'Buddy',
          },
          body: await (async () => {
            const f = new FormData();
            f.append('model', STT_MODEL);
            const wav = await readFile(outWav);
            f.append('file', new Blob([wav], { type: 'audio/wav' }), 'buddy-stt.wav');
            return f;
          })()
        });

        if (transcribe.ok) {
          const data = await transcribe.json();
          const text = data?.text || '';
          if (live && text) {
            process.stdout.write(`[live-transcript] ${text}\n`);
          }
          return { ok: true, provider: 'openrouter-stt', model: STT_MODEL, text, liveTranscript: !!live, fileSize };
        }
        // fall through to local whisper fallback
        var openrouterFailure = { status: transcribe.status, body: (await transcribe.text()).slice(0, 200) };
      } catch (e) {
        var openrouterFailure = { error: e.message };
      }
    }

    // Fallback 1: local whisper-cli or whisper-cpp (brew) binary
    let whisperBin = '';
    for (const cand of ['whisper-cli', 'whisper-cpp']) {
      const r = await sh(`command -v ${cand} >/dev/null 2>&1 && echo yes || echo no`);
      if ((r.stdout || '').trim() === 'yes') { whisperBin = cand; break; }
    }
    if (whisperBin) {
      const modelPath = process.env.BUDDY_WHISPER_MODEL || `${process.env.HOME}/.buddy/models/ggml-base.en.bin`;
      const modelExists = await sh(`[ -f "${modelPath}" ] && echo yes || echo no`);
      if ((modelExists.stdout || '').trim() === 'yes') {
        // Remove any previous txt output
        await sh('rm -f /tmp/buddy-stt.txt');
        const cppRun = await sh(`${whisperBin} -m "${modelPath}" -f "${outWav}" -otxt -of /tmp/buddy-stt -nt -l en 2>/tmp/buddy-whisper.err`);
        try {
          const txt = (await readFile('/tmp/buddy-stt.txt', 'utf8')).trim();
          if (txt) {
            if (live) process.stdout.write(`[live-transcript] ${txt}\n`);
            return { ok: true, provider: whisperBin, text: txt, liveTranscript: !!live, fileSize };
          }
        } catch {}
      } else {
        var whisperModelMissing = { hint: `Download a whisper model to ${modelPath}. E.g. curl -L -o ${modelPath} https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin` };
      }
    }

    // Fallback 2: python whisper
    const whisperCheck = await sh('command -v whisper >/dev/null 2>&1 && echo yes || echo no');
    if ((whisperCheck.stdout || '').trim() === 'yes') {
      const localRun = await sh(`whisper "${outWav}" --model base --language en --output_format txt --output_dir /tmp 2>/dev/null`);
      try {
        const txt = (await readFile('/tmp/buddy-stt.txt', 'utf8')).trim();
        if (txt) {
          if (live) process.stdout.write(`[live-transcript] ${txt}\n`);
          return { ok: true, provider: 'python-whisper', text: txt, liveTranscript: !!live, fileSize };
        }
      } catch {}
    }

    return {
      ok: false,
      error: 'Transcription failed. OpenRouter STT unavailable and no usable local whisper fallback.',
      diagnostics: {
        openrouter: typeof openrouterFailure !== 'undefined' ? openrouterFailure : 'not attempted',
        whisperModel: typeof whisperModelMissing !== 'undefined' ? whisperModelMissing : undefined,
        hint: 'brew install whisper-cpp && curl -L -o ~/.buddy/models/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin'
      },
      fileSize
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function voiceCommand(command = '') {
  const raw = String(command || '').trim();
  if (!raw) return { ok: false, error: 'Empty voice command' };

  if (raw === '/voice' || raw === '/voice help') {
    return {
      ok: true,
      usage: [
        '/voice list',
        '/voice set <name>',
        '/voice current',
        '/voice say <text>',
        '/voice listen',
        '/voice listen --live',
        '/voice auto on|off|status',
        '/voice live on|off|status'
      ],
      voices: SUPPORTED_VOICES,
      current: _selectedVoice
    };
  }
  if (raw === '/voice list') return { ok: true, voices: SUPPORTED_VOICES, current: _selectedVoice };
  if (raw === '/voice current') return getVoice();

  const setMatch = raw.match(/^\/voice\s+set\s+(.+)$/i);
  if (setMatch) return setVoice(setMatch[1].trim());

  const sayMatch = raw.match(/^\/voice\s+say\s+([\s\S]+)$/i);
  if (sayMatch) return speak(sayMatch[1].trim());

  if (raw === '/voice listen') return listen({ live: false });
  if (raw === '/voice listen --live') return listen({ live: true });

  const autoMatch = raw.match(/^\/voice\s+auto\s+(on|off|status)$/i);
  if (autoMatch) {
    const op = autoMatch[1].toLowerCase();
    if (op === 'status') return getVoiceAuto();
    return setVoiceAuto(op === 'on');
  }

  const liveMatch = raw.match(/^\/voice\s+live\s+(on|off|status)$/i);
  if (liveMatch) {
    const op = liveMatch[1].toLowerCase();
    if (op === 'status') return getVoiceLive();
    return setVoiceLive(op === 'on');
  }

  return { ok: false, error: 'Unknown /voice command', command: raw };
}

export async function voiceLoop({ model = 'openai/gpt-5-nano', maxTurns = 10 } = {}) {
  for (let turn = 0; turn < maxTurns; turn++) {
    const input = await listen();
    if (!input.ok || !input.text) continue;

    const chat = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': OPENROUTER_HTTP_REFERER || 'http://localhost',
        'X-OpenRouter-Title': OPENROUTER_X_TITLE || 'Buddy',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: input.text }],
        stream: false
      })
    });

    if (!chat.ok) continue;
    const data = await chat.json();
    const response = data?.choices?.[0]?.message?.content || '';
    if (response) await speak(response);
  }
  return { ok: true };
}

export default {
  speak,
  listen,
  voiceLoop,
  setVoice,
  getVoice,
  setVoiceAuto,
  getVoiceAuto,
  setVoiceLive,
  getVoiceLive,
  voiceCommand,
  SUPPORTED_VOICES
};
