import { useState, useEffect } from "react";
import { PhoneCall, HeartHandshake, Wind, Waves, Activity } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function Help() {
  const [breathingState, setBreathingState] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    if (!isBreathing) return;
    const durations: Record<string, number> = { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000 };
    const next: Record<string, "inhale" | "hold1" | "exhale" | "hold2"> = {
      inhale: "hold1", hold1: "exhale", exhale: "hold2", hold2: "inhale",
    };
    const t = setTimeout(() => setBreathingState(next[breathingState]), durations[breathingState]);
    return () => clearTimeout(t);
  }, [breathingState, isBreathing]);

  const breathLabel = { inhale: "Inhale", hold1: "Hold", exhale: "Exhale", hold2: "Hold" };
  const breathScale = { inhale: 1.5, hold1: 1.5, exhale: 1, hold2: 1 };

  return (
    <div className="min-h-[100dvh] px-5 pt-12 pb-28 space-y-6 overflow-y-auto">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-semibold text-white drop-shadow-md mb-1">Crisis & Grounding</h1>
        <p className="text-white/60 text-sm">You don't have to carry this alone.</p>
      </motion.div>

      {/* Emergency helplines */}
      <motion.section {...fadeUp(0.05)}>
        <p className="text-xs text-red-300 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" /> Emergency Helplines
        </p>
        <div className="space-y-2.5">
          {[
            { title: "National Suicide Prevention", sub: "Dial 988", href: "tel:988", icon: PhoneCall, accent: true },
            { title: "Crisis Text Line", sub: "Text HOME to 741741", href: "sms:741741", icon: HeartHandshake, accent: false },
            { title: "SAMHSA Helpline", sub: "1-800-662-4357", href: "tel:1-800-662-4357", icon: PhoneCall, accent: false },
          ].map(({ title, sub, href, icon: Icon, accent }) => (
            <a key={title} href={href}>
              <div className={`flex items-center justify-between p-4 rounded-2xl glass hover:bg-white/20 transition-all ${
                accent ? "border border-red-400/30 bg-red-400/5" : "border border-white/15"
              }`}>
                <div>
                  <p className={`font-semibold text-sm ${accent ? "text-red-200" : "text-white"}`}>{title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{sub}</p>
                </div>
                <Icon className={`w-5 h-5 ${accent ? "text-red-300" : "text-teal-300"}`} />
              </div>
            </a>
          ))}
        </div>
      </motion.section>

      {/* Box breathing */}
      <motion.section {...fadeUp(0.1)}>
        <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
          <Wind className="w-3.5 h-3.5" /> Grounding Exercises
        </p>

        <div className="glass-strong rounded-2xl p-5 mb-3">
          <h3 className="font-medium text-white mb-1">Box Breathing</h3>
          <p className="text-sm text-white/60 mb-5">Calm your nervous system with measured breaths.</p>

          <div className="flex flex-col items-center py-4">
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-teal-400/40 bg-teal-400/5"
                animate={{
                  scale: isBreathing ? breathScale[breathingState] : 1,
                  borderColor: isBreathing ? "rgba(52,211,153,0.7)" : "rgba(52,211,153,0.2)",
                  backgroundColor: isBreathing && (breathingState === "hold1" || breathingState === "inhale")
                    ? "rgba(52,211,153,0.12)"
                    : "rgba(52,211,153,0.03)",
                }}
                transition={{ duration: 4, ease: "linear" }}
              />
              <span className="relative z-10 text-sm font-semibold text-white/90 tracking-widest uppercase">
                {isBreathing ? breathLabel[breathingState] : "Ready"}
              </span>
            </div>

            <button
              onClick={() => { setIsBreathing(!isBreathing); if (!isBreathing) setBreathingState("inhale"); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isBreathing
                  ? "glass text-white/80 hover:bg-white/20"
                  : "bg-teal-500/80 text-white hover:bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
              }`}
            >
              {isBreathing ? "Stop" : "Start Exercise"}
            </button>
          </div>
        </div>

        {/* 5-4-3-2-1 */}
        <div className="glass-strong rounded-2xl p-5 mb-3">
          <h3 className="font-medium text-white mb-1">5-4-3-2-1 Technique</h3>
          <p className="text-sm text-white/60 mb-4">A sensory exercise to pull you back to reality.</p>
          <ul className="space-y-2.5">
            {[["5", "things you can see"], ["4", "things you can physically feel"], ["3", "things you can hear"], ["2", "things you can smell"], ["1", "thing you can taste"]].map(([n, label]) => (
              <li key={n} className="flex gap-3 items-start">
                <span className="font-bold text-teal-300 text-base w-4 shrink-0">{n}</span>
                <span className="text-white/75 text-sm leading-snug">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Urge surfing */}
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-5 h-5 text-teal-300" />
            <h3 className="font-medium text-white">Urge Surfing</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Cravings are like ocean waves. They build, peak, and eventually crash. You don't have to fight the wave — you just have to ride it out. Notice the physical sensations in your body. Give it 15 minutes.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
