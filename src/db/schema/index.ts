export * from "./auth";
export * from "./content";
export * from "./gallery";
export * from "./media";
export * from "./menu";
export * from "./reservations";
export * from "./system";

import * as auth from "./auth";
import * as content from "./content";
import * as gallery from "./gallery";
import * as media from "./media";
import * as menu from "./menu";
import * as reservations from "./reservations";
import * as system from "./system";

export const schema = {
  ...auth,
  ...content,
  ...gallery,
  ...media,
  ...menu,
  ...reservations,
  ...system,
};
