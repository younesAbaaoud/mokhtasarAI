import type { AppProps } from 'next/app';
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "../components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <main className="antialiased min-h-screen">
          <Component {...pageProps} />
          <Toaster />
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
} 