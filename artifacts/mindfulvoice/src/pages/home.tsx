import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Square, Globe, Loader2, Music2, VolumeX } from "lucide-react";
import { useMindfulStore, Message } from "@/hooks/use-mindful-store";
import { useAmbientMusic } from "@/hooks/use-ambient-music";

// ─── Language tables ──────────────────────────────────────────────────────────
const LANG_BCP47: Record<string, string> = {
  hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN",
  ml: "ml-IN", bn: "bn-IN", gu: "gu-IN", mr: "mr-IN",
  pa: "pa-IN", ur: "ur-PK", en: "en-US", fr: "fr-FR",
  de: "de-DE", es: "es-ES", pt: "pt-BR", ar: "ar-SA",
  zh: "zh-CN", ja: "ja-JP", ko: "ko-KR",
};

const LANG_NAMES: Record<string, string> = {
  hi: "Hindi", ta: "Tamil", te: "Telugu", kn: "Kannada",
  ml: "Malayalam", bn: "Bengali", gu: "Gujarati", mr: "Marathi",
  pa: "Punjabi", ur: "Urdu", en: "English", fr: "French",
  de: "German", es: "Spanish", pt: "Portuguese", ar: "Arabic",
  zh: "Chinese", ja: "Japanese", ko: "Korean",
};

const FALLBACK_PHRASES = [
  "I'm feeling a strong craving right now",
  "I had a tough day but I didn't give in",
  "I feel so lonely and lost",
  "I'm anxious about staying clean",
  "I actually feel proud of myself today",
  "I need someone to talk to",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFallbackResponse(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("craving")) return "Try urge surfing: observe the craving like a wave. It will peak and pass in 10–20 minutes. You don't have to act on it.";
  if (t.includes("proud")) return "That is worth celebrating. You chose yourself today. Your streak grows stronger with every moment like this.";
  if (t.includes("anxious") || t.includes("anxiety")) return "Let's breathe together. Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times. You are safe right now.";
  if (t.includes("alone") || t.includes("lonely") || t.includes("lost")) return "You are not alone. Right now, in this moment, I'm here with you. You reached out — that took courage.";
  if (t.includes("trigger")) return "Let's look at this pattern. What were you doing or feeling just before? Naming it takes away some of its power.";
  if (t.includes("tough") || t.includes("didn't give in")) return "That was a real test, and you passed it. Every hard day you get through builds an armor no one can take from you.";
  return "I hear you. Thank you for sharing that with me. How are you feeling right now, in this moment?";
}

function speakText(text: string, langCode: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const bcp47 = LANG_BCP47[langCode] ?? "en-US";
  utterance.lang = bcp47;
  utterance.rate = 0.9;
  utterance.pitch = 1.08;

  // Try to find a matching voice for the language
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.startsWith(bcp47.split("-")[0]))
    ?? voices.find((v) => v.lang === bcp47);
  if (match) utterance.voice = match;

  window.speechSynthesis.speak(utterance);
}

async function transcribeAudio(audioBase64: string, mimeType: string): Promise<{ text: string; language: string }> {
  const res = await fetch("/api/groq/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  if (!res.ok) throw new Error("Transcription failed");
  return res.json();
}

async function getGroqResponse(message: string, language: string): Promise<string> {
  const res = await fetch("/api/groq/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
  });
  if (!res.ok) throw new Error("Chat failed");
  const data = await res.json() as { response: string };
  return data.response;
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { messages, addMessage, incrementVoiceUse } = useMindfulStore();
  const { isPlaying: isMusicPlaying, toggle: toggleMusic } = useAmbientMusic();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [detectedLang, setDetectedLang] = useState("en");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Load voices on mount
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", () => window.speechSynthesis.getVoices());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = async (text: string, lang = detectedLang) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text, sender: "user", timestamp: Date.now() };
    addMessage(userMsg);
    setInputValue("");
    setIsProcessing(true);
    try {
      const response = await getGroqResponse(text, lang);
      addMessage({ id: (Date.now() + 1).toString(), text: response, sender: "ai", timestamp: Date.now() });
      speakText(response, lang);
    } catch {
      const fallback = getFallbackResponse(text);
      addMessage({ id: (Date.now() + 1).toString(), text: fallback, sender: "ai", timestamp: Date.now() });
      speakText(fallback, "en");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(",")[1];
            const { text, language } = await transcribeAudio(base64, mimeType);
            if (text?.trim()) {
              setDetectedLang(language);
              await handleSend(text, language);
            }
          } catch {
            await handleSend(FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)], "en");
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      setIsRecording(true);
      incrementVoiceUse();
      recorder.start(100); // collect chunks every 100ms
      // Auto-stop after 15s
      setTimeout(() => {
        if (recorder.state === "recording") { recorder.stop(); setIsRecording(false); }
      }, 15000);
    } catch {
      // Fallback demo mode
      setIsRecording(true);
      incrementVoiceUse();
      setTimeout(async () => {
        setIsRecording(false);
        await handleSend(FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)], "en");
      }, 2500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 py-8">
      {/* Music toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleMusic}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl glass transition-all text-xs font-medium ${
            isMusicPlaying ? "text-teal-300 border border-teal-400/30 bg-teal-400/10" : "text-white/50"
          }`}
        >
          {isMusicPlaying ? <Music2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          {isMusicPlaying ? "Music on" : "Music"}
        </button>
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h1 className="text-white text-2xl font-semibold tracking-tight drop-shadow-lg">
          How are you feeling today?
        </h1>
        {detectedLang !== "en" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white/80 text-xs"
          >
            <Globe className="w-3 h-3" />
            {LANG_NAMES[detectedLang] ?? detectedLang} detected
          </motion.div>
        )}
      </motion.div>

      {/* Glass panel */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full glass-strong rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.28)" }}
      >
        {/* Chat history */}
        {messages.length > 0 && (
          <div ref={scrollRef} className="max-h-64 overflow-y-auto px-5 pt-5 pb-3 space-y-3">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center mr-2 shrink-0 border border-white/30 text-white font-serif italic text-xs">
                      M
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[78%] text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-white/25 text-white rounded-br-sm"
                        : "bg-white/10 text-white/90 rounded-tl-sm border border-white/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center mr-2 border border-white/30 text-white font-serif italic text-xs shrink-0">
                    M
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/10 flex gap-1 items-center">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {messages.length === 0 && !isProcessing && (
          <div className="px-5 pt-5 pb-2">
            <p className="text-white/40 text-sm text-center">
              {isRecording ? "Listening..." : "Speak or type in any language"}
            </p>
          </div>
        )}

        {messages.length > 0 && <div className="h-px bg-white/10 mx-4" />}

        {/* Input */}
        <div className="p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            className="glass-input rounded-2xl flex items-center gap-2 px-4 py-3"
          >
            <input
              data-testid="input-message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="I'm feeling a bit overwhelmed..."
              disabled={isProcessing}
              className="flex-1 bg-transparent text-white placeholder:text-white/45 text-sm outline-none min-w-0"
            />
            <button
              data-testid="button-mic-toggle"
              type="button"
              disabled={isProcessing}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                isRecording
                  ? "bg-red-400/80 shadow-[0_0_14px_rgba(248,113,113,0.6)]"
                  : "bg-white/20 hover:bg-white/30 border border-white/25"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : isRecording ? (
                <Square className="w-3.5 h-3.5 text-white fill-white" />
              ) : (
                <Mic className="w-4 h-4 text-white" />
              )}
            </button>
          </form>

          {/* Reflect button */}
          <div className="flex justify-end mt-3">
            <button
              data-testid="button-send"
              type="button"
              disabled={!inputValue.trim() || isProcessing}
              onClick={() => handleSend(inputValue)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-input text-white/80 text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reflect
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2"
        >
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-red-400 rounded-full"
                animate={{ height: [6, 18, 6] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
              />
            ))}
          </div>
          <p className="text-white/70 text-xs">Listening... tap mic to stop</p>
        </motion.div>
      )}
    </div>
  );
}
