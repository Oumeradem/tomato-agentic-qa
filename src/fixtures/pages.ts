import { Page } from '@playwright/test';

/**
 * Central composition point for every page object a scenario can use.
 *
 * Page objects are wired together once per scenario against a fresh page
 * (dependency injection / fixture). `CustomWorld.initPageObjects()` builds them
 * in the `Before` hook (see src/support/world.ts).
 *
 * As the project grows, import your pages and components here and add them to
 * the interface, e.g.:
 *
 *   import { HomePage } from '../pages/HomePage';
 *   import { Header } from '../pages/components/Header';
 *
 *   export interface PageObjects {
 *     readonly header: Header;
 *     readonly homePage: HomePage;
 *   }
 *
 *   export function createPageObjects(page: Page): PageObjects {
 *     const header = new Header(page);
 *     return { header, homePage: new HomePage(page, header) };
 *   }
 */
// Intentionally empty until the first page object is added to the project.
/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
export interface PageObjects {
  // readonly homePage: HomePage;
}

/** Composes the page objects for a fresh page (dependency injection / fixture). */
export function createPageObjects(_page: Page): PageObjects {
  return {};
}
