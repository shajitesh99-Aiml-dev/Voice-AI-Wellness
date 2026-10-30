import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Play, Square, Activity, Zap, Heart, Wind, Music2, VolumeX } from "lucide-react";
import { useAmbientMusic } from "@/hooks/use-ambient-music";

// ─── Dance move definitions ──────────────────────────────────────────────────
interface DanceMove {
  name: string;
  instruction: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  expression: "calm" | "joy" | "happy";
  body: { x: number[]; y: number[]; rotate: number[] };
  leftArm: { rotate: number[] };
  rightArm: { rotate: number[] };
  leftElbow: { rotate: number[] };
  rightElbow: { rotate: number[] };
  leftThigh: { rotate: number[] };
  rightThigh: { rotate: number[] };
  leftKnee: { rotate: number[] };
  rightKnee: { rotate: number[] };
  head: { rotate: number[]; y: number[] };
  bodyDuration: number;
  limbDuration: number;
}

const DANCE_MOVES: DanceMove[] = [
  {
    name: "Gentle Sway", instruction: "Sway slowly left and right", color: "#818cf8",
    icon: Wind, expression: "calm",
    body: { x: [-10, 0, 10, 0, -10], y: [0, -2, 0, -2, 0], rotate: [-3, 0, 3, 0, -3] },
    leftArm: { rotate: [-15, -28, -15] }, rightArm: { rotate: [15, 28, 15] },
    leftElbow: { rotate: [-12, -22, -12] }, rightElbow: { rotate: [12, 22, 12] },
    leftThigh: { rotate: [-6, 6, -6] }, rightThigh: { rotate: [6, -6, 6] },
    leftKnee: { rotate: [4, 14, 4] }, rightKnee: { rotate: [4, 14, 4] },
    head: { rotate: [3, 0, -3, 0, 3], y: [0, -1, 0, -1, 0] },
    bodyDuration: 2, limbDuration: 2,
  },
  {
    name: "Wave Arms", instruction: "Raise both arms and wave overhead", color: "#34d399",
    icon: Zap, expression: "joy",
    body: { x: [-4, 0, 4, 0, -4], y: [-6, 0, -6, 0, -6], rotate: [0, 0, 0, 0, 0] },
    leftArm: { rotate: [-30, -145, -30] }, rightArm: { rotate: [30, 145, 30] },
    leftElbow: { rotate: [-20, -45, -20] }, rightElbow: { rotate: [20, 45, 20] },
    leftThigh: { rotate: [-8, 8, -8] }, rightThigh: { rotate: [8, -8, 8] },
    leftKnee: { rotate: [10, 22, 10] }, rightKnee: { rotate: [10, 22, 10] },
    head: { rotate: [0, -6, 0, 6, 0], y: [-4, 0, -4] },
    bodyDuration: 1.2, limbDuration: 0.9,
  },
  {
    name: "Step & Clap", instruction: "Step side to side and clap", color: "#f59e0b",
    icon: Activity, expression: "happy",
    body: { x: [-18, 0, 18, 0, -18], y: [0, -4, 0, -4, 0], rotate: [0, 0, 0, 0, 0] },
    leftArm: { rotate: [38, -38, 38] }, rightArm: { rotate: [-38, 38, -38] },
    leftElbow: { rotate: [-50, -12, -50] }, rightElbow: { rotate: [50, 12, 50] },
    leftThigh: { rotate: [-32, 0, -32] }, rightThigh: { rotate: [0, 32, 0] },
    leftKnee: { rotate: [28, 5, 28] }, rightKnee: { rotate: [5, 28, 5] },
    head: { rotate: [-6, 0, 6, 0, -6], y: [0, -2, 0, -2, 0] },
    bodyDuration: 0.9, limbDuration: 0.85,
  },
  {
    name: "Jump & Joy", instruction: "Jump gently or tap your feet fast", color: "#f472b6",
    icon: Heart, expression: "joy",
    body: { x: [0, 0, 0, 0, 0], y: [-12, 0, -12, 0, -12], rotate: [-3, 0, 3, 0, -3] },
    leftArm: { rotate: [-85, -115, -85] }, rightArm: { rotate: [85, 115, 85] },
    leftElbow: { rotate: [-28, -12, -28] }, rightElbow: { rotate: [28, 12, 28] },
    leftThigh: { rotate: [22, 48, 22] }, rightThigh: { rotate: [-22, -48, -22] },
    leftKnee: { rotate: [32, 65, 32] }, rightKnee: { rotate: [32, 65, 32] },
    head: { rotate: [0, -9, 0, 9, 0], y: [-6, 0, -6] },
    bodyDuration: 0.5, limbDuration: 0.45,
  },
];

// ─── Human-like dancing character ────────────────────────────────────────────
function HumanDancer({ moveIndex }: { moveIndex: number }) {
  const move = DANCE_MOVES[moveIndex];
  const dur = move.bodyDuration;
  const lDur = move.limbDuration;
  const C = move.color;
  const SKIN = "#E8B49A";
  const SKIN_DARK = "#C9936E";
  const HAIR = "#1A0E08";
  const SHIRT = move.color;
  const PANTS = "#1e3a5f";
  const SHOE = "#1a1208";
  const SHIRT_DARK = move.color + "CC";

  const smilePath = move.expression === "joy"
    ? "M52 40 Q60 46.5 68 40"
    : "M53 40 Q60 44 67 40";

  const trans = (d: number, del = 0) => ({
    duration: d, repeat: Infinity, ease: "easeInOut" as const, delay: del,
  });

  return (
    <svg viewBox="0 0 120 220" className="w-40 h-56" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`aura-${moveIndex}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C} stopOpacity="0.35" />
          <stop offset="100%" stopColor={C} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="headGrad" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#F0C4A5" />
          <stop offset="100%" stopColor={SKIN} />
        </radialGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hairShad" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={HAIR} floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Floor shadow */}
      <motion.g
        animate={{ scaleX: [1, 0.78, 1], opacity: [0.22, 0.12, 0.22] }}
        transition={trans(dur)}
        style={{ originX: "60px", originY: "208px" }}
      >
        <ellipse cx="60" cy="208" rx="28" ry="6" fill="rgba(0,0,0,0.22)" />
      </motion.g>

      {/* Aura */}
      <motion.g
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.85, 0.5] }}
        transition={trans(dur)}
        style={{ originX: "60px", originY: "115px" }}
      >
        <ellipse cx="60" cy="115" rx="48" ry="58" fill={`url(#aura-${moveIndex})`} />
      </motion.g>

      {/* ── WHOLE BODY GROUP ── */}
      <motion.g
        animate={{ x: move.body.x, y: move.body.y, rotate: move.body.rotate }}
        transition={trans(dur)}
        style={{ originX: "60px", originY: "130px" }}
      >
        {/* === RIGHT LEG (back) === */}
        <motion.g
          animate={{ rotate: move.rightThigh.rotate }}
          transition={trans(lDur, 0.1)}
          style={{ originX: "64px", originY: "122px" }}
        >
          {/* Right thigh */}
          <rect x="57" y="122" width="14" height="34" rx="7" fill={PANTS} />
          {/* Right calf */}
          <motion.g
            animate={{ rotate: move.rightKnee.rotate }}
            transition={trans(lDur, 0.05)}
            style={{ originX: "64px", originY: "156px" }}
          >
            <rect x="58" y="156" width="12" height="30" rx="6" fill={PANTS} />
            {/* Sock */}
            <rect x="58" y="180" width="12" height="8" rx="3" fill="#dde5f0" />
            {/* Right shoe */}
            <ellipse cx="64" cy="188" rx="11" ry="5" fill={SHOE} />
            <rect x="53" y="184" width="22" height="8" rx="3" fill={SHOE} />
            <rect x="53" y="183" width="22" height="4" rx="2" fill="#2a2010" />
          </motion.g>
        </motion.g>

        {/* === LEFT LEG (front) === */}
        <motion.g
          animate={{ rotate: move.leftThigh.rotate }}
          transition={trans(lDur)}
          style={{ originX: "56px", originY: "122px" }}
        >
          {/* Left thigh */}
          <rect x="49" y="122" width="14" height="34" rx="7" fill={PANTS} />
          {/* Seam detail */}
          <rect x="55.5" y="124" width="1.5" height="30" rx="0.75" fill="rgba(255,255,255,0.08)" />
          {/* Left calf */}
          <motion.g
            animate={{ rotate: move.leftKnee.rotate }}
            transition={trans(lDur, 0.15)}
            style={{ originX: "56px", originY: "156px" }}
          >
            <rect x="50" y="156" width="12" height="30" rx="6" fill={PANTS} />
            {/* Sock */}
            <rect x="50" y="180" width="12" height="8" rx="3" fill="#dde5f0" />
            {/* Left shoe */}
            <ellipse cx="56" cy="188" rx="11" ry="5" fill={SHOE} />
            <rect x="45" y="184" width="22" height="8" rx="3" fill={SHOE} />
            <rect x="45" y="183" width="22" height="4" rx="2" fill="#2a2010" />
          </motion.g>
        </motion.g>

        {/* === HIP / PELVIS === */}
        <path d="M44 115 Q60 120 76 115 L78 128 Q60 132 42 128 Z" fill={PANTS} />

        {/* === TORSO (shirt) === */}
        {/* Shirt back shading */}
        <path d="M42 62 Q38 88 40 115 L80 115 Q82 88 78 62 Z" fill={SHIRT_DARK} />
        {/* Shirt front */}
        <path d="M44 62 Q40 88 42 113 L78 113 Q80 88 76 62 Z" fill={SHIRT} />
        {/* Collar V-neck */}
        <path d="M52 62 L60 74 L68 62" fill="none" stroke={SKIN} strokeWidth="2" strokeLinecap="round" />
        {/* Shirt highlight */}
        <path d="M52 70 Q56 90 54 110" stroke="rgba(255,255,255,0.12)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Shirt crease */}
        <path d="M67 70 Q65 90 66 108" stroke="rgba(0,0,0,0.06)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* === RIGHT ARM (back) === */}
        <motion.g
          animate={{ rotate: move.rightArm.rotate }}
          transition={trans(lDur, 0.1)}
          style={{ originX: "76px", originY: "67px" }}
        >
          {/* Right upper arm - shirt sleeve */}
          <rect x="72" y="67" width="13" height="30" rx="6.5" fill={SHIRT} />
          {/* Elbow */}
          <circle cx="78.5" cy="97" r="6" fill={SHIRT} />
          {/* Right forearm */}
          <motion.g
            animate={{ rotate: move.rightElbow.rotate }}
            transition={trans(lDur)}
            style={{ originX: "78.5px", originY: "97px" }}
          >
            <rect x="74" y="97" width="10" height="26" rx="5" fill={SKIN} />
            {/* Wrist crease */}
            <rect x="75" y="118" width="8" height="2" rx="1" fill={SKIN_DARK} opacity="0.4" />
            {/* Right hand */}
            <ellipse cx="79" cy="126" rx="6.5" ry="5.5" fill={SKIN} />
            <path d="M73 123 Q76 129 79 131" stroke={SKIN_DARK} strokeWidth="1" fill="none" opacity="0.5" />
          </motion.g>
        </motion.g>

        {/* === LEFT ARM (front) === */}
        <motion.g
          animate={{ rotate: move.leftArm.rotate }}
          transition={trans(lDur)}
          style={{ originX: "44px", originY: "67px" }}
        >
          {/* Left upper arm - shirt sleeve */}
          <rect x="35" y="67" width="13" height="30" rx="6.5" fill={SHIRT} />
          {/* Sleeve highlight */}
          <path d="M38 70 Q37 82 38 95" stroke="rgba(255,255,255,0.14)" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Elbow */}
          <circle cx="41.5" cy="97" r="6" fill={SHIRT} />
          {/* Left forearm */}
          <motion.g
            animate={{ rotate: move.leftElbow.rotate }}
            transition={trans(lDur, 0.1)}
            style={{ originX: "41.5px", originY: "97px" }}
          >
            <rect x="36" y="97" width="10" height="26" rx="5" fill={SKIN} />
            {/* Wrist crease */}
            <rect x="37" y="118" width="8" height="2" rx="1" fill={SKIN_DARK} opacity="0.4" />
            {/* Left hand */}
            <ellipse cx="41" cy="126" rx="6.5" ry="5.5" fill={SKIN} />
            <path d="M47 123 Q44 129 41 131" stroke={SKIN_DARK} strokeWidth="1" fill="none" opacity="0.5" />
          </motion.g>
        </motion.g>

        {/* === NECK === */}
        <rect x="53" y="50" width="14" height="16" rx="7" fill={SKIN} />
        <path d="M55 52 Q60 54 65 52" stroke={SKIN_DARK} strokeWidth="1" fill="none" opacity="0.35" />

        {/* === HEAD === */}
        <motion.g
          animate={{ rotate: move.head.rotate, y: move.head.y }}
          transition={trans(lDur, 0.05)}
          style={{ originX: "60px", originY: "50px" }}
        >
          {/* Head base */}
          <ellipse cx="60" cy="32" rx="19" ry="22" fill="url(#headGrad)" />
          {/* Jaw shadow */}
          <ellipse cx="60" cy="49" rx="13" ry="5" fill={SKIN_DARK} opacity="0.22" />

          {/* === HAIR === */}
          {/* Back hair */}
          <ellipse cx="60" cy="18" rx="19" ry="15" fill={HAIR} filter="url(#hairShad)" />
          {/* Hair top sweep */}
          <path d="M41 22 Q41 6 60 4 Q79 6 79 22 L77 14 Q72 4 60 3 Q48 4 43 14 Z" fill={HAIR} />
          {/* Hair side left */}
          <ellipse cx="42" cy="28" rx="4" ry="10" fill={HAIR} />
          {/* Hair side right */}
          <ellipse cx="78" cy="28" rx="4" ry="10" fill={HAIR} />
          {/* Hair highlight */}
          <path d="M48 8 Q55 5 60 6" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* === EARS === */}
          <ellipse cx="41" cy="33" rx="3.5" ry="5" fill={SKIN_DARK} />
          <ellipse cx="79" cy="33" rx="3.5" ry="5" fill={SKIN_DARK} />
          <ellipse cx="41" cy="33" rx="2" ry="3.5" fill={SKIN} opacity="0.7" />
          <ellipse cx="79" cy="33" rx="2" ry="3.5" fill={SKIN} opacity="0.7" />

          {/* === EYES (with blink) === */}
          <motion.g
            animate={{ scaleY: [1, 1, 1, 0.08, 1, 1] }}
            transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.7, 0.82, 0.86, 0.9, 1] }}
            style={{ originY: "30px" }}
          >
            {/* Eye sockets */}
            <ellipse cx="53" cy="30" rx="5" ry="5.5" fill="white" />
            <ellipse cx="67" cy="30" rx="5" ry="5.5" fill="white" />
            {/* Irises */}
            <circle cx="53.5" cy="31" r="3.2" fill="#4A2C0A" />
            <circle cx="67.5" cy="31" r="3.2" fill="#4A2C0A" />
            {/* Pupils */}
            <circle cx="53.5" cy="31" r="1.6" fill="#0d0d0d" />
            <circle cx="67.5" cy="31" r="1.6" fill="#0d0d0d" />
            {/* Catchlights */}
            <circle cx="54.7" cy="29.5" r="1.0" fill="white" opacity="0.95" />
            <circle cx="68.7" cy="29.5" r="1.0" fill="white" opacity="0.95" />
          </motion.g>

          {/* Lower eyelid */}
          <path d="M48 34 Q53 36 58 34" stroke={SKIN_DARK} strokeWidth="0.8" fill="none" opacity="0.35" />
          <path d="M62 34 Q67 36 72 34" stroke={SKIN_DARK} strokeWidth="0.8" fill="none" opacity="0.35" />

          {/* Eyebrows */}
          <motion.path
            d={move.expression === "joy" ? "M47 21 Q52 18 57 20" : "M47 22 Q52 19.5 57 21"}
            stroke={HAIR} strokeWidth="2.2" fill="none" strokeLinecap="round"
          />
          <motion.path
            d={move.expression === "joy" ? "M63 20 Q68 18 73 21" : "M63 21 Q68 19.5 73 22"}
            stroke={HAIR} strokeWidth="2.2" fill="none" strokeLinecap="round"
          />

          {/* Nose */}
          <path d="M58 34 Q60 39 62 34" stroke={SKIN_DARK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <ellipse cx="56.5" cy="38" rx="2" ry="1.5" fill={SKIN_DARK} opacity="0.35" />
          <ellipse cx="63.5" cy="38" rx="2" ry="1.5" fill={SKIN_DARK} opacity="0.35" />

          {/* Mouth / smile */}
          <motion.path
            d={smilePath}
            stroke="#A05030" strokeWidth="2" fill="none" strokeLinecap="round"
          />
          {/* Cheek blush */}
          <ellipse cx="45" cy="38" rx="6" ry="4" fill="#F4A0A0" opacity="0.18" />
          <ellipse cx="75" cy="38" rx="6" ry="4" fill="#F4A0A0" opacity="0.18" />
        </motion.g>

        {/* Music note particles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.text
            key={i}
            x={30 + i * 20}
            y={20}
            fontSize="10"
            fill={C}
            textAnchor="middle"
            animate={{ opacity: [0, 0.8, 0], y: [20, -10, -40], scale: [0.5, 1.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
          >
            {i % 2 === 0 ? "♪" : "♫"}
          </motion.text>
        ))}
      </motion.g>
    </svg>
  );
}

// ─── Movement meter ────────────────────────────────────────────────────────
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
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #6366f1, ${color})` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Main Dance page ───────────────────────────────────────────────────────
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
  const { isPlaying: isMusicPlaying, toggle: toggleMusic } = useAmbientMusic();

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch {
      setCameraError(true);
    }
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
      const prev = prevFrameRef.current.data;
      const curr = frame.data;
      for (let i = 0; i < curr.length; i += 16) {
        if (
          Math.abs(curr[i] - prev[i]) +
          Math.abs(curr[i + 1] - prev[i + 1]) +
          Math.abs(curr[i + 2] - prev[i + 2]) > 40
        ) changed++;
      }
      const score = changed / (canvas.width * canvas.height / 4);
      setMovementScore((p) => p * 0.7 + score * 0.3);
      setTotalMoveScore((p) => p + score);
    }
    prevFrameRef.current = frame;
  }, [isCameraOn]);

  const getHealthInsight = useCallback((avg: number, secs: number) => {
    if (secs < 10) return "Warming up — keep moving!";
    if (avg < 0.05) return "Follow the dancer — any movement helps your mood.";
    if (avg < 0.15) return "Good! Gentle movement releases serotonin and reduces stress.";
    if (avg < 0.3) return "Excellent! Your heart rate is rising — great for wellness.";
    return "Outstanding! You're in full dance therapy mode. Your body is healing.";
  }, []);

  useEffect(() => {
    if (!isSessionActive) return;
    moveTimerRef.current = setInterval(() => {
      setMoveTimer((t) => {
        if (t <= 1) { setMoveIndex((m) => (m + 1) % DANCE_MOVES.length); return 8; }
        return t - 1;
      });
    }, 1000);
    sessionTimerRef.current = setInterval(() => {
      setSessionSeconds((s) => {
        const next = s + 1;
        setTotalMoveScore((total) => {
          setHealthInsight(getHealthInsight(total / Math.max(next, 1), next));
          return total;
        });
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
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-[100dvh] px-4 pt-12 pb-28 space-y-4 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white drop-shadow-md">Dance Therapy</h1>
          <p className="text-white/60 text-sm mt-0.5">Move your body, heal your mind</p>
        </div>
        {/* Music toggle */}
        <button
          onClick={toggleMusic}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl glass transition-all text-xs font-medium ${
            isMusicPlaying ? "text-teal-300 border border-teal-400/30 bg-teal-400/10" : "text-white/60"
          }`}
        >
          {isMusicPlaying ? <Music2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {isMusicPlaying ? "Music on" : "Music off"}
        </button>
      </motion.div>

      {/* Character + Camera */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <div className="flex-1 glass-strong rounded-3xl flex flex-col items-center justify-center py-4 relative overflow-hidden min-h-[230px]">
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{ opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ background: `radial-gradient(circle at 50% 65%, ${currentMove.color}, transparent 70%)` }}
          />
          <HumanDancer moveIndex={moveIndex} />
          <AnimatePresence mode="wait">
            <motion.div
              key={moveIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center mt-1 relative z-10"
            >
             <div
  className="flex items-center justify-center gap-1.5"
  style={{ color: currentMove.color }}
>
  <MoveIcon className="w-3.5 h-3.5" />
  <span className="text-xs font-semibold" style={{ color: currentMove.color }}>
    {currentMove.name}
  </span>
</div>
              <p className="text-[10px] text-white/50 mt-0.5 px-3">{currentMove.instruction}</p>
            </motion.div>
          </AnimatePresence>
          {isSessionActive && (
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full transition-all"
                  style={{ background: i < 9 - moveTimer ? currentMove.color : "rgba(255,255,255,0.15)" }}
                />
              ))}
              <span className="text-[10px] text-white/40 ml-1">{moveTimer}s</span>
            </div>
          )}
        </div>

        {/* Camera */}
        <div className="w-[120px] glass-strong rounded-3xl overflow-hidden flex flex-col items-center justify-center relative">
          {isCameraOn ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted playsInline
                style={{ transform: "scaleX(-1)" }}
              />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              {cameraError
                ? <><CameraOff className="w-7 h-7 text-white/40" /><span className="text-[10px] text-white/40">Unavailable</span></>
                : <><Camera className="w-7 h-7 text-white/40" /><span className="text-[10px] text-white/40">Camera starts with session</span></>
              }
            </div>
          )}
          <canvas ref={canvasRef} width={80} height={60} className="hidden" />
        </div>
      </motion.div>

      {/* Health metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-2xl p-4 space-y-4"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white">Health Metrics</span>
          {isSessionActive && <span className="text-xs font-mono text-teal-300">{fmt(sessionSeconds)}</span>}
        </div>
        <MovementMeter score={movementScore} />
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: wellnessScore, label: "Wellness", color: "text-teal-300" },
            { value: movementScore < 0.08 ? "Low" : movementScore < 0.2 ? "Med" : "High", label: "Energy", color: "text-amber-300" },
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
            <motion.div
              key={healthInsight}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-teal-400/10 border border-teal-400/20 rounded-xl p-3"
            >
              <p className="text-xs text-teal-200 leading-relaxed">{healthInsight}</p>
            </motion.div>
          ) : (
            <p className="text-xs text-white/40 text-center">Start a session to see your health assessment.</p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Start / Stop */}
      <motion.button
        data-testid="button-dance-session"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={isSessionActive ? stopSession : startSession}
        className="w-full h-14 rounded-2xl text-base font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2"
        style={{
          background: isSessionActive
            ? "linear-gradient(135deg,#dc2626,#9f1239)"
            : `linear-gradient(135deg,#4338ca,${currentMove.color})`,
        }}
      >
        {isSessionActive
          ? <><Square className="w-5 h-5" /> Stop Session</>
          : <><Play className="w-5 h-5" /> Start Dance Session</>
        }
      </motion.button>

      <p className="text-center text-[11px] text-white/40 pb-2">
        Dance therapy reduces cortisol and boosts endorphins. Even 5 minutes helps.
      </p>
    </div>
  );
}
