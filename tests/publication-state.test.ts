import { test } from "node:test";
import assert from "node:assert/strict";
import { hasUnpublishedChanges } from "../src/server/publication-state";
const snapshot = {
  title: "Home",
  sections: [
    { id: "positioning", type: "positioning", heading: "Hello", body: "Body" },
  ],
};
test("publication state compares saved content instead of a legacy status or JSON key order", () => {
  assert.equal(
    hasUnpublishedChanges(snapshot, {
      sections: snapshot.sections,
      title: "Home",
    }),
    false,
  );
  assert.equal(
    hasUnpublishedChanges({ ...snapshot, title: "New" }, snapshot),
    true,
  );
  assert.equal(
    hasUnpublishedChanges(
      {
        ...snapshot,
        sections: [{ ...snapshot.sections[0], heading: "Changed" }],
      },
      snapshot,
    ),
    true,
  );
  assert.equal(hasUnpublishedChanges(snapshot, null), true);
  assert.equal(hasUnpublishedChanges(snapshot, { status: "PUBLISHED" }), true);
});
