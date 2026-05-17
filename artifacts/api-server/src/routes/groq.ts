import { Router } from "express";

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE = "https://api.groq.com/openai/v1";

router.post("/groq/transcribe", async (req, res) => {
  if (!GROQ_API_KEY) {
    res.status(500).json({ error: "GROQ_API_KEY not configured" });
    return;
  }

  const { audioBase64, mimeType = "audio/webm" } = req.body as {
    audioBase64: string;
    mimeType?: string;
  };

  if (!audioBase64) {
    res.status(400).json({ error: "audioBase64 is required" });
    return;
  }

  try {
    const buffer = Buffer.from(audioBase64, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "verbose_json");

    const response = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ err }, "Groq transcription error");
      res.status(500).json({ error: "Transcription failed" });
      return;
    }

    const data = (await response.json()) as {
      text: string;
      language?: string;
    };
    res.json({ text: data.text, language: data.language ?? "en" });
  } catch (err) {
    req.log.error({ err }, "Transcription error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/groq/chat", async (req, res) => {
  if (!GROQ_API_KEY) {
    res.status(500).json({ error: "GROQ_API_KEY not configured" });
    return;
  }

  const { message, language = "en" } = req.body as {
    message: string;
    language?: string;
  };

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const langInstruction =
    language !== "en"
      ? `CRITICAL: The user spoke in language code "${language}". You MUST reply in that exact language. If "${language}" is "hi", reply in Hindi. If "ta", reply in Tamil. If "te", reply in Telugu. If "kn", reply in Kannada. If "ml", reply in Malayalam. Match the user's language exactly — do not switch to English.`
      : "Reply in English.";

  const systemPrompt = `You are MindfulVoice, a compassionate AI wellness companion for drug awareness and mental health support in India. You speak with warmth, empathy, and deep understanding. ${langInstruction}

Keep responses brief (2–3 sentences). Be emotionally supportive and non-judgmental.
- Cravings → urge surfing: observe it like a wave, it passes in 10-20 minutes
- Pride/progress → celebrate warmly
- Anxiety → box breathing: inhale 4, hold 4, exhale 4, hold 4
- Loneliness → warm reassurance, remind they are not alone
- Trigger → help identify patterns
- General → empathetic listening`;

  try {
    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ err }, "Groq chat error");
      res.status(500).json({ error: "Chat failed" });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    res.json({ response: data.choices[0]?.message?.content ?? "" });
  } catch (err) {
    req.log.error({ err }, "Chat error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
