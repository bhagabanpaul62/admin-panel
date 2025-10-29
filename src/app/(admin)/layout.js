import { Geist, Geist_Mono } from "next/font/google";
import SideNavBar from "@/components/nav/SideNavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin",
  description: "Admin area",
};

// This is a nested layout for the (admin) route segment.
// Do NOT render <html> or <body> here — those belong in the root layout (src/app/layout.js).
export default function AdminLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <SideNavBar />
      <main className="">
        {/* leave space for sidebar; adjust if you change widths */}
        {children}
      </main>
    </div>
  );
}
