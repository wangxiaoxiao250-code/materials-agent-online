import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MOF Agent Online',
  description: 'Materials & Chemical Engineering Intelligent Agent powered by iFlow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}