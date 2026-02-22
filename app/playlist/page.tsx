import MusicPlayer from '@/components/MusicPlayer';
import { Metadata } from 'next';

export default function PlaylistPage() {
    return <MusicPlayer type="playlist" />;
}

export const metadata: Metadata = {
    description: '태인의 플레이리스트',
    openGraph: {
        description: '태인의 플레이리스트',
        title: '태인의 플레이리스트',
    },
    title: '태인의 플레이리스트',
    twitter: {
        description: '태인의 플레이리스트',
        title: '태인의 플레이리스트',
    },
};
