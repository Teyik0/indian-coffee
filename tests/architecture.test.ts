import { describe, expect, test } from "bun:test";
import { hasAdminPermission, isBackOfficeRole } from "@/api/lib/permissions";
import {
  legacyMenuMigrationCount,
  legacyMenuSeed,
} from "@/api/modules/menu/data";
import { legacyMenuEntries } from "@/api/modules/menu/legacy.generated";
import { adminRoutes } from "@/components/admin/routes";

describe("legacy menu migration", () => {
  test("preserves every historical menu item and variant", () => {
    expect(legacyMenuMigrationCount).toBe(215);
    expect(legacyMenuEntries).toHaveLength(215);
    expect(
      legacyMenuEntries.filter((entry) => entry.kind === "item")
    ).toHaveLength(65);
    expect(
      legacyMenuEntries.filter((entry) => entry.kind === "variant")
    ).toHaveLength(150);
  });

  test("builds all public categories with priced variants", () => {
    expect(legacyMenuSeed.map((category) => category.slug)).toEqual([
      "menus",
      "starters",
      "vegetarian-dishes",
      "main-courses",
      "specialties",
      "desserts",
      "drinks",
      "wines",
    ]);
    const migratedVariants = legacyMenuSeed.flatMap((category) =>
      category.sections.flatMap((section) =>
        section.items.flatMap((item) => item.variants)
      )
    );
    expect(migratedVariants.every((variant) => variant.priceCents > 0)).toBe(
      true
    );
  });
});

describe("typed admin navigation", () => {
  test("keeps logical paths free of the physical prefix", () => {
    expect(adminRoutes.dashboard).toBe("/");
    expect(adminRoutes.gallery).toBe("/gallery");
    expect(adminRoutes.content).toBe("/content");
    expect(adminRoutes.hours).toBe("/hours");
    expect(adminRoutes.reservations).toBe("/reservations");
    expect(adminRoutes.users).toBe("/users");
    expect(adminRoutes.menuItem("dish-id")).toBe("/menu/dish-id");
    expect(adminRoutes.reservation("booking-id")).toBe(
      "/reservations/booking-id"
    );
  });
});

describe("admin permissions", () => {
  // L'assertion précédente exigeait qu'`editor` n'ait *aucun* droit, ce qui
  // figeait un défaut : `hasAdminPermission` ignorait son argument
  // `permission` et le rôle par défaut de Better Auth était inutilisable.
  test("grants the service permissions to the dining-room role", () => {
    expect(hasAdminPermission("editor", "dashboard:read")).toBe(true);
    expect(hasAdminPermission("editor", "menu:write")).toBe(true);
    expect(hasAdminPermission("editor", "gallery:write")).toBe(true);
    expect(hasAdminPermission("editor", "content:write")).toBe(true);
    expect(hasAdminPermission("editor", "hours:write")).toBe(true);
    expect(hasAdminPermission("editor", "reservations:write")).toBe(true);
  });

  test("reserves account management to administrators", () => {
    expect(hasAdminPermission("editor", "users:read")).toBe(false);
    expect(hasAdminPermission("editor", "users:write")).toBe(false);
    expect(hasAdminPermission("admin", "users:read")).toBe(true);
    expect(hasAdminPermission("admin", "users:write")).toBe(true);
  });

  test("denies every permission outside the back-office roles", () => {
    // `customer` est le rôle attribué par une inscription sociale : il ne doit
    // ouvrir aucun écran.
    for (const permission of [
      "dashboard:read",
      "menu:write",
      "users:read",
    ] as const) {
      expect(hasAdminPermission("customer", permission)).toBe(false);
      expect(hasAdminPermission(null, permission)).toBe(false);
      expect(hasAdminPermission(undefined, permission)).toBe(false);
    }
    expect(isBackOfficeRole("customer")).toBe(false);
    expect(isBackOfficeRole("admin")).toBe(true);
    expect(isBackOfficeRole("editor")).toBe(true);
  });
});
