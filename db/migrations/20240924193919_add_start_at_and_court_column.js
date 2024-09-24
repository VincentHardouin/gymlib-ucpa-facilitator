/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.dateTime('start_at').nullable();
    table.string('court').nullable();
    table.string('activity').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.dropColumn('start_at');
    table.dropColumn('court');
    table.dropColumn('activity');
  });
};

export {
  down,
  up,
};
