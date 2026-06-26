import { NextResponse } from "next/server";
import { db } from "../../../../src/shared/lib/storage/db-client";
import { contentNodes, mediaAssets, activityLogs } from "../../../../src/shared/lib/storage/schema";
import { sql, desc } from "drizzle-orm";

export const runtime = "nodejs"; // Dynamic Node/Edge compatible local route

export async function GET() {
  try {
    // 1. Core Node counts
    const nodesCountQuery = await db
      .select({
        status: contentNodes.status,
        count: sql<number>`count(*)`
      })
      .from(contentNodes)
      .groupBy(contentNodes.status);

    let activeCount = 0;
    let draftCount = 0;
    let archivedCount = 0;

    nodesCountQuery.forEach((row: { status: string; count: number }) => {
      if (row.status === "published") activeCount = row.count;
      else if (row.status === "draft") draftCount = row.count;
      else if (row.status === "archived") archivedCount = row.count;
    });

    // 2. Media Assets statistics
    const mediaStats = await db
      .select({
        count: sql<number>`count(*)`,
        totalBytes: sql<number>`sum(size_bytes)`
      })
      .from(mediaAssets);

    const mediaCount = mediaStats[0]?.count || 0;
    const totalMediaBytes = mediaStats[0]?.totalBytes || 0;

    // 3. Telemetry Cache Hit Ratio (simulate edge cache metric)
    const cacheHitRatio = "94.2%";

    // 4. Activity Logs (Latest 10)
    const activities = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(10);

    return NextResponse.json({
      activeNodes: activeCount,
      draftNodes: draftCount,
      archivedNodes: archivedCount,
      totalNodes: activeCount + draftCount + archivedCount,
      mediaCount,
      totalMediaBytes,
      cacheHitRatio,
      activities
    });
  } catch (error: any) {
    console.error("[CMS-API] Dashboard telemetry load failed:", error);
    return NextResponse.json(
      { error: "Failed to retrieve CMS telemetry data", details: error?.message },
      { status: 500 }
    );
  }
}
