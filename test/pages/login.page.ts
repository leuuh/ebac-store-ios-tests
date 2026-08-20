// test/pages/login.page.ts
// Tela de Login do LojaEBAC.
// Fluxo do exercicio passo 1: "Primeiramente faca login".
//
// Seletores (testID do React Native -> accessibility id no iOS):
//   email    -> campo de e-mail
//   password -> campo de senha
//   btnLogin -> botao "Entrar"
import { browser } from '@wdio/globals';
import BasePage from './base.page';

class LoginPage extends BasePage {
  // accessibility id e a estrategia mais estavel no iOS (e multiplataforma).
  get inputEmail() { return '~email'; }
  get inputPassword() { return '~password'; }
  get btnLogin() { return '~btnLogin'; }
  // O app abre na Home, nao no Login. A tela de Login mora na 4a aba, cuja
  // rota se chama "Account" (o rotulo exibido e "Profile"). O navigator dessa
  // aba declara initialRouteName "StartScreen", que nao existe entre as suas
  // telas — entao o React Navigation cai na primeira da lista, o Login.
  get tabAccount() { return '~tab-Account'; }

  async EsperarPaginaCarregar() {
    // Idempotente: se ja estou no Login, nao mexo na navegacao.
    if (await $(this.btnLogin).isDisplayed()) return;
    await this.waitAndClick(this.tabAccount);
    // 60s (e nao os 30s padrao): medido no device real do Sauce, a tela de
    // Login levou ~60s pra montar depois do toque na aba na primeira
    // navegacao do app. Depois disso o app responde em fracoes de segundo.
    await this.waitFor(this.btnLogin, 60000);
  }

  async logar(email: string, senha: string) {
    // garanto que estou na tela certa antes de digitar.
    await this.EsperarPaginaCarregar();
    await this.waitAndType(this.inputEmail, email);
    await this.waitAndType(this.inputPassword, senha);
    await this.waitAndClick(this.btnLogin);
    await this.ConfirmarLogado();
  }

  // O login bate na API real (public/authUser em lojaebac.ebaconline.art.br).
  // Se a credencial for recusada o app NAO navega: continua no formulario
  // exibindo o erro vindo do backend (ex.: "Email is incorrect").
  // Sem esta checagem o teste passava mesmo sem logar, e as specs seguintes
  // quebravam na Home procurando elementos que nunca chegaram a existir.
  async ConfirmarLogado(timeout = 30000) {
    try {
      await browser.waitUntil(
        async () => !(await $(this.btnLogin).isDisplayed()),
        { timeout, interval: 500 },
      );
    } catch {
      throw new Error(`Login nao concluiu: ${await this.MensagemDeErro()}`);
    }
  }

  // Le o aviso mostrado pelo app para o erro aparecer no relatorio do CI,
  // em vez de um timeout generico que nao diz o motivo.
  private async MensagemDeErro() {
    const alerta = await $$('//XCUIElementTypeStaticText');
    for (const el of alerta) {
      const texto = await el.getText().catch(() => '');
      if (/incorrect|invalid|please enter|unable/i.test(texto)) return texto;
    }
    return 'o app permaneceu na tela de Login (motivo nao identificado)';
  }
}

export default new LoginPage();
