import { describe, expect, test } from "bun:test";
import { adminRoutes, isActiveAdminPath } from "@/components/admin/routes";

describe("isActiveAdminPath", () => {
  test("active la page correspondant au chemin logique du routeur", () => {
    expect(isActiveAdminPath("/gallery", adminRoutes.gallery)).toBe(true);
    expect(isActiveAdminPath("/gallery", adminRoutes.reservations)).toBe(false);
  });

  test("accepte aussi un chemin physique préfixé par /admin", () => {
    expect(isActiveAdminPath("/admin/gallery", adminRoutes.gallery)).toBe(true);
  });

  test("conserve la section active sur un écran de détail", () => {
    expect(
      isActiveAdminPath("/reservations/42", adminRoutes.reservations)
    ).toBe(true);
    expect(isActiveAdminPath("/menu/42", adminRoutes.menu)).toBe(true);
  });

  test("n'active le tableau de bord que sur sa route exacte", () => {
    expect(isActiveAdminPath("/", adminRoutes.dashboard)).toBe(true);
    expect(isActiveAdminPath("/gallery", adminRoutes.dashboard)).toBe(false);
  });
});
