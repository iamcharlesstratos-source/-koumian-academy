import { headers } from "next/headers";
import { AlertTriangle } from "lucide-react";
import { isInAppBrowser } from "@/lib/browser";

/**
 * Shown on the login screen when the visitor is inside an in-app browser
 * (Messenger, Facebook, Instagram, TikTok…). Google blocks OAuth in those
 * webviews, so we steer the user to email + password or to a real browser.
 */
export function InAppBrowserNotice() {
  const ua = headers().get("user-agent") ?? "";
  if (!isInAppBrowser(ua)) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-300" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Bukas ka sa in-app browser
          </p>
          <p className="mt-1 text-amber-700/90 dark:text-amber-200/80">
            Hinaharangan ng Google ang Google sign-in sa loob ng Messenger o
            Facebook. Para makapasok:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-amber-700/90 dark:text-amber-200/80">
            <li>
              Mag-sign in gamit ang <strong>email at password</strong> dito
              mismo — gumagana ito kahit saan, <em>o</em>
            </li>
            <li>
              I-tap ang <strong>•••</strong> sa kanang taas, piliin ang{" "}
              <strong>Open in Safari</strong> o <strong>Chrome</strong>, tapos
              doon mag-Google sign in.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
