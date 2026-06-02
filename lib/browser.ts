/**
 * Detects in-app / embedded browsers (Messenger, Facebook, Instagram, TikTok,
 * etc.) from a User-Agent string.
 *
 * Why this matters: Google blocks OAuth sign-in inside embedded webviews
 * (error 403: disallowed_useragent — "Use secure browsers" policy). There's no
 * way to make Google allow it, so when we detect one of these browsers we steer
 * the user to either (a) email + password (which works everywhere) or (b)
 * opening the site in Safari/Chrome.
 */
export function isInAppBrowser(ua: string): boolean {
  if (!ua) return false;
  const needles = [
    "FBAN",
    "FBAV",
    "FB_IAB",
    "FBIOS",
    "FBDV",
    "Messenger",
    "Instagram",
    "Line/",
    "LinkedInApp",
    "Twitter",
    "Snapchat",
    "Pinterest",
    "BytedanceWebview",
    "musical_ly",
    "TikTok",
    "; wv)", // generic Android WebView
  ];
  return needles.some((n) => ua.includes(n));
}
