import { PostgresClient } from "./deps.ts";

export const db = new PostgresClient({
  user: "user",
  password: "userpassword",
  database: "realworld",
  hostname: "realworld_postgres",
  port: 5432,
  tls: {
    enforce: false,
  },
});
