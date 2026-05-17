import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Play, Square, Activity, Zap, Heart, Wind } from "lucide-react";

const DANCE_MOVES = [
  { name: "Gentle Sway", instruction: "Sway your body slowly left and right", color: "#818cf8", icon: Wind,
    body: { x: [-12, 0, 12, 0, -12] as number[], rotate: [-5, 0, 5, 0, -5] as number[] },
    leftArm: { rotate: [-20, -35, -20] as number[] }, rightArm: { rotate: [20, 35, 20] as number[] },
    leftLeg: { rotate: [-5, 5, -5] as number[] }, rightLeg: { rotate: [5, -5, 5] as number[] },
    bodyDuration: 2, limbDuration: 2 },
  { name: "Wave Arms", instruction: "Raise both arms and wave them overhead", color: "#34d399", icon: Zap,
    body: { x: [0, -4, 0, 4, 0] as number[], rotate: [0, 0, 0, 0, 0] as number[] },
    leftArm: { rotate: [-40, -140, -40] as number[] }, rightArm: { rotate: [40, 140, 40] as number[] },
    leftLeg: { rotate: [-8, 8, -8] as number[] }, rightLeg: { rotate: [8, -8, 8] as number[] },
    bodyDuration: 1.2, limbDuration: 0.9 },
  { name: "Step & Clap", instruction: "Step side to side and clap your hands", color: "#f59e0b", icon: Activity,
    body: { x: [-20, 0, 20, 0, -20] as number[], rotate: [0, 0, 0, 0, 0] as number[] },
    leftArm: { rotate: [30, -30, 30] as number[] }, rightArm: { rotate: [-30, 30, -30] as number[] },
    leftLeg: { rotate: [-35, 0, -35] as number[] }, rightLeg: { rotate: [0, 35, 0] as number[] },
    bodyDuration: 0.9, limbDuration: 0.9 },
  { name: "Jump & Joy", instruction: "Jump gently or tap your feet rapidly", color: "#f472b6", icon: Heart,
    body: { x: [0, 0, 0, 0, 0] as number[], rotate: [0, 0, 0, 0, 0] as number[] },
    leftArm: { rotate: [-70, -120, -70] as number[] }, rightArm: { rotate: [70, 120, 70] as number[] },
    leftLeg: { rotate: [20, 50, 20] as number[] }, rightLeg: { rotate: [-20, -50, -20] as number[] },
    bodyDuration: 0.5, limbDuration: 0.5 },
];

function DancingCharacter({ moveIndex, color }: { moveIndex: number; color: string }) {
  const move = DANCE_MOVES[moveIndex];
  const dur = move.bodyDuration;
  const lDur = move.limbDuration;
  return (
    <svg viewBox="0 0 120 220" className="w-36 h-52" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="bodyGrad2" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#312e81" />
        </radialGradient>
        <radialGradient id="headGrad2" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </radialGradient>
        <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <motion.circle cx="60" cy="110" r="50"
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
        fill={color} style={{ originX: "60px", originY: "110px" }} />
      <motion.g animate={{ x: move.body.x, rotate: move.body.rotate }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "60px", originY: "110px" }}>
        <motion.g animate={{ rotate: move.leftArm.rotate }}
          transition={{ duration: lDur, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "44px", originY: "75px" }}>
          <line x1="44" y1="75" x2="16" y2="108" stroke={color} strokeWidth="9" strokeLinecap="round" filter="url(#glow2)" />
          <circle cx="14" cy="111" r="6" fill={color} filter="url(#glow2)" />
        </motion.g>
        <motion.g animate={{ rotate: move.rightArm.rotate }}
          transition={{ duration: lDur, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          style={{ originX: "76px", originY: "75px" }}>
          <line x1="76" y1="75" x2="104" y2="108" stroke={color} strokeWidth="9" strokeLinecap="round" filter="url(#glow2)" />
          <circle cx="106" cy="111" r="6" fill={color} filter="url(#glow2)" />
        </motion.g>
        <rect x="40" y="58" width="40" height="60" rx="14" fill="url(#bodyGrad2)" filter="url(#glow2)" />
        <rect x="40" y="100" width="40" height="5" rx="2" fill={color} opacity="0.4" />
        <circle cx="60" cy="36" r="24" fill="url(#headGrad2)" filter="url(#glow2)" />
        <motion.g animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }} style={{ originY: "33px" }}>
          <circle cx="52" cy="33" r="5" fill="#1e1b4b" />
          <circle cx="68" cy="33" r="5" fill="#1e1b4b" />
          <circle cx="54" cy="31" r="1.5" fill="white" opacity="0.8" />
          <circle cx="70" cy="31" r="1.5" fill="white" opacity="0.8" />
        </motion.g>
        <path d="M 50 42 Q 60 50 70 42" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <motion.g animate={{ rotate: move.leftLeg.rotate }}
          transition={{ duration: lDur, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "52px", originY: "118px" }}>
          <line x1="52" y1="118" x2="40" y2="175" stroke="#4338ca" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="38" cy="179" rx="12" ry="7" fill="#312e81" />
        </motion.g>
        <motion.g animate={{ rotate: move.rightLeg.rotate }}
          transition={{ duration: lDur, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          style={{ originX: "68px", originY: "118px" }}>
          <line x1="68" y1="118" x2="80" y2="175" stroke="#4338ca" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="82" cy="179" rx="12" ry="7" fill="#312e81" />
        </motion.g>
      </motion.g>
      {[0,1,2,3].map((i) => (
        <motion.circle key={i} cx={20+i*26} cy={10+(i%2)*20} r="3" fill={color}
          animate={{ opacity: [0,1,0], scale: [0,1.5,0], y: [0,-20,-40] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i*0.4, ease: "easeOut" }} />
      ))}
    </svg>
  );
}

function MovementMeter({ score }: { score: number }) {
  const level = score < 0.08 ? "Low" : score < 0.2 ? "Moderate" : "High";
  const color = score < 0.08 ? "#818cf8" : score < 0.2 ? "#f59e0b" : "#34d399";
  const pct = Math.min(100, score * 400);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span>Movement</span>
        <span style={{ color }} className="font-semibold">{level}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #6366f1, ${color})` }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} />
      </div>
    </div>
  );
}

export default function Dance() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [moveIndex, setMoveIndex] = useState(0);
  const [moveTimer, setMoveTimer] = useState(8);
  const [movementScore, setMovementScore] = useState(0);
  const [totalMoveScore, setTotalMoveScore] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [healthInsight, setHealthInsight] = useState("");
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const motionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOn(false);
    prevFrameRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setIsCameraOn(true);
    } catch { setCameraError(true); }
  }, []);

  const detectMovement = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (prevFrameRef.current) {
      let changed = 0;
      const prev = prevFrameRef.current.data, curr = frame.data;
      for (let i = 0; i < curr.length; i += 16) {
        if (Math.abs(curr[i]-prev[i]) + Math.abs(curr[i+1]-prev[i+1]) + Math.abs(curr[i+2]-prev[i+2]) > 40) changed++;
      }
      const score = changed / (canvas.width * canvas.height / 4);
      setMovementScore((p) => p * 0.7 + score * 0.3);
      setTotalMoveScore((p) => p + score);
    }
    prevFrameRef.current = frame;
  }, [isCameraOn]);

  const getHealthInsight = useCallback((avg: number, secs: number) => {
    if (secs < 10) return "Warming up — keep moving!";
    if (avg < 0.05) return "Try following the character — any movement helps your mood.";
    if (avg < 0.15) return "Good! Gentle movement releases serotonin and reduces stress.";
    if (avg < 0.3) return "Excellent movement! Your heart rate is rising — great for wellness.";
    return "Outstanding! You are in full dance therapy mode. Your body is healing.";
  }, []);

  useEffect(() => {
    if (!isSessionActive) return;
    moveTimerRef.current = setInterval(() => {
      setMoveTimer((t) => { if (t <= 1) { setMoveIndex((m) => (m+1)%DANCE_MOVES.length); return 8; } return t-1; });
    }, 1000);
    sessionTimerRef.current = setInterval(() => {
      setSessionSeconds((s) => {
        const next = s+1;
        setTotalMoveScore((total) => { setHealthInsight(getHealthInsight(total/Math.max(next,1), next)); return total; });
        return next;
      });
    }, 1000);
    motionTimerRef.current = setInterval(detectMovement, 200);
    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (motionTimerRef.current) clearInterval(motionTimerRef.current);
    };
  }, [isSessionActive, detectMovement, getHealthInsight]);

  const startSession = async () => {
    await startCamera();
    setIsSessionActive(true);
    setSessionSeconds(0); setTotalMoveScore(0); setMoveIndex(0); setMoveTimer(8);
    setHealthInsight("Warming up — keep moving!");
  };

  const stopSession = () => {
    setIsSessionActive(false); stopCamera();
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    if (motionTimerRef.current) clearInterval(motionTimerRef.current);
  };

  const currentMove = DANCE_MOVES[moveIndex];
  const MoveIcon = currentMove.icon;
  const avgScore = totalMoveScore / Math.max(sessionSeconds, 1);
  const wellnessScore = Math.min(100, Math.round(avgScore * 500 + sessionSeconds / 3));
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="min-h-[100dvh] px-4 pt-12 pb-28 space-y-4 overflow-y-auto">
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <h1 className="text-2xl font-semibold text-white drop-shadow-md">Dance Therapy</h1>
        <p className="text-white/60 text-sm mt-0.5">Move your body, heal your mind</p>
      </motion.div>

      {/* Character + Camera */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="flex gap-3">
        <div className="flex-1 glass-strong rounded-3xl flex flex-col items-center justify-center py-5 relative overflow-hidden">
          <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{ opacity:[0.05,0.14,0.05] }} transition={{ duration:2, repeat:Infinity }}
            style={{ background:`radial-gradient(circle at 50% 60%, ${currentMove.color}, transparent 70%)` }} />
          <DancingCharacter moveIndex={moveIndex} color={currentMove.color} />
          <AnimatePresence mode="wait">
            <motion.div key={moveIndex} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="text-center mt-1 relative z-10">
              <div className="flex items-center justify-center gap-1.5">
                <MoveIcon className="w-3.5 h-3.5" style={{ color:currentMove.color }} />
                <span className="text-xs font-semibold" style={{ color:currentMove.color }}>{currentMove.name}</span>
              </div>
              <p className="text-[10px] text-white/50 mt-0.5 px-3">{currentMove.instruction}</p>
            </motion.div>
          </AnimatePresence>
          {isSessionActive && (
            <div className="mt-2 flex items-center gap-1">
              {Array.from({length:8}).map((_,i) => (
                <div key={i} className="w-1 h-1 rounded-full" style={{ background: i < 9-moveTimer ? currentMove.color : "rgba(255,255,255,0.15)" }} />
              ))}
              <span className="text-[10px] text-white/40 ml-1">{moveTimer}s</span>
            </div>
          )}
        </div>

        <div className="w-[130px] glass-strong rounded-3xl overflow-hidden flex flex-col items-center justify-center relative">
          {isCameraOn ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline style={{ transform:"scaleX(-1)" }} />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              {cameraError ? <><CameraOff className="w-7 h-7 text-white/40" /><span className="text-[10px] text-white/40">Unavailable</span></> 
                : <><Camera className="w-7 h-7 text-white/40" /><span className="text-[10px] text-white/40">Camera starts with session</span></>}
            </div>
          )}
          <canvas ref={canvasRef} width={80} height={60} className="hidden" />
        </div>
      </motion.div>

      {/* Health metrics */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="glass-strong rounded-2xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white">Health Metrics</span>
          {isSessionActive && <span className="text-xs font-mono text-teal-300">{fmt(sessionSeconds)}</span>}
        </div>
        <MovementMeter score={movementScore} />
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: wellnessScore, label: "Wellness", color: "text-teal-300" },
            { value: movementScore < 0.08 ? "Low" : movementScore < 0.2 ? "Med" : "High", label: "Energy", color: `text-[${currentMove.color}]` },
            { value: `${movementScore < 0.08 ? 60 : movementScore < 0.2 ? 80 : 100}+`, label: "BPM est.", color: "text-pink-300" },
          ].map(({ value, label, color }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <div className={`text-xl font-bold text-white ${color}`}>{value}</div>
              <div className="text-[10px] text-white/50">{label}</div>
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {healthInsight ? (
            <motion.div key={healthInsight} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="bg-teal-400/10 border border-teal-400/20 rounded-xl p-3">
              <p className="text-xs text-teal-200 leading-relaxed">{healthInsight}</p>
            </motion.div>
          ) : (
            <p className="text-xs text-white/40 text-center">Start a session to see your health assessment.</p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Start/Stop */}
      <motion.button
        data-testid="button-dance-session"
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        onClick={isSessionActive ? stopSession : startSession}
        className="w-full h-14 rounded-2xl text-base font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2"
        style={{ background: isSessionActive ? "linear-gradient(135deg,#dc2626,#9f1239)" : `linear-gradient(135deg,#4338ca,${currentMove.color})` }}
      >
        {isSessionActive ? <><Square className="w-5 h-5" /> Stop Session</> : <><Play className="w-5 h-5" /> Start Dance Session</>}
      </motion.button>

      <p className="text-center text-[11px] text-white/40 pb-2">Dance therapy reduces cortisol and boosts endorphins.</p>
    </div>
  );
}
