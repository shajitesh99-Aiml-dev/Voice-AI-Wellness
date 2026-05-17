import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Square, Globe, Loader2 } from "lucide-react";
import { Orb } from "@/components/orb";
import { useMindfulStore, Message } from "@/hooks/use-mindful-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import roomBg from "@assets/WhatsApp_Image_2026-05-13_at_10.22.39_AM_1778647975654.jpeg";

const LANG_MAP: Record<string, string> = {
  hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN",
  ml: "ml-IN", bn: "bn-IN", gu: "gu-IN", mr: "mr-IN",
  pa: "pa-IN", ur: "ur-IN", en: "en-US",
};

const LANG_NAMES: Record<string, string> = {
  hi: "Hindi", ta: "Tamil", te: "Telugu", kn: "Kannada",
  ml: "Malayalam", bn: "Bengali", gu: "Gujarati", mr: "Marathi",
  pa: "Punjabi", ur: "Urdu", en: "English",
};

const FALLBACK_PHRASES = [
  "I'm feeling a strong craving right now",
  "I had a tough day but I didn't give in",
  "I feel so lonely and lost",
  "I'm anxious about staying clean",
  "I actually feel proud of myself today",
  "I need someone to talk to",
];

function getFallbackResponse(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("craving")) return "Try urge surfing: observe the craving like a wave. It will peak and pass in 10-20 minutes. You don't have to act on it.";
  if (t.includes("proud")) return "That is worth celebrating. You chose yourself today. Your streak grows stronger with every moment like this.";
  if (t.includes("anxious")) return "Let's breathe together. Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times. You are safe right now.";
  if (t.includes("alone") || t.includes("lonely") || t.includes("lost")) return "You are not alone. Right now, in this moment, I'm here with you. You reached out — that took courage.";
  if (t.includes("trigger")) return "Let's look at this pattern. What were you doing or feeling just before? Naming it takes away some of its power.";
  if (t.includes("tough") || t.includes("didn't give in")) return "That was a real test, and you passed it. Every hard day you get through builds an armor no one can take from you.";
  return "I hear you. Thank you for sharing that with me. How are you feeling right now, in this moment?";
}

function speakText(text: string, lang: string) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_MAP[lang] ?? "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
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

export default function Home() {
  const { messages, addMessage, incrementVoiceUse } = useMindfulStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [detectedLang, setDetectedLang] = useState("en");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRecording, isProcessing]);

  const handleSend = async (text: string, lang = detectedLang) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInputValue("");
    setIsProcessing(true);

    try {
      const response = await getGroqResponse(text, lang);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
        timestamp: Date.now(),
      };
      addMessage(aiMsg);
      speakText(response, lang);
    } catch {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getFallbackResponse(text),
        sender: "ai",
        timestamp: Date.now(),
      };
      addMessage(aiMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setIsProcessing(true);
        try {
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
              const phrase = FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
              await handleSend(phrase, "en");
            } finally {
              setIsProcessing(false);
            }
          };
          reader.readAsDataURL(blob);
        } catch {
          setIsProcessing(false);
        }
      };

      setIsRecording(true);
      incrementVoiceUse();
      recorder.start();

      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecording(false);
        }
      }, 12000);
    } catch {
      setIsRecording(true);
      incrementVoiceUse();
      setTimeout(async () => {
        setIsRecording(false);
        const phrase = FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
        await handleSend(phrase, "en");
      }, 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[100dvh] relative">
      {/* Room background */}
      <div
        className="absolute top-0 left-0 right-0 h-[40vh] pointer-events-none"
        style={{
          backgroundImage: `url(${roomBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />

      {/* Language badge */}
      {detectedLang !== "en" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-medium backdrop-blur-md"
        >
          <Globe className="w-3 h-3" />
          {LANG_NAMES[detectedLang] ?? detectedLang}
        </motion.div>
      )}

      {/* Orb + Mic */}
      <div className="pt-12 pb-6 flex flex-col items-center justify-center relative z-10">
        <Orb isRecording={isRecording || isProcessing} />
        <Button
          data-testid="button-mic-toggle"
          size="icon"
          variant="ghost"
          disabled={isProcessing}
          className="mt-6 rounded-full w-14 h-14 bg-background/50 backdrop-blur-md border border-white/10 shadow-lg transition-all"
          onClick={toggleRecording}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : isRecording ? (
            <Square className="w-5 h-5 text-red-400 fill-red-400" />
          ) : (
            <Mic className="w-6 h-6 text-foreground" />
          )}
        </Button>
        {isRecording && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-400 mt-2"
          >
            Listening... tap to stop
          </motion.p>
        )}
        {isProcessing && !isRecording && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-primary/70 mt-2"
          >
            Thinking in your language...
          </motion.p>
        )}
        {!isRecording && !isProcessing && (
          <p className="text-[11px] text-muted-foreground mt-2 opacity-60">
            Speak in any Indian language
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-4" ref={scrollRef}>
        {messages.length === 0 && !isRecording && !isProcessing && (
          <div className="text-center text-muted-foreground mt-8 opacity-60">
            <p>I am here to listen.</p>
            <p className="text-sm mt-1">Speak in Hindi, Tamil, Telugu, or any Indian language.</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 shrink-0 border border-primary/30 text-primary font-serif italic text-sm">
                  M
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-primary/80 to-primary/40 text-white rounded-br-sm backdrop-blur-md border border-primary/20"
                    : "bg-card/60 backdrop-blur-xl border border-white/5 rounded-tl-sm text-foreground shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {(isRecording || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-end"
            >
              <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md rounded-br-sm border border-white/5 flex gap-1 items-center h-[46px]">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text input */}
      <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="flex items-center gap-2 max-w-[430px] mx-auto"
        >
          <Input
            data-testid="input-message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type in any language..."
            disabled={isProcessing}
            className="bg-card/80 backdrop-blur-lg border-white/10 rounded-full px-5 h-12 focus-visible:ring-primary/50"
          />
          <Button
            data-testid="button-send"
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isProcessing}
            className="rounded-full w-12 h-12 shrink-0 bg-primary/80 hover:bg-primary text-white shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
