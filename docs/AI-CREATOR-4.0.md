# AI Creator 4.0 — Full Countdown Copilot

AI Creator 4.0 is the final AI milestone for the 4.x product line. It is designed so a future 5.0 release is not required just to finish the AI creator.

## Included

- Natural English, Hindi, Hinglish and mixed-script understanding.
- Typos, abbreviations, casual phrasing and incomplete requests.
- Smart absolute and relative date interpretation.
- Annual birthday/anniversary recurrence handling.
- One-question clarification for genuine ambiguity.
- Conversational memory and user-approved preference memory.
- Follow-up editing without restarting the conversation.
- Structured app actions: create, update, delete (confirmation required), open, remember preference and reminder suggestion.
- AI visual design inference: theme, accent, emoji, description and tags.
- Voice input using browser speech recognition when available.
- Optional text-to-speech reply support in the client.
- Local offline smart-parser fallback.
- Local chat persistence plus optional authenticated Supabase conversation persistence.
- Server-side OpenAI Responses API integration; no API key in the browser.
- Daily AI quota/rate protection through a Supabase RPC.
- Prompt-injection-resistant server instructions and strict structured output.
- Selected countdown context is supplied to the copilot for edit requests.
- No automatic destructive action: delete actions require confirmation in the client protocol.

## Production setup

Frontend `.env`:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_AI_ENDPOINT=https://YOUR_PROJECT.supabase.co/functions/v1/ai-countdown
```

Supabase function secrets:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-6-luna
AI_FREE_DAILY_LIMIT=25
```

Deploy:

```bash
supabase db push
supabase functions deploy ai-countdown --use-api
```

The API key and service role key must stay in Supabase function secrets. Never place them in `VITE_*` variables.

## AI 4.0 action contract

The model returns a structured response containing:

- `reply`
- `needsClarification`
- `clarificationQuestion`
- `memory`
- `result`
- `actions[]`

The browser executes only the known action types and keeps destructive operations explicit.
