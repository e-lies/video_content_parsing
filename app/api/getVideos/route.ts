import { NextRequest } from "next/server";
import { TwelveLabs } from "twelvelabs-js";

//a get request to the server to get the different videos from an id
export async function GET(req: NextRequest) {
  //get the id parameter in the url
  const id: string | null = req.nextUrl.searchParams.get("id");
  // Check for the API key in the authorization header
  const apiKey =
    req.headers.get("authorization") || process.env.TWELVE_LABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = new TwelveLabs({
      apiKey: apiKey as string,
    });

    const listVideosFromId = async (index: string) => {
      const videos = await client.index.video.list(index);
      return videos;
    };
    const videos = await listVideosFromId(id as string);

    const videosArray = videos.map((video: any) => {
      return {
        title: video.metadata?.filename,
        id: video.id,
        duration: video.metadata?.duration,
        source: video.source,
      };
    });

    return Response.json(videosArray);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
