import { useState, useEffect } from "react";
import { PhoneCall, HeartHandshake, Wind, Waves, Activity, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Help() {
  const [breathingState, setBreathingState] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    if (!isBreathing) return;

    let timeout: NodeJS.Timeout;
    
    if (breathingState === "inhale") {
      timeout = setTimeout(() => setBreathingState("hold1"), 4000);
    } else if (breathingState === "hold1") {
      timeout = setTimeout(() => setBreathingState("exhale"), 4000);
    } else if (breathingState === "exhale") {
      timeout = setTimeout(() => setBreathingState("hold2"), 4000);
    } else if (breathingState === "hold2") {
      timeout = setTimeout(() => setBreathingState("inhale"), 4000);
    }

    return () => clearTimeout(timeout);
  }, [breathingState, isBreathing]);

  return (
    <div className="flex flex-col h-full px-5 pt-12 pb-28 space-y-8 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Crisis & Grounding</h1>
        <p className="text-muted-foreground text-sm">You don't have to carry this alone. Resources to help anchor you in the present.</p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Emergency Helplines
        </h2>
        <div className="space-y-3">
          <a href="tel:988" className="block">
            <Card className="bg-destructive/10 border-destructive/20 p-4 flex items-center justify-between hover:bg-destructive/20 transition-colors">
              <div>
                <h3 className="font-semibold text-destructive-foreground">National Suicide Prevention</h3>
                <p className="text-xs text-destructive-foreground/80 mt-1">Dial 988</p>
              </div>
              <PhoneCall className="w-5 h-5 text-destructive" />
            </Card>
          </a>
          <a href="sms:741741" className="block">
            <Card className="bg-card/60 backdrop-blur border-white/5 p-4 flex items-center justify-between hover:bg-card/80 transition-colors">
              <div>
                <h3 className="font-semibold text-foreground">Crisis Text Line</h3>
                <p className="text-xs text-muted-foreground mt-1">Text HOME to 741741</p>
              </div>
              <HeartHandshake className="w-5 h-5 text-primary" />
            </Card>
          </a>
          <a href="tel:1-800-662-4357" className="block">
            <Card className="bg-card/60 backdrop-blur border-white/5 p-4 flex items-center justify-between hover:bg-card/80 transition-colors">
              <div>
                <h3 className="font-semibold text-foreground">SAMHSA Helpline</h3>
                <p className="text-xs text-muted-foreground mt-1">1-800-662-4357</p>
              </div>
              <PhoneCall className="w-5 h-5 text-primary" />
            </Card>
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Wind className="w-4 h-4" /> Grounding Exercises
        </h2>
        
        <Card className="bg-card/40 backdrop-blur border-white/5 overflow-hidden mb-4">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-medium text-foreground mb-1">Box Breathing</h3>
            <p className="text-sm text-muted-foreground mb-4">Calm your nervous system with measured breaths.</p>
            
            <div className="flex flex-col items-center py-6">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <div 
                  className={`absolute inset-0 rounded-2xl border-2 transition-all duration-[4000ms] ease-linear ${
                    !isBreathing ? 'border-primary/20 scale-100' :
                    breathingState === 'inhale' ? 'border-primary bg-primary/10 scale-150' :
                    breathingState === 'hold1' ? 'border-primary bg-primary/20 scale-150' :
                    breathingState === 'exhale' ? 'border-primary/50 bg-primary/5 scale-100' :
                    'border-primary/30 bg-transparent scale-100'
                  }`}
                />
                <span className="relative z-10 text-sm font-medium tracking-widest text-primary uppercase">
                  {!isBreathing ? "Ready" : breathingState}
                </span>
              </div>
              
              <Button 
                variant={isBreathing ? "outline" : "default"} 
                className={isBreathing ? "border-white/10" : "bg-primary text-white"}
                onClick={() => {
                  setIsBreathing(!isBreathing);
                  if (!isBreathing) setBreathingState("inhale");
                }}
              >
                {isBreathing ? "Stop" : "Start Exercise"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-white/5 p-5 mb-4">
          <h3 className="font-medium text-foreground mb-1">5-4-3-2-1 Technique</h3>
          <p className="text-sm text-muted-foreground mb-4">A sensory exercise to pull you back to reality.</p>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li className="flex gap-3"><span className="font-bold text-primary">5</span> things you can see</li>
            <li className="flex gap-3"><span className="font-bold text-primary">4</span> things you can physically feel</li>
            <li className="flex gap-3"><span className="font-bold text-primary">3</span> things you can hear</li>
            <li className="flex gap-3"><span className="font-bold text-primary">2</span> things you can smell</li>
            <li className="flex gap-3"><span className="font-bold text-primary">1</span> thing you can taste</li>
          </ul>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-white/5 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Waves className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-foreground">Urge Surfing</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Cravings are like ocean waves. They build, peak, and eventually crash. You don't have to fight the wave; you just have to ride it out. Notice the physical sensations in your body. Give it 15 minutes.</p>
        </Card>
      </section>
    </div>
  );
}
