// test/pages/login.page.ts
// Tela de Login do LojaEBAC.
// Fluxo do exercicio passo 1: "Primeiramente faca login".
//
// Seletores (testID do React Native -> accessibility id no iOS):
//   email    -> campo de e-mail
//   password -> campo de senha
//   btnLogin -> botao "Entrar"
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
    await this.waitFor(this.btnLogin);
  }

  async logar(email: string, senha: string) {
    // garanto que estou na tela certa antes de digitar.
    await this.EsperarPaginaCarregar();
    await this.waitAndType(this.inputEmail, email);
    await this.waitAndType(this.inputPassword, senha);
    await this.waitAndClick(this.btnLogin);
  }
}

export default new LoginPage();
