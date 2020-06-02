import { PostgresClient } from "../deps.ts";

export const client = new PostgresClient({
    user: "user",
    password: "userpassword",
    database: "realworld",
    hostname: "realworld_postgres",
    port: 5432
});

export const execute = async (query: string) => {
  try {
    await client.connect();
    await client.query(query);
  } catch (error) {
    console.log(error);
  }
};
