import { NextResponse } from 'next/server'


export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(`https://yuntae.in/api/music/lyrics/${params.id}`)

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