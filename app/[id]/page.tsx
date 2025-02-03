import MusicPlayer from '@/components/MusicPlayer';
import { Metadata } from 'next';

export default function MainPage({ params }: { params: { id: string } }) {
    return <MusicPlayer songId={params.id} />;
}
