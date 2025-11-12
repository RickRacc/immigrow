import { BASE } from "./config.js";
import { newDriver, By, until } from "./helpers.js";

export default async function testTitle() {
  const d = await newDriver();
  try {
    await d.get(BASE + "/");
    await d.wait(until.titleContains("Immigrow"), 5000);
    const title = await d.getTitle();
    if (!title.includes("Immigrow")) {
      throw new Error(`Expected title to contain 'Immigrow', but got: ${title}`);
    }
  } finally {
    await d.quit();
  }
}
