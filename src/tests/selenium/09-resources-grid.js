import { BASE } from "./config.js";
import { newDriver, By } from "./helpers.js";
export default async function testResourcesGrid(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/resources");
    await d.findElements(By.css(".card"));
  } finally { await d.quit(); }
}
