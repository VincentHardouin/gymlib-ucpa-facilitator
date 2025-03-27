/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.dropPrimary();
  });

  await knex.schema.alterTable('reservations', (table) => {
    table.increments('id').primary();
    table.boolean('is_subscription').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.dropPrimary('id');
  });

  await knex.schema.alterTable('reservations', (table) => {
    table.string('code').primary().alter();
    table.dropColumn('is_subscription');
  });
};
