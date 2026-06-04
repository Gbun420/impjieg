import { redirect } from "next/navigation";

export default async function LoginAliasPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) {
      query.set(key, value);
    }
  }

  redirect(`/auth/login${query.toString() ? `?${query.toString()}` : ""}`);
}
