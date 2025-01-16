import { NextResponse } from 'next/server'


export async function GET(
    request: Request
) {
    try {
        const response = await fetch(`https://yuntae.in/api/music/recent`, { cache: "no-store" })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch recent musics' },
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