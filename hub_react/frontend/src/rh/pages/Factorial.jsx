import { useState } from 'react';
import { Link } from 'react-router';
import {
  CircleAlert, CircleCheck, Eye, RefreshCw, TriangleAlert, UserMinus, UserPen, UserPlus, UserRoundSearch, UserX,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { formatarCpf } from '../../lib/cpf';
import { CabecalhoPagina, Cartao, EstadoCarregamento } from '../../admin/ui/Pagina';
import Botao from '../../admin/ui/Botao';
import { useFeedback } from '../../admin/ui/Feedback';

const quando = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function UltimaSincronizacao({ ultima, intervaloHoras }) {
  if (!ultima) {
    return <p className="text-sm text-gray-500">Ainda não houve sincronização.</p>;
  }
  const por = ultima.quem === 'automático' ? 'automática' : `por ${ultima.quem}`;
  if (ultima.erro) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800 ring-1 ring-red-200">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span><strong>Falhou em {quando(ultima.quando)}</strong> ({por}): {ultima.erro}</span>
      </p>
    );
  }
  if (ultima.alerta) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span><strong>Pausada em {quando(ultima.quando)}:</strong> {ultima.alerta}</span>
      </p>
    );
  }
  return (
    <div className="text-sm text-gray-600">
      <p className="flex items-center gap-2 text-gray-800">
        <CircleCheck className="size-4 text-green-600" aria-hidden />
        Última sincronização em <strong>{quando(ultima.quando)}</strong> ({por})
      </p>
      <p className="mt-1 pl-6">
        {ultima.criados} cadastrado(s) · {ultima.bloqueados} bloqueado(s) · {ultima.renomeados} nome(s) atualizado(s)
        {intervaloHoras > 0 && <> · roda sozinha a cada {intervaloHoras} h</>}
      </p>
    </div>
  );
}

/** Uma categoria da prévia, com a lista de pessoas recolhível. */
function Grupo({ icone: Icone, cor, titulo, texto, itens, mostrarNovoNome = false }) {
  if (!itens.length) return null;
  return (
    <details className="group rounded-lg ring-1 ring-gray-200 open:ring-gray-300">
      <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 select-none">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${cor}`}>
          <Icone className="size-4" aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-gray-900">
            {titulo} <span className="tabular-nums">({itens.length})</span>
          </span>
          <span className="block text-xs text-gray-500">{texto}</span>
        </span>
        <span className="mt-1 text-xs text-gray-400 group-open:hidden">ver</span>
        <span className="mt-1 hidden text-xs text-gray-400 group-open:inline">ocultar</span>
      </summary>
      <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto border-t border-gray-100 text-sm">
        {itens.map((i, n) => (
          <li key={i.cpf ?? i.factorialId ?? n} className="flex flex-wrap justify-between gap-x-4 px-4 py-2">
            <span className="text-gray-800">
              {mostrarNovoNome ? <>{i.nome} → <strong>{i.novoNome}</strong></> : i.nome}
            </span>
            {i.cpf && <span className="text-gray-500 tabular-nums">{formatarCpf(i.cpf)}</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function Factorial() {
  const { dados, erro, carregando, recarregar } = useApi('/rh/factorial');
  const { avisar, confirmar } = useFeedback();
  const [previa, setPrevia] = useState(null);
  const [erroAcao, setErroAcao] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [aplicando, setAplicando] = useState(false);

  async function verificar() {
    setBuscando(true);
    setErroAcao('');
    try {
      setPrevia(await api('/rh/factorial/previa', { method: 'POST' }));
    } catch (e) {
      setErroAcao(e.message);
    } finally {
      setBuscando(false);
    }
  }

  async function aplicar() {
    const ok = await confirmar({
      titulo: 'Aplicar a sincronização?',
      mensagem: `${previa.criar.length} pessoa(s) serão liberadas no hub, ${previa.bloquear.length} bloqueada(s) e ${previa.renomear.length} terão o nome atualizado. Tudo fica registrado no histórico.`,
      textoConfirmar: 'Aplicar',
      perigo: previa.bloquear.length > 0,
    });
    if (!ok) return;
    setAplicando(true);
    setErroAcao('');
    try {
      const r = await api('/rh/factorial/sincronizar', { method: 'POST' });
      avisar(`Sincronizado: ${r.criados} cadastrado(s), ${r.bloqueados} bloqueado(s), ${r.renomeados} nome(s) atualizado(s).`);
      setPrevia(null);
      recarregar();
    } catch (e) {
      setErroAcao(e.message);
    } finally {
      setAplicando(false);
    }
  }

  const mudancas = previa ? previa.criar.length + previa.bloquear.length + previa.renomear.length : 0;

  return (
    <>
      <CabecalhoPagina
        titulo="Factorial"
        descricao="Os colaboradores ativos no Factorial podem entrar no hub com o CPF; quem é desligado lá é bloqueado aqui."
      />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        {dados && !dados.configurado ? (
          <Cartao className="flex items-start gap-3 p-5">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Integração ainda não configurada</p>
              <p className="mt-1">
                Peça à T.I. para colocar a chave da API do Factorial (<code className="rounded bg-gray-100 px-1">FACTORIAL_API_KEY</code>) na
                configuração do servidor. A chave é criada por um administrador no Factorial, em Configuração → API.
                Enquanto isso, os CPFs podem ser cadastrados em <Link to="/rh/colaboradores" className="font-medium text-brand-dark underline">Colaboradores</Link>.
              </p>
            </div>
          </Cartao>
        ) : dados && (
          <div className="space-y-6">
            <Cartao className="space-y-4 p-5">
              <UltimaSincronizacao ultima={dados.ultima} intervaloHoras={dados.intervaloHoras} />
              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <Botao icone={Eye} variante={previa ? 'secundario' : 'primario'} carregando={buscando} onClick={verificar}>
                  {previa ? 'Verificar de novo' : 'Verificar agora'}
                </Botao>
              </div>
              {erroAcao && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erroAcao}</p>}
            </Cartao>

            {previa && (
              <Cartao className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">O que mudaria no hub</h2>
                    <p className="text-sm text-gray-500">
                      {previa.ativosFactorial} colaborador(es) ativo(s) no Factorial
                      {previa.campoCpf && <> · CPF lido do campo <code className="rounded bg-gray-100 px-1">{previa.campoCpf}</code></>}
                    </p>
                  </div>
                  <Botao icone={RefreshCw} carregando={aplicando} disabled={!mudancas} onClick={aplicar}>
                    {mudancas ? 'Aplicar sincronização' : 'Nada a aplicar'}
                  </Botao>
                </div>

                {!mudancas && (
                  <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-800 ring-1 ring-green-200">
                    <CircleCheck className="size-4" aria-hidden />
                    O hub já está igual ao Factorial.
                  </p>
                )}

                <div className="space-y-2">
                  <Grupo icone={UserPlus} cor="bg-green-50 text-green-700" titulo="Serão liberados no hub" texto="Ativos no Factorial e ainda sem cadastro no hub." itens={previa.criar} />
                  <Grupo icone={UserX} cor="bg-red-50 text-red-700" titulo="Serão bloqueados" texto="Desligados no Factorial e ainda com acesso ao hub." itens={previa.bloquear} />
                  <Grupo icone={UserPen} cor="bg-gray-100 text-gray-600" titulo="Nome será atualizado" texto="O nome no hub ficará igual ao do Factorial." itens={previa.renomear} mostrarNovoNome />
                </div>

                {(previa.bloqueadosNoHub.length > 0 || previa.foraDoFactorial.length > 0 || previa.semCpf.length > 0) && (
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Para o RH conferir (a sincronização não mexe)</p>
                    <Grupo icone={UserMinus} cor="bg-amber-50 text-amber-700" titulo="Bloqueados no hub, mas ativos no Factorial" texto="Se foi engano, libere em Colaboradores." itens={previa.bloqueadosNoHub} />
                    <Grupo icone={UserRoundSearch} cor="bg-blue-50 text-blue-700" titulo="No hub, mas não encontrados no Factorial" texto="Ex.: terceiros e estagiários cadastrados à mão. Continuam com acesso." itens={previa.foraDoFactorial} />
                    <Grupo icone={CircleAlert} cor="bg-amber-50 text-amber-700" titulo="Ativos no Factorial sem CPF válido" texto="Corrija o CPF no Factorial para eles poderem entrar no hub." itens={previa.semCpf} />
                  </div>
                )}
              </Cartao>
            )}
          </div>
        )}
      </EstadoCarregamento>
    </>
  );
}
