
exports.up = function(knex, Promise) {
  return knex.schema.createTable('diagnosis', function (table) {
    table.increments('id');
    table.string('donor_id');
    table.timestamp('start_date');
    table.timestamp('end_date');
    table.string('icd10_code');
    table.string('source');
    table.string('row_no');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('diagnosis');
};
