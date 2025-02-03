import { NextRequest, NextResponse } from 'next/server';
import youtubesearchapi from 'youtube-search-api';

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const searchResults = await youtubesearchapi.GetListByKeyword(query, false, 1, [{ type: "video" }]);
        return NextResponse.json({ data: searchResults.items[0] }, { status: 200 });
    } catch (error) {
        console.error('Error occurred during search:', error);
        return NextResponse.json({ error: 'An error occurred during the search' }, { status: 500 });
    }
}