import { useState } from 'react';
import {
  FileSpreadsheet, History, Megaphone, Pencil, Search, Trash2, UserCheck, UserPlus, UserX,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../../admin/ui/Pagina';
import { classeInput } from '../../admin/ui/Campos';

const ACOES = {
  cadastro: { icone: UserPlus, cor: 'bg-green-50 text-green-700' },
  importacao: { icone: FileSpreadsheet, cor: 'bg-green-50 text-green-700' },
  edicao: { icone: Pencil, cor: 'bg-gray-100 text-gray-600' },
  ativacao: { icone: UserCheck, cor: 'bg-blue-50 text-blue-700' },
  bloqueio: { icone: UserX, cor: 'bg-amber-50 text-amber-700' },
  exclusao: { icone: Trash2, cor: 'bg-red-50 text-red-700' },
  aviso: { icone: Megaphone, cor: 'bg-brand-soft text-brand-dark' },
};

const quando = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Historico() {
  const { dados, erro, carregando, recarregar } = useApi('/rh/historico');
  const [busca, setBusca] = useState('');
  const termo = busca.trim().toLowerCase();
  const lista = (dados ?? []).filter((h) => !termo || `${h.autor} ${h.descricao}`.toLowerCase().includes(termo));

  return (
    <>
      <CabecalhoPagina titulo="Histórico" descricao="Tudo o que foi feito neste painel, por quem e quando (últimas 300 ações)." />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        <Cartao>
          <div className="border-b border-gray-100 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input type="search" placeholder="Buscar por nome, CPF ou quem fez" aria-label="Buscar no histórico" value={busca} onChange={(e) => setBusca(e.target.value)} className={`${classeInput} pl-9`} />
            </div>
          </div>
          {lista.length === 0 ? (
            <Vazio icone={History} titulo={termo ? 'Nada encontrado' : 'Nenhuma ação registrada ainda'} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {lista.map((h) => {
                const { icone: Icone, cor } = ACOES[h.acao] ?? ACOES.edicao;
                return (
                  <li key={h.id} className="flex items-start gap-3 px-4 py-3">
                    <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${cor}`}>
                      <Icone className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">{h.descricao}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {h.autor} · <span className="tabular-nums">{quando(h.data_hora)}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Cartao>
      </EstadoCarregamento>
    </>
  );
}
