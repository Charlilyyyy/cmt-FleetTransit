import 'server-only';

import { createServiceClient, SupabaseAdapter } from '@cmt/storage';

/**
 * Server-side storage adapter using the service role key.
 * RLS is bypassed — callers MUST enforce tenant scope from the verified session.
 */
export function getServerStorage(): SupabaseAdapter {
  return new SupabaseAdapter(createServiceClient());
}
