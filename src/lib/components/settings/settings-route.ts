import type { RouteId } from '$app/types';

export type SettingsRoute = Extract<
  RouteId,
  '/settings/appearance' | '/settings/reading' | '/settings/sync' | '/settings/tracking'
>;

export const settingsRoutes: SettingsRoute[] = [
  '/settings/appearance',
  '/settings/reading',
  '/settings/tracking',
  '/settings/sync'
];
