import { NextResponse } from 'next/server'


export async function GET(
    request: Request
) {
    const params = new URL(request.url).searchParams
    const url = params.get('url')

    if (!url) {
        return NextResponse.json(
            { error: 'URL parameter is required' },
            { status: 400 }
        )
    }

    try {
        const response = await fetch(url, { cache: 'no-store' })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch lyrics' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}