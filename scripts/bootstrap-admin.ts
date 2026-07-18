import * as v from "valibot";
import { db, eq } from "@/api/lib/db";
import { auth } from "@/api/plugins/better-auth.plugin";
import { user } from "@/db/schema/auth";

const InputSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(12)),
  name: v.pipe(v.string(), v.minLength(2)),
});

const input = v.parse(InputSchema, {
  email: process.env.BOOTSTRAP_ADMIN_EMAIL,
  password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  name: process.env.BOOTSTRAP_ADMIN_NAME ?? "Administration Indian Coffee",
});

const created = await auth.api.createUser({
  body: { ...input, role: "admin" },
});

await db
  .update(user)
  .set({ emailVerified: true, role: "admin" })
  .where(eq(user.id, created.user.id));
console.info(`Administrator account created for ${created.user.email}.`);
