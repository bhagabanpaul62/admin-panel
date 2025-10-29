// Root layout for the Next.js app router
// Must be a server component (do NOT add 'use client' at the top)
import "./globals.css";

export const metadata = {
  title: "Admin Panel",
  description: "Admin panel UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
