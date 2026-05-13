import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface MindfulState {
  messages: Message[];
  streak: number;
  lastActiveDate: string | null;
  voiceUseCount: number;
  addMessage: (msg: Message) => void;
  incrementVoiceUse: () => void;
  resetChat: () => void;
}

export const useMindfulStore = create<MindfulState>()(
  persist(
    (set, get) => ({
      messages: [],
      streak: 0,
      lastActiveDate: null,
      voiceUseCount: 0,
      addMessage: (msg) => {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        set((state) => {
          let newStreak = state.streak;
          let newLastActive = state.lastActiveDate;

          if (state.lastActiveDate !== todayStr) {
            if (!state.lastActiveDate) {
              newStreak = 1;
            } else {
              const lastDate = new Date(state.lastActiveDate);
              const diffTime = Math.abs(now.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                newStreak += 1;
              } else if (diffDays > 1) {
                newStreak = 1;
              }
            }
            newLastActive = todayStr;
          }

          return {
            messages: [...state.messages, msg],
            streak: newStreak,
            lastActiveDate: newLastActive,
          };
        });
      },
      incrementVoiceUse: () => set((state) => ({ voiceUseCount: state.voiceUseCount + 1 })),
      resetChat: () => set({ messages: [] }),
    }),
    {
      name: "mindful-storage",
    }
  )
);
