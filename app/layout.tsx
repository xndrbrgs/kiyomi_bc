import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { ViewTransitions } from "next-view-transitions";
import Footer from "@/components/Footer/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Kool Kids Book Club",
  description:
    "Discover and share your favorite books with The Kool Kids Book Club community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${montserrat.variable} antialiased font-montserrat`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
