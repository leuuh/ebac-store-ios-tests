// test/pages/produto.page.ts
// Tela de detalhes do Produto.
// Fluxo do exercicio passos 3 e 4:
//   "Escolha um produto na lista e o selecione"
//   "Adicione o produto no carrinho"
//
// Seletores (conferidos no main.jsbundle do .ipa):
//   productName -> nome do produto (usado pra conferir tudo bem)
//   addToCart   -> botao "Adicionar ao carrinho"; e o TouchableOpacity em si,
//                  aparece 1x no app inteiro e SO nesta tela, entao serve de
//                  marcador de "cheguei nos detalhes".
//
// Por que NAO usamos '~productDetails' como container de detalhes: no bundle
// ele e o TouchableOpacity de cada CARD da lista de busca (o onPress navega
// pra ProductDetails levando o productId). Ou seja, ele vive na tela ANTERIOR
// e existe varias vezes — esperar por ele aqui dava falso negativo.
import BasePage from './base.page';

class ProdutoPage extends BasePage {
  get nomeProduto() { return '~productName'; }
  get detalhes() { return '~addToCart'; }
  get btnAddCarrinho() { return '~addToCart'; }

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
