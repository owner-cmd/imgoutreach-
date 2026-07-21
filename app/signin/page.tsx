"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

function SignInInner() {
  const search = useSearchParams();
  const next = search.get("next") || "/request";
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    let done = false;

    // Google returns the Gmail refresh token once, right after consent, in the
    // session Supabase builds from the callback. onAuthStateChange delivers that
    // full session (getSession can race the callback parse and miss the token).
    const handle = async (session: import("@supabase/supabase-js").Session | null) => {
      if (done || !session?.user) return;
      done = true;
      setEmail(session.user.email ?? null);
      const refresh = session.provider_refresh_token;
      if (refresh && session.access_token) {
        try {
          const res = await fetch("/api/gmail/store", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ refresh_token: refresh }),
          });
          if (!res.ok) console.error("gmail/store failed:", res.status, await res.text());
          else console.log("gmail/store: token saved");
        } catch (e) { console.error("gmail/store threw:", e); }
      } else {
        // If this logs, Google didn't return a refresh token (check offline/consent + provider config).
        console.warn("No provider_refresh_token on session — Gmail not captured.");
      }
      window.location.replace(next);
    };

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => { handle(session); });
    sb.auth.getSession().then(({ data }) => {
      if (data.session) handle(data.session);
      else setTimeout(() => { if (!done) setLoading(false); }, 1500);
    });

    return () => sub.subscription.unsubscribe();
  }, [next]);

  const signIn = async () => {
    const sb = supabaseBrowser();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/signin?next=${encodeURIComponent(next)}`,
        // Ask for Gmail send permission in the same consent, and force offline +
        // consent so Google returns a refresh token we can use to send later.
        scopes: "https://www.googleapis.com/auth/gmail.compose",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  return (
    <div className="pt-32 pb-20 max-w-md mx-auto px-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
      <p className="text-gray-500 text-sm mb-8">
        Sign in with Google to claim your <span className="font-semibold text-blue-800">25 free drafts</span>, save your details for next time, and let us send your approved emails from your Gmail — all in one step.
      </p>

      {loading ? (
        <Loader2 className="animate-spin mx-auto text-blue-700" />
      ) : email ? (
        <p className="text-emerald-700 flex items-center justify-center gap-2"><Check size={16} /> Signed in as {email}</p>
      ) : (
        <button
          onClick={signIn}
          className="btn-outline w-full flex items-center justify-center gap-3 py-3"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      )}

      <p className="text-xs text-gray-400 mt-6">
        One free trial per account. Your info is saved so you can come back and order more anytime.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return <Suspense><SignInInner /></Suspense>;
}
