import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  doublePrecision,
  smallint,
  bigint,
  primaryKey,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// NextAuth tables — column names must match what @auth/drizzle-adapter expects
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }),
  image: text("image"),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: bigint("expires_at", { mode: "number" }),
  token_type: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------
export const savedProperties = pgTable("saved_properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 500 }).notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
  kommunenummer: varchar("kommunenummer", { length: 4 }),
  postnummer: varchar("postnummer", { length: 4 }),
  notes: text("notes"),
  savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }).notNull(),
  address: text("address"),
  kommunenummer: varchar("kommunenummer", { length: 4 }),
  active: boolean("active").default(true),
  unsubscribeToken: varchar("unsubscribe_token", { length: 64 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const priceAlerts = pgTable("price_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kommunenummer: varchar("kommunenummer", { length: 4 }).notNull(),
  postnummer: varchar("postnummer", { length: 4 }),
  thresholdPct: doublePrecision("threshold_pct").default(5.0),
  lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const neighborhoodReviews = pgTable("neighborhood_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kommunenummer: varchar("kommunenummer", { length: 4 }).notNull(),
  postnummer: varchar("postnummer", { length: 4 }),
  rating: smallint("rating").notNull(),
  pros: text("pros"),
  cons: text("cons"),
  livedYears: smallint("lived_years"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
