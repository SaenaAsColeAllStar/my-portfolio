import { NextResponse } from "next/server";
import { runPublishingPipeline } from "../../../../../../src/shared/lib/cms/publishing-pipeline";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// POST: Trigger the publishing pipeline for a specific content node
export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    // Trigger the event-driven publishing pipeline
    const result = await runPublishingPipeline(id);

    return NextResponse.json({
      success: true,
      warnings: result.warnings,
      node: result.node,
      message: `Node "${result.node.title}" published successfully.`
    });
  } catch (error: any) {
    console.error(`[CMS-API] Publishing node failed for ID:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Publishing Pipeline Failed", 
        details: error?.message || "An unexpected error occurred during publishing."
      },
      { status: 500 }
    );
  }
}
