import { BASE } from "./config.js";
import { newDriver, By, until } from "./helpers.js";
export default async function testNavOrgs(){
  const d = await newDriver();
  try{
    await d.get(BASE + "/");
    // Wait for the Organizations link to be present before clicking
    const orgsLink = await d.wait(until.elementLocated(By.linkText("Organizations")), 10000);
    await orgsLink.click();
    await d.wait(until.elementLocated(By.css("h1")), 5000);
  } finally { await d.quit(); }
}
