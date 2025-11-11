import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export async function newDriver() {
  const options = new chrome.Options()
    .addArguments("--headless=new", "--no-sandbox", "--disable-gpu", "--window-size=1280,800");
  return await new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

export { By, until };
