// test/pages/carrinho.page.ts
// Tela do Carrinho.
// Usada entre "adicionar no carrinho" e "adicionar endereco / ir pro pagamento".
//
// Seletores:
//   cart        -> icone/entrada do carrinho (tap pra abrir)
//   emptyCart   -> estado vazio (nao queremos esse no fluxo feliz)
//   totalPrice  -> valor total (pra validar que ha item)
//   listItemTitle -> titulo de um item (para depois seguirmos pra pagamento)
import BasePage from './base.page';

class CarrinhoPage extends BasePage {
  get iconeCarrinho() { return '~cart'; }
  get carrinhoVazio() { return '~emptyCart'; }
  get valorTotal() { return '~totalPrice'; }

  async AbrirCarrinho() {
    await this.waitAndClick(this.iconeCarrinho);
  }

  // confirma que o carrinho tem ao menos um item esperando o total aparecer.
  async TemItens() {
    const total = await this.waitFor(this.valorTotal, 15000);
    return total.isDisplayed();
  }
}

export default new CarrinhoPage();
