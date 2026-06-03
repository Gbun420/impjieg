import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export function createClient() {
  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        async get(name: string) {
          try {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignore during prerendering
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // Ignore during prerendering
          }
        },
      },
    }
  );
}
