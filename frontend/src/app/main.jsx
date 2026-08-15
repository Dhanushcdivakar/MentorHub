import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import "./index.css";

import App from "./App";
import { store } from "../redux/store";
import queryClient from "../lib/react-query";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
