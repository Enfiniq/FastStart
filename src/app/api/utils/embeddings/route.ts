import { NextRequest, NextResponse } from "next/server";
import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

let embeddingPipeline: FeatureExtractionPipeline | null = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Supabase/gte-small"
    );
  }
  return embeddingPipeline;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error:
            "Invalid input. Please provide a 'text' field with a string value.",
        },
        { status: 400 }
      );
    }

    const pipe = await getEmbeddingPipeline();
    const result = await pipe(text);
    const embeddings = Array.from(result.data);

    return NextResponse.json({
      text: text,
      embeddings: embeddings,
      dimensions: 384,
    });
  } catch (error) {
    console.error("Error generating embeddings:", error);

    return NextResponse.json(
      { error: "Failed to generate embeddings. Please try again later." },
      { status: 500 }
    );
  }
}
