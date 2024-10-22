import { NextRequest } from 'next/server';
import { TwelveLabs } from 'twelvelabs-js';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

type JsonSchema = {
    type: "number" | "string" | "boolean";
    required?: boolean;
    multiple?: boolean;
    enum?: [string,...string[]];
    description: string;
    children?: {[key: string]: any};
}

function jsonToZod(jsonSchema: JsonSchema ) {
    switch (jsonSchema.type) {
        case "number":
            let numberSchema: z.ZodType<number | number[] | null> | z.ZodArray<z.ZodType<number | number[] | null>, "many"> = z.number().describe(jsonSchema.description);
            if (!jsonSchema.required) {
            numberSchema = numberSchema.nullable();
            }
            if (jsonSchema.multiple) {
            numberSchema = z.array(numberSchema);
            }
            return numberSchema;
        case "string":
            let stringSchema: z.ZodType<string | string[] | null> | z.ZodArray<z.ZodType<string | string[] | null>, "many"> = z.string().describe(jsonSchema.description);
            if (jsonSchema.enum) {
                stringSchema  = z.enum(jsonSchema.enum);
            }
            if (!jsonSchema.required) {
                stringSchema = stringSchema.nullable();
            }
            if (jsonSchema.multiple) {
                stringSchema = z.array(stringSchema);
            }
            return stringSchema;
        case "boolean":
            let booleanSchema: z.ZodType<boolean | boolean[] | null> | z.ZodArray<z.ZodType<boolean | boolean[] | null>, "many"> = z.boolean().describe(jsonSchema.description);
            if (!jsonSchema.required) {
                booleanSchema = booleanSchema.nullable();
            }
            if (jsonSchema.multiple) {
                booleanSchema = z.array(booleanSchema);
            }
            return booleanSchema;
        default:
            throw new Error(`Unsupported type: ${jsonSchema.type} ${jsonSchema.description}`);
    }

}

function jsonToZodObject(jsonSchema: {[key: string]: JsonSchema}) {
    return z.object(Object.keys(jsonSchema).reduce((acc: {[key: string]: any}, cur: string) => {
        if (jsonSchema[cur].children) {
            acc[cur] = z.array(jsonToZodObject(jsonSchema[cur].children));
        }
        else{
            acc[cur] = jsonToZod(jsonSchema[cur]);
        }
        return acc;
    },{}));
}

export async function POST(req: NextRequest) {
    const { id, videoPrompt, schemaDescription, jsonSchema }: { id: string, videoPrompt: string, schemaDescription: string, jsonSchema: {[key: string]: any} } = await req.json();
    const zodSchema = jsonToZodObject(jsonSchema);
    
    try {
        const client = new TwelveLabs({
            apiKey: process.env.TWELVE_LABS_API_KEY as string,
        });
        
        const videoSummary = await client.generate.summarize(
            id,
            "summary", 
            videoPrompt,
            0.1
          );
          
          console.log(`Generated text: ${videoSummary.summary }`);
          
          const result = await generateObject({
            model: openai('gpt-4o', {
              structuredOutputs: true,
            }),
            schemaName: 'summary',
            schemaDescription: schemaDescription,
            schema: zodSchema,
            prompt: videoSummary.summary,
          });
          
            console.log("result = ",result.object );
            return Response.json(result.object);
    } catch (error) {
        console.error(error);
        return Response.json({ error }, { status: 500 });
    }
};


