// test/pages/base.page.ts
// Classe base de todos os Page Objects.
// Aqui centralizo os seletores iOS (no React Native o "testID" vira
// "accessibility id" no iOS) e dois helpers que se repetem em todas as telas:
//   - waitFor()      -> espera um elemento ficar visivel
//   - waitAndClick() -> espera, clica e trata o "elemento nao clicavel ainda"
//
// Padrao: cada Page herda daqui e so declara seus seletores + acoes.
import { browser } from '@wdio/globals';

export class BasePage {
  // espera o elemento existir e ficar visivel, devolvendo o elemento pronto.
  async waitFor(selector: string, timeout = 30000) {
    const el = await $(selector);
    await el.waitForDisplayed({ timeout });
    return el;
  }

  // atalho: espera + clica. Mobile costuma precisar de um pequeno retardo
  // entre a renderizacao e o toque efetivo, da o waitForDisplayed primeiro.
  async waitAndClick(selector: string, timeout = 30000) {
    const el = await this.waitFor(selector, timeout);
    await el.click();
  }

  // atalho: espera + digita texto (limpando antes para nao concatenar).
  async waitAndType(selector: string, text: string, timeout = 30000) {
    const el = await this.waitFor(selector, timeout);
    await el.clearValue();
    await el.addValue(text);
  }

  // pausa generica so pra animacao/transicao de tela (nao usar em excesso).
  async pause(ms = 1500) {
    await browser.pause(ms);
  }

  // espera uma condicao booleana ate dar true ou estourar o timeout.
  async waitUntil(fn: () => Promise<boolean>, timeout = 30000) {
    await browser.waitUntil(fn, { timeout, timeoutMsg: 'Condicao nao satisfeita no tempo limite' });
  }
}

export default BasePage;
