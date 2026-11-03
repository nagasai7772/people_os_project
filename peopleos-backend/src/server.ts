import { app } from "./app";
import { env } from "./config/env";
import { pool } from "./database/pool";
async function start() {
  await pool.query("SELECT 1");
  app.listen(env.PORT, () => console.log(`PeopleOS API running on http://localhost:${env.PORT}`));
}
start().catch((error) => { console.error("Failed to start API", error); process.exit(1); });
