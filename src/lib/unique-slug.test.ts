import test from "node:test";
import assert from "node:assert/strict";
import { generateUniqueSlug } from "./unique-slug";

test("generateUniqueSlug retries until it finds an unused slug", async () => {
  const attempts: string[] = [];
  const slug = await generateUniqueSlug("atlas-studio", async (candidate) => {
    attempts.push(candidate);
    return attempts.length < 3;
  });

  assert.equal(attempts.length, 3);
  assert.equal(slug, attempts[2]);
  assert.match(slug, /^atlas-studio-[a-z0-9]{4}$/);
});

test("generateUniqueSlug falls back to a default base slug when blank", async () => {
  const slug = await generateUniqueSlug("", async () => false);

  assert.match(slug, /^item-[a-z0-9]{4}$/);
});
