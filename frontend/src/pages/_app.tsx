import type { AppProps } from 'next/app';
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <main className="antialiased min-h-screen">
          <Component {...pageProps} />
          <Toaster richColors position="top-right" />
        </main>
      </AuthProvider>
    </ThemeProvider>
  );
} 