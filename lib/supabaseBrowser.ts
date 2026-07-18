"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Singleton browser client for auth (persists the session in localStorage and
// auto-detects the OAuth callback in the URL after Google sign-in).
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
    );
  }
  return client;
}
