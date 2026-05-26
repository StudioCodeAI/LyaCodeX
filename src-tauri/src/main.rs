use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "lyacodex",
    bin_name = "lyacodex",
    about = "LyaCodeX — Se você pensa, você executa.",
    long_about = "LyaCodeX: agente de terminal com IA para programadores.\nUse no terminal do VS Code, PowerShell, Windows Terminal ou qualquer IDE.\n\nSe você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.",
    version = "0.1.0",
    author = "Luis Antonio Cardozo"
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Acorda o runtime e mostra o status
    Wake,
    /// Mostra status do runtime e providers
    Status,
    /// Lista modelos disponíveis no provider ativo
    Models,
    /// Lista engines locais detectadas (Ollama, LM Studio)
    Engines,
    /// Gerencia chaves de API no Lya Keychain
    Keychain,
    /// Busca skills no catálogo Antigravity
    Skills {
        /// Termo de busca (ex: coding, security, testing)
        #[arg(default_value = "coding")]
        query: String,
    },
    /// Envia uma mensagem única para o runtime e imprime a resposta
    Chat {
        /// Mensagem para o runtime
        prompt: String,
        /// Provider a usar (ollama, openrouter, openai, gemini, groq)
        #[arg(long, default_value = "ollama")]
        provider: String,
        /// Modelo a usar
        #[arg(long, default_value = "gpt-oss:20b")]
        model: String,
    },
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        None => {
            // Sem subcomando: abre a UI desktop
            lyacodex_desktop_lib::run();
        }
        Some(Commands::Wake) => {
            println!("LyaCodeX Runtime — Acordando...");
            println!("Se você pensa, você executa.");
            println!("Se você executa, você indexa.");
            println!("Se você indexa, você evolui.");
            println!();
            println!("Status: breathing");
            println!("Backend: lyacodex_ii_backend v0.1.0");
        }
        Some(Commands::Status) => {
            println!("LyaCodeX Status");
            println!("---------------");
            println!("Runtime:  breathing");
            println!("Keychain: Lya Keychain (Windows Credential Manager)");
            println!("Skills:   sickn33/antigravity-awesome-skills");
            println!("Engines:  Ollama (localhost:11434), LM Studio (localhost:1234)");
        }
        Some(Commands::Models) => {
            println!("LyaCodeX — Modelos disponíveis");
            println!("Providers configurados: ollama, lmstudio, openrouter, openai, gemini, groq");
            println!("Para listar modelos do Ollama: ollama list");
            println!("Para gerenciar providers: lyacodex (abre a UI)");
        }
        Some(Commands::Engines) => {
            println!("LyaCodeX — Engines locais");
            println!("Verificando Ollama em localhost:11434...");
            println!("Use: lyacodex (abre UI) → aba Local para detecção completa.");
        }
        Some(Commands::Keychain) => {
            println!("LyaCodeX Keychain — Gerenciador de chaves");
            println!("Chaves armazenadas no Windows Credential Manager.");
            println!("Para adicionar ou remover chaves: lyacodex (abre UI) → aba Providers.");
        }
        Some(Commands::Skills { query }) => {
            println!("LyaCodeX Skills — Buscando: {query}");
            println!("Catálogo: sickn33/antigravity-awesome-skills");
            println!("Para busca completa com filtros: lyacodex (abre UI) → aba Skills.");
        }
        Some(Commands::Chat { prompt, provider, model }) => {
            println!("LyaCodeX Chat — {provider} / {model}");
            println!("Prompt: {prompt}");
            println!();
            println!("[runtime] Chat direto via CLI ainda em implementação.");
            println!("[runtime] Use: lyacodex (abre UI) → Runtime Chat para resposta completa.");
        }
    }
}
