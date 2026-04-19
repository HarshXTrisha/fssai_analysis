import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'FoodSafe AI by Aura Architects',
  description: 'AI-powered FSSAI Schedule 4 compliance inspection platform. Built by Aura Architects at IIM Bangalore.',
  keywords: ['FSSAI', 'Food Safety', 'AI Audit', 'Gemini Vision', 'Restaurant Compliance', 'Aura Architects', 'IIM Bangalore'],
  authors: [{ name: 'Aura Architects' }],
  openGraph: {
    title: 'FoodSafe AI by Aura Architects',
    description: 'AI-powered FSSAI Schedule 4 compliance inspection platform. Built by Aura Architects at IIM Bangalore.',
    type: 'website',
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
