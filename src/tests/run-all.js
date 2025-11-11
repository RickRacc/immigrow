import t1 from "./01-home.js";
import t2 from "./02-nav-events.js";
import t3 from "./03-nav-orgs.js";
import t4 from "./04-nav-resources.js";
import t5 from "./05-title.js";
import t6 from "./06-footer.js";
import t7 from "./07-events-grid.js";
import t8 from "./08-orgs-grid.js";
import t9 from "./09-resources-grid.js";
import t10 from "./10-404.js";

const tests = [t1,t2,t3,t4,t5,t6,t7,t8,t9,t10];

(async () => {
  for (const fn of tests) {
    process.stdout.write(`→ ${fn.name || "test"} ... `);
    try { await fn(); console.log("OK"); }
    catch(e){ console.error("FAIL", e); process.exit(1); }
  }
  process.exit(0);
})();
