import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LankaListings",
  description: "A trusted Sri Lankan marketplace for vehicles, property, jobs, and local essentials."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
