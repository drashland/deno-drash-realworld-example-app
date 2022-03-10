export async function test(cb: (() => Promise<void> | void)) {
  try {
    await cb();
  } finally {
    const p1 = Deno.run({
      cmd: ["/root/.deno/bin/nessie", "rollback", "all"],
      stderr: "null",
      stdout: "null",
    });
    await p1.status();
    p1.close();
    const p2 = Deno.run({
      cmd: ["/root/.deno/bin/nessie", "migrate"],
      stderr: "null",
      stdout: "null",
    });
    await p2.status();
    p2.close();
  }
}
