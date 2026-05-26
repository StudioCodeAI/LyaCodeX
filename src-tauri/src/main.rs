use clap::{Parser, Subcommand};

// ─────────────────────────────────────────────────────────────────────────────
// LyaCodeX — CLI entry point
//
// Aliases aceitos no terminal (configurados pelo instalador no PATH):
//   lyacodex  LyaCodex  LYACODEX  lcx  LCX  lya  Lya
//
// O binário compilado chama-se "lyacodex.exe".
// O instalador cria os aliases/symlinks no PATH automaticamente.
// ─────────────────────────────────────────────────────────────────────────────

const BANNER: &str = r#"
 ██╗  ██╗   ██╗ █████╗  ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗
 ██║  ╚██╗ ██╔╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝
 ██║   ╚████╔╝ ███████║██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ 
 ██║    ╚██╔╝  ██╔══██║██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ 
 ███████╗██║   ██║  ██║╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗
 ╚══════╝╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
"#;

const SLOGAN: &str = "Se você pensa, você executa. Se você executa, você indexa. Se você indexa, você evolui.";
const VERSION: &str = "0.1.0";

#[derive(Parser)]
#[command(
    name        = "lyacodex",
    bin_name    = "lyacodex",
    display_name = "LyaCodeX",
    about       = "LyaCodeX — agente de terminal com IA para programadores.",
    long_about  = concat!(
        "LyaCodeX — agente de terminal com IA para programadores.\n\n",
        "Aliases: lyacodex | LyaCodex | LYACODEX | lcx | LCX | lya | Lya\n\n",
        "Se você pensa, você executa.\n",
        "Se você executa, você indexa.\n",
        "Se você indexa, você evolui.",
    ),
    version     = VERSION,
    author      = "Luis Antonio Cardozo",
    // Sem subcomando → abre UI (override do after_help)
    after_help  = "Dica: rode 'lyacodex' sem argumentos para abrir a interface desktop.",
)]
struct Cli {
    /// Não mostra o banner ASCII ao iniciar
    #[arg(long, global = true)]
    no_banner: bool,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Acorda o runtime e exibe o ritual de início
    Wake,

    /// Mostra status completo do runtime, providers e engines
    Status,

    /// Lista modelos disponíveis no provider ativo
    Models,

    /// Detecta engines locais (Ollama, LM Studio) e exibe informações
    Engines,

    /// Gerencia chaves de API no Lya Keychain (Windows Credential Manager)
    Keychain,

    /// Busca skills no catálogo Antigravity Awesome Skills
    Skills {
        /// Termo de busca: coding, security, testing, devops, medicine, finance...
        #[arg(default_value = "coding")]
        query: String,

        /// Idioma dos resultados: pt-BR ou en
        #[arg(long, default_value = "pt-BR")]
        lang: String,
    },

    /// Envia uma mensagem para o runtime e imprime a resposta
    Chat {
        /// Mensagem / prompt para a Lya
        prompt: String,

        /// Provider: ollama | lmstudio | openrouter | openai | gemini | groq | anthropic
        #[arg(long, default_value = "ollama")]
        provider: String,

        /// Modelo: gpt-oss:20b | llama3 | gemini-2.5-flash | gpt-4o | etc.
        #[arg(long, default_value = "gpt-oss:20b")]
        model: String,

        /// Modo runtime: local | cloud | hybrid | auto
        #[arg(long, default_value = "hybrid")]
        mode: String,
    },

    /// Exibe os aliases disponíveis no terminal
    Aliases,

    /// Exibe informações de versão detalhadas
    Info,
}

fn print_banner() {
    println!("{}", BANNER);
    println!("  {SLOGAN}");
    println!("  v{VERSION} — Luis Antonio Cardozo\n");
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        // Sem subcomando → abre UI desktop
        None => {
            if !cli.no_banner {
                print_banner();
            }
            lyacodex_desktop_lib::run();
        }

        Some(Commands::Wake) => {
            print_banner();
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  🌿  Antes de executar, a Lya precisa");
            println!("      respirar um motor.");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!();
            println!("  Status     : breathing ✅");
            println!("  Runtime    : lyacodex_desktop_lib v{VERSION}");
            println!("  Keychain   : Lya Keychain (Windows Credential Manager)");
            println!("  Skills     : sickn33/antigravity-awesome-skills");
            println!("  Engines    : Ollama :11434 | LM Studio :1234");
            println!();
            println!("  Na hora de acordar a LyaCodeX,");
            println!("  o runtime assopra no ouvido dela. 🌬️");
            println!();
            println!("  → Para a interface completa: lyacodex");
        }

        Some(Commands::Status) => {
            println!("LyaCodeX — Status do Runtime");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  Versão     : {VERSION}");
            println!("  Runtime    : breathing ✅");
            println!("  Keychain   : Lya Keychain (Windows Credential Manager)");
            println!("  Skills     : sickn33/antigravity-awesome-skills (1.200+ skills)");
            println!("  Engine 1   : Ollama       → localhost:11434");
            println!("  Engine 2   : LM Studio    → localhost:1234");
            println!("  Providers  : ollama | lmstudio | openrouter | openai | gemini | groq | anthropic");
            println!("  Modos      : local | cloud | hybrid | auto");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  → Interface completa: lyacodex");
        }

        Some(Commands::Models) => {
            println!("LyaCodeX — Modelos disponíveis");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  LOCAL (sem custo de API):");
            println!("    ollama    → gpt-oss:20b, llama3, mistral, phi3, gemma...");
            println!("    lmstudio  → qualquer modelo .gguf carregado");
            println!();
            println!("  CLOUD (requer API key no Keychain):");
            println!("    openrouter → acesso unificado a 200+ modelos");
            println!("    openai     → gpt-4o, gpt-4o-mini");
            println!("    gemini     → gemini-2.5-flash, gemini-2.5-pro");
            println!("    anthropic  → claude-sonnet-4-6, claude-opus-4-6");
            println!("    groq       → llama3-70b (inferência ultra-rápida)");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  Para listar modelos Ollama instalados: ollama list");
            println!("  Para gerenciar: lyacodex → aba Providers");
        }

        Some(Commands::Engines) => {
            println!("LyaCodeX — Engines locais");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  🔍 Verificando localhost:11434 (Ollama)...");
            println!("  🔍 Verificando localhost:1234  (LM Studio)...");
            println!();
            println!("  Para detecção completa com lista de modelos:");
            println!("    lyacodex → aba Local Engine");
            println!();
            println!("  Instalar Ollama : https://ollama.com/download");
            println!("  Instalar LM Studio : https://lmstudio.ai");
            println!("  Baixar gpt-oss  : ollama pull gpt-oss:20b");
        }

        Some(Commands::Keychain) => {
            println!("LyaCodeX Keychain");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  Suas chaves são armazenadas no Windows Credential Manager.");
            println!("  A API key real NUNCA é exposta no frontend.");
            println!();
            println!("  O sistema usa keyRef (referência segura):");
            println!("    lya:openai:Default Key → resolve no backend Rust");
            println!("    lya:gemini:Default Key → resolve no backend Rust");
            println!("    lya:anthropic:Default Key → resolve no backend Rust");
            println!();
            println!("  Para gerenciar chaves: lyacodex → aba Providers");
        }

        Some(Commands::Skills { query, lang }) => {
            println!("LyaCodeX Skills — Buscando: \"{query}\" [{lang}]");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  Catálogo: sickn33/antigravity-awesome-skills");
            println!("  Idiomas : PT-BR | EN");
            println!();
            println!("  Categorias disponíveis:");
            println!("    💻 dev       🔒 security   🧪 testing");
            println!("    ⚙️  devops    📊 data       🏥 medicine");
            println!("    💰 finance   ✍️  writing    🎨 design");
            println!("    🤖 agent     📦 other");
            println!();
            println!("  Para busca interativa com até 5 skills ativas:");
            println!("    lyacodex → aba Skills");
        }

        Some(Commands::Chat { prompt, provider, model, mode }) => {
            println!("LyaCodeX Chat");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  Provider : {provider}");
            println!("  Modelo   : {model}");
            println!("  Modo     : {mode}");
            println!("  Prompt   : {prompt}");
            println!();
            println!("  [Em implementação] Chat direto via CLI.");
            println!("  Use a interface completa para resposta agora:");
            println!("    lyacodex");
        }

        Some(Commands::Aliases) => {
            println!("LyaCodeX — Aliases disponíveis no terminal");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  lyacodex     → comando principal");
            println!("  LyaCodex     → alias (case-insensitive no Windows)");
            println!("  LYACODEX     → alias (case-insensitive no Windows)");
            println!("  lcx          → atalho curto");
            println!("  LCX          → atalho curto maiúsculo");
            println!("  lya          → atalho mais curto");
            println!("  Lya          → alias amigável");
            println!();
            println!("  Todos os aliases são configurados pelo instalador.");
            println!("  Para instalar: .\\scripts\\install.ps1");
            println!();
            println!("  Exemplos:");
            println!("    lya wake");
            println!("    lcx status");
            println!("    lyacodex skills coding --lang pt-BR");
            println!("    lya chat \"como faço um loop em Rust?\"");
        }

        Some(Commands::Info) => {
            println!("LyaCodeX — Informações");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            println!("  Nome      : LyaCodeX");
            println!("  Versão    : {VERSION}");
            println!("  Autor     : Luis Antonio Cardozo");
            println!("  Stack     : Rust + Tauri 2 + React 19 + TypeScript");
            println!("  Keychain  : Windows Credential Manager (keyring crate)");
            println!("  Skills    : github.com/sickn33/antigravity-awesome-skills");
            println!("  Slogan    : {SLOGAN}");
            println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }
    }
}
