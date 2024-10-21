import { NextRequest, NextResponse } from 'next/server';
import { TwelveLabs } from 'twelvelabs-js';

const TWELVELAB_API_URL = 'https://api.twelvelab.com/v1/indexes';
const TWELVELAB_API_KEY = process.env.TWELVELAB_API_KEY;

export async function GET(req: NextRequest, res: NextResponse) {
    if (req.method === 'GET') {
        try {
            const client = new TwelveLabs({
                apiKey: process.env.TWELVE_LABS_API_KEY as string,
            });
            const ind = await client.index.list();
            const indexes: { id: string, name: string }[] = ind.map((index) => {
                return { id: index.id, name: index.name }; 
            });
            return Response.json(indexes);
        } catch (error: any) {
            console.error('Error fetching indexes:', error);
            return Response.json({ error }, { status: 500 });
        }
    }
}