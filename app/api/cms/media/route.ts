import { NextResponse } from "next/server";
import { db } from "../../../../src/shared/lib/storage/db-client";
import { mediaAssets, activityLogs } from "../../../../src/shared/lib/storage/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

// GET: List all uploaded media assets
export async function GET() {
  try {
    const assets = await db
      .select()
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt));

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error("[CMS-API] Fetching media failed:", error);
    return NextResponse.json(
      { error: "Failed to retrieve media library assets", details: error?.message },
      { status: 500 }
    );
  }
}

// POST: Handle multipart media uploads
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file payload found in the upload request." }, { status: 400 });
    }

    const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const filename = file.name;
    const mimeType = file.type;
    const sizeBytes = file.size;
    const timestamp = new Date().toISOString();

    let fileUrl = "";
    const r2Key = `media/${Date.now()}_${filename.replace(/\s+/g, "_")}`;

    // Check if Cloudflare R2 bucket binding is available
    const r2Bucket = (process.env as any).MEDIA_BUCKET;

    if (r2Bucket) {
      // Production: stream the file into Cloudflare R2 object store
      console.log(`[CMS-MEDIA] Uploading to Cloudflare R2: ${r2Key}`);
      const arrayBuffer = await file.arrayBuffer();
      await r2Bucket.put(r2Key, arrayBuffer, {
        httpMetadata: { contentType: mimeType }
      });
      // Construct public URL (in production this resolves via R2 custom domains)
      fileUrl = `/api/cms/media/stream/${r2Key}`;
    } else {
      // Local Development: Write the file to the local public/uploads directory.
      // Use eval('require') to shield native Node.js 'fs' calls from edge bundler checks.
      const fs = eval('require')("fs");
      const path = eval('require')("path");

      console.log(`[CMS-MEDIA] Writing upload locally: public/uploads/${filename}`);

      const uploadDir = path.resolve(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filePath, buffer);
      fileUrl = `/uploads/${filename}`;
    }

    const newAsset = {
      id,
      filename,
      mimeType,
      sizeBytes,
      r2Key: fileUrl, // Store the reachable URL key directly
      altText,
      createdAt: timestamp
    };

    // Write to registry table
    await db.insert(mediaAssets).values(newAsset);

    // Audit log upload
    await db.insert(activityLogs).values({
      id: `log_${Date.now()}`,
      action: "upload",
      nodeId: null,
      nodeTitle: filename,
      details: `Uploaded media asset "${filename}" (${(sizeBytes / 1024).toFixed(1)} KB). Mapped URL: ${fileUrl}`,
      createdAt: timestamp
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error: any) {
    console.error("[CMS-API] Media upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload media asset", details: error?.message },
      { status: 500 }
    );
  }
}
