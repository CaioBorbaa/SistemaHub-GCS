import { Link } from 'react-router';
import { Clock, FileSpreadsheet, LogIn, Megaphone, UserCheck, UserPlus, UserX, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { CabecalhoPagina, Cartao, EstadoCarregamento } from '../../admin/ui/Pagina';
import { ultimoAcesso } from '../datas';

const numero = new Intl.NumberFormat('pt-BR');
const diasDesde = (iso) => Math.floor((Date.now() - new Date(iso)) / 86_400_000);

function Indicador({ icone: Icone, rotulo, valor, detalhe, para }) {
  return (
    <Link to={para} className="block rounded-xl bg-white p-5 shadow-xs ring-1 ring-gray-200 transition-shadow hover:shadow-md hover:ring-gray-300">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Icone className="size-4 text-gray-400" aria-hidden />
        {rotulo}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">{numero.format(valor)}</p>
      {detalhe && <p className="mt-1 text-xs text-gray-500">{detalhe}</p>}
    </Link>
  );
}

function Atalho({ icone: Icone, titulo, texto, para }) {
  return (
    <Link to={para} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-xs ring-1 ring-gray-200 transition-shadow hover:shadow-md hover:ring-gray-300">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
        <Icone className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold text-gray-900">{titulo}</span>
        <span className="block text-xs text-gray-500">{texto}</span>
      </span>
    </Link>
  );
}

function Lista({ titulo, descricao, vazio, itens, render }) {
  return (
    <Cartao>
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">{titulo}</h2>
        {descricao && <p className="text-sm text-gray-500">{descricao}</p>}
      </div>
      {itens.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">{vazio}</p>
      ) : (
        <ul className="divide-y divide-gray-100">{itens.map(render)}</ul>
      )}
    </Cartao>
  );
}

export default function Inicio() {
  const { usuario } = useAuth();
  const { dados, erro, carregando, recarregar } = useApi('/rh/resumo');
  const t = dados?.totais;

  return (
    <>
      <CabecalhoPagina titulo={`Olá, ${usuario.nome.split(' ')[0]}`} descricao="Resumo de quem pode entrar no hub e de como está o uso." />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        {dados && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Indicador icone={Users} rotulo="Com acesso liberado" valor={t.ativos} detalhe={`${numero.format(t.inativos)} bloqueado(s)`} para="/rh/colaboradores?filtro=ativos" />
              <Indicador icone={LogIn} rotulo="Entraram hoje" valor={t.entraram_hoje} detalhe={`${numero.format(t.entraram_7_dias)} nos últimos 7 dias`} para="/rh/colaboradores?filtro=ativos" />
              <Indicador icone={UserCheck} rotulo="Nunca entraram" valor={t.nunca_entraram} detalhe="Cadastrados que ainda não usaram o hub" para="/rh/colaboradores?filtro=nunca" />
              <Indicador icone={UserX} rotulo={`Sem acesso há ${dados.diasSemAcesso}+ dias`} valor={t.sem_acesso} detalhe="Vale conferir se ainda estão na empresa" para="/rh/colaboradores?filtro=ativos" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Atalho icone={UserPlus} titulo="Novo colaborador" texto="Liberar um CPF" para="/rh/colaboradores" />
              <Atalho icone={FileSpreadsheet} titulo="Cadastrar vários" texto="Colar uma lista da planilha" para="/rh/colaboradores?importar=1" />
              <Atalho icone={Megaphone} titulo="Publicar aviso" texto="Comunicado em popup no hub" para="/rh/avisos" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Lista
                titulo="Últimos acessos"
                vazio="Ninguém entrou no hub ainda."
                itens={dados.ultimosAcessos}
                render={(a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <span className="truncate text-gray-800">{a.nome}</span>
                    <span className="shrink-0 text-gray-500 tabular-nums">{ultimoAcesso(a.data_hora)}</span>
                  </li>
                )}
              />
              <Lista
                titulo={`Sem acesso há mais de ${dados.diasSemAcesso} dias`}
                descricao="Ainda com acesso liberado. Se a pessoa saiu da empresa, bloqueie em Colaboradores."
                vazio="Todos com acesso liberado entraram recentemente."
                itens={dados.semAcesso}
                render={(a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <span className="truncate text-gray-800">{a.nome}</span>
                    <span className="flex shrink-0 items-center gap-1 text-gray-500 tabular-nums">
                      <Clock className="size-3.5" aria-hidden />
                      há {diasDesde(a.ultimo_acesso)} dias
                    </span>
                  </li>
                )}
              />
            </div>
          </div>
        )}
      </EstadoCarregamento>
    </>
  );
}
