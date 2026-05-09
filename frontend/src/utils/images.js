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

export function fallbackImageUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#e63946"/>
          <stop offset="1" stop-color="#0f766e"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#bg)"/>
      <circle cx="122" cy="92" r="52" fill="rgba(255,255,255,0.16)"/>
      <path d="M88 265h464l-92-104-68 68-48-48-84 84-58-58z" fill="rgba(255,255,255,0.24)"/>
      <text x="320" y="182" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#fff">EventHub</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
