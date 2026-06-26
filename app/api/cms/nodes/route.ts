import { NextResponse } from "next/server";
import { db } from "../../../../src/shared/lib/storage/db-client";
import { contentNodes, activityLogs } from "../../../../src/shared/lib/storage/schema";
import { eq, and, or, like, desc } from "drizzle-orm";

export const runtime = "nodejs";

// GET: Fetch list of content items with filtering and searching
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const conditions = [];

    if (type && type !== "All") {
      conditions.push(eq(contentNodes.type, type));
    }
    if (status && status !== "All") {
      conditions.push(eq(contentNodes.status, status));
    }
    if (search) {
      conditions.push(
        or(
          like(contentNodes.title, `%${search}%`),
          like(contentNodes.summary, `%${search}%`),
          like(contentNodes.body, `%${search}%`),
          like(contentNodes.slug, `%${search}%`)
        )
      );
    }

    const query = db.select().from(contentNodes);
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    // Default sort by updatedAt descending
    const items = await query.orderBy(desc(contentNodes.updatedAt));

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("[CMS-API] Fetching nodes failed:", error);
    return NextResponse.json(
      { error: "Failed to retrieve content items", details: error?.message },
      { status: 500 }
    );
  }
}

// POST: Create a new content item (draft by default)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug, 
      type, 
      summary, 
      bodyContent, 
      version = "1.0.0",
      extraMetadata = "{}",
      seoTitle = "",
      seoDescription = "",
      seoKeywords = "",
      seoCanonical = ""
    } = body;

    if (!title || !slug || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, and type are mandatory." },
        { status: 400 }
      );
    }

    // Verify slug uniqueness
    const existingSlug = await db
      .select()
      .from(contentNodes)
      .where(eq(contentNodes.slug, slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: `Conflict: A content node with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const timestamp = new Date().toISOString();
    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newNode = {
      id: nodeId,
      slug,
      type,
      title,
      summary: summary || "",
      body: bodyContent || "",
      status: "draft", // Always starts as draft
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || summary || "",
      seoKeywords: seoKeywords || "",
      seoCanonical: seoCanonical || `https://coleallstar.dev/${type}s/${slug}`,
      aiEmbeddingsStatus: "pending",
      extraMetadata: typeof extraMetadata === "string" ? extraMetadata : JSON.stringify(extraMetadata)
    };

    await db.insert(contentNodes).values(newNode);

    // Write activity log
    await db.insert(activityLogs).values({
      id: `log_${Date.now()}`,
      action: "create",
      nodeId: nodeId,
      nodeTitle: title,
      details: `Created draft content node of type "${type}" with version ${version}.`,
      createdAt: timestamp
    });

    return NextResponse.json(newNode, { status: 201 });
  } catch (error: any) {
    console.error("[CMS-API] Creating node failed:", error);
    return NextResponse.json(
      { error: "Failed to create content item", details: error?.message },
      { status: 500 }
    );
  }
}
