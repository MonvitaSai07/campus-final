# Deploy whatsapp-notify Edge Function

## 1. Set secrets (one-time)

Copy `.env.example` and fill in your real values, then run:

```bash
supabase secrets set \
  TWILIO_ACCOUNT_SID=<your-twilio-account-sid> \
  TWILIO_AUTH_TOKEN=<your-twilio-auth-token> \
  TWILIO_WHATSAPP_NUMBER=<your-twilio-whatsapp-number> \
  GEMINI_API_KEY=<your-gemini-api-key>
```

> Never commit real credentials. Store them in `.env` (gitignored) or Supabase secrets.

## 2. Deploy the function

```bash
supabase functions deploy whatsapp-notify --no-verify-jwt
```

## 3. Add phone number to Supabase

Run `supabase/add_phone_number.sql` in the Supabase SQL Editor.
Replace `+919999999999` with your real WhatsApp number (E.164 format).

## 4. Update mock data phone number

In `src/services/mockData.js`, update:
```js
{ id:'parent-1', ..., phone_number: '+91XXXXXXXXXX' }
```

## 5. Test locally (optional)

```bash
supabase functions serve whatsapp-notify --env-file .env
```

Then POST to `http://localhost:54321/functions/v1/whatsapp-notify`:
```json
{
  "parent_phone": "+91XXXXXXXXXX",
  "student_name": "Priya Sharma",
  "alert_type": "attendance",
  "details": { "percentage": 68, "class": "10B" }
}
```
