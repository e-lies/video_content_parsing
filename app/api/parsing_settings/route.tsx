import { NextRequest } from "next/server";
//import filesystem
import fs from "fs";

//update the utils/parsing_settings.json file following the json sent by the client, where the json having the same id as the one sent by the client will be replaced in the list of parsing settings
export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      name,
      videoPrompt,
      schemaDescription,
      jsonSchema,
    }: {
      id: string;
      name: string;
      videoPrompt: string;
      schemaDescription: string;
      jsonSchema: { [key: string]: any };
    } = await req.json();
    const parsing_settings = JSON.parse(
      fs.readFileSync("utils/parsing_settings.json", "utf8")
    );
    const index = parsing_settings.findIndex(
      (element: any) => element.id === id
    );
    if (index !== -1) {
      parsing_settings[index] = {
        id,
        name,
        videoPrompt,
        schemaDescription,
        jsonSchema,
      };
    } else {
      parsing_settings.push({
        id,
        name,
        videoPrompt,
        schemaDescription,
        jsonSchema,
      });
    }
    fs.writeFileSync(
      "utils/parsing_settings.json",
      JSON.stringify(parsing_settings)
    );
    return Response.json(
      {
        message:
          index === -1
            ? "New parsing settings index created"
            : "Parsing settings updated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
