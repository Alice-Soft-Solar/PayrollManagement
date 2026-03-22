import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alicesoft",
  description: "Alicesoft Attendance, Payroll, and Reporting Platform",
  icons: {
    icon: "/alicesoft-logo.png",
    shortcut: "/alicesoft-logo.png",
    apple: "/alicesoft-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
