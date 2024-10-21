import { NextRequest, NextResponse } from 'next/server';
import { TwelveLabs } from 'twelvelabs-js';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { LangChainAdapter } from 'ai';

type JsonSchema = {
    type: "number" | "string" | "boolean";
    required?: boolean;
    multiple?: boolean;
    enum?: [string,...string[]];
    description: string;
    children?: {[key: string]: any};
}

function jsonToZod(jsonSchema: JsonSchema ): z.ZodType<any, any, any> {
    switch (jsonSchema.type) {
        case "number":
            let numberSchema: z.ZodType<number | number[] | null, any, any> | z.ZodArray<z.ZodType<number | number[] | null, any, any>, "many"> = z.number().describe(jsonSchema.description);
            if (!jsonSchema.required) {
            numberSchema = numberSchema.nullable();
            }
            if (jsonSchema.multiple) {
            numberSchema = z.array(numberSchema);
            }
            return numberSchema;
        case "string":
            let stringSchema: z.ZodType<string | string[] | null, any, any> | z.ZodArray<z.ZodType<string | string[] | null, any, any>, "many"> = z.string().describe(jsonSchema.description);
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
            let booleanSchema: z.ZodType<boolean | boolean[] | null, any, any> | z.ZodArray<z.ZodType<boolean | boolean[] | null, any, any>, "many"> = z.boolean().describe(jsonSchema.description);
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

function jsonToZodObject(jsonSchema: {[key: string]: JsonSchema}): z.ZodObject<any> {
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

export async function POST(req: NextRequest, res: NextResponse) {
    const { id, videoPrompt, schemaDescription, jsonSchema }: { id: string, videoPrompt: string, schemaDescription: string, jsonSchema: {[key: string]: any} } = await req.json();
    console.log("id = ",id, "videoPrompt = ",videoPrompt, "schemaDescription = ",schemaDescription, "jsonSchema = ",jsonSchema);
    const zodSchema = jsonToZodObject(jsonSchema);
    console.log("zodSchema = ",zodSchema);
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


