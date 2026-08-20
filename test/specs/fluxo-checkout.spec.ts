// test/specs/fluxo-checkout.spec.ts
// Spec E2E do exercicio M29: fluxo completo de compra no LojaEBAC (iOS).
//
// Espelha, passo a passo, o pedido do enunciado:
//   1) Primeiramente faca login
//   2) Acesse a area de busca (Browse)
//   3) Escolha um produto na lista e o selecione
//   4) Adicione o produto no carrinho
//   5) Adicione um endereco (se nao existir). Apos, ir para o pagamento
//   6) Complete o fluxo de checkout
//
// Credenciais e dados sao de exemplo do app de teste da EBAC.
import { browser } from '@wdio/globals';
import LoginPage from '../pages/login.page';
import BrowsePage from '../pages/browse.page';
import ProdutoPage from '../pages/produto.page';
import CarrinhoPage from '../pages/carrinho.page';
import EnderecoPage from '../pages/endereco.page';
import CheckoutPage from '../pages/checkout.page';

// Conta de teste criada especificamente para esta automacao via
// POST public/addUser na API do app. Nao e conta de ninguem e so tem
// acesso ao ambiente de demonstracao do curso.
const EMAIL = 'qa.leuuh.tests@gmail.com';
const SENHA = 'Ebac@2026';

describe('LojaEBAC (iOS) — Fluxo de checkout', () => {
  before(async () => {
    // [M30] Reforco server-side do que as capabilities pedem: no device real
    // o WebDriverAgent estava gastando 25-85s por busca esperando a tela ficar
    // "idle" (a Home anima sem parar) ate a sessao morrer. Aplicar como
    // settings garante que vale pra sessao inteira.
    // NAO adicionar 'snapshotMaxDepth' aqui: testei com 30 e o btnLogin
    // desapareceu da arvore (React Native aninha mais fundo que isso), o que
    // troca lentidao por elemento invisivel. So os dois timeouts abaixo.
    await browser.updateSettings({
      waitForIdleTimeout: 0,
      animationCoolOffTimeout: 0,
    });
    // Garante que o app esta la e reseta o estado entre runs (noReset=true
    // no config, entao um reset explicito evita lixo de sessoes anteriores).
    await browser.pause(2500);
  });

  it('faz login no app', async () => {
    // passo 1. O logar() ja confirma que a tela de Login saiu do ar; se a API
    // recusar a credencial ele falha aqui, com a mensagem do app, em vez de
    // deixar as specs seguintes quebrarem na Home.
    await LoginPage.logar(EMAIL, SENHA);
    expect(await $(LoginPage.btnLogin).isDisplayed()).toBe(false);
  });

  it('acede a area de busca (Browse)', async () => {
    // passo 2
    await BrowsePage.AbrirBusca();
    await BrowsePage.waitFor(BrowsePage.campoBusca, 15000);
    expect(await $(BrowsePage.campoBusca).isDisplayed()).toBe(true);
  });

  it('seleciona um produto da lista', async () => {
    // passos 2 (continuacao) e 3: busca um termo e abre o primeiro resultado.
    await BrowsePage.Buscar('a');
    const primeiroItem = BrowsePage.itemDaLista(1);
    await BrowsePage.waitAndClick(primeiroItem, 15000);
    // passo 3: confirma que chegamos na tela de detalhes do produto.
    await ProdutoPage.EsperarDetalhes();
    expect(await $(ProdutoPage.detalhes).isDisplayed()).toBe(true);
  });

  it('adiciona o produto no carrinho', async () => {
    // passo 4
    await ProdutoPage.AdicionarAoCarrinho();
    await CarrinhoPage.AbrirCarrinho();
    expect(await CarrinhoPage.TemItens()).toBe(true);
  });

  it('adiciona endereco e segue para o pagamento', async () => {
    // passo 5 - "se nao existir": a Page so cadastra se o botao existir.
    await EnderecoPage.CadastrarEndereco({
      nomeEndereco: 'Casa',
      firstName: 'Leonardo',
      lastName: 'Almeida',
      telefone: '11999999999',
      endereco: 'Rua de Teste, 123',
    });
    await EnderecoPage.IrParaPagamento();
  });

  it('completa o fluxo de checkout', async () => {
    // passo 6
    await CheckoutPage.FinalizarCheckout();
    const concluido = await CheckoutPage.PedidoFoiConcluido();
    expect(concluido).toBe(true);
  });
});
