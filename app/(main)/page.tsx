import MusicPlayer from '@/components/MusicPlayer';
import { Metadata } from 'next';

export default function MainPage() {
  return <MusicPlayer />;
}

export const metadata: Metadata = {
  description: '최근에 들은 노래',
  openGraph: {
    description: '최근에 들은 노래',
    title: '최근에 들은 노래',
  },
  title: '최근에 들은 노래',
  twitter: {
    description: '최근에 들은 노래',
    title: '최근에 들은 노래',
  },
};
