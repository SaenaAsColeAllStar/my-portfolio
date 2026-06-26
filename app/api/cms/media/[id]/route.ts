import { NextResponse } from "next/server";
import { db } from "../../../../../src/shared/lib/storage/db-client";
import { mediaAssets, activityLogs } from "../../../../../src/shared/lib/storage/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// DELETE: Delete a media asset from registry and physical storage (R2/local folder)
export async function DELETE(request: Request, { params }: RouteProps) {
  const { id } = await params;
  try {

    // Retrieve asset metadata from registry
    const assets = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);

    const asset = assets[0];

    if (!asset) {
      return NextResponse.json({ error: `Media asset with ID "${id}" not found.` }, { status: 404 });
    }

    const filename = asset.filename;
    const r2Key = asset.r2Key;

    // Check if Cloudflare R2 bucket binding is available
    const r2Bucket = (process.env as any).MEDIA_BUCKET;

    if (r2Bucket && r2Key.startsWith("/api/cms/media/stream/")) {
      // Production: Delete object from Cloudflare R2
      const bucketKey = r2Key.replace("/api/cms/media/stream/", "");
      console.log(`[CMS-MEDIA] Purging key from Cloudflare R2: ${bucketKey}`);
      await r2Bucket.delete(bucketKey);
    } else if (r2Key.startsWith("/uploads/")) {
      // Local Development: Delete local file from public/uploads folder
      const fs = eval('require')("fs");
      const path = eval('require')("path");

      const localPath = path.join(process.cwd(), "public", r2Key);
      console.log(`[CMS-MEDIA] Deleting local file: ${localPath}`);
      
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }

    // Delete registry entry from database
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));

    // Audit log deletion
    await db.insert(activityLogs).values({
      id: `log_${Date.now()}`,
      action: "delete", // 'delete' matches schema action constraints
      nodeId: null,
      nodeTitle: filename,
      details: `Deleted media asset "${filename}". Key was purged from storage.`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: `Media asset "${filename}" successfully deleted.` });
  } catch (error: any) {
    console.error(`[CMS-API] Deleting media asset ${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete media asset", details: error?.message },
      { status: 500 }
    );
  }
}
