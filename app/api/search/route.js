import { NextRequest, NextResponse } from 'next/server';
import youtubesearchapi from 'youtube-search-api';

export async function GET(request) {
    // URL에서 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    // 쿼리 파라미터가 없는 경우 에러 반환
    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        // YouTube API로 검색
        const searchResults = await youtubesearchapi.GetListByKeyword(query, false, 1, [{ type: "video" }]);

        // 검색 결과 반환
        return NextResponse.json({ data: searchResults.items[0] }, { status: 200 });
    } catch (error) {
        console.error('Error occurred during search:', error);
        return NextResponse.json({ error: 'An error occurred during the search' }, { status: 500 });
    }
}