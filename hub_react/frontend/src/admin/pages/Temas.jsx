import { useEffect, useState } from 'react';
import { CalendarClock, Eye, Pin, PowerOff, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { TEMAS, carregarTodosOsTemas } from '../../temas';
import { CabecalhoPagina, Cartao, EstadoCarregamento } from '../ui/Pagina';
import Botao from '../ui/Botao';
import Modal from '../ui/Modal';
import { Campo, Selo, Toggle, classeInput } from '../ui/Campos';
import { useFeedback } from '../ui/Feedback';
import PresentesSaco from './PresentesSaco';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const ddmmaaaa = (iso) => `${ddmm(iso)}/${iso.slice(0, 4)}`;
const mmddParaTexto = (mmdd) => `${mmdd.slice(3)}/${mmdd.slice(0, 2)}`;

const MODOS = [
  { id: 'automatico', icone: CalendarClock, titulo: 'Automático por data', texto: 'Cada tema habilitado entra e sai sozinho no seu período.' },
  { id: 'fixo', icone: Pin, titulo: 'Fixar um tema', texto: 'Um tema fica no ar até você mudar, ignorando as datas.' },
  { id: 'desligado', icone: PowerOff, titulo: 'Desligado', texto: 'O hub fica sempre com o visual padrão.' },
];

function urlPrevia(id, t) {
  const p = new URLSearchParams({ previa: id, mensagem: t.mensagem, efeitos: t.efeitos ? '1' : '0' });
  return `/?${p}`;
}

/** Miniatura do hub com o tema: cabeçalho e rodapé padrão, fundo temático. */
function MiniPrevia({ tema, mensagem }) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-gray-200" aria-hidden>
      <div className="relative flex h-10 items-center overflow-hidden bg-brand px-3 text-white">
        <img src="/images/logo.png" alt="" className="relative h-5" />
        {tema.Personagem && <tema.Personagem estatico />}
      </div>
      {tema.Pendentes && (
        <div className="relative">
          <tema.Pendentes mini />
        </div>
      )}
      <div className={`relative flex h-24 items-center justify-center gap-2.5 ${tema.fundo}`}>
        <div className="absolute inset-0" style={{ backgroundImage: tema.estampa, backgroundSize: '120px' }} />
        {tema.Cenario && <tema.Cenario efeitos={false} className="absolute bottom-1 left-1.5 w-[72px]" />}
        {tema.CenarioDireita && <tema.CenarioDireita estatico className="absolute right-1.5 bottom-1 w-[62px]" />}
        {['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500'].map((cor) => (
          <span key={cor} className={`relative size-8 rounded-[20%] shadow-sm ${cor}`} />
        ))}
      </div>
      <div className="truncate bg-brand px-2 py-1.5 text-center text-[11px] font-bold text-white">{mensagem || 'Desenvolvido pelo Setor de T.I.'}</div>
    </div>
  );
}

function SeletorDiaMes({ rotulo, valor, aoMudar }) {
  const [mes, dia] = valor.split('-');
  const atualizar = (novoMes, novoDia) => aoMudar(`${novoMes}-${novoDia}`);
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-gray-700">{rotulo}</legend>
      <div className="flex gap-2">
        <select aria-label={`${rotulo}: dia`} className={classeInput} value={dia} onChange={(e) => atualizar(mes, e.target.value)}>
          {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select aria-label={`${rotulo}: mês`} className={classeInput} value={mes} onChange={(e) => atualizar(e.target.value, dia)}>
          {MESES.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
        </select>
      </div>
    </fieldset>
  );
}

function PersonalizarTema({ id, valor, aoFechar, aoAplicar }) {
  const tema = TEMAS[id];
  const [t, setT] = useState(valor);
  const personalizado = t.periodo.tipo === 'personalizado';
  const mudar = (campo, v) => setT((atual) => ({ ...atual, [campo]: v }));

  return (
    <Modal
      aberto
      titulo={`${tema.emoji} Personalizar ${tema.nome}`}
      aoFechar={aoFechar}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao onClick={() => aoAplicar(t)}>Aplicar</Botao>
        </>
      }
    >
      <div className="space-y-5">
        <Campo rotulo="Mensagem no rodapé" opcional dica="Aparece abaixo de “Desenvolvido pelo Setor de T.I.”. Pode usar emojis.">
          {(campoId) => (
            <div className="flex gap-2">
              <input id={campoId} className={classeInput} maxLength={120} value={t.mensagem} onChange={(e) => mudar('mensagem', e.target.value)} />
              <Botao variante="secundario" onClick={() => mudar('mensagem', tema.mensagemPadrao)} className="shrink-0">Padrão</Botao>
            </div>
          )}
        </Campo>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Enfeites animados</p>
            <p className="text-xs text-gray-500">O personagem cruzando o topo e os enfeites caindo devagar no fundo. Desligado, fica só a estampa.</p>
          </div>
          <Toggle ligado={t.efeitos} aoMudar={(v) => mudar('efeitos', v)} rotulo="Enfeites animados" />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">Período no modo automático</legend>
          <div className="space-y-2">
            {[
              { tipo: 'auto', titulo: 'Padrão', texto: tema.periodoAuto },
              { tipo: 'personalizado', titulo: 'Personalizado', texto: 'Escolha as datas. Repete todo ano.' },
            ].map((op) => (
              <label key={op.tipo} className={`flex cursor-pointer gap-3 rounded-lg p-3 ring-1 ring-inset has-focus-visible:ring-2 has-focus-visible:ring-brand ${t.periodo.tipo === op.tipo ? 'bg-brand-soft ring-brand/40' : 'ring-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="periodo"
                  className="mt-0.5 accent-brand-dark"
                  checked={t.periodo.tipo === op.tipo}
                  onChange={() => mudar('periodo', op.tipo === 'auto' ? { tipo: 'auto' } : { tipo: 'personalizado', inicio: '12-01', fim: '12-31', ...(valor.periodo.tipo === 'personalizado' ? valor.periodo : {}) })}
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">{op.titulo}</span>
                  <span className="block text-xs text-gray-500">{op.texto}</span>
                </span>
              </label>
            ))}
          </div>
          {personalizado && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SeletorDiaMes rotulo="Começa em" valor={t.periodo.inicio} aoMudar={(v) => mudar('periodo', { ...t.periodo, inicio: v })} />
              <SeletorDiaMes rotulo="Termina em" valor={t.periodo.fim} aoMudar={(v) => mudar('periodo', { ...t.periodo, fim: v })} />
            </div>
          )}
        </fieldset>
      </div>
    </Modal>
  );
}

export default function Temas() {
  const { dados, erro, carregando, recarregar, setDados } = useApi('/admin/temas');
  const { avisar } = useFeedback();
  const [rascunho, setRascunho] = useState(null);
  const [personalizando, setPersonalizando] = useState(null);
  // animações de todos os temas, só para as miniaturas (no hub, cada tema carrega o seu)
  const [pacotes, setPacotes] = useState({});
  useEffect(() => {
    carregarTodosOsTemas().then(setPacotes).catch(() => {});
  }, []);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (dados) setRascunho(dados.config);
  }, [dados]);

  const alterado = rascunho && JSON.stringify(rascunho) !== JSON.stringify(dados?.config);
  const mudarTema = (id, valor) => setRascunho((r) => ({ ...r, temas: { ...r.temas, [id]: valor } }));

  async function salvar() {
    setSalvando(true);
    try {
      setDados(await api('/admin/temas', { method: 'PUT', body: rascunho }));
      avisar('Temas salvos. O hub já mostra a nova configuração.');
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setSalvando(false);
    }
  }

  const ativo = dados?.ativo && TEMAS[dados.ativo.id];
  const proximo = dados && dados.config.modo === 'automatico' && !dados.ativo
    ? Object.entries(dados.calendario)
        .filter(([id]) => dados.config.temas[id]?.habilitado)
        .sort(([, a], [, b]) => a.inicio.localeCompare(b.inicio))[0]
    : null;

  return (
    <div className={alterado ? 'pb-20' : ''}>
      <CabecalhoPagina titulo="Temas" descricao="Deixe o hub no clima das datas comemorativas com um fundo suave e uma mensagem no rodapé. O cabeçalho e o rodapé continuam sempre na cor da marca." />

      <EstadoCarregamento carregando={carregando || (dados && !rascunho)} erro={erro} recarregar={recarregar}>
        {rascunho && (
          <div className="space-y-6">
            {/* Situação atual */}
            <Cartao className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl ${ativo ? ativo.fundo : 'bg-gray-100'}`}>
                {ativo ? ativo.emoji : <Sparkles className="size-6 text-gray-400" aria-hidden />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">No hub agora</p>
                <p className="font-semibold text-gray-900">
                  {ativo ? `Tema ${ativo.nome}` : 'Visual padrão'}
                  {dados.ativo?.origem === 'fixo' && <span className="font-normal text-gray-500"> · fixado manualmente</span>}
                  {dados.ativo?.ate && <span className="font-normal text-gray-500"> · até {ddmmaaaa(dados.ativo.ate)}</span>}
                </p>
                {proximo && (
                  <p className="mt-0.5 text-sm text-gray-500">
                    Próximo: {TEMAS[proximo[0]].emoji} {TEMAS[proximo[0]].nome} em {ddmmaaaa(proximo[1].inicio)}
                  </p>
                )}
              </div>
            </Cartao>

            {/* Modo */}
            <section>
              <h2 className="mb-3 font-semibold text-gray-900">Como escolher o tema</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {MODOS.map(({ id, icone: Icone, titulo, texto }) => {
                  const marcado = rascunho.modo === id;
                  return (
                    <label key={id} className={`flex cursor-pointer gap-3 rounded-xl bg-white p-4 ring-1 ring-inset has-focus-visible:ring-2 has-focus-visible:ring-brand ${marcado ? 'ring-2 ring-brand-dark' : 'ring-gray-200 hover:ring-gray-300'}`}>
                      <input
                        type="radio"
                        name="modo"
                        className="sr-only"
                        checked={marcado}
                        onChange={() => setRascunho((r) => ({ ...r, modo: id, fixo: id === 'fixo' ? r.fixo ?? Object.keys(TEMAS)[0] : r.fixo }))}
                      />
                      <Icone className={`mt-0.5 size-5 shrink-0 ${marcado ? 'text-brand-dark' : 'text-gray-400'}`} aria-hidden />
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">{titulo}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">{texto}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {rascunho.modo === 'fixo' && (
                <div className="mt-3 max-w-xs">
                  <Campo rotulo="Tema fixado">
                    {(id) => (
                      <select id={id} className={classeInput} value={rascunho.fixo ?? ''} onChange={(e) => setRascunho((r) => ({ ...r, fixo: e.target.value }))}>
                        {Object.entries(TEMAS).map(([temaId, t]) => <option key={temaId} value={temaId}>{t.emoji} {t.nome}</option>)}
                      </select>
                    )}
                  </Campo>
                </div>
              )}
            </section>

            {/* Temas */}
            <section>
              <h2 className="mb-3 font-semibold text-gray-900">Temas disponíveis</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(TEMAS).map(([id, tema]) => {
                  const t = rascunho.temas[id];
                  const salvo = dados.config.temas[id];
                  const periodoMudou = JSON.stringify(t.periodo) !== JSON.stringify(salvo.periodo);
                  const emUso = dados.ativo?.id === id;
                  const ignorado = rascunho.modo !== 'automatico';
                  return (
                    <Cartao key={id} className="flex flex-col p-4">
                      <MiniPrevia tema={{ ...tema, ...pacotes[id] }} mensagem={t.mensagem} />
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                            {tema.emoji} {tema.nome}
                            {emUso && <Selo cor="verde">no ar</Selo>}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">{tema.descricao}</p>
                        </div>
                        <Toggle
                          ligado={t.habilitado}
                          disabled={ignorado}
                          aoMudar={(v) => mudarTema(id, { ...t, habilitado: v })}
                          rotulo={`${t.habilitado ? 'Desabilitar' : 'Habilitar'} ${tema.nome} no modo automático`}
                        />
                      </div>

                      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        <p>
                          <span className="font-medium text-gray-800">Período: </span>
                          {t.periodo.tipo === 'personalizado'
                            ? `${mmddParaTexto(t.periodo.inicio)} a ${mmddParaTexto(t.periodo.fim)} (personalizado)`
                            : tema.periodoAuto}
                        </p>
                        {!periodoMudou && (
                          <p className="mt-0.5">
                            <span className="font-medium text-gray-800">Próxima vez: </span>
                            {ddmmaaaa(dados.calendario[id].inicio)} a {ddmmaaaa(dados.calendario[id].fim)}
                          </p>
                        )}
                        {!t.efeitos && <p className="mt-0.5">Enfeites animados desligados (só a estampa).</p>}
                      </div>

                      <div className="mt-auto flex gap-2 pt-4">
                        <Botao variante="secundario" icone={SlidersHorizontal} className="flex-1" onClick={() => setPersonalizando(id)}>Personalizar</Botao>
                        <a
                          href={urlPrevia(id, t)}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                        >
                          <Eye className="size-4" aria-hidden />
                          Pré-visualizar
                        </a>
                      </div>
                    </Cartao>
                  );
                })}
              </div>
              {rascunho.modo !== 'automatico' && (
                <p className="mt-3 text-xs text-gray-500">Habilitar/desabilitar só vale no modo automático.</p>
              )}
            </section>

            <PresentesSaco />
          </div>
        )}
      </EstadoCarregamento>

      {alterado && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p className="text-sm text-gray-600">Você tem alterações não salvas.</p>
            <div className="flex gap-2">
              <Botao variante="secundario" onClick={() => setRascunho(dados.config)}>Descartar</Botao>
              <Botao onClick={salvar} carregando={salvando}>Salvar</Botao>
            </div>
          </div>
        </div>
      )}

      {personalizando && (
        <PersonalizarTema
          id={personalizando}
          valor={rascunho.temas[personalizando]}
          aoFechar={() => setPersonalizando(null)}
          aoAplicar={(valor) => {
            mudarTema(personalizando, valor);
            setPersonalizando(null);
          }}
        />
      )}
    </div>
  );
}
