import MusicPlayer from '@/components/MusicPlayer';

export default async function MainPage({ params }: { params: { id: string } }) {
    const id = await params.id;
    return <MusicPlayer songId={id} />;
}
