# LyaCodex Trial Gateway

This is the intended production shape for the first-run GPT trial.

The desktop/web client must never ship with an OpenAI API key. Instead, LyaCodex II calls a small gateway owned by the project. The gateway stores the OpenAI key on the server side, applies short quotas, and forwards compatible chat requests to OpenAI.

Recommended behavior:

- anonymous trial with a short daily quota;
- no workspace files sent unless the user explicitly asks;
- server-side abuse limits by IP/device/session;
- clear upgrade path to user-owned API key;
- no secrets returned to the client.

Expected OpenAI-compatible endpoint:

- `POST /v1/chat/completions`

Default model mapping:

- client model: `gpt-5.5-trial`
- upstream model: `gpt-5.5`

Environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, optional, defaults to `gpt-5.5`
- `TRIAL_DAILY_LIMIT`, optional

The current app provider points to `https://trial.lyacodex.ai/v1`. Change this URL in the provider catalog when the gateway is deployed.
