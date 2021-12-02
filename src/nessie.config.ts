import { config } from "./config.ts";
import { ClientPostgreSQL } from "./deps.ts";

const client = new ClientPostgreSQL({
  database: config.database.database,
  hostname: config.database.hostname,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  tls: {
    enforce: false,
  },
});

export default {
  client,
  migrationFolders: ["./db/migrations"],
  seedFolders: ["./db/seeds"],
};
