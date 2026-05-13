import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbProps {
  isRecording: boolean;
  className?: string;
}

export function Orb({ isRecording, className }: OrbProps) {
  return (
    <div className={cn("relative flex items-center justify-center w-32 h-32", className)}>
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6B21A8] via-[#4338CA] to-[#0D9488] opacity-80 blur-lg"
        animate={{
          scale: isRecording ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isRecording ? [0.6, 0.9, 0.6] : [0.6, 0.7, 0.6],
        }}
        transition={{
          duration: isRecording ? 1.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-[#0D9488] via-[#4338CA] to-[#6B21A8] shadow-[0_0_40px_rgba(13,148,136,0.6)]"
        animate={{
          rotate: [0, 360],
          scale: isRecording ? [1, 1.1, 1] : 1,
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: isRecording ? 0.5 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }
        }}
      />
      
      {isRecording && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/50"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/30"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      )}
      
      <div className="absolute inset-0 bg-white/5 rounded-full backdrop-blur-sm" />
    </div>
  );
}
