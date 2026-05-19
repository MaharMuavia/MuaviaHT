import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VisualCore Sentinel | Autonomous Business Intelligence',
  description: 'Google Antigravity Hackathon 2026 - Autonomous Content-to-Action Agent',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-navy-bg overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
