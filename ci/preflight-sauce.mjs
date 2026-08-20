// Preflight do Sauce Labs: responde, em ~2s e antes de subir a suite, se a
// conta consegue alocar um device iOS agora — e com que nome pedir.
//
// Por que existe: o run 32394032972 gastou o job inteiro para morrer em 8s com
// "We couldn't find a MATCHING device ... You have 0 public device concurrency",
// mensagem enterrada no meio de 260 linhas de log do wdio. O dado que decide o
// rumo (tem device? qual?) precisa aparecer antes, sozinho e legivel.
const USER = process.env.SAUCE_USERNAME;
const KEY = process.env.SAUCE_ACCESS_KEY;
const BASE = 'https://api.us-west-1.saucelabs.com';

const auth = 'Basic ' + Buffer.from(`${USER}:${KEY}`).toString('base64');

async function get(path) {
  const res = await fetch(BASE + path, { headers: { Authorization: auth } });
  const texto = await res.text();
  try {
    return { ok: res.ok, status: res.status, dados: JSON.parse(texto) };
  } catch {
    return { ok: res.ok, status: res.status, texto: texto.slice(0, 300) };
  }
}

// Os endpoints do Sauce devolvem ora array, ora {entities:[...]}, ora
// {devices:[...]}, e os itens ora sao string (id) ora objeto. Normalizo aqui
// para o resto do script nao ficar cheio de ternario.
const paraLista = (v) => (Array.isArray(v) ? v : v?.entities || v?.devices || []);
const nomeDe = (d) => (typeof d === 'string' ? d : d?.name || d?.id || '');

const secao = (titulo) => console.log(`\n===== ${titulo} =====`);

const concorrencia = await get(`/rest/v1.2/users/${USER}/concurrency`);
secao('CONCORRÊNCIA PERMITIDA');
if (concorrencia.dados?.concurrency) {
  const { organization, team } = concorrencia.dados.concurrency;
  // 'rds' = real devices. 'mac_vms' = VMs Mac (simulador iOS na nuvem).
  console.log('organization.allowed:', JSON.stringify(organization?.allowed));
  console.log('team.allowed        :', JSON.stringify(team?.allowed));
  const rds = team?.allowed?.rds ?? organization?.allowed?.rds ?? 0;
  const macs = team?.allowed?.mac_vms ?? organization?.allowed?.mac_vms ?? 0;
  console.log(`\n-> device real (rds): ${rds}`);
  console.log(`-> VM Mac/simulador (mac_vms): ${macs}`);
} else {
  console.log('resposta inesperada:', JSON.stringify(concorrencia).slice(0, 400));
}

const livres = await get('/v1/rdc/devices/available');
const listaLivres = paraLista(livres.dados).map(nomeDe);
const iosLivres = listaLivres.filter((n) => /iphone|ipad/i.test(n));
const iosFree = iosLivres.filter((n) => /_free/i.test(n));

secao('DEVICES LIVRES AGORA');
console.log(`total: ${listaLivres.length} | iOS: ${iosLivres.length} | iOS do pool free: ${iosFree.length}`);
console.log('\niPhones do pool "free" (o que um trial costuma poder pegar):');
console.log(iosFree.filter((n) => /iphone/i.test(n)).slice(0, 30).join('\n') || '(nenhum)');

// O catalogo diz o que a conta enxerga; o descritor de um device diz o nome
// canonico para a capability e se ele e publico ou privado.
const catalogo = await get('/v1/rdc/devices');
const listaCatalogo = paraLista(catalogo.dados);
const iphonesCatalogo = listaCatalogo.filter((d) => /iphone/i.test(nomeDe(d)));

secao('CATÁLOGO VISÍVEL PARA A CONTA');
console.log(`itens: ${listaCatalogo.length} | iPhones: ${iphonesCatalogo.length}`);
const amostra = iphonesCatalogo.slice(0, 3);
for (const d of amostra) {
  if (typeof d === 'object') {
    console.log(
      JSON.stringify({
        id: d.id,
        name: d.name,
        os: d.os,
        osVersion: d.osVersion,
        isPrivate: d.isPrivate,
        isArm: d.isArm,
        suportaAppium: d.supportsAppiumWebAppTesting,
      })
    );
  } else {
    console.log(d);
  }
}
