export * from './rbac';
export * from './claims';
export * from './firebase-client';
export * from './firebase-admin';
export * from './line-auth';

export const SESSION_COOKIE_NAME = 'cmt_session';
export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000; // 5 days
