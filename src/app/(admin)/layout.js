"use client";
import { Geist, Geist_Mono } from "next/font/google";
import SideNavBar from "@/components/nav/SideNavBar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inner component that uses the sidebar context
function AdminContent({ children }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={`transition-all duration-200 ease-in-out min-h-screen p-6 ${
        collapsed ? "ml-16" : "ml-48"
      }`}
    >
      {children}
    </main>
  );
}

// This is a nested layout for the (admin) route segment.
// Do NOT render <html> or <body> here — those belong in the root layout (src/app/layout.js).
export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SideNavBar />
        <AdminContent>{children}</AdminContent>
      </div>
    </SidebarProvider>
  );
}
