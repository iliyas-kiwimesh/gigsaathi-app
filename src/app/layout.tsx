import type { Metadata } from "next";
import "./globals.css";
import { NavigationBar } from "@/components/NavigationBar";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "GigSaathi Dashboard",
  description: "Analytics and management dashboard for GigSaathi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased min-h-screen bg-background`}
      >
        <AuthProvider>
          <NavigationBar />
          <div className="container mx-auto px-4 py-6">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
