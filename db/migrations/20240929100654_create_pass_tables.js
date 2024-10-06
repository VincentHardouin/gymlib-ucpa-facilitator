/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable('devices', (table) => {
    table.string('deviceLibraryIdentifier').primary();
    table.string('pushToken').notNullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('passes', (table) => {
    table.string('passTypeIdentifier').notNullable();
    table.string('serialNumber').notNullable().unique();
    table.string('nextEvent').defaultTo(null);
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('registrations', (table) => {
    table.string('passTypeIdentifier');
    table.string('serialNumber').references('passes.serialNumber');
    table.string('deviceLibraryIdentifier').references('devices.deviceLibraryIdentifier');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.dropTable('registrations');
  await knex.schema.dropTable('passes');
  await knex.schema.dropTable('devices');
};

export {
  down,
  up,
};
