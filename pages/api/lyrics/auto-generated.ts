import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { songId } = req.query;

    if (!songId || typeof songId !== 'string') {
        return res.status(400).json({ message: 'Song ID is required' });
    }

    try {
        // Query the generated_lyrics table for this song
        const { data, error } = await supabase
            .from('generated_lyrics')
            .select('lyrics')
            .eq('song_id', songId)
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'Lyrics not found' });
        }

        return res.status(200).json(data.lyrics);
    } catch (error) {
        console.error('Error fetching auto-generated lyrics:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
