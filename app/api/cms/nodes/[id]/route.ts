import { NextResponse } from "next/server";
import { db } from "../../../../../src/shared/lib/storage/db-client";
import { contentNodes, activityLogs } from "../../../../../src/shared/lib/storage/schema";
import { eq, or } from "drizzle-orm";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET: Fetch a single node by ID or Slug
export async function GET(request: Request, { params }: RouteProps) {
  const { id } = await params;
  try {

    const nodes = await db
      .select()
      .from(contentNodes)
      .where(or(eq(contentNodes.id, id), eq(contentNodes.slug, id)))
      .limit(1);

    const node = nodes[0];

    if (!node) {
      return NextResponse.json(
        { error: `Content item with ID or slug "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(node);
  } catch (error: any) {
    console.error(`[CMS-API] Fetching node ${request.url} failed:`, error);
    return NextResponse.json(
      { error: "Failed to retrieve content item", details: error?.message },
      { status: 500 }
    );
  }
}

// PUT: Update an existing content item
export async function PUT(request: Request, { params }: RouteProps) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Fetch original node to verify existence and log changes
    const nodes = await db
      .select()
      .from(contentNodes)
      .where(or(eq(contentNodes.id, id), eq(contentNodes.slug, id)))
      .limit(1);
      
    const originalNode = nodes[0];
    
    if (!originalNode) {
      return NextResponse.json(
        { error: `Content item with ID "${id}" not found.` },
        { status: 404 }
      );
    }

    const { 
      title, 
      slug, 
      summary, 
      bodyContent, 
      status,
      version,
      extraMetadata,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoCanonical
    } = body;

    // Build update payload dynamically
    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updatePayload.title = title;
    if (slug !== undefined) updatePayload.slug = slug;
    if (summary !== undefined) updatePayload.summary = summary;
    if (bodyContent !== undefined) updatePayload.body = bodyContent;
    if (status !== undefined) updatePayload.status = status;
    if (version !== undefined) updatePayload.version = version;
    if (seoTitle !== undefined) updatePayload.seoTitle = seoTitle;
    if (seoDescription !== undefined) updatePayload.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updatePayload.seoKeywords = seoKeywords;
    if (seoCanonical !== undefined) updatePayload.seoCanonical = seoCanonical;
    
    if (extraMetadata !== undefined) {
      updatePayload.extraMetadata = typeof extraMetadata === "string" 
        ? extraMetadata 
        : JSON.stringify(extraMetadata);
    }

    // Update in D1/SQLite
    const updatedNodes = await db
      .update(contentNodes)
      .set(updatePayload)
      .where(eq(contentNodes.id, originalNode.id))
      .returning();

    const updatedNode = updatedNodes[0];

    // Log update audit event
    await db.insert(activityLogs).values({
      id: `log_${Date.now()}`,
      action: "update",
      nodeId: originalNode.id,
      nodeTitle: updatedNode.title,
      details: `Updated content node. Fields modified: ${Object.keys(updatePayload).filter(k => k !== "updatedAt").join(", ")}.`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(updatedNode);
  } catch (error: any) {
    console.error(`[CMS-API] Updating node ${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to update content item", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a content item
export async function DELETE(request: Request, { params }: RouteProps) {
  const { id } = await params;
  try {

    // Fetch node to get name/title for auditing
    const nodes = await db
      .select()
      .from(contentNodes)
      .where(or(eq(contentNodes.id, id), eq(contentNodes.slug, id)))
      .limit(1);

    const node = nodes[0];

    if (!node) {
      return NextResponse.json(
        { error: `Content item with ID "${id}" not found.` },
        { status: 404 }
      );
    }

    // Execute deletion in D1 (foreign key cascades remove relations and versions)
    await db.delete(contentNodes).where(eq(contentNodes.id, node.id));

    // Log deletion event
    await db.insert(activityLogs).values({
      id: `log_${Date.now()}`,
      action: "delete",
      nodeId: null,
      nodeTitle: node.title,
      details: `Deleted content node "${node.title}" of type "${node.type}" (ID: ${node.id}, Slug: ${node.slug}).`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: `Node "${node.title}" successfully deleted.` });
  } catch (error: any) {
    console.error(`[CMS-API] Deleting node ${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete content item", details: error?.message },
      { status: 500 }
    );
  }
}
