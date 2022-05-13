import { State } from "../deps.ts";

async function migrate() {
  const state = await State.init({
    config: "./nessie.config.ts",
    debug: false,
  });
  await state.client.prepare();
  await state.client.migrate(undefined);
  await state.client.close();
}

async function rollback() {
  const state = await State.init({
    config: "./nessie.config.ts",
    debug: false,
  });
  await state.client.prepare();
  await state.client.rollback("all");
  await state.client.close();
}

export async function test(
  t: Deno.TestContext,
  name: string,
  cb: (() => Promise<void> | void),
) {
  try {
    await t.step(name, cb);
  } finally {
    // define a new console
    const Console = (function (oldConsole: Console) {
      return {
        ...oldConsole,
        info: function (text: string) {
          let isNessie = false;
          for (
            const item of [
              "Rollback",
              "Rolling back",
              "Migrating",
              "Done",
              "Migrated",
              "Migrations",
              "Starting",
            ]
          ) {
            if (text.includes(item)) {
              isNessie = true;
              break;
            }
          }
          if (!isNessie) {
            oldConsole.info(text);
          }
        },
      };
      // deno-lint-ignore no-window-prefix
    }(window.console));

    //Then redefine the old console
    // deno-lint-ignore no-global-assign
    console = Console as unknown as Console;
    await rollback();
    await migrate();
  }
}
