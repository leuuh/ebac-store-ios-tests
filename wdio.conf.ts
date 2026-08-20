// wdio.conf.ts
// Configuração do WebdriverIO para os testes iOS do app LojaEBAC (Exercício Módulo 29 - EBAC).
//
// Como o exercício pode ser executado de duas formas, deixei duas capabilities:
//   - suites.sim   -> simulador local (LojaEBAC-sim.app)  [exige macOS + Xcode]
//   - suites.sauce -> Sauce Labs na nuvem (LojaEBAC.ipa)  [roda de qualquer OS]
//
// No dia-a-dia escolha o alvo com:  npm run test:sim   ou   npm run test:sauce
//
// [M30] Agora carregamos as credenciais do .env com dotenv (local) ou dos
// secrets do GitHub Actions (CI). Antes eu lia process.env direto e acabei
// esquecendo de carregar o .env — corrigido: importo dotenv/config no topo.
import 'dotenv/config';
import { mkdir } from 'node:fs/promises';
import { browser } from '@wdio/globals';
import type { Options } from '@wdio/types';

// [M30] Credenciais do Sauce Labs: o @wdio/sauce-service le direto do
// ambiente (SAUCE_USERNAME / SAUCE_ACCESS_KEY), seja do .env (local) ou dos
// secrets do GitHub Actions (CI). Por isso nao preciso de variaveis aqui.
const RODA_NO_SAUCE = process.env.RUN_ON === 'sauce';

export const config: Options.Testrunner = {
  //
  // ====== Suites ======
  // Dois conjuntos de specs: um por ambiente. Assim a mesma suíte de testes
  // roda em qualquer alvo sem mudar o código do teste.
  suites: {
    sim: ['./test/specs/**/*.spec.ts'],
    sauce: ['./test/specs/**/*.spec.ts'],
  },

  //
  // ====== Runner ======
  // [M30] No Sauce Labs o @wdio/sauce-service resolve o endpoint sozinho,
  // entao nao preciso mais setar hostname/port/path/protocol a mao (tirei).
  // No simulador local o @wdio/appium-service sobe o servidor Appium.
  // [M30] user/key no top-level: o service do Sauce le do ambiente, mas o
  // detectBackend do webdriverio precisa deles aqui pra reconhecer o backend.
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  // [M30] Região da conta Sauce Labs (free trial fica presa a uma região).
  // O service detecta automaticamente a partir das credenciais. Se falhar,
  // defina SAUCE_REGION no .env / secrets com: 'us-east-1', 'eu-central-1', 'us-west-1'.
  region: (process.env.SAUCE_REGION as any) || undefined,
  hostname: RODA_NO_SAUCE ? undefined : '127.0.0.1',
  port: RODA_NO_SAUCE ? undefined : 4723,
  path: RODA_NO_SAUCE ? undefined : '/',

  //
  // ====== Cucumber/Mocha ======
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 180000, // testes mobile são lentos: 3 min de margem por it.
  },

  //
  // ====== Services ======
  // [M30] Sauce: uso o service oficial (@wdio/sauce-service) — ele conecta no
  // data center do Sauce e ainda marca o resultado do teste no dashboard.
  // Simulador local: Appium service sobe/encerra o servidor sozinho.
  // Os args do Appium vão como [nome, { args }] dentro do array services.
  services: RODA_NO_SAUCE
    ? ['sauce']
    : [['appium', { args: { relaxedSecurity: true, allowInsecure: ['adb_shell'] } }]],

  //
  // ====== Reporter ======
  reporters: ['spec'],

  //
  // ====== Capabilities ======
  // O array abaixo mantém UM servidor conhecido só (sauce OU sim), nunca os
  // dois ao mesmo tempo, para não confundir o WebdriverIO. A escolha vem do
  // flag RUN_ON que setamos via npm script (ver package.json -> "test:sauce"/"test:sim").
  capabilities: RODA_NO_SAUCE ? [
    {
      // ---- Sauce Labs (nuvem) — usa o .ipa em device/emulador real da nuvem.
      // [M30] username/accessKey sairam daqui: o @wdio/sauce-service injeta
      // sozinho a partir de SAUCE_USERNAME/SAUCE_ACCESS_KEY do ambiente.
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      // [M30] App Storage do Sauce: o caminho do app fica em 'appium:app' no
      // nível top da capability (nao dentro de sauce:options). A referencia
      // 'storage:filename=...' aponta pro .ipa que subimos no App Management.
      'appium:app': 'storage:filename=LojaEBAC.ipa',
      'sauce:options': {
        build: 'LojaEBAC-iOS-M30-CI',
        name: 'Fluxo de checkout completo',
        // [M30] ESTA É A LINHA QUE FAZIA O CI QUEBRAR quando faltava.
        // Sem 'appiumVersion' o Sauce Labs aloca o Appium 1.x por padrão, que
        // só fala o protocolo antigo (JSONWP). Como o trial aloca iPhones com
        // iOS 17/18, a nuvem recusava a sessão com HTTP 500:
        //   "iOS 17 and above must be used with the W3C protocol and Appium 2".
        // Pedir 'latest' (ou 'stable') é o que liga o Appium 2 + W3C.
        appiumVersion: 'latest',
      },
      // [M30] Trial do Sauce Labs (US-West) tem inventário de iOS muito limitado.
      // Afrouxei: deviceName como regex 'iPhone.*' (qualquer modelo) e SEM
      // platformVersion fixa — deixo o Sauce alocar qualquer iPhone disponível.
      // Antes pedia iPhone + iOS 16/18 exatos e sempre voltava "no matching device".
      'appium:deviceName': 'iPhone.*',
      // 'appium:platformVersion' removido de propósito: pede a versão exata e
      // nenhum device casava. Sem esse campo o Sauce aceita qualquer versão.
      'appium:noReset': true,
      'appium:newCommandTimeout': 180,
      // [M30] 'appium:useNewWDA' saiu daqui: eu tinha colocado achando que
      // "forçava o W3C", mas ela não tem esse efeito — quem escolhe o
      // protocolo é a versão do Appium (ver appiumVersion acima). Além disso,
      // em device real o WebDriverAgent é gerenciado pelo próprio Sauce.
    },
  ] : [
    {
      // ---- Simulador local — exige Mac, Xcode e o LojaEBAC-sim.app em ./app
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': 'iPhone 15',
      'appium:platformVersion': '17.5',
      'appium:app': process.cwd() + '/app/LojaEBAC-sim.app',
      'appium:noReset': true,
      'appium:newCommandTimeout': 180,
      'appium:autoAcceptAlerts': true,
      'appium:usePrebuiltWDA': false,
    },
  ],

  //
  // ====== Hooks ======
  // Capturamos print se um teste falhar — útil pra depurar no começo dos estudos.
  // Vale principalmente no CI, onde nao temos a tela: o workflow publica a pasta
  // errorShots/ como artefato. Por isso a captura roda em qualquer ambiente.
  afterTest: async function (_test, _context, result) {
    if (result.passed) return;

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    try {
      // saveScreenshot nao cria a pasta: sem isso falha com ENOENT.
      await mkdir('./errorShots', { recursive: true });
      await browser.saveScreenshot(`./errorShots/falha-${stamp}.png`);
      // Nada de getPageSource aqui: no Sauce ele pendurou por 60s e a sessao
      // morreu, derrubando em cascata todos os testes seguintes com
      // "invalid session id". O diagnostico de identificadores sai do bundle
      // (main.jsbundle), sem custo de sessao.
    } catch (err) {
      // Sessao morta (invalid session id) nao rende print — apenas registramos,
      // sem engolir o motivo em silencio como antes.
      console.warn(`[errorShots] nao foi possivel salvar o print: ${(err as Error).message}`);
    }
  },
};
