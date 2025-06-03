import './globals.css';
import { Metadata } from 'next';
import { Footer, Navbar } from '../components';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr-FR',
    },
  },
  icons: {
    icon: '/favicon.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='fr'>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
