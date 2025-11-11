import { BASE } from "./config.js";
import { newDriver, By } from "./helpers.js";
export default async function testEventsGrid(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/events");
    await d.findElements(By.css(".card")); // fine if zero
  } finally { await d.quit(); }
}
