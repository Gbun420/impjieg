import test from "node:test";
import assert from "node:assert/strict";
import { generateUniqueSlug, insertWithUniqueSlugRetry } from "./unique-slug";

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

test("insertWithUniqueSlugRetry retries duplicate key errors with a new slug", async () => {
  const seenSlugs: string[] = [];
  let attempts = 0;

  const result = await insertWithUniqueSlugRetry({
    baseSlug: "atlas-studio",
    insert: async (slug) => {
      seenSlugs.push(slug);
      attempts += 1;

      if (attempts < 3) {
        return {
          data: null,
          error: { code: "23505", message: "duplicate key value violates unique constraint" },
        };
      }

      return {
        data: { id: "job_1", slug },
        error: null,
      };
    },
  });

  assert.equal(attempts, 3);
  assert.equal(result.error, null);
  assert.deepEqual(result.data, { id: "job_1", slug: seenSlugs[2] });
  assert.equal(new Set(seenSlugs).size, 3);
});
