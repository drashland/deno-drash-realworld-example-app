import { connectPg, PgConn } from "./deps.ts";

export const db: PgConn = await connectPg({
  username: "user",
  password: "userpassword",
  database: "realworld",
  hostname: "realworld_postgres",
  port: 5432,
  sslMode: "disable",
});
