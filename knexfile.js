// Update with your config settings.

const schema = process.env.DB_SCHEMA || 'public';

module.exports = {
  development: {
    client: 'postgresql',
    searchPath: schema,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password'
    },
    migrations: {
      tableName: '_knex_migrations',
      schemaName: schema,
    },
    pool: {
      ping: function (c, cb) {
        c.query({sql: 'SELECT 1'}, [], cb);
      },
      pingTimeout: 5 * 1000,
      min: 2,
      max: 10,
    },
    //wrapIdentifier: (value, origImpl, queryContext) => origImpl(convertToSnakeCase(value))
  },

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },
  //
  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'postgres',
  //     user:     'postgres',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

};
