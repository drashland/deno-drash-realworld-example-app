import { PostgresClient } from "../deps.ts";

const dbConn = new PostgresClient({
  user: "user",
  database: "realworld",
  hostname: "realworld_postgres",
  port: 5432,
});

export default dbConn;
