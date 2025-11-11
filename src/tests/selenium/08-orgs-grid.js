import { BASE } from "./config.js";
import { newDriver, By } from "./helpers.js";
export default async function testOrgsGrid(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/organizations");
    await d.findElements(By.css(".card"));
  } finally { await d.quit(); }
}
