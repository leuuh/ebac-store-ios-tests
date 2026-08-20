// test/specs/probe-seletores.spec.ts
//
// [TEMPORARIO - diagnostico]
//
// Rodada 1 do probe mediu isto no device real:
//   class chain          52357 ms | nao achou
//   predicate name       55417 ms | nao achou
//   predicate tipo+name  57705 ms | nao achou
//   accessibility id     59590 ms | nao achou
//   id INEXISTENTE       59700 ms | nao achou   <-- mesmo tempo dos reais
//
// Duas conclusoes: (1) trocar a estrategia de seletor nao resolve nada, todas
// custam o mesmo; (2) buscar um id que sabidamente nao existe custa o mesmo que
// buscar btnLogin, ou seja o custo e a varredura da arvore de acessibilidade,
// nao a procura em si. ~57s por busca e o motivo dos testes estourarem.
//
// Nesta rodada 2 o pageSource vem PRIMEIRO (na rodada 1 ele ficou por ultimo e
// o timeout do mocha matou o teste antes de chegar nele). Preciso do tamanho da
// arvore e do que realmente esta na tela.
import { browser } from '@wdio/globals';

describe('[probe] arvore de acessibilidade no device real', () => {
  it('captura o pageSource antes de qualquer busca', async () => {
    // Sem nenhum findElement antes: quero o custo limpo de um unico snapshot.
    const inicio = Date.now();
    let fonte = '';
    try {
      fonte = await browser.getPageSource();
      console.log(`[probe] pageSource OK | ${Date.now() - inicio} ms | ${fonte.length} chars`);
    } catch (err) {
      console.log(`[probe] pageSource FALHOU apos ${Date.now() - inicio} ms: ${(err as Error).message.slice(0, 120)}`);
      return;
    }

    // Quantos elementos a arvore tem, por tipo. Se vier na casa dos milhares,
    // o snapshot lento esta explicado e a correcao e limitar a profundidade.
    const tipos: Record<string, number> = {};
    for (const m of fonte.matchAll(/<(XCUIElementType\w+)/g)) {
      tipos[m[1]] = (tipos[m[1]] ?? 0) + 1;
    }
    const total = Object.values(tipos).reduce((a, b) => a + b, 0);
    const ranking = Object.entries(tipos).sort((a, b) => b[1] - a[1]).slice(0, 12);
    console.log(`[probe] total de elementos na arvore: ${total}`);
    for (const [tipo, qtd] of ranking) {
      console.log(`[probe] tipo ${tipo.replace('XCUIElementType', '').padEnd(22)} ${qtd}`);
    }

    // Todo name/label/value visivel: e assim que descubro se btnLogin existe
    // com outro nome, ou se a tela nem e a de login.
    const nomes = [...fonte.matchAll(/name="([^"]{1,60})"/g)].map((m) => m[1]);
    const unicos = [...new Set(nomes)];
    console.log(`[probe] ${unicos.length} names unicos na tela:`);
    console.log(`[probe] names: ${unicos.slice(0, 120).join(' | ')}`);

    // Cabeca do XML: mostra qual app/tela esta em foco de verdade.
    console.log('[probe] ---- inicio do pageSource ----');
    for (const linha of fonte.slice(0, 2500).split('\n')) {
      console.log(`[probe] ${linha}`);
    }
    console.log('[probe] ---- fim do trecho ----');
  });

  it('mede uma unica busca depois do snapshot', async () => {
    // Uma so, para confirmar que o custo se repete a cada busca (ou seja, que
    // nao existe cache de snapshot entre comandos).
    const inicio = Date.now();
    const existe = await $('~btnLogin').isExisting();
    console.log(`[probe] busca pos-snapshot | ${Date.now() - inicio} ms | existe=${existe}`);
  });
});
