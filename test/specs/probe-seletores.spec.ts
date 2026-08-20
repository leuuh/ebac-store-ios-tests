// test/specs/probe-seletores.spec.ts
//
// [TEMPORARIO - diagnostico de performance]
//
// Motivo: no device real do Sauce Labs cada findElement por "accessibility id"
// esta levando 26s a 60s, e a terceira busca estoura e mata a sessao
// ("invalid session id"). Ja zeramos waitForIdleTimeout e animationCoolOffTimeout
// e o custo continuou igual, entao o gargalo NAO e o idle do WebDriverAgent.
//
// Este probe nao valida regra de negocio: ele so cronometra as tres formas de
// localizar o MESMO elemento e imprime o tempo de cada uma, para eu escolher a
// estrategia com dado medido em vez de chute. Some do repo assim que a decisao
// estiver tomada.
import { browser } from '@wdio/globals';

// Cronometra uma busca e imprime na hora. Imprimir dentro da funcao (e nao no
// fim do teste) e proposital: se a sessao morrer no meio, o que ja mediu ficou
// registrado no log do CI.
async function medir(rotulo: string, seletor: string) {
  const inicio = Date.now();
  let desfecho: string;
  try {
    const el = await $(seletor);
    const existe = await el.isExisting();
    desfecho = existe ? 'ACHOU' : 'nao achou';
  } catch (err) {
    desfecho = `ERRO ${(err as Error).message.slice(0, 60)}`;
  }
  const ms = Date.now() - inicio;
  console.log(`[probe] ${rotulo.padEnd(18)} | ${String(ms).padStart(6)} ms | ${desfecho} | ${seletor}`);
  return ms;
}

describe('[probe] custo dos seletores no device real', () => {
  it('cronometra accessibility id x predicate string x class chain', async () => {
    // Comeco pelas estrategias que espero serem rapidas: se a sessao morrer no
    // meio do probe, os dados mais valiosos ja terao sido impressos.
    await medir('class chain', '-ios class chain:**/XCUIElementTypeButton[`name == "btnLogin"`]');
    await medir('predicate name', '-ios predicate string:name == "btnLogin"');
    await medir('predicate tipo+name', '-ios predicate string:type == "XCUIElementTypeButton" AND name == "btnLogin"');
    await medir('accessibility id', '~btnLogin');

    // Elemento que sabidamente nao existe: mostra o custo do pior caso, que e
    // justamente o que vinha estourando 60s e derrubando a sessao.
    await medir('id inexistente', '~nao-existe-xyz');

    // Por ultimo o pageSource: e a medicao mais cara, mas revela o tamanho da
    // arvore de acessibilidade — a suspeita principal para o custo das buscas.
    const inicio = Date.now();
    try {
      const fonte = await browser.getPageSource();
      console.log(`[probe] pageSource        | ${String(Date.now() - inicio).padStart(6)} ms | ${fonte.length} chars`);
    } catch (err) {
      console.log(`[probe] pageSource FALHOU apos ${Date.now() - inicio} ms: ${(err as Error).message.slice(0, 80)}`);
    }
  });
});
