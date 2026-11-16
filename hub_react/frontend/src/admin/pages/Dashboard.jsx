import { useState } from 'react';
import { Link } from 'react-router';
import { BarChart3, LayoutGrid, LogIn, MousePointerClick, Table2, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../ui/Pagina';

const numero = new Intl.NumberFormat('pt-BR');
const diaCurto = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const diaLongo = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
const dataHora = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function Indicador({ icone: Icone, rotulo, valor, detalhe, para }) {
  const conteudo = (
    <>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Icone className="size-4 text-gray-400" aria-hidden />
        {rotulo}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-gray-500">{detalhe}</p>}
    </>
  );
  const classe = 'block rounded-xl bg-white p-5 shadow-xs ring-1 ring-gray-200';
  return para ? (
    <Link to={para} className={`${classe} transition-shadow hover:shadow-md hover:ring-gray-300`}>{conteudo}</Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  );
}

/** Colunas por dia (série única): sem legenda, tooltip por barra, tabela alternativa. */
function GraficoCliquesPorDia({ dados }) {
  const [foco, setFoco] = useState(null);
  const [tabela, setTabela] = useState(false);
  const maximo = Math.max(...dados.map((d) => d.cliques), 1);
  const escala = Math.max(4, Math.ceil(maximo / 4) * 4); // topo "redondo" divisível em 4 faixas
  const linhas = [1, 0.75, 0.5, 0.25].map((f) => Math.round(escala * f));
  const total = dados.reduce((s, d) => s + d.cliques, 0);

  return (
    <Cartao className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Cliques por dia</h2>
          <p className="text-sm text-gray-500">{numero.format(total)} cliques nos últimos {dados.length} dias</p>
        </div>
        <button
          type="button"
          onClick={() => setTabela((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
        >
          {tabela ? <BarChart3 className="size-3.5" aria-hidden /> : <Table2 className="size-3.5" aria-hidden />}
          {tabela ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>

      {tabela ? (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-gray-500">
              <tr><th className="py-2 font-medium">Dia</th><th className="py-2 text-right font-medium">Cliques</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...dados].reverse().map((d) => (
                <tr key={d.dia}>
                  <td className="py-1.5 text-gray-700">{diaLongo(d.dia)}</td>
                  <td className="py-1.5 text-right text-gray-900 tabular-nums">{numero.format(d.cliques)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2 pt-3">
          {/* Eixo Y */}
          <div className="relative h-48 w-7 shrink-0 text-right text-[11px] text-gray-500 tabular-nums" aria-hidden>
            {linhas.map((v) => (
              <span key={v} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(v / escala) * 100}%` }}>{v}</span>
            ))}
            <span className="absolute right-0 bottom-0 translate-y-1/2">0</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative h-48" onMouseLeave={() => setFoco(null)}>
              {/* Grade discreta */}
              {linhas.map((v) => (
                <div key={v} className="absolute inset-x-0 border-t border-gray-100" style={{ bottom: `${(v / escala) * 100}%` }} aria-hidden />
              ))}
              <div className="absolute inset-x-0 bottom-0 border-t border-gray-300" aria-hidden />

              <div className="absolute inset-0 flex items-end" role="list" aria-label="Cliques por dia">
                {dados.map((d, i) => (
                  <div
                    key={d.dia}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${diaLongo(d.dia)}: ${d.cliques} cliques`}
                    onMouseEnter={() => setFoco(i)}
                    onFocus={() => setFoco(i)}
                    onBlur={() => setFoco(null)}
                    className="group relative flex h-full flex-1 items-end px-px focus:outline-none"
                  >
                    <div
                      className={`w-full rounded-t-[4px] transition-colors ${foco === i ? 'bg-brand-darker' : 'bg-brand-dark'} ${foco !== null && foco !== i ? 'opacity-50' : ''}`}
                      style={{ height: d.cliques ? `max(${(d.cliques / escala) * 100}%, 2px)` : 0 }}
                    />
                    {foco === i && (
                      <div
                        className={`pointer-events-none absolute z-10 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg ${
                          i < 4 ? 'left-0' : i > dados.length - 5 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                        style={{ bottom: `calc(${Math.min((d.cliques / escala) * 100, 70)}% + 8px)` }}
                      >
                        <p className="text-gray-300">{diaLongo(d.dia)}</p>
                        <p className="font-semibold tabular-nums">{numero.format(d.cliques)} {d.cliques === 1 ? 'clique' : 'cliques'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Eixo X: primeiro, meio e último dia */}
            <div className="mt-2 flex justify-between text-[11px] text-gray-500 tabular-nums" aria-hidden>
              <span>{diaCurto(dados[0].dia)}</span>
              <span>{diaCurto(dados[Math.floor(dados.length / 2)].dia)}</span>
              <span>{diaCurto(dados.at(-1).dia)}</span>
            </div>
          </div>
        </div>
      )}
    </Cartao>
  );
}

function MaisAcessados({ itens, dias }) {
  const maximo = Math.max(...itens.map((i) => i.cliques), 1);
  return (
    <Cartao className="p-5">
      <h2 className="font-semibold text-gray-900">Sistemas mais acessados</h2>
      <p className="mb-4 text-sm text-gray-500">Últimos {dias} dias</p>
      {itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">Nenhum clique registrado ainda.</p>
      ) : (
        <ol className="space-y-3">
          {itens.map((item) => (
            <li key={item.id} title={`${item.nome}: ${item.cliques} cliques`}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="truncate text-gray-700">{item.nome}</span>
                <span className="font-medium text-gray-900 tabular-nums">{numero.format(item.cliques)}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-brand-dark" style={{ width: `${(item.cliques / maximo) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Cartao>
  );
}

export default function Dashboard() {
  const { dados, erro, carregando, recarregar } = useApi('/admin/dashboard');
  const t = dados?.totais;

  return (
    <>
      <CabecalhoPagina titulo="Visão geral" descricao="Uso do hub e resumo do que está publicado." />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        {dados && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Indicador icone={MousePointerClick} rotulo="Cliques" valor={numero.format(t.cliques_periodo)} detalhe={`Últimos ${dados.dias} dias`} />
              <Indicador icone={LogIn} rotulo="Acessos hoje" valor={numero.format(t.logins_hoje)} detalhe="Logins realizados" />
              <Indicador icone={Users} rotulo="Colaboradores ativos" valor={numero.format(t.usuarios_7_dias)} detalhe={`Entraram nos últimos 7 dias, de ${numero.format(t.usuarios_ativos)} cadastrados`} para="/admin/usuarios" />
              <Indicador icone={LayoutGrid} rotulo="Sistemas publicados" valor={numero.format(t.links_ativos)} detalhe={`${numero.format(t.links_total - t.links_ativos)} inativos · ${t.categorias} categorias · ${t.banners_ativos} banners`} para="/admin/sistemas" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3"><GraficoCliquesPorDia dados={dados.cliquesPorDia} /></div>
              <div className="lg:col-span-2"><MaisAcessados itens={dados.maisAcessados} dias={dados.dias} /></div>
            </div>

            <Cartao>
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="font-semibold text-gray-900">Últimos acessos</h2>
              </div>
              {dados.ultimosLogins.length === 0 ? (
                <Vazio icone={LogIn} titulo="Nenhum acesso registrado" texto="Os logins passam a ser registrados a partir desta versão." />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {dados.ultimosLogins.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                      <span className="truncate font-medium text-gray-800">{l.nome}</span>
                      <span className="shrink-0 text-gray-500 tabular-nums">
                        <span className="hidden sm:inline">{l.ip} · </span>{dataHora(l.data_hora)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          </div>
        )}
      </EstadoCarregamento>
    </>
  );
}
