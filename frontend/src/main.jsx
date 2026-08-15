import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "./context/AppContext";

import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";

import App from "./App";
import { store } from "./redux/store";
import queryClient from "./lib/react-query";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                }}
              />
              <App />
            </QueryClientProvider>
          </AppProvider>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
);


