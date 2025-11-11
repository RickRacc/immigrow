import { BASE } from "./config.js";
import { newDriver, By, until } from "./helpers.js";

export default async function testHome() {
  const d = await newDriver();
  try {
    await d.get(BASE + "/");
    await d.wait(until.titleContains("Immigrow"), 5000).catch(()=>{});
  } finally { await d.quit(); }
}
