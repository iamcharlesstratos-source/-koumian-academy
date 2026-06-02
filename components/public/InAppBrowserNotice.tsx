import { AlertTriangle } from "lucide-react";

/**
 * Banner shown on the login screen when the visitor is inside an in-app
 * browser (Messenger, Facebook, Instagram, TikTok…). Google blocks OAuth in
 * those webviews, but email + password works fine — so we tell the user to use
 * it right here, and explain how to reach Google sign-in if they want it.
 *
 * Visibility is decided by the caller (the login page detects the browser).
 */
export function InAppBrowserNotice() {
  return (
    <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-300" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Sign in dito mismo sa Messenger
          </p>
          <p className="mt-1 text-amber-700/90 dark:text-amber-200/80">
            Gamitin ang <strong>email at password</strong> sa ibaba — gumagana
            ito kahit nasa loob ka ng Messenger o Facebook. Wala ka pang
            account? I-tap ang <strong>Create one</strong> sa baba.
          </p>
          <p className="mt-2 text-amber-700/90 dark:text-amber-200/80">
            Ang <strong>Google sign-in</strong> ay hindi pinapayagan ng Google
            sa in-app browser. Kung Google ang gusto mo: i-tap ang{" "}
            <strong>•••</strong> sa taas, piliin ang{" "}
            <strong>Open in Safari</strong> o <strong>Chrome</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
