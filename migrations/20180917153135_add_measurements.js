
exports.up = function(knex, Promise) {
  return knex.schema.createTable('measurements', function (table) {
    table.increments('id');
    table.string('donor_id');
    table.timestamp('date');
    table.string('type');
    table.string('amount');
    table.string('unit');
    table.string('reference');
    table.string('source');
    table.string('row_no');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('measurements');
};
