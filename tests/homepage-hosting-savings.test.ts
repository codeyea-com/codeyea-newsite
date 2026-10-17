import { test } from "node:test";
import assert from "node:assert/strict";
import { annualPlanSavings } from "../src/content/homepage-hosting-savings";

test("the existing annual web prices show 20% savings without discounting twice", () => {
  for (const [monthly, annual] of [[7, 67.2], [12, 115.2], [19, 182.4]]) {
    const plan = { monthlyPrice: `$${monthly}`, annualPrice: `$${annual}` };
    assert.deepEqual(annualPlanSavings(plan), { percent: 20, regularAnnual: `$${monthly * 12}` });
    assert.equal(plan.annualPrice, `$${annual}`);
  }
});

test("undiscounted email plans and unconfirmed prices do not advertise a discount", () => {
  for (const plan of [
    { monthlyPrice: "$2", annualPrice: "$24" },
    { monthlyPrice: "TBC", annualPrice: "TBC" },
    { monthlyPrice: "$0", annualPrice: "$0" },
    { monthlyPrice: "$7", annualPrice: "$90" },
  ]) assert.equal(annualPlanSavings(plan), null);
});
