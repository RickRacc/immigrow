import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export async function newDriver() {
  const options = new chrome.Options()
    .addArguments("--headless=new", "--no-sandbox", "--disable-gpu", "--window-size=1280,800");

  // Use system chromedriver in CI (matches system chromium version)
  const service = new chrome.ServiceBuilder();
  if (process.env.CI) {
    service.setPath('/usr/bin/chromedriver');
  }

  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();
}

export { By, until };
