import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { NavigationBar } from "@/components/NavigationBar";
import { AuthProvider } from "@/providers/AuthProvider";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

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
        className={`${robotoSlab.className} antialiased min-h-screen bg-background`}
      >
        <AuthProvider>
          <NavigationBar />
          <div className="container mx-auto px-4 py-6">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
