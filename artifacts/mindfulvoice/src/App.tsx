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

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[430px] relative pb-[80px] bg-background shadow-2xl overflow-x-hidden">
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
