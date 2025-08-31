import type { Metadata } from "next";
import '../styles/globals.css';
import { AuthProvider } from "../context/AuthContext";
import { Inter, JetBrains_Mono } from 'next/font/google';


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "UPS Dashboard",
  description: "UPS Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} font-sans`}>

        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
