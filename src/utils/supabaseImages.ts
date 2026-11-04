import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

const isRemoteUrl = (path: string) =>
  path.startsWith("http://") ||
  path.startsWith("https://") ||
  path.startsWith("data:");

const mimeByExt: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
};

const extByMime: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/heic": "heic",
};

const normalizeStoragePath = (path: string) => {
  const trimmed = path.trim().replace(/^\/+/, "");
  return trimmed;
};

const stripBucketPrefix = (path: string, bucket: string) => {
  const normalized = normalizeStoragePath(path);
  return normalized.startsWith(`${bucket}/`)
    ? normalized.slice(bucket.length + 1)
    : normalized;
};

const getMimeFromPath = (path: string): string => {
  const cleanPath = path.split(/[?#]/, 1)[0];
  const ext = cleanPath.split(".").pop()?.toLowerCase();
  return (ext && mimeByExt[ext]) || "image/jpeg";
};

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Decodes a base64 string (with or without data URI prefix) into a Uint8Array. */
export const base64ToUint8Array = (input: string): Uint8Array => {
  const base64 = input
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/[^A-Za-z0-9+/=]/g, "");

  const len = base64.length;
  if (len === 0) {
    return new Uint8Array(0);
  }

  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const byteLength = Math.floor((len * 3) / 4) - padding;
  const bytes = new Uint8Array(byteLength);

  let byteIndex = 0;
  for (let i = 0; i < len; i += 4) {
    const enc1 = BASE64_CHARS.indexOf(base64.charAt(i));
    const enc2 = BASE64_CHARS.indexOf(base64.charAt(i + 1));
    const enc3 =
      base64.charAt(i + 2) === "="
        ? 0
        : BASE64_CHARS.indexOf(base64.charAt(i + 2));
    const enc4 =
      base64.charAt(i + 3) === "="
        ? 0
        : BASE64_CHARS.indexOf(base64.charAt(i + 3));

    const triplet =
      ((enc1 < 0 ? 0 : enc1) << 18) |
      ((enc2 < 0 ? 0 : enc2) << 12) |
      ((enc3 < 0 ? 0 : enc3) << 6) |
      (enc4 < 0 ? 0 : enc4);

    if (byteIndex < byteLength) bytes[byteIndex++] = (triplet >> 16) & 0xff;
    if (byteIndex < byteLength) bytes[byteIndex++] = (triplet >> 8) & 0xff;
    if (byteIndex < byteLength) bytes[byteIndex++] = triplet & 0xff;
  }

  return bytes;
};

const blobToDataUri = (blob: Blob, fallbackMime: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const result = fr.result as string;
      if (
        result &&
        result.startsWith("data:") &&
        (result.startsWith("data:;base64,") ||
          result.startsWith("data:application/octet-stream;base64,"))
      ) {
        const commaIdx = result.indexOf(",");
        resolve(`data:${fallbackMime};base64,${result.slice(commaIdx + 1)}`);
      } else {
        resolve(result);
      }
    };
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });

/**
 * Downloads a storage object and converts it into a base64 data URI.
 * Returns null if the object cannot be downloaded or is a corrupted placeholder.
 */
export const downloadImageDataUri = async (
  path: string,
  bucket: string,
  supabase: SupabaseClient<Database>,
): Promise<string | null> => {
  if (!path || isRemoteUrl(path)) {
    return null;
  }

  const storagePath = stripBucketPrefix(path, bucket);

  try {
    const { data: blob, error } = await supabase.storage
      .from(bucket)
      .download(storagePath);

    // Valid images are larger than 32 bytes (guards against 14-byte "File not found" artifacts)
    if (error || !blob || blob.size <= 32) {
      return null;
    }

    const fallbackMime = getMimeFromPath(storagePath);
    return await blobToDataUri(blob, fallbackMime);
  } catch (err) {
    console.warn("downloadImageDataUri failed:", err);
    return null;
  }
};

/** Resolves a post/group image path or URL to something React Native Image can load. */
export const resolveImageUri = async (
  path: string,
  bucket: string,
  supabase: SupabaseClient<Database>,
): Promise<string> => {
  if (isRemoteUrl(path)) {
    return path;
  }

  const storagePath = stripBucketPrefix(path, bucket);

  // 1. Try createSignedUrl first (works for private & public buckets with auth token)
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60 * 60);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  } catch (err) {
    console.warn("createSignedUrl failed, trying fallback:", err);
  }

  // 2. Fallback: download blob with authenticated Supabase client and convert to data URI
  const dataUri = await downloadImageDataUri(storagePath, bucket, supabase);
  if (dataUri) {
    return dataUri;
  }

  // 3. Final fallback: publicUrl (works if bucket is configured as public)
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data?.publicUrl || path;
};

/**
 * Reads local image bytes reliably across Android (including Expo Go percent-encoded cache paths),
 * iOS, and Web.
 */
const readLocalImageBytes = async (
  localUri: string,
  base64?: string | null,
): Promise<Uint8Array> => {
  // 1. Prefer direct base64 from expo-image-picker when available
  if (base64 && base64.length > 0) {
    const bytes = base64ToUint8Array(base64);
    if (bytes.byteLength > 32) {
      return bytes;
    }
  }

  if (localUri.startsWith("data:")) {
    const bytes = base64ToUint8Array(localUri);
    if (bytes.byteLength > 32) {
      return bytes;
    }
  }

  // 2. Try fetch(localUri), and if Expo Go's Android file interceptor 404s on double-encoded
  // "%2540anonymous%252F..." cache paths, retry with decodeURIComponent(localUri)
  const candidateUris = [localUri];
  try {
    const decodedUri = decodeURIComponent(localUri);
    if (decodedUri !== localUri) {
      candidateUris.push(decodedUri);
    }
  } catch {
    // ignore malformed URI encoding
  }

  for (const uri of candidateUris) {
    try {
      const fileRes = await fetch(uri);
      if (fileRes.ok) {
        const arrayBuffer = await fileRes.arrayBuffer();
        if (arrayBuffer.byteLength > 32) {
          return new Uint8Array(arrayBuffer);
        }
      }
    } catch {
      // try next strategy
    }
  }

  // 3. Fallback to React Native's native XMLHttpRequest + FileReader (uses Android ContentResolver)
  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error("Failed to read local image file"));
    xhr.responseType = "blob";
    xhr.open("GET", localUri, true);
    xhr.send(null);
  });

  const dataUri = await blobToDataUri(blob, getMimeFromPath(localUri));
  const bytes = base64ToUint8Array(dataUri);
  if (bytes.byteLength <= 32) {
    throw new Error("Selected image file could not be read or is empty");
  }
  return bytes;
};

export const uploadImage = async (
  localUri: string,
  supabase: SupabaseClient<Database>,
  mimeType?: string,
  base64?: string | null,
) => {
  const imageBytes = await readLocalImageBytes(localUri, base64);
  const arrayBuffer = imageBytes.buffer.slice(
    imageBytes.byteOffset,
    imageBytes.byteOffset + imageBytes.byteLength,
  ) as ArrayBuffer;

  const uriWithoutQuery = localUri.split(/[?#]/, 1)[0];
  const uriExt = uriWithoutQuery.split(".").pop()?.toLowerCase();
  const normalizedMimeType = mimeType?.toLowerCase();
  const fileExt =
    (normalizedMimeType && extByMime[normalizedMimeType]) ||
    (uriExt && mimeByExt[uriExt] ? uriExt : "jpeg");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const contentType = normalizedMimeType ?? mimeByExt[fileExt] ?? "image/jpeg";

  const { error, data } = await supabase.storage
    .from("images")
    .upload(path, arrayBuffer, { contentType, upsert: false });

  if (error) {
    throw error;
  } else {
    return data.path;
  }
};
