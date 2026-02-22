import MusicPlayer from '@/components/MusicPlayer';

export default async function MainPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    return <MusicPlayer songId={id} />;
}
