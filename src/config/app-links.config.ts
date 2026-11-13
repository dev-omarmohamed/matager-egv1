/**
 * Application Store & Download Links Configuration
 *
 * Set the store URLs when native apps are released.
 * If a link is `null`, the store button displays in a disabled state with "Coming soon".
 */
export interface AppLinksConfig {
  ios: string | null;
  android: string | null;
  web: string | null;
}

export const APP_LINKS: AppLinksConfig = {
  ios: null, // e.g. "https://apps.apple.com/app/matager/id123456789"
  android: null, // e.g. "https://play.google.com/store/apps/details?id=app.matager.pos"
  web: null,
};

