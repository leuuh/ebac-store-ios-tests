// test/pages/endereco.page.ts
// Tela de Endereco (cadastro/selecao).
// Fluxo do exercicio passo 5:
//   "Adicione um endereco (se nao existir). Apos, ir para o pagamento"
//
// Seletores:
//   addNewAddress                  -> botao "adicionar novo endereco"
//   addressName, address, phone... -> campos do formulario
//   save                           -> salvar o endereco
//   selectAddressOrContinueToPayment -> ir para pagamento
import BasePage from './base.page';

class EnderecoPage extends BasePage {
  get btnAddNovoEndereco() { return '~addNewAddress'; }
  get inputNomeEndereco() { return '~addressName'; }
  get inputFirstName() { return '~firstName'; }
  get inputLastName() { return '~lastName'; }
  get inputTelefone() { return '~phone'; }
  get inputEndereco() { return '~address'; }
  get btnSalvar() { return '~save'; }
  get btnIrParaPagamento() { return '~selectAddressOrContinueToPayment'; }

  // cadastra um endereco de exemplo caso ainda nao exista.
  async CadastrarEndereco(dados: {
    nomeEndereco: string; firstName: string; lastName: string;
    telefone: string; endereco: string;
  }) {
    // so clico em "novo endereco" se o botao estiver visivel (nao existe ainda).
    // No React Native o overlay pode demorar, por isso o timeout maior.
    const existe = await $(this.btnAddNovoEndereco).isExisting();
    if (existe) {
      await this.waitAndClick(this.btnAddNovoEndereco, 10000);
      await this.pause(1000);
      await this.waitAndType(this.inputNomeEndereco, dados.nomeEndereco);
      await this.waitAndType(this.inputFirstName, dados.firstName);
      await this.waitAndType(this.inputLastName, dados.lastName);
      await this.waitAndType(this.inputTelefone, dados.telefone);
      await this.waitAndType(this.inputEndereco, dados.endereco);
      await this.waitAndClick(this.btnSalvar);
    }
  }

  // apos ter endereco, segue para a tela de pagamento.
  async IrParaPagamento() {
    await this.waitAndClick(this.btnIrParaPagamento, 15000);
  }
}

export default new EnderecoPage();
