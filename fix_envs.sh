npx vercel env add NEXT_PUBLIC_SUPABASE_URL production < <(echo "https://dummy.supabase.co")
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < <(echo "dummy_anon_key")
npx vercel deploy --prod --yes
