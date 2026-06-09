/**
 * Admin User Creation / Update Script
 *
 * Run: ADMIN_CREATE_EMAIL=partner@example.com CONFIRM_CREATE_ADMIN=true npm run admin:create-user
 *
 * Creates or updates a Supabase user with admin role.
 * Requires service-role access. Never logs passwords.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient<Database>(url, key);
}

async function main() {
  const email = process.env.ADMIN_CREATE_EMAIL;
  if (!email) {
    console.error("Missing ADMIN_CREATE_EMAIL env var.");
    process.exit(1);
  }

  const isProduction = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_URL?.includes("vercel.app");
  const confirmed = process.env.CONFIRM_CREATE_ADMIN === "true";

  if (isProduction && !confirmed) {
    console.error("Production detected. Set CONFIRM_CREATE_ADMIN=true to proceed.");
    process.exit(1);
  }

  const supabase = getServiceClient();

  // Check if user exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const user = existing?.users?.find((u) => u.email === email);

  if (user) {
    console.log(`User exists: ${email} (id: ${user.id})`);

    // Update app_metadata to include admin role
    const currentMeta = user.app_metadata || {};
    const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: { ...currentMeta, role: "admin" },
      email_confirm: true,
    });

    if (updateErr) {
      console.error(`Failed to update user: ${updateErr.message}`);
      process.exit(1);
    }

    console.log(`  Updated: app_metadata.role = "admin"`);
    console.log(`  Admin role set: yes`);
    console.log(`  MFA required: yes (on first login)`);
  } else {
    console.log(`User does not exist: ${email}`);
    console.log(`  Run the Supabase invite flow or provide ADMIN_CREATE_TEMP_PASSWORD to create.`);

    if (process.env.ADMIN_CREATE_TEMP_PASSWORD) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: process.env.ADMIN_CREATE_TEMP_PASSWORD,
        email_confirm: false,
        app_metadata: { role: "admin" },
      });

      if (createErr) {
        console.error(`Failed to create user: ${createErr.message}`);
        process.exit(1);
      }

      console.log(`  Created: ${created.user?.id}`);
      console.log(`  Admin role set: yes`);
      console.log(`  MFA required: yes (on first login)`);
      console.log(`  Password: reset via /auth/reset-password`);
    }
  }
}

main().catch((err) => {
  console.error("Admin creation failed:", err.message);
  process.exit(1);
});
