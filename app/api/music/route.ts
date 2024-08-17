import { NextResponse, NextRequest } from "next/server";

const allowedOrigins = ['http://localhost', 'http://127.0.0.1', 'https://yuntae.in'];

async function cors(request: NextRequest, response: NextResponse) {
    const origin = request.headers.get("origin") ?? "";

    if (allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");

    return response;
}

export async function OPTIONS(request: NextRequest) {
    const response = new NextResponse(null, { status: 204 });
    return cors(request, response);
}

export async function GET(request: NextRequest) {
    try {
        const options_token = {
            method: 'GET',
            headers: {
                authority: 'api.cider.sh',
                accept: '*/*',
                'accept-language': 'ko-KR,ko;q=0.9',
                referer: 'http://localhost:10768/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Cider-2 (WebView;?client=sabiiro&env=production&platform=windows&arch=x86_64&clientVersion=7)'
            }
        };

        const response_token = await fetch('https://api.cider.sh/v1/', options_token);
        const token_data = await response_token.json();
        const token = token_data.token;

        // 6개월 주기로 갱신 필요
        const mediaUserToken = "AoMGIGmXc2BcMbdz8SYGkNZdharyHtHmeYyaZUpUTLTEF+IEmo+f1yFkG0oA5o1KRi6J7GTArluapwsEhfsyjBBOIVZyfIDycq1zQnobKtQhsAsCiS2ByKpH7FwG0KLTBUF23/IMLgYKf5+9WlA3q/6TXRrid2sNA5qMFvjB/kwuZyRv6iz7+JrJTKbzeh06FVFCGK1mQns6tdTTEncfn5tqbgq+uNSN7vw7iN/hBEkXoE7dAg==";

        const options = {
            method: 'GET',
            headers: {
                authority: 'amp-api.music.apple.com',
                'User-Agent': 'Cider-2 (WebView;?client=sabiiro&env=production&platform=windows&arch=x86_64)',
                'media-user-token': mediaUserToken,
                origin: 'https://music.apple.com',
                referer: 'https://music.apple.com/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                Authorization: 'Bearer ' + token
            }
        };

        const response = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks?l=ko&types=songs', options);
        const data = await response.json();
        const corsResponse = NextResponse.json(data);
        return cors(request, corsResponse);
    } catch (error) {
        console.error(error);
        const errorResponse = NextResponse.json({ error: (error as any).message }, { status: 500 });
        return cors(request, errorResponse);
    }
}

export const dynamic = "force-dynamic";
