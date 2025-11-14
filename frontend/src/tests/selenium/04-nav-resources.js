import { BASE } from "./config.js";
import { newDriver, By, until } from "./helpers.js";
export default async function testNavResources(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/");
    // Wait for the Resources link to be present before clicking
    const resourcesLink = await d.wait(until.elementLocated(By.linkText("Resources")), 10000);
    await resourcesLink.click();
    await d.wait(until.elementLocated(By.css("h1")), 5000);
  } finally { await d.quit(); }
}
