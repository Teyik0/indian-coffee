import * as Effect from "effect4/Effect";
import * as Schema from "effect4/Schema";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const Email = Schema.String.check(
  Schema.makeFilter((value) => EMAIL_PATTERN.test(value), {
    message: "Indiquez une adresse email valide.",
  })
);

export const UrlString = Schema.String.check(
  Schema.makeFilter((value) => URL.canParse(value), {
    message: "Indiquez une URL valide.",
  })
);

export const IsoDate = Schema.String.check(
  Schema.makeFilter(
    (value) => {
      if (!ISO_DATE_PATTERN.test(value)) {
        return false;
      }
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    },
    { message: "Choisissez une date valide." }
  )
);

export const Uuid = Schema.String.check(
  Schema.isUUID(undefined, { message: "Identifiant invalide." })
);

export const Version = Schema.Int.check(Schema.isGreaterThanOrEqualTo(1));

export const NumberInput = Schema.Union([
  Schema.Number,
  Schema.NumberFromString,
]);

export function boundedString(
  minimum: number,
  maximum: number,
  options?: { readonly trim?: boolean; readonly minimumMessage?: string }
) {
  return (options?.trim ? Schema.Trim : Schema.String).check(
    Schema.isMinLength(
      minimum,
      options?.minimumMessage ? { message: options.minimumMessage } : undefined
    ),
    Schema.isMaxLength(maximum)
  );
}

export function boundedInt(
  minimum: number,
  maximum: number,
  messages?: { readonly minimum?: string; readonly maximum?: string }
) {
  return Schema.Int.check(
    Schema.isGreaterThanOrEqualTo(
      minimum,
      messages?.minimum ? { message: messages.minimum } : undefined
    ),
    Schema.isLessThanOrEqualTo(
      maximum,
      messages?.maximum ? { message: messages.maximum } : undefined
    )
  );
}

export function boundedNumberInput(
  minimum: number,
  maximum: number,
  messages?: { readonly minimum?: string; readonly maximum?: string }
) {
  return NumberInput.check(
    Schema.isInt(),
    Schema.isGreaterThanOrEqualTo(
      minimum,
      messages?.minimum ? { message: messages.minimum } : undefined
    ),
    Schema.isLessThanOrEqualTo(
      maximum,
      messages?.maximum ? { message: messages.maximum } : undefined
    )
  );
}

export function mutableArray<S extends Schema.Constraint>(schema: S) {
  return Schema.Array(schema).pipe(Schema.mutable);
}

export function defaulted<S extends Schema.Constraint>(
  schema: S,
  value: S["Encoded"]
) {
  return Schema.withDecodingDefault(Effect.succeed(value))(schema);
}

export function standard<S extends Schema.ConstraintDecoder<unknown>>(
  schema: S
) {
  return Schema.toStandardSchemaV1(schema);
}
