type Permissions = Parameters<typeof browser.permissions.request>[0];

export type DataCollection = 'authenticationInfo' | 'locationInfo';

// `data_collection` is a Firefox-only permissions field. Chromium doesn't
// recognize the key, so only include it in Firefox builds.
export function withDataCollection(
  permissions: Permissions,
  dataCollection: DataCollection,
): Permissions {
  if (!import.meta.env.FIREFOX) return permissions;
  return { ...permissions, data_collection: [dataCollection] } as Permissions;
}
