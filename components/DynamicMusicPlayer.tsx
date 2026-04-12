'use client';
import dynamic from 'next/dynamic';

const DynamicMusicPlayer = dynamic(() => import('@/components/MusicPlayer'), { ssr: false });

export default DynamicMusicPlayer;
