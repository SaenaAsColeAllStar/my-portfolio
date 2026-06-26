import { NextResponse } from "next/server";
import { db } from "../../../../../../src/shared/lib/storage/db-client";
import { contentNodes, contentVersions, activityLogs } from "../../../../../../src/shared/lib/storage/schema";
import { eq, desc, or } from "drizzle-orm";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET: Retrieve the version history list for a content node
export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    // Resolve the real UUID nodeId if slug is provided
    const nodes = await db
      .select({ id: contentNodes.id })
      .from(contentNodes)
      .where(or(eq(contentNodes.id, id), eq(contentNodes.slug, id)))
      .limit(1);

    const node = nodes[0];
    if (!node) {
      return NextResponse.json({ error: "Content node not found" }, { status: 404 });
    }

    // Fetch version history snapshots
    const history = await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.nodeId, node.id))
      .orderBy(desc(contentVersions.createdAt));

    return NextResponse.json(history);
  } catch (error: any) {
    console.error(`[CMS-API] Fetching version history failed:`, error);
    return NextResponse.json(
      { error: "Failed to fetch version history", details: error?.message },
      { status: 500 }
    );
  }
}

// POST: Rollback a content node to a specific historical version snapshot
export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json({ error: "Missing versionId parameter in request body" }, { status: 400 });
    }

    // Resolve node first
    const nodes = await db
      .select()
      .from(contentNodes)
      .where(or(eq(contentNodes.id, id), eq(contentNodes.slug, id)))
      .limit(1);

    const node = nodes[0];
    if (!node) {
      return NextResponse.json({ error: "Content node not found" }, { status: 404 });
    }

    // Fetch the target historical snapshot
    const versions = await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.id, versionId))
      .limit(1);

    const targetVersion = versions[0];
    if (!targetVersion) {
      return NextResponse.json({ error: "Target historical version snapshot not found" }, { status: 404 });
    }

    if (targetVersion.nodeId !== node.id) {
      return NextResponse.json({ error: "Conflict: Target version does not belong to this content node" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    // Overwrite active content node with historical snapshot data
    const updatedNodes = await db
      .update(contentNodes)
      .set({
        title: targetVersion.title,
        summary: targetVersion.summary,
        body: targetVersion.body,
        extraMetadata: targetVersion.extraMetadata,
        updatedAt: timestamp
      })
      .where(eq(contentNodes.id, node.id))
      .returning();

    const updatedNode = updatedNodes[0];

    // Log rollback event
    await db.insert(activityLogs).values({
      id: `log_${Date.now()}`,
      action: "rollback",
      nodeId: node.id,
      nodeTitle: node.title,
      details: `Rolled back node content to version ${targetVersion.version} (Snapshot created at: ${targetVersion.createdAt}).`,
      createdAt: timestamp
    });

    return NextResponse.json({
      success: true,
      node: updatedNode,
      message: `Content node successfully rolled back to version ${targetVersion.version}.`
    });
  } catch (error: any) {
    console.error(`[CMS-API] Reverting version failed:`, error);
    return NextResponse.json(
      { error: "Failed to rollback version snapshot", details: error?.message },
      { status: 500 }
    );
  }
}
