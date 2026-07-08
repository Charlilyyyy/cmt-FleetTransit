import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type BrowserSupabaseEnv = {
  url: string;
  anonKey: string;
};

export type ServiceSupabaseEnv = BrowserSupabaseEnv & {
  serviceRoleKey: string;
};

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

/** Browser / Next public client (anon key). Prefer explicit args in packages; env is a convenience. */
export function createBrowserClient(env?: Partial<BrowserSupabaseEnv>): SupabaseClient {
  const url = env?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env?.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'), requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}

/** Server client with service role — bypasses RLS. Never expose to the browser. */
export function createServiceClient(env?: Partial<ServiceSupabaseEnv>): SupabaseClient {
  const url = env?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = env?.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(
    requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL'),
    requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/** Server client with user JWT for RLS-scoped queries. */
export function createUserScopedClient(
  accessToken: string,
  env?: Partial<BrowserSupabaseEnv>
): SupabaseClient {
  const url = env?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env?.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'), requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
