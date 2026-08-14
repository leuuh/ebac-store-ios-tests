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
      },
      'appium:deviceName': 'iPhone.*',
      'appium:platformVersion': '17',
      'appium:noReset': true,
      'appium:newCommandTimeout': 180,
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
  afterTest: async function (_test, _context, result) {
    if (!result.passed && process.env.RUN_ON !== 'sauce') {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      await browser.saveScreenshot(`./errorShots/falha-${stamp}.png`).catch(() => {});
    }
  },
};
