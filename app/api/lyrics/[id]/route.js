import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;
    if (!id) return NextResponse.json({ error: 'id is required' });

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

        const response = await fetch(`https://amp-api.music.apple.com/v1/catalog/kr/songs/${id}/syllable-lyrics?l=ko&platform=web`, options);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error });
    }
}

export const dynamic = "force-dynamic";