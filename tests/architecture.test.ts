import { describe, expect, test } from "bun:test";
import { hasAdminPermission } from "@/api/lib/protected-admin-page";
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
      legacyMenuEntries.filter((entry) => entry.kind === "item"),
    ).toHaveLength(65);
    expect(
      legacyMenuEntries.filter((entry) => entry.kind === "variant"),
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
        section.items.flatMap((item) => item.variants),
      ),
    );
    expect(migratedVariants.every((variant) => variant.priceCents > 0)).toBe(
      true,
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
      "/reservations/booking-id",
    );
  });
});

describe("admin permissions", () => {
  test("reserves every back-office permission to admins", () => {
    expect(hasAdminPermission("editor", "menu:write")).toBe(false);
    expect(hasAdminPermission("editor", "reservations:write")).toBe(false);
    expect(hasAdminPermission("editor", "users:read")).toBe(false);
    expect(hasAdminPermission("admin", "users:read")).toBe(true);
  });
});
