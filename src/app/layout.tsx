import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strata",
  description: "A tool for continuous discovery, inspired by Teresa Torres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            success: {
              style: {
                background: '#F0FDF4',
                color: '#166534',
              },
            },
            error: {
              style: {
                background: '#FEF2F2',
                color: '#991B1B',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

