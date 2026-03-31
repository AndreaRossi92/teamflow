import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

async function bootstrap() {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

bootstrap().catch(console.error);
