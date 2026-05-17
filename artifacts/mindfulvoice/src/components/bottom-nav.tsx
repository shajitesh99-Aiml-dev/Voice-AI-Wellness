import { Link, useLocation } from "wouter";
import { MessageCircle, BarChart2, Heart, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: MessageCircle, label: "Chat" },
    { href: "/dance", icon: Music2, label: "Dance" },
    { href: "/insights", icon: BarChart2, label: "Insights" },
    { href: "/help", icon: Heart, label: "Help" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div
        className="w-full max-w-[430px] pb-4 pt-3 px-5 flex justify-between items-center"
        style={{
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className="relative flex flex-col items-center gap-1 w-14"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-white/20 shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                    : "text-white/50 hover:text-white/80",
                )}
              >
                <Icon
                  className={cn("w-5 h-5", isActive ? "text-white" : "text-white/50")}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span className={cn("text-[9px] font-medium", isActive ? "text-white" : "text-white/40")}>
                {label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
