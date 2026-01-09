# Weekly Digest Edge Function

Sends weekly digest emails to users who have enabled the digest feature.

## Schedule

Configured to run every Sunday at 8:00 AM UTC.

## Required Secrets

Set these in your Supabase project dashboard under Edge Functions > Secrets:

- `RESEND_API_KEY` - Your Resend API key
- `APP_URL` - Your app URL (e.g., `https://quotidian.app`)

The following are automatically available:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

## Deployment

```bash
# Deploy the function
supabase functions deploy weekly-digest

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set APP_URL=https://quotidian.app
```

## Cron Setup

After deploying, set up the cron job in the Supabase dashboard:

1. Go to Database > Extensions and enable `pg_cron` if not already enabled
2. Run this SQL in the SQL Editor:

```sql
-- Schedule weekly digest for every Sunday at 8:00 AM UTC
SELECT cron.schedule(
  'weekly-digest-job',
  '0 8 * * 0',  -- Every Sunday at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://<project-ref>.supabase.co/functions/v1/weekly-digest',
      headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

Replace `<project-ref>` with your Supabase project reference and `<service-role-key>` with your service role key.

## Manual Testing

Test the function manually:

```bash
# Invoke locally
supabase functions serve weekly-digest --env-file .env.local

# In another terminal
curl -X POST http://localhost:54321/functions/v1/weekly-digest \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json"
```

## What It Does

1. Queries all users with `digest_enabled = true` in preferences
2. For each user:
   - Fetches their email from auth.users
   - Fetches favorites from the last 7 days
   - Fetches journal entries from the last 7 days
   - Fetches quote history from the last 7 days
3. Builds personalized digest with:
   - Most recent favorited quote as "Quote of the Week"
   - Longest reflection as highlight
   - Week stats (quotes viewed, reflections, favorites)
4. Sends email via Resend API
5. Returns summary of processed/sent/failed counts
