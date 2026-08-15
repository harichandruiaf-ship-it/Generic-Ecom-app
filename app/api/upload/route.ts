import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { verifySession } from "@/lib/auth";

const UPLOAD_BASE = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ALLOWED_FOLDERS = ["products", "banners", "logo", "blog", "categories"] as const;

function safeName(original: string): string {
  const ext = path.extname(original) || ".jpg";
  return `${randomUUID()}${ext}`;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token || !verifySession(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await request.formData();
    const files = formData.getAll("files");
    if (!files?.length || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const folderParam = formData.get("folder") ?? "products";
    const folder =
      typeof folderParam === "string" && ALLOWED_FOLDERS.includes(folderParam as (typeof ALLOWED_FOLDERS)[number])
        ? (folderParam as (typeof ALLOWED_FOLDERS)[number])
        : "products";
    const uploadDir = path.join(UPLOAD_BASE, folder);

    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (typeof file === "string") continue;
      const blob = file as Blob;
      if (blob.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File ${(file as File).name} exceeds 5MB` },
          { status: 400 }
        );
      }
      const type = blob.type;
      if (!ALLOWED_TYPES.includes(type)) {
        return NextResponse.json(
          { error: `Invalid type: ${type}. Use JPEG, PNG, WebP, or GIF.` },
          { status: 400 }
        );
      }
      const name = safeName((file as File).name);
      const filePath = path.join(uploadDir, name);
      const buffer = Buffer.from(await blob.arrayBuffer());
      await writeFile(filePath, buffer);
      urls.push(`/uploads/${folder}/${name}`);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
