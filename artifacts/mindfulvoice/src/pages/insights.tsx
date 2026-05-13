import { useMindfulStore } from "@/hooks/use-mindful-store";
import { Flame, MessageCircle, Heart, Star, Award, Zap, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Insights() {
  const { streak, messages, voiceUseCount } = useMindfulStore();
  
  const totalConversations = messages.filter(m => m.sender === "user").length;
  
  // Calculate wellness score
  const positiveKeywords = ["proud", "tough", "didn't give in", "good", "great", "better"];
  const neutralKeywords = ["craving", "anxious", "lonely", "lost", "need", "alone"];
  
  let posCount = 0;
  messages.filter(m => m.sender === "user").forEach(m => {
    const text = m.text.toLowerCase();
    if (positiveKeywords.some(k => text.includes(k))) posCount++;
  });
  
  const wellnessScore = totalConversations === 0 ? 50 : Math.min(100, Math.max(10, Math.round((posCount / totalConversations) * 100) + 40));

  // Determine themes
  const textBlob = messages.filter(m => m.sender === "user").map(m => m.text.toLowerCase()).join(" ");
  const themes = [];
  if (textBlob.includes("craving")) themes.push("Cravings");
  if (textBlob.includes("anxious") || textBlob.includes("anxiety")) themes.push("Anxiety");
  if (textBlob.includes("proud") || textBlob.includes("good")) themes.push("Progress");
  if (textBlob.includes("lonely") || textBlob.includes("alone") || textBlob.includes("lost")) themes.push("Loneliness");
  if (textBlob.includes("tough") || textBlob.includes("didn't give in")) themes.push("Resilience");
  
  if (themes.length === 0) themes.push("Exploration");

  const commonTheme = themes[0];
  let insightTip = "Consistency is the foundation of change. Keep showing up.";
  if (commonTheme === "Cravings") insightTip = "Notice your cravings like waves. They rise, but they also fall. You are the ocean, not the wave.";
  if (commonTheme === "Anxiety") insightTip = "Your breath is an anchor. When your mind races, return to the simple act of breathing in and out.";
  if (commonTheme === "Loneliness") insightTip = "Reaching out takes immense courage. Even in solitude, you are connected to everyone walking this path.";
  if (commonTheme === "Resilience") insightTip = "Your strength is inspiring. You've proven that you can withstand the storm.";

  const achievements = [
    { title: "First Step", desc: "First conversation", icon: Star, unlocked: totalConversations > 0 },
    { title: "Week Warrior", desc: "7-day streak", icon: Flame, unlocked: streak >= 7 },
    { title: "Voice of Courage", desc: "Used voice 5 times", icon: MicIcon, unlocked: voiceUseCount >= 5 },
    { title: "Resilient", desc: "Showed strength", icon: Shield, unlocked: textBlob.includes("tough") || textBlob.includes("didn't give in") },
    { title: "Proud Moment", desc: "Celebrated yourself", icon: Award, unlocked: textBlob.includes("proud") },
  ];

  return (
    <div className="flex flex-col h-full px-5 pt-12 pb-28 space-y-6 overflow-y-auto">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your Journey</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border-white/5 p-5 flex flex-col items-center justify-center gap-2 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-accent" />
          </div>
          <div className="text-3xl font-bold">{streak}</div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Day Streak</div>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border-white/5 p-5 flex flex-col items-center justify-center gap-2 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="text-3xl font-bold">{totalConversations}</div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sessions</div>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-white/5 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Wellness Balance</h2>
          <span className="text-xl font-bold text-primary">{wellnessScore}</span>
        </div>
        <Progress value={wellnessScore} className="h-2 bg-white/5" />
        <p className="text-sm text-muted-foreground mt-4">
          Based on the sentiment and resilience shown in your conversations.
        </p>
      </Card>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">Detected Themes</h2>
        <div className="flex flex-wrap gap-2">
          {themes.map(t => (
            <span key={t} className="px-3 py-1.5 rounded-full bg-secondary/50 border border-secondary/30 text-sm text-secondary-foreground backdrop-blur-sm">
              {t}
            </span>
          ))}
        </div>
      </div>

      <Card className="bg-primary/10 border-primary/20 p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Insight
        </h2>
        <p className="text-foreground leading-relaxed relative z-10">{insightTip}</p>
      </Card>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">Milestones</h2>
        <div className="space-y-3">
          {achievements.map(a => (
            <div key={a.title} className={`flex items-center gap-4 p-4 rounded-xl border ${a.unlocked ? 'bg-card/60 border-white/10' : 'bg-card/20 border-white/5 opacity-50'} backdrop-blur-sm transition-all`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.unlocked ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                <a.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{a.title}</h3>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Just a wrapper to keep icon imports clean above
function MicIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
}
