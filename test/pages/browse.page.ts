// test/pages/browse.page.ts
// Area de Busca (Browse) do LojaEBAC.
// Fluxo do exercicio passo 2: "Acesse a area de busca (Browse)".
//
// Seletores (conferidos no main.jsbundle do .ipa):
//   ~Browse      -> aba da tab bar que leva a area de busca
//   searchInput  -> campo de texto da busca (TextInput real, exposto no iOS)
//   productDetails -> TouchableOpacity de CADA card de produto da lista
//
// Por que NAO usamos '~search-icon': no bundle ele e um <Icon> filho de um
// TouchableOpacity. No iOS o RN marca o Touchable como accessible={true}, o
// XCUITest funde os filhos num unico elemento e o testID interno some da
// arvore. Mesmo caso do '~search-products', que alem disso e apenas o Text do
// placeholder "Search Products" — nunca foi a lista de resultados.
import BasePage from './base.page';

class BrowsePage extends BasePage {
  get abaBusca() { return '~Browse'; }
  get campoBusca() { return '~searchInput'; }
  // um item generico da lista de produtos (primeiro elemento).
  // Atencao: no XCUITest a arvore NAO tem atributo `testID` — o testID do
  // React Native chega no iOS como `name`. XPath com @testID nunca casa.
  get primeiroProduto() { return this.itemDaLista(1); }

  async AbrirBusca() {
    await this.waitAndClick(this.abaBusca);
  }

  async Buscar(termo: string) {
    await this.waitAndType(this.campoBusca, termo);
    // pequena pausa pra lista filtrar (animacao do app).
    await this.pause(1500);
  }

  // retorna o seletor do card N da lista (1-based). Cada card e um
  // TouchableOpacity testID="productDetails", entao ha varios na tela e o
  // indice do XPath escolhe qual.
  itemDaLista(indice: number) {
    return `(//*[@name="productDetails"])[${indice}]`;
  }
}

export default new BrowsePage();
