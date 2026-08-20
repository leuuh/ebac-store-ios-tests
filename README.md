# ebac-store-ios-tests

Suíte de testes iOS para o app **LojaEBAC** — exercício do **Módulo 29** (Testes iOS com Appium) do curso de QA da EBAC.

## Sobre o exercício

Implementar uma suíte de testes automatizados (WebdriverIO + Appium) que percorre o fluxo completo de compra da loja:

1. **Login** no app
2. Acessar a área de **busca** (Browse)
3. **Selecionar** um produto da lista
4. **Adicionar** o produto no carrinho
5. **Adicionar um endereço** (se não existir) e ir para o pagamento
6. **Completar o checkout**

App em teste: [LojaEBAC](https://github.com/EBAC-QE/ebac-store-mobile-tests/tree/ios/app)
- `LojaEBAC.ipa` → device real ou Sauce Labs
- `LojaEBAC-sim.app` → simulador (macOS + Xcode)

## Estrutura do projeto

```
ebac-store-ios-tests/
├── app/                       # apps baixados (.ipa /.app) — ver instruções
├── test/
│   ├── pages/                 # Page Objects (um por tela/fluxo)
│   │   ├── login.page.ts
│   │   ├── browse.page.ts
│   │   ├── produto.page.ts
│   │   ├── carrinho.page.ts
│   │   ├── endereco.page.ts
│   │   └── checkout.page.ts
│   └── specs/                 # specs (testes) em si
│       └── fluxo-checkout.spec.ts
├── wdio.conf.ts               # config WebdriverIO (Sauce Labs + simulador)
├── package.json
├── tsconfig.json
├── .env.example               # modelo de credenciais Sauce Labs
└── README.md
```

## Pré-requisitos

- Node.js 18+
- Appium 2 + driver XCUITest (`appium driver install xcuitest`)
- Para rodar em **simulador**: macOS Xcode + Simulator
- Para rodar no **Sauce Labs**: conta ativa (credenciais)

## Preparando o ambiente

> Aviso honesto: simulador iOS nativo **só roda em macOS** (exige Xcode).
> Se você está em Windows/Linux, use o caminho **Sauce Labs** (nuvem).

1. Instale dependências:
   ```bash
   npm install
   ```
2. (Simulador) Instale o driver XCUITest:
   ```bash
   appium driver install xcuitest
   ```
3. Baixe o app e coloque na pasta `app/`:
   ```
   app/LojaEBAC-sim.app    # simulador macOS
   app/LojaEBAC.ipa        # Sauce Labs / device real
   ```
4. (Sauce Labs) Copie `.env.example` para `.env` e preencha suas credenciais.

## Rodando os testes

```bash
# Simulador local (em um Mac)
npm run test:sim

# Sauce Labs (de qualquer OS)
npm run test:sauce
```

## CI — GitHub Actions + Sauce Labs (M30)

A partir do M30, a suíte roda automaticamente em **Continuous Integration** via **GitHub Actions** usando a **Sauce Labs** como Device Farm.

### Como funciona
- **Trigger**: push na branch `ci` (ou disparo manual `workflow_dispatch`).
- **Runner**: `ubuntu-latest` com Node 20.
- **Credenciais**: `SAUCE_USERNAME` e `SAUCE_ACCESS_KEY` vêm dos **Secrets** do GitHub (Settings → Secrets and variables → Actions).
- **Workflow**: `.github/workflows/ci.yml` — instala deps com `npm ci`, roda `npm run test:sauce`.
- **Resultado**: no dashboard do Sauce Labs (link no job do Actions) tem vídeo, logs e screenshots.

### Configurando os Secrets
1. No repo GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Adicione dois secrets:
   - `SAUCE_USERNAME` — seu usuário do Sauce Labs
   - `SAUCE_ACCESS_KEY` — sua Access Key (User Settings → Access Key)
3. Pronto: qualquer push na branch `ci` dispara o pipeline.

### Rodando manualmente
No GitHub: aba **Actions** → **CI - Testes iOS no Sauce Labs** → **Run workflow** → escolher branch `ci` → **Run workflow**.

### Onde ver a execução (vídeo)
- No GitHub Actions: clique no run → job `sauce-tests` → link **Sauce Labs** (ou procure no dashboard `https://app.saucelabs.com` → Automated → Test Results).
- Lá tem o vídeo completo da sessão, logs Appium, screenshots de cada passo.

## Limitação conhecida — cota de Device Farm

> **O pipeline está vermelho e a causa não é o código.** A conta Sauce Labs usada
> neste exercício não tem cota de device real. Limitação já reconhecida para este
> projeto.

A API de concorrência do Sauce (`/rest/v1.2/users/{user}/concurrency`) responde:

```json
"organization": { "allowed": { "rds": 0, "mac_vms": 0, "vms": 0 } },
"team":         { "allowed": { "rds": 0, "mac_vms": 1, "vms": 0 } }
```

- `rds: 0` → **nenhum device real alocável** (RDC = Real Device Cloud).
- `mac_vms: 1` → a conta só tem uma VM Mac (simulador).

O erro que aparece no meio do log do WebdriverIO:

```
session not created: We couldn't find a MATCHING device in our US-West data center
Warning: You have 0 public device concurrency so you can only access private devices.
```

### A pegadinha
O catálogo do Sauce lista **117 iPhones públicos** e ~162 devices iOS "livres".
**Visível ≠ alocável.** Pedir um device nominalmente pelo ID do pool free
(`iPhone_13_Pro_free_sjc1`) produz exatamente a mesma recusa — não existe
capability que contorne cota zerada.

### Por que não usar o simulador
O simulador consumiria a cota `mac_vms: 1` que a conta tem, mas exige um `.app`
compilado para simulador. O app distribuído é `LojaEBAC.ipa`, e **.ipa só roda em
device físico**.

### O que foi feito a respeito
`ci/preflight-sauce.mjs` roda **antes** da suíte e consulta a cota. Se `rds === 0`,
aborta em ~40s com o motivo no topo do log, em vez de gastar ~15 min para morrer
no meio de 260 linhas de saída do Appium. Quando houver cota, o preflight passa
sozinho e a suíte executa sem nenhuma alteração de código.

- **Page Object Model**: cada tela vira uma classe, isolando os seletores do teste. Assim, se o app mudar de identificador, só mexemos numa página.
- **Seletores iOS**: priorizei `accessibility id` (mais estável e multiplataforma), com `predicate` e `class chain` como fallback onde necessário.
- **`.env`**: credenciais ficam fora do repositório (nunca commitar).
- **Screenshots de falha**: salvos em `errorShots/` só localmente.

## Entrega

**M29**: Repositório público, branch `main`. Link do repo submeto como resposta do exercício.

**M30 (CI)**: Mesma base, **branch `ci`** com o workflow GitHub Actions rodando no Sauce Labs.

O pipeline está configurado, dispara corretamente a cada push e autentica na Sauce
Labs. A execução na Device Farm não pôde ser gravada por ausência de cota de device
real na conta — ver [Limitação conhecida](#limitação-conhecida--cota-de-device-farm).
