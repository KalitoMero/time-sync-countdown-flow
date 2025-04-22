
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider } from "@/context/TimerContext";
import Layout from "@/components/Layout";
import UserSelection from "@/components/UserSelection";
import TimeSelection from "@/components/TimeSelection";
import CountdownDisplay from "@/components/CountdownDisplay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TimerProvider>
      <TooltipProvider>
        <Toaster position="bottom-left" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<UserSelection />} />
              <Route path="time-selection/:userId" element={<TimeSelection />} />
              <Route path="countdown" element={<CountdownDisplay />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TimerProvider>
  </QueryClientProvider>
);

export default App;
