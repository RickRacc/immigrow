import { BASE } from "./config.js";
import { newDriver, By } from "./helpers.js";
export default async function testFooter(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/");
    await d.findElement(By.xpath("//*[contains(.,'Immigrow')]"));
  } finally { await d.quit(); }
}
