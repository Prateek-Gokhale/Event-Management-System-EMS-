export function optimizedImageUrl(url, { width = 640, height = 360 } = {}) {
  if (!url || typeof url !== "string") {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("images.unsplash.com")) {
      return url;
    }

    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("h", String(height));
    parsed.searchParams.set("q", "80");
    return parsed.toString();
  } catch {
    return url;
  }
}
