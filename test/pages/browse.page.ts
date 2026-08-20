// test/pages/browse.page.ts
// Area de Busca (Browse) do LojaEBAC.
// Fluxo do exercicio passo 2: "Acesse a area de busca (Browse)".
//
// Seletores:
//   search-icon     -> icone/lupa que abre a busca
//   searchInput     -> campo de texto da busca
//   search-products -> lista de produtos retornados
import BasePage from './base.page';

class BrowsePage extends BasePage {
  get iconeBusca() { return '~search-icon'; }
  get campoBusca() { return '~searchInput'; }
  get listaProdutos() { return '~search-products'; }
  // um item generico da lista de produtos (primeiro elemento).
  // Atencao: no XCUITest a arvore NAO tem atributo `testID` — o testID do
  // React Native chega no iOS como `name`. XPath com @testID nunca casa.
  get primeiroProduto() { return this.itemDaLista(1); }

  async AbrirBusca() {
    await this.waitAndClick(this.iconeBusca);
  }

  async Buscar(termo: string) {
    await this.waitAndClick(this.iconeBusca);
    await this.waitAndType(this.campoBusca, termo);
    // pequena pausa pra lista filtrar (animacao do app).
    await this.pause(1500);
  }

  // retorna o seletor XPath do item N da lista de busca (1-based).
  itemDaLista(indice: number) {
    return `//*[@name="search-products"]/*[${indice}]`;
  }
}

export default new BrowsePage();
