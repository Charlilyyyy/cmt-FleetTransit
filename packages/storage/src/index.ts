export type { StorageAdapter, TripListFilters } from './adapter';
export { SupabaseAdapter } from './supabase-adapter';
export {
  createBrowserClient,
  createServiceClient,
  createUserScopedClient,
  type BrowserSupabaseEnv,
  type ServiceSupabaseEnv,
} from './supabase-client';
export * from './mappers';
