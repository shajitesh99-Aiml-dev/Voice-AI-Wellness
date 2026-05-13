import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Square } from "lucide-react";
import { Orb } from "@/components/orb";
import { useMindfulStore, Message } from "@/hooks/use-mindful-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import roomBg from "@assets/WhatsApp_Image_2026-05-13_at_10.22.39_AM_1778647975654.jpeg";

const MOCK_PHRASES = [
  "I'm feeling a strong craving right now",
  "I had a tough day but I didn't give in",
  "I feel so lonely and lost",
  "I'm anxious about staying clean",
  "I actually feel proud of myself today",
  "I need someone to talk to",
];

function getAiResponse(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("craving")) return "Try urge surfing: observe the craving like a wave. It will peak and pass in 10-20 minutes. You don't have to act on it.";
  if (lowerText.includes("proud")) return "That is worth celebrating. You chose yourself today. Your streak grows stronger with every moment like this.";
  if (lowerText.includes("anxious")) return "Let's breathe together. Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times. You are safe right now.";
  if (lowerText.includes("alone") || lowerText.includes("lonely") || lowerText.includes("lost")) return "You are not alone. Right now, in this moment, I'm here with you. You reached out — that took courage.";
  if (lowerText.includes("trigger")) return "Let's look at this pattern. What were you doing or feeling just before? Naming it takes away some of its power.";
  if (lowerText.includes("tough") || lowerText.includes("didn't give in")) return "That was a real test, and you passed it. Every hard day you get through builds an armor no one can take from you.";
  return "I hear you. Thank you for sharing that with me. How are you feeling right now, in this moment?";
}

export default function Home() {
  const { messages, addMessage, incrementVoiceUse } = useMindfulStore();
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRecording]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), text, sender: "user", timestamp: Date.now() };
    addMessage(userMsg);
    setInputValue("");
    
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: getAiResponse(text), sender: "ai", timestamp: Date.now() };
      addMessage(aiMsg);
    }, 1000);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    setIsRecording(true);
    incrementVoiceUse();
    
    setTimeout(() => {
      if (isRecording) return; // if user cancelled
      setIsRecording(false);
      const randomPhrase = MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
      handleSend(randomPhrase);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-[100dvh] relative">
      <div 
        className="absolute top-0 left-0 right-0 h-[40vh] opacity-10 bg-cover bg-center pointer-events-none mix-blend-screen mask-image-gradient"
        style={{ 
          backgroundImage: `url(${roomBg})`,
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      />
      
      <div className="pt-12 pb-6 flex flex-col items-center justify-center relative z-10">
        <Orb isRecording={isRecording} />
        <Button 
          size="icon" 
          variant="ghost" 
          className="mt-6 rounded-full w-14 h-14 bg-background/50 backdrop-blur-md border border-white/10 shadow-lg"
          onClick={toggleRecording}
        >
          {isRecording ? <Square className="w-5 h-5 text-destructive fill-destructive" /> : <Mic className="w-6 h-6 text-foreground" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10 opacity-60">
            <p>I am here to listen.</p>
            <p className="text-sm mt-2">Speak your mind or type below.</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 shrink-0 border border-primary/30 text-primary font-serif italic text-sm">
                  M
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.sender === "user" 
                  ? "bg-gradient-to-br from-primary/80 to-primary/40 text-white rounded-br-sm backdrop-blur-md border border-primary/20" 
                  : "bg-card/60 backdrop-blur-xl border border-white/5 rounded-tl-sm text-foreground shadow-sm"
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isRecording && (
             <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9 }}
             className="flex justify-end"
           >
             <div className="px-4 py-3 rounded-2xl max-w-[80%] bg-white/10 backdrop-blur-md rounded-br-sm border border-white/5 flex gap-1 items-center h-[46px]">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "300ms" }} />
             </div>
           </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="flex items-center gap-2 max-w-[430px] mx-auto"
        >
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="bg-card/80 backdrop-blur-lg border-white/10 rounded-full px-5 h-12 focus-visible:ring-primary/50"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim()}
            className="rounded-full w-12 h-12 shrink-0 bg-primary/80 hover:bg-primary text-white shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
