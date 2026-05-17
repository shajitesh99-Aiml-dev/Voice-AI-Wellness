import { useMindfulStore } from "@/hooks/use-mindful-store";
import { Flame, MessageCircle, Star, Award, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  );
}

export default function Insights() {
  const { streak, messages, voiceUseCount } = useMindfulStore();
  const userMessages = messages.filter((m) => m.sender === "user");
  const totalConversations = userMessages.length;

  const positiveKeywords = ["proud", "tough", "didn't give in", "good", "great", "better"];
  let posCount = 0;
  userMessages.forEach((m) => {
    if (positiveKeywords.some((k) => m.text.toLowerCase().includes(k))) posCount++;
  });
  const wellnessScore = totalConversations === 0 ? 50 : Math.min(100, Math.max(10, Math.round((posCount / totalConversations) * 100) + 40));

  const textBlob = userMessages.map((m) => m.text.toLowerCase()).join(" ");
  const themes: string[] = [];
  if (textBlob.includes("craving")) themes.push("Cravings");
  if (textBlob.includes("anxious") || textBlob.includes("anxiety")) themes.push("Anxiety");
  if (textBlob.includes("proud") || textBlob.includes("good")) themes.push("Progress");
  if (textBlob.includes("lonely") || textBlob.includes("alone") || textBlob.includes("lost")) themes.push("Loneliness");
  if (textBlob.includes("tough") || textBlob.includes("didn't give in")) themes.push("Resilience");
  if (themes.length === 0) themes.push("Exploration");

  const commonTheme = themes[0];
  const insightMap: Record<string, string> = {
    Cravings: "Notice your cravings like waves. They rise, but they also fall. You are the ocean, not the wave.",
    Anxiety: "Your breath is an anchor. When your mind races, return to the simple act of breathing in and out.",
    Loneliness: "Reaching out takes immense courage. Even in solitude, you are connected to everyone walking this path.",
    Resilience: "Your strength is inspiring. You've proven that you can withstand the storm.",
  };
  const insightTip = insightMap[commonTheme] ?? "Consistency is the foundation of change. Keep showing up.";

  const achievements = [
    { title: "First Step", desc: "First conversation", Icon: Star, unlocked: totalConversations > 0 },
    { title: "Week Warrior", desc: "7-day streak", Icon: Flame, unlocked: streak >= 7 },
    { title: "Voice of Courage", desc: "Used voice 5 times", Icon: MicIcon, unlocked: voiceUseCount >= 5 },
    { title: "Resilient", desc: "Showed strength", Icon: Shield, unlocked: textBlob.includes("tough") || textBlob.includes("didn't give in") },
    { title: "Proud Moment", desc: "Celebrated yourself", Icon: Award, unlocked: textBlob.includes("proud") },
  ];

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div className="min-h-[100dvh] px-5 pt-12 pb-28 space-y-5 overflow-y-auto">
      <motion.h1 {...fadeUp(0)} className="text-2xl font-semibold text-white drop-shadow-md">
        Your Journey
      </motion.h1>

      {/* Streak + Sessions */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 gap-3">
        {[
          { icon: Flame, value: streak, label: "Day Streak", color: "text-amber-300" },
          { icon: MessageCircle, value: totalConversations, label: "Sessions", color: "text-teal-300" },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="glass-strong rounded-2xl p-5 flex flex-col items-center gap-2">
            <Icon className={`w-6 h-6 ${color}`} />
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Wellness score */}
      <motion.div {...fadeUp(0.1)} className="glass-strong rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Wellness Balance</span>
          <span className="text-xl font-bold text-teal-300">{wellnessScore}</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-300"
            initial={{ width: 0 }}
            animate={{ width: `${wellnessScore}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-xs text-white/50 mt-3 leading-relaxed">
          Based on the sentiment and resilience shown in your conversations.
        </p>
      </motion.div>

      {/* Themes */}
      <motion.div {...fadeUp(0.15)}>
        <p className="text-xs text-white/60 uppercase tracking-wider font-medium mb-3">Detected Themes</p>
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full glass text-white/80 text-sm">
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Insight card */}
      <motion.div {...fadeUp(0.2)} className="glass-strong rounded-2xl p-5 border border-teal-400/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
        <p className="text-xs text-teal-300 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Insight
        </p>
        <p className="text-white/90 text-sm leading-relaxed relative z-10">{insightTip}</p>
      </motion.div>

      {/* Achievements */}
      <motion.div {...fadeUp(0.25)}>
        <p className="text-xs text-white/60 uppercase tracking-wider font-medium mb-3">Milestones</p>
        <div className="space-y-2.5">
          {achievements.map(({ title, desc, Icon, unlocked }) => (
            <div
              key={title}
              className={`flex items-center gap-4 p-4 rounded-2xl glass transition-all ${
                unlocked ? "border border-white/20" : "opacity-40"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                unlocked ? "bg-amber-400/20 text-amber-300" : "bg-white/10 text-white/40"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">{title}</p>
                <p className="text-xs text-white/50">{desc}</p>
              </div>
              {unlocked && <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
