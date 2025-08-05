import { NextResponse } from 'next/server';

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: `{"context":{"client":{"hl":"ko","gl":"KR","deviceMake":"","deviceModel":"","userAgent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36,gzip(gfe)","clientName":"WEB_REMIX","clientVersion":"1.20250730.03.00","osName":"X11","osVersion":""}},"query":${JSON.stringify(query)}}`
        };

        const response = await fetch('https://music.youtube.com/youtubei/v1/search?prettyPrint=false', options);
        const data = await response.json();
        console.log(data);

        let videoId = null;
        try {
            videoId =
                data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicCardShelfRenderer?.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId;
        } catch (e) {
            return NextResponse.json({ error: 'Video ID not found in response', response: data }, { status: 404 });
        }

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID not found in response', response: data }, { status: 404 });
        }

        return NextResponse.json({ videoId }, { status: 200 });
    } catch (error) {
        console.error('Error occurred during search:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}