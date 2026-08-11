// test/pages/checkout.page.ts
// Tela de Checkout / Confirmacao do pedido.
// Fluxo do exercicio passo 6: "Complete o fluxo de checkout".
//
// Seletores:
//   completeCheckout             -> botao final que confirma o pedido
//   orderCode                    -> codigo do pedido gerado (prova do sucesso)
//   transactionSuccessfulImage   -> imagem de "pagamento realizado"
//   goBackHome                   -> voltar pra home apos fechar o pedido
import BasePage from './base.page';

class CheckoutPage extends BasePage {
  get btnCompleteCheckout() { return '~completeCheckout'; }
  get codigoPedido() { return '~orderCode'; }
  get imgSucesso() { return '~transactionSuccessfulImage'; }
  get btnVoltarHome() { return '~goBackHome'; }

  async FinalizarCheckout() {
    await this.waitAndClick(this.btnCompleteCheckout, 20000);
  }

  async PedidoFoiConcluido() {
    // imagem de sucesso ou codigo do pedido visiveis sao a prova do checkout.
    try {
      await this.waitFor(this.imgSucesso, 25000);
      return true;
    } catch {
      const codigo = await $(this.codigoPedido).isExisting();
      return codigo;
    }
  }
}

export default new CheckoutPage();
