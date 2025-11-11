import { BASE } from "./config.js";
import { newDriver } from "./helpers.js";
export default async function test404(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/nope-this-page");
    // just load without crashing
  } finally { await d.quit(); }
}
