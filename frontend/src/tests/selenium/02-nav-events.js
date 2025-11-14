import { BASE } from "./config.js";
import { newDriver, By, until } from "./helpers.js";
export default async function testNavEvents(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/");
    // Wait for the Events link to be present before clicking
    const eventsLink = await d.wait(until.elementLocated(By.linkText("Events")), 10000);
    await eventsLink.click();
    await d.wait(until.elementLocated(By.css("h1")), 5000);
  } finally { await d.quit(); }
}
