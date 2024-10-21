import { NextRequest, NextResponse } from 'next/server';
import { TwelveLabs } from 'twelvelabs-js';

//a get request to the server to get the different videos from an id
export async function GET(req: NextRequest, res: NextResponse) {
    //get the id parameter in the url
    const id: string | null = req.nextUrl.searchParams.get('id');
    try{
        const client = new TwelveLabs({
            apiKey: process.env.TWELVE_LABS_API_KEY as string,
        });
        
        const listVideosFromId = async (index: string) => {
            const videos = await client.index.video.list(id as string);
            return videos;
        }
        const videos = await listVideosFromId(id as string);

        const videosArray = videos.map((video: any) => {
            return {title: video.metadata?.filename , id: video.id, duration: video.metadata?.duration, source: video.source};
        });

        return Response.json(videosArray);

    } catch (error) {
        console.error(error);
        return Response.json({ error }, { status: 500 });
    }
};