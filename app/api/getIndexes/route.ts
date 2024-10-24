import { NextRequest } from "next/server";
import { TwelveLabs } from "twelvelabs-js";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  let apiKey;
  if (!authHeader) {
    apiKey = process.env.TWELVE_LABS_API_KEY;
  } else apiKey = authHeader;
  if (req.method === "GET") {
    try {
      const client = new TwelveLabs({
        apiKey: apiKey as string,
      });
      const ind = await client.index.list();
      const indexes: { id: string; name: string }[] = ind.map((index) => {
        return { id: index.id, name: index.name };
      });
      return Response.json(indexes);
    } catch (error) {
      console.error("Error fetching indexes:", error);
      return Response.json({ error }, { status: 500 });
    }
  }
}
