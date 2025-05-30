import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/auth-provider";
import authOptions from "@/auth-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathExplorer",
  description: "PathExplorer",
  icons: [
    { rel: "icon", url: "/Accenture.png" },
    { rel: "apple-touch-icon", url: "/Accenture.png" },
    { rel: "shortcut icon", url: "/Accenture.png" }
  ]
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-theme="sabritones">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
