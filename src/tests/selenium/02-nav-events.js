import { BASE } from "./config.js";
import { newDriver, By, until } from "./helpers.js";
export default async function testNavEvents(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/");
    await d.findElement(By.linkText("Events")).click();
    await d.wait(until.elementLocated(By.css("h1")), 5000);
  } finally { await d.quit(); }
}
