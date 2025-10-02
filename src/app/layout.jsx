import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/theme.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SIGMA",
  description: "Sistema Integrado de Gestión de Maquinaria Agrícola",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-primary font-theme`}
      >
        <ThemeProvider>
          <PermissionsProvider>
            {children}
          </PermissionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
