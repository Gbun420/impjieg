import test from "node:test";
import assert from "node:assert/strict";
import { assertEmployerOwnsGrant, isEligibleAdminUser } from "./access";

test("employer ownership check allows the matching employer", async () => {
  const employer = await assertEmployerOwnsGrant(
    "user-1",
    "employer-1",
    {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  async single() {
                    return {
                      data: {
                        id: "employer-1",
                        user_id: "user-1",
                        name: "Atlas Studio",
                        slug: "atlas-studio",
                      },
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      },
    } as never
  );

  assert.equal(employer.id, "employer-1");
});

test("employer ownership check rejects another employer", async () => {
  await assert.rejects(
    () =>
      assertEmployerOwnsGrant("user-1", "employer-2", {
        from() {
          return {
            select() {
              return {
                eq() {
                  return {
                    async single() {
                      return {
                        data: {
                          id: "employer-1",
                          user_id: "user-1",
                          name: "Atlas Studio",
                          slug: "atlas-studio",
                        },
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        },
      } as never),
    /own commercial grants/
  );
});

test("eligible admin users require both admin role metadata and allowlisted email", () => {
  assert.equal(
    isEligibleAdminUser({
      id: "admin-1",
      email: "admin@example.com",
      app_metadata: { role: "admin" },
    }),
    false
  );

  assert.equal(
    isEligibleAdminUser({
      id: "admin-2",
      email: "info@dopaminedigital.co",
      app_metadata: { role: "admin" },
    }),
    true
  );
});
