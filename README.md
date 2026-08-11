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

## Decisões de estudo

- **Page Object Model**: cada tela vira uma classe, isolando os seletores do teste. Assim, se o app mudar de identificador, só mexemos numa página.
- **Seletores iOS**: priorizei `accessibility id` (mais estável e multiplataforma), com `predicate` e `class chain` como fallback onde necessário.
- **`.env`**: credenciais ficam fora do repositório (nunca commitar).
- **Screenshots de falha**: salvos em `errorShots/` só localmente.

## Entrega

Repositório público, branch `main`. Link do repo submeto como resposta do exercício.
