import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
);

export default async function handler(req: Request, context: { waitUntil: (promise: Promise<any>) => void }) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const url = new URL(req.url);
    const songId = url.searchParams.get('songId');
    const youtubeId = url.searchParams.get('youtubeId');

    let fullLyrics = '';
    try {
        if (req.body) {
            const body = await req.json();
            fullLyrics = body.fullLyrics || '';
        }
    } catch (error) {
        console.error('Error parsing request body:', error);
    }

    if (!songId) {
        return new Response(JSON.stringify({ message: 'Song ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!youtubeId) {
        return new Response(JSON.stringify({ message: 'YouTube ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { data: pendingJob } = await supabase
            .from('pending_jobs')
            .select('song_id')
            .eq('song_id', songId)
            .single();

        if (pendingJob) {
            return new Response(JSON.stringify({ message: 'Lyrics generation already in progress' }), {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await supabase
            .from('pending_jobs')
            .insert({
                song_id: songId,
                youtube_id: youtubeId,
                started_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Error checking/updating pending generations:', error);
    }

    context.waitUntil(
        generateLyrics(songId, youtubeId, fullLyrics)
    );

    return new Response(JSON.stringify({ message: 'Lyrics generation started' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
    });
}

async function generateLyrics(songId: string, youtubeId: string, fullLyrics: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            await removeSongFromPending(songId);
            return;
        }

        const youtubeUrl = `https://youtu.be/${youtubeId}`;
        console.log(`Generating lyrics for song ${songId} from YouTube video ${youtubeUrl}`);

        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        fileData: {
                            fileUri: youtubeUrl,
                            mimeType: 'video/*'
                        }
                    }
                ]
            }
        ];

        if (fullLyrics) {
            contents.push({
                role: 'user',
                parts: [
                    {
                        text: `이 노래의 전체 가사는 다음과 같습니다:\n${fullLyrics}\n\n이 전체 가사에 맞춰서 타임라인을 생성해주세요. 만약 들리는 가사와 전체 가사가 맞지 않는다고 판단되면, 제공된 전체 가사는 모두 무시하고 들리는 가사를 기준으로 생성해주세요. 주의사항:- 영상의 전체 길이를 고려하여, 마지막 구절의 \`start\`와 \`end\`는 전체 영상 길이(초 단위)보다 작아야 합니다.\n- 구절의 시작과 종료 시간은 영상의 실제 진행 타임라인과 일치해야 하며, 시간이 순차적으로 증가해야 합니다.\n- 60초 미만 구간과 60초 이후 구간 사이의 시간 차이가 자연스럽게 연결되어야 하며, 구절의 지속 시간이 지나치게 길어지거나, 다음 구절과의 시간 간격이 부자연스럽게 벌어지지 않도록 해야 합니다.\n- 시간 표시에서 60초 미만 구간에서 60초 이후 구간으로 전환할 때, 시간이 급격히 100초 대로 뛰어가는 오류가 발생하지 않도록 주의합니다.\n- 각 구절의 타임라인은 영상 전체의 시간 분포를 고려해 실제 등장하는 시간에 맞춰서 설정되어야 하며, 급격한 시간 점프나 부정확한 시간 표시가 없도록 확인합니다.\n잘못된 예시 케이스:\n- {\"text\":\"나 이곳에 몰래 속삭여\",\"start\":57.486,\"end\":100.756}\n- {\"text\":\"밤 하늘의 별들이\",\"start\":54.486,\"end\":59.756}, {\"text\":\"빛나는 이유는\",\"start\":104.234,\"end\":108.562}\n\n`
                    } as any
                ]
            });
        } else {
            contents.push({
                role: 'user',
                parts: [
                    {
                        text: "영상 속에 나오는 노래의 싱크 가사 데이터를 생성해줘. 주의사항:- 영상의 전체 길이를 고려하여, 마지막 구절의 \`start\`와 \`end\`는 전체 영상 길이(초 단위)보다 작아야 합니다.\n- 구절의 시작과 종료 시간은 영상의 실제 진행 타임라인과 일치해야 하며, 시간이 순차적으로 증가해야 합니다.\n- 60초 미만 구간과 60초 이후 구간 사이의 시간 차이가 자연스럽게 연결되어야 하며, 구절의 지속 시간이 지나치게 길어지거나, 다음 구절과의 시간 간격이 부자연스럽게 벌어지지 않도록 해야 합니다.\n- 시간 표시에서 60초 미만 구간에서 60초 이후 구간으로 전환할 때, 시간이 급격히 100초 대로 뛰어가는 오류가 발생하지 않도록 주의합니다.\n- 각 구절의 타임라인은 영상 전체의 시간 분포를 고려해 실제 등장하는 시간에 맞춰서 설정되어야 하며, 급격한 시간 점프나 부정확한 시간 표시가 없도록 확인합니다.\n잘못된 예시 케이스:\n- {\"text\":\"나 이곳에 몰래 속삭여\",\"start\":57.486,\"end\":100.756}\n- {\"text\":\"밤 하늘의 별들이\",\"start\":54.486,\"end\":59.756}, {\"text\":\"빛나는 이유는\",\"start\":104.234,\"end\":108.562}\n\n"
                    } as any
                ]
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    role: 'user',
                    parts: [
                        {
                            text: "당신은 영상에 나오는 노래의 가사를 구절 단위로 추출하여, 각 구절이 등장하는 정확한 시간(초 단위)의 타임라인과 함께 JSON 형식으로 출력하는 싱크 가사 생성기입니다. JSON 배열의 각 항목은 반드시 `text`, `start`, `end` 필드를 포함해야 하며, `start`와 `end`는 실제 영상에서 해당 구절이 시작되고 끝나는 시간을 초 단위로 정확하게 반영해야 합니다.\n예시 형식:\n```json\n[\n   {\n    \"text\": \"그 날의 우린\",\n    \"start\": 55.244,\n    \"end\": 58.497\n},{\n    \"text\": \"뜨겁게 사랑했지\",\n    \"start\": 59.252,\n    \"end\": 65.723\n}\n...\n]\n```\n완성된 형태의 JSON 데이터만을 출력하십시오."
                        }
                    ]
                },
                generationConfig: {
                    temperature: 0.4,
                    topK: 64,
                    topP: 0.95,
                    maxOutputTokens: 65536,
                    responseMimeType: "text/plain"
                }
            })
        });

        const result = await response.json();

        const generatedContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedContent) {
            console.error('No content was generated');
            await removeSongFromPending(songId);
            return;
        }

        let parsedLyrics;
        try {
            const jsonMatch = generatedContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
            if (jsonMatch) {
                parsedLyrics = JSON.parse(jsonMatch[0]);
            } else {
                parsedLyrics = JSON.parse(generatedContent);
            }
        } catch (error) {
            console.error('Failed to parse generated lyrics as JSON:', error);
            await removeSongFromPending(songId);
            return;
        }

        console.log(`Generated lyrics for song ${songId} successfully: ${JSON.stringify(parsedLyrics)}`);
        await supabase
            .from('generated_lyrics')
            .upsert({
                song_id: songId,
                lyrics: parsedLyrics,
                created_at: new Date().toISOString()
            });

        console.log(`Generated lyrics for song ${songId} saved successfully`);
        await removeSongFromPending(songId);
    } catch (error) {
        console.error('Error generating lyrics:', error);
        await removeSongFromPending(songId);
    }
}

async function removeSongFromPending(songId: string) {
    try {
        await supabase
            .from('pending_jobs')
            .delete()
            .eq('song_id', songId);
    } catch (error) {
        console.error('Error removing song from pending list:', error);
    }
}
