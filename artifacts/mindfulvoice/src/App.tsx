import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/bottom-nav";
import Home from "@/pages/home";
import Insights from "@/pages/insights";
import Help from "@/pages/help";
import Dance from "@/pages/dance";
import roomBg from "@assets/WhatsApp_Image_2026-05-13_at_10.22.39_AM_1778647975654.jpeg";

const queryClient = new QueryClient();

function Router() {
  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${roomBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Subtle dark veil for readability */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none z-0" />

      <div className="w-full max-w-[430px] relative z-10 pb-[80px] overflow-x-hidden min-h-[100dvh]">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dance" component={Dance} />
          <Route path="/insights" component={Insights} />
          <Route path="/help" component={Help} />
          <Route component={NotFound} />
        </Switch>
        <BottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
