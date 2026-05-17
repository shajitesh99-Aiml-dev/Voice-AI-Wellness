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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="w-full max-w-[430px] bg-background/80 backdrop-blur-xl border-t border-white/5 pb-4 pt-3 px-4 flex justify-between items-center rounded-t-3xl">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className="relative flex flex-col items-center justify-center w-14 h-12 transition-colors"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(13,148,136,0.3)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("w-5 h-5", isActive && "fill-primary/20")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn("text-[9px] font-medium mt-0.5", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(13,148,136,1)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
