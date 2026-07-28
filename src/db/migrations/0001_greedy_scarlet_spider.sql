CREATE TABLE "reservation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"actor_id" text,
	"actor_name" text,
	"from_status" "reservation_status",
	"to_status" "reservation_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opening_hours" ALTER COLUMN "opens_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "opening_hours" ALTER COLUMN "closes_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "opening_hours" ADD COLUMN "is_closed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "slot_minutes" smallint DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "max_covers_per_slot" smallint DEFAULT 40 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "lead_time_minutes" smallint DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "max_party_size" smallint DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "booking_horizon_days" smallint DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "last_service_minutes" smallint DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation_events" ADD CONSTRAINT "reservation_events_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_events" ADD CONSTRAINT "reservation_events_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservation_events_reservation_idx" ON "reservation_events" USING btree ("reservation_id","created_at");--> statement-breakpoint
CREATE INDEX "special_hours_day_idx" ON "special_hours" USING btree ("day");--> statement-breakpoint
-- Les horaires historiques n'étaient stockés que pour les jours 1, 5 et 7, la
-- plage couverte étant encodée dans le libellé (« Lundi — Jeudi »). On étend en
-- grille de sept jours en reportant le dernier jour défini, sinon mardi,
-- mercredi, jeudi et samedi basculeraient en « fermé » et la validation des
-- réservations refuserait ces jours. Sans ligne préexistante, on ne fait rien :
-- c'est une installation neuve et le seed s'en charge.
INSERT INTO "opening_hours" ("day_of_week", "is_closed", "opens_at", "closes_at", "label", "sort_order")
SELECT
  t."day_of_week",
  carried."opens_at" IS NULL,
  carried."opens_at",
  carried."closes_at",
  NULL,
  0
FROM generate_series(1, 7) AS t("day_of_week")
CROSS JOIN LATERAL (
  SELECT l."opens_at", l."closes_at"
  FROM "opening_hours" l
  WHERE l."sort_order" = 0 AND l."day_of_week" <= t."day_of_week"
  ORDER BY l."day_of_week" DESC
  LIMIT 1
) AS carried
WHERE EXISTS (SELECT 1 FROM "opening_hours")
  AND NOT EXISTS (
    SELECT 1 FROM "opening_hours" o
    WHERE o."day_of_week" = t."day_of_week" AND o."sort_order" = 0
  );--> statement-breakpoint
-- `label` désigne désormais un service (« Midi », « Soir ») et non plus une
-- plage de jours : le regroupement d'affichage est dérivé à la lecture. Les
-- anciens libellés (« Lundi — Jeudi », « Dimanche ») deviendraient des noms de
-- service erronés, on les efface tous.
UPDATE "opening_hours" SET "label" = NULL;--> statement-breakpoint
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_day_service_key" UNIQUE("day_of_week","sort_order");