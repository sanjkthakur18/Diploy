const { pgTable, serial, text, varchar, decimal, timestamp, pgEnum, integer } = require("drizzle-orm/pg-core");
const { relations } = require("drizzle-orm");
const { createInsertSchema, createSelectSchema } = require("drizzle-zod");
const { z } = require("zod");

const productStatusEnum = pgEnum("product_status", [
    "created_locally",
    "synced_to_woocommerce", 
    "sync_failed"
]);

const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
    status: productStatusEnum("status").default("created_locally").notNull(),
    woocommerceId: integer("woocommerce_id"),
    userId: integer("user_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const usersRelations = relations(users, ({ many }) => ({
    products: many(products),
}));

const productsRelations = relations(products, ({ one }) => ({
    user: one(users, {
        fields: [products.userId],
        references: [users.id],
    }),
}));

const insertUserSchema = createInsertSchema(users, {
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
});

const selectUserSchema = createSelectSchema(users);

const insertProductSchema = createInsertSchema(products, {
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal"),
    imageUrl: z.string().url().optional(),
});

const selectProductSchema = createSelectSchema(products);

const updateProductSchema = insertProductSchema.partial().omit({ userId: true });

module.exports = {
    productStatusEnum,
    users,
    products,
    usersRelations,
    productsRelations,
    insertUserSchema,
    selectUserSchema,
    insertProductSchema,
    selectProductSchema,
    updateProductSchema
};
