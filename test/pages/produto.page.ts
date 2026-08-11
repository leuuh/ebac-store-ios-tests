// test/pages/produto.page.ts
// Tela de detalhes do Produto.
// Fluxo do exercicio passos 3 e 4:
//   "Escolha um produto na lista e o selecione"
//   "Adicione o produto no carrinho"
//
// Seletores:
//   productName    -> nome do produto (usado pra conferir tudo bem)
//   productDetails -> container de detalhes
//   addToCart       -> botao "Adicionar ao carrinho"
//   cart           -> icone de carrinho (pra validar o contador, se houver)
import BasePage from './base.page';

class ProdutoPage extends BasePage {
  get nomeProduto() { return '~productName'; }
  get detalhes() { return '~productDetails'; }
  get btnAddCarrinho() { return '~addToCart'; }
  get iconeCarrinho() { return '~cart'; }

  async EsperarDetalhes() {
    await this.waitFor(this.detalhes);
  }

  async AdicionarAoCarrinho() {
    await this.EsperarDetalhes();
    await this.waitAndClick(this.btnAddCarrinho);
    // da um respiro pro toast/dialog de "adicionado" desaparecer.
    await this.pause(2000);
  }
}

export default new ProdutoPage();
