import {
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  type UploadHandler,
} from '@remix-run/node';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export const imageUploadHandler: UploadHandler = async ({ name, data, filename, contentType }) => {
  // Only handle file uploads for image field
  if (name !== 'image') {
    return undefined;
  }

  // If no file, return undefined
  if (!filename) {
    return undefined;
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  await ensureUploadDir();

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
  const filePath = join(UPLOAD_DIR, uniqueFilename);

  // Collect data chunks
  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  for await (const chunk of data) {
    totalSize += chunk.byteLength;

    if (totalSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    chunks.push(chunk);
  }

  // Write file to disk
  const buffer = Buffer.concat(chunks);
  await writeFile(filePath, buffer);

  // Return the public path (relative to /public)
  return `/uploads/${uniqueFilename}`;
};

export async function parseFormData(request: Request) {
  const uploadHandler = unstable_composeUploadHandlers(
    imageUploadHandler,
    unstable_createMemoryUploadHandler()
  );

  return await unstable_parseMultipartFormData(request, uploadHandler);
}
