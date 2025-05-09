import { BrowserRouter as Router } from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "@context/ThemeContext";
import { ToastProvider } from "@components/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LoadingSpinner } from "@components/LoadingSpinner";
import { routes } from "./routes/routes";
import { useRoutes } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const element = useRoutes(routes);
  return <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <Router basename="/cake-rate/">
            <AppContent />
          </Router>
        </ToastProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
