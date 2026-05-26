# First Run Local Model

LyaCodex II now has a first-run wake flow. On the first launch, the user can:

- prepare a local model;
- try the project-owned GPT trial gateway;
- configure a cloud API provider;
- enter the runtime directly.

The recommended local path is:

1. Install Ollama from `https://ollama.com/download`.
2. Pull the OpenAI open-weight model with `ollama pull gpt-oss:20b`.
3. Use the Local panel to verify Ollama and the model.
4. Activate the recommended runtime, which maps `OpenAI GPT Local` to `gpt-oss:20b`.

The app does not auto-download large model files. It presents the command and lets the user decide when to run it.

The GPT trial path uses `LyaCodex GPT Trial`, an OpenAI-compatible gateway controlled by the product. It must be hosted separately so the OpenAI API key stays server-side. See `examples/trial-gateway`.

In desktop mode, the Rust backend checks:

- Ollama health at `http://localhost:11434/api/version`;
- available models at `http://localhost:11434/api/tags`;
- OpenAI-compatible chat base URL at `http://localhost:11434/v1`.

In browser mode, direct inspection is disabled and the panel instructs the user to run the desktop build for local engine detection.
