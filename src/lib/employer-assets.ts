export const EMPLOYER_ASSETS_BUCKET = "employer-assets";
export const EMPLOYER_ASSET_MAX_BYTES = 5 * 1024 * 1024;
export const EMPLOYER_ASSET_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export type EmployerAssetKind = "logo" | "cover";

export function getEmployerAssetPath(
  userId: string,
  kind: EmployerAssetKind,
  fileName: string
) {
  const safeName = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = safeName || "image";
  const stamp = Date.now();

  return `employers/${userId}/${kind}-${stamp}-${suffix}`;
}
