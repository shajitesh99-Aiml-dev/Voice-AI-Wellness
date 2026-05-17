import { Router } from "express";

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE = "https://api.groq.com/openai/v1";

const LANG_CODE_TO_NAME: Record<string, string> = {
  hi: "Hindi", ta: "Tamil", te: "Telugu", kn: "Kannada",
  ml: "Malayalam", bn: "Bengali", gu: "Gujarati", mr: "Marathi",
  pa: "Punjabi", ur: "Urdu", en: "English", fr: "French",
  de: "German", es: "Spanish", pt: "Portuguese", ar: "Arabic",
  zh: "Chinese", ja: "Japanese", ko: "Korean", ru: "Russian",
  it: "Italian", tr: "Turkish", nl: "Dutch", pl: "Polish",
};

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
    const ext = mimeType.includes("mp4") ? "audio.mp4" : mimeType.includes("ogg") ? "audio.ogg" : "audio.webm";
    const blob = new Blob([buffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", blob, ext);
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "verbose_json");
    // No language hint — let Whisper auto-detect for best multilingual accuracy

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
      segments?: Array<{ text: string; language?: string }>;
    };

    // Whisper returns full language names like "hindi", "tamil", etc.
    // Map them back to ISO codes for consistency
    const rawLang = (data.language ?? "en").toLowerCase().trim();
    const FULL_NAME_TO_CODE: Record<string, string> = {
      hindi: "hi", tamil: "ta", telugu: "te", kannada: "kn",
      malayalam: "ml", bengali: "bn", gujarati: "gu", marathi: "mr",
      punjabi: "pa", urdu: "ur", english: "en", french: "fr",
      german: "de", spanish: "es", portuguese: "pt", arabic: "ar",
      chinese: "zh", japanese: "ja", korean: "ko", russian: "ru",
      italian: "it", turkish: "tr", dutch: "nl", polish: "pl",
    };
    const langCode = FULL_NAME_TO_CODE[rawLang] ?? rawLang;

    res.json({ text: data.text, language: langCode });
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

  const langName = LANG_CODE_TO_NAME[language] ?? language;
  const isIndian = ["hi","ta","te","kn","ml","bn","gu","mr","pa","ur"].includes(language);

  const langInstruction = language === "en"
    ? `Reply in English only.`
    : `MANDATORY LANGUAGE RULE: The user spoke in ${langName} (language code: "${language}"). 
You MUST write your entire response in ${langName} script/characters. 
- If ${langName} is Hindi: use Devanagari script (हिन्दी में लिखें)
- If ${langName} is Tamil: use Tamil script (தமிழில் எழுதுங்கள்)
- If ${langName} is Telugu: use Telugu script (తెలుగులో రాయండి)
- If ${langName} is Kannada: use Kannada script (ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ)
- If ${langName} is Malayalam: use Malayalam script (മലയാളത്തിൽ എഴുതുക)
- If ${langName} is Bengali: use Bengali script (বাংলায় লিখুন)
- If ${langName} is Gujarati: use Gujarati script (ગુજરાતીમાં લખો)
- If ${langName} is Marathi: use Devanagari script (मराठीत लिहा)
- If ${langName} is Punjabi: use Gurmukhi script (ਪੰਜਾਬੀ ਵਿੱਚ ਲਿਖੋ)
- If ${langName} is Urdu: use Nastaliq/Arabic script (اردو میں لکھیں)
Never mix English into your response. Every single word must be in ${langName}.`;

  const systemPrompt = `You are MindfulVoice — a warm, compassionate AI wellness companion for drug awareness and mental health support${isIndian ? " in India" : ""}. You listen deeply and respond with empathy.

${langInstruction}

Keep responses to 2–3 short, warm sentences. Never be clinical. Be like a caring friend.

Response guidelines by topic:
- Cravings → urge surfing: observe it like a wave — it peaks and passes in 10–20 minutes
- Pride/progress → celebrate warmly and sincerely
- Anxiety → gentle box breathing: inhale 4, hold 4, exhale 4, hold 4
- Loneliness/feeling lost → warm reassurance, you are not alone
- Anger/frustration → acknowledge and ground them
- Asking for help → validate courage, offer the next small step
- General → empathetic reflection, ask one gentle follow-up question`;

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
        max_tokens: 250,
        temperature: 0.72,
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
