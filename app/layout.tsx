import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Aven Residences — Rise above the park',
  description: 'Rise above the park at Aven, Lagos. Explore a sunset glass tower and step inside the 218 m² Level 18 residence through a cinematic architectural walkthrough.',
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
