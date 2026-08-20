// test/specs/probe-seletores.spec.ts
//
// [TEMPORARIO - diagnostico]
//
// Historico das rodadas no device real:
//   rodada 1 (noReset:true)  todas as estrategias de seletor custaram ~57s e
//                            nao acharam nada. Trocar seletor nao resolve.
//   rodada 2 (noReset:true)  pageSource OK em 6.7s, arvore de 142 elementos,
//                            names 'tab-Home'/'tab-Browse'/'tab-Account' e
//                            NENHUM 'btnLogin' -> o app abria JA LOGADO.
//   rodada 3 (noReset:false) pageSource pendura 60823 ms e a sessao morre
//                            ("A session is either terminated or not started").
//                            As buscas seguintes falham em ~500ms porque a
//                            sessao ja estava morta.
//
// O que a rodada 3 provou: a sessao NASCE viva (os executeScript de job-name e
// context responderam). Quem a mata e o getPageSource pendurando 60s, que e o
// limite do proxy do Sauce. Com o app logado o mesmo comando custava 6.7s.
//
// Por isso esta rodada 4 inverte a ordem. O pageSource vai POR ULTIMO, porque
// ele e o comando suicida: tudo que vinha depois dele media sessao morta e nao
// media nada. Antes dele:
//   1) screenshot  - o comando mais barato que existe e o unico que me diz de
//                    verdade QUAL tela esta na frente. Ate agora eu so tinha
//                    inferencia; o print vira artefato do workflow.
//   2) buscas      - com timeout curto, pra medir custo real sem estourar.
import { browser } from '@wdio/globals';
import { mkdirSync, writeFileSync } from 'node:fs';

describe('[probe] arvore de acessibilidade no device real', () => {
  it('tira print e mede buscas antes de qualquer pageSource', async () => {
    // O app esta sendo reinstalado (noReset:false); dou tempo de sair do splash
    // e de qualquer alerta de permissao do iOS aparecer.
    await browser.pause(20000);

    // ---- 1. screenshot: barato e o unico jeito de eu ver a tela ----
    try {
      const inicio = Date.now();
      const b64 = await browser.takeScreenshot();
      mkdirSync('errorShots', { recursive: true });
      writeFileSync('errorShots/probe-tela.png', Buffer.from(b64, 'base64'));
      console.log(`[probe] screenshot OK | ${Date.now() - inicio} ms | ${b64.length} chars b64`);
    } catch (err) {
      console.log(`[probe] screenshot FALHOU: ${(err as Error).message.slice(0, 120)}`);
    }

    // ---- 2. alerta de sistema na frente? ----
    // App recem-instalado costuma subir com o alerta de permissao pendente, e
    // alerta pendente e causa classica de snapshot travado. Se tiver texto
    // aqui, achei o culpado do getPageSource de 60s.
    try {
      const texto = await browser.getAlertText();
      console.log(`[probe] ALERTA NA TELA: ${texto}`);
    } catch (err) {
      console.log(`[probe] sem alerta de sistema (${(err as Error).message.slice(0, 60)})`);
    }

    // ---- 3. buscas com timeout curto ----
    // Timeout de 8s: quero medir o custo, nao esperar o proxy do Sauce cortar.
    for (const alvo of ['~btnLogin', '~tab-Account']) {
      const inicio = Date.now();
      try {
        const existe = await $(alvo).waitForExist({ timeout: 8000 }).then(() => true).catch(() => false);
        console.log(`[probe] busca ${alvo} | ${Date.now() - inicio} ms | existe=${existe}`);
      } catch (err) {
        console.log(`[probe] busca ${alvo} | ${Date.now() - inicio} ms | ERRO ${(err as Error).message.slice(0, 90)}`);
      }
    }
  });

  // Fica isolado no ultimo teste de proposito: se ele matar a sessao, o que
  // interessa ja foi medido e publicado acima.
  it('so entao captura o pageSource (comando que mata a sessao)', async () => {
    const inicio = Date.now();
    let fonte = '';
    try {
      fonte = await browser.getPageSource();
      console.log(`[probe] pageSource OK | ${Date.now() - inicio} ms | ${fonte.length} chars`);
    } catch (err) {
      console.log(`[probe] pageSource FALHOU apos ${Date.now() - inicio} ms: ${(err as Error).message.slice(0, 120)}`);
      return;
    }

    const tipos: Record<string, number> = {};
    for (const m of fonte.matchAll(/<(XCUIElementType\w+)/g)) {
      tipos[m[1]] = (tipos[m[1]] ?? 0) + 1;
    }
    const total = Object.values(tipos).reduce((a, b) => a + b, 0);
    console.log(`[probe] total de elementos na arvore: ${total}`);

    const nomes = [...fonte.matchAll(/name="([^"]{1,60})"/g)].map((m) => m[1]);
    const unicos = [...new Set(nomes)];
    console.log(`[probe] ${unicos.length} names unicos na tela:`);
    console.log(`[probe] names: ${unicos.slice(0, 120).join(' | ')}`);
  });
});
