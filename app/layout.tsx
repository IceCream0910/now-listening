import { Viewport } from 'next';
import { ReactNode } from 'react';
import './globals.css';

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  icons: {
    icon: 'data:,',
  },
};

export const viewport: Viewport = {
  height: 'device-height',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  width: 'device-width',
};
