import { BASE } from "./config.js";
import { newDriver } from "./helpers.js";
export default async function testTitle(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/");
    await d.getTitle(); // smoke
  } finally { await d.quit(); }
}
