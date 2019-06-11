module.exports = {
  type: 'postgres',
  host: process.env.DB_HOSTNAME,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: ['build/entity/**/*.js'],
  migrations: ['build/migration/**/*.ts'],
  subscribers: ['build/subscriber/**/*.js'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
  provider_uri: process.env.WEB3_PROVIDER_HOST,
}
