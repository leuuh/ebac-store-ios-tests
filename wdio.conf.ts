// wdio.conf.ts
// Configuração do WebdriverIO para os testes iOS do app LojaEBAC (Exercício Módulo 29 - EBAC).
//
// Como o exercício pode ser executado de duas formas, deixei duas capabilities:
//   - suites.sim   -> simulador local (LojaEBAC-sim.app)  [exige macOS + Xcode]
//   - suites.sauce -> Sauce Labs na nuvem (LojaEBAC.ipa)  [roda de qualquer OS]
//
// No dia-a-dia escolha o alvo com:  npm run test:sim   ou   npm run test:sauce
import type { Options } from '@wdio/types';

// Junta os ambientes a partir de variáveis opcionais (ver .env.example).
// Mantemos tudo aqui em texto puro para facilitar o estudo — em projeto real
// a boa prática é externalizar senhas para o .env (que está no .gitignore).
const SAUCE_USER = process.env.SAUCE_USERNAME ?? 'seu-usuario-saucelabs';
const SAUCE_KEY = process.env.SAUCE_ACCESS_KEY ?? 'sua-access-key-saucelabs';

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
  // Para Sauce Labs apontamos direto para o data center deles. Para o
  // simulador, deixamos vazio e usamos o @wdio/appium-service local.
  hostname: process.env.RUN_ON === 'sauce' ? 'ondemand.us-west-1.saucelabs.com' : '127.0.0.1',
  port: process.env.RUN_ON === 'sauce' ? 443 : 4723,
  path: process.env.RUN_ON === 'sauce' ? '/wd/hub' : '/',
  protocol: process.env.RUN_ON === 'sauce' ? 'https' : 'http',

  //
  // ====== Cucumber/Mocha ======
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 180000, // testes mobile são lentos: 3 min de margem por it.
  },

  //
  // ====== Services ======
  // O Appium service sobe/encerra o servidor sozinho quando rodamos local.
  // Em Sauce Labs não precisamos dele (a nuvem já fornece o Appium).
  services: process.env.RUN_ON === 'sauce' ? [] : ['appium'],
  appiumService: process.env.RUN_ON === 'sauce' ? undefined : {
    args: {
      relaxedSecurity: true,
      allowInsecure: ['adb_shell'],
    },
  },

  //
  // ====== Reporter ======
  reporters: ['spec'],

  //
  // ====== Capabilities ======
  // O array abaixo mantém UM servidor conhecido só (sauce OU sim), nunca os
  // dois ao mesmo tempo, para não confundir o WebdriverIO. A escolha vem do
  // flag RUN_ON que setamos via npm script (ver package.json -> "test:sauce"/"test:sim").
  capabilities: process.env.RUN_ON === 'sauce' ? [
    {
      // ---- Sauce Labs (nuvem) — usa o .ipa em device/emulador real da nuvem.
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'sauce:options': {
        username: SAUCE_USER,
        accessKey: SAUCE_KEY,
        app: 'storage:filename=LojaEBAC.ipa',
        appName: 'LojaEBAC.ipa',
        build: 'LojaEBAC-iOS-M29',
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
