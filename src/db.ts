import { PostgresClient } from "./deps.ts";
import { config } from "./config.ts"

export const db = new PostgresClient({
  database: config.database.database,
  hostname: config.database.hostname,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  tls: {
      enforce: false,
  },
});
