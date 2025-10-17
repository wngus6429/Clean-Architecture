import { ping } from "../db";

(async () => {
  try {
    const rows = await ping();
    console.log("DB ping OK:", rows);
    process.exit(0);
  } catch (e) {
    console.error("DB ping FAILED:", e);
    process.exit(1);
  }
})();
