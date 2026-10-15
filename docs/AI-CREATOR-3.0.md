> Historical milestone. Superseded by [AI Creator 4.0](./AI-CREATOR-4.0.md).

# AI Creator 3.0

Countify AI Creator 3.0 upgrades the previous rigid date parser into a natural-language countdown assistant.

## What changed

- English, Hindi and Hinglish understanding.
- Month names and abbreviations, including Hindi month names.
- Ordinal dates such as `12th November 2026`.
- Day-month and month-day formats.
- ISO and slash dates.
- Relative dates such as tomorrow, next week, next month and next weekday.
- Relationship-aware event naming (`my sister ... anniversary`, `mummy birthday`, etc.).
- Conversational AI UI with recent-message context.
- Structured AI response validation before a countdown is created.
- Secure Supabase Edge Function for OpenAI; no API key in the browser.
- Local smart fallback remains available when `VITE_AI_ENDPOINT` is not configured.

## Production setup

Deploy the `ai-countdown` Supabase Edge Function and configure:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-6-luna
```

Then point the frontend at:

```text
VITE_AI_ENDPOINT=https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-countdown
```

The AI provider is used only server-side. The browser receives the validated structured countdown result.

## Example

`My sister wedding anniversary on 12 november, 2026`

should resolve to:

- My Sister's Wedding Anniversary
- 2026-11-12
- 💖
- romantic/candy theme

No rigid prompt format is required.
