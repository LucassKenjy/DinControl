const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('../frontend/node_modules/typescript');
function load(file, name) {
  const source = fs.readFileSync(file, 'utf8').replace(/^import .*$/gm, '').split('interface ')[0];
  const code = ts.transpile(source, { target: ts.ScriptTarget.ES2022 });
  return vm.runInNewContext(code + '\n' + name, {
    chaveData: (d) => [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-'),
    normalizarTexto: (s) => s.toLowerCase(),
  });
}
const monthly = load('frontend/src/components/transactions/charts/MonthlyChart.tsx', 'obterMovimentacaoMensal');
const investment = load('frontend/src/components/transactions/charts/InvestmentChart.tsx', 'obterInvestimentosMensais');
const tx = (data, tipo, valor, categoria='Outros') => ({data: data+'T12:00:00', tipo, valor, categoria});
test('selected month excludes adjacent months and other years; sums same-day transactions', () => {
  const data = [tx('2024-02-29','ENTRADA',100), tx('2024-02-29','ENTRADA',50), tx('2024-02-01','SAIDA',20), tx('2025-02-01','ENTRADA',999), tx('2024-03-01','SAIDA',999)];
  const result = monthly(data, '2024-02');
  assert.equal(result.entradas.length,29);
  assert.equal(result.entradas[28],150);
  assert.equal(result.saidas[0],20);
  assert.equal(result.entradas.reduce((a,b)=>a+b),150);
  assert.equal(result.saidas.reduce((a,b)=>a+b),20);
});
test('investments respect selected month and empty periods contain zeroes', () => {
  const data = [tx('2023-12-31','SAIDA',40,'Investimento'), tx('2024-12-31','SAIDA',900,'Investimento'), tx('2023-12-31','SAIDA',100,'Outros')];
  assert.equal(investment(data,'2023-12')[30],40);
  assert.equal(investment(data,'2024-02').length,29);
  assert.equal(investment(data,'2025-02').length,28);
  assert.equal(investment(data,'2024-02').reduce((a,b)=>a+b),0);
});

function postRoute() {
  const source = fs.readFileSync('src/server.js','utf8').replace(/\r\n/g, '\n');
  const start = source.indexOf('app.post(\n    "/transactions"');
  const end = source.indexOf('app.put(\n    "/transactions/:id"', start);
  let handler;
  const queries = [];
  vm.runInNewContext(source.slice(start,end), {
    app: { post: (_path, _auth, fn) => { handler = fn; } },
    autenticarUsuario() {}, validarDadosTransacao: () => null,
    pool: { query: async (sql, args) => { queries.push({sql,args}); return {rows:[{data:args[4]}]}; } },
    console,
  });
  return {handler,queries};
}
test('API persists the selected date, rejects impossible dates, and allows legacy requests', async () => {
  for (const [date, expected] of [['2024-02-29T15:00:00.000Z',201], ['2025-02-29T15:00:00.000Z',400], ['',400], [null,400], [undefined,201]]) {
    const {handler,queries} = postRoute();
    let status;
    const res = { status(code) { status=code; return this; }, json() {} };
    await handler({body:{tipo:'ENTRADA',valor:10,categoria:'Salario',data:date},usuarioId:7},res);
    assert.equal(status,expected);
    if (expected===201) { assert.equal(queries[0].args[4],date ?? null); assert.equal(queries[0].args[3],7); }
    else assert.equal(queries.length,0);
  }
});
