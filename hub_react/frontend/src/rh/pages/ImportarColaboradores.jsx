import { useMemo, useState } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { cpfValido, formatarCpf, somenteDigitos } from '../../lib/cpf';
import Botao from '../../admin/ui/Botao';
import Modal from '../../admin/ui/Modal';
import { classeInput } from '../../admin/ui/Campos';
import { useFeedback } from '../../admin/ui/Feedback';

const MAX = 500;

/**
 * Lê o texto colado de uma planilha: uma pessoa por linha, com nome e CPF em
 * qualquer ordem (tab, ";" ou "," entre as colunas). Linhas sem número (ex.: o
 * cabeçalho "Nome | CPF") são ignoradas.
 */
function lerLinhas(texto) {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => /\d/.test(linha))
    .map((linha) => {
      // números com cara de CPF; se houver outros (ex.: matrícula), fica o que for um CPF válido
      const candidatos = [...linha.matchAll(/\d{3}\.\d{3}\.\d{3}-\d{2}|\d{9,11}/g)].map((m) => ({
        trecho: m[0],
        // o Excel corta os zeros à esquerda de CPFs como 012.345.678-90
        cpf: somenteDigitos(m[0]).padStart(11, '0'),
      }));
      const achado = candidatos.find((c) => cpfValido(c.cpf)) ?? candidatos[0];
      const cpf = achado?.cpf ?? somenteDigitos(linha);
      const nome = (achado ? linha.replace(achado.trecho, ' ') : linha.replace(/[\d.-]+/g, ' '))
        .replace(/[\t;,|]+/g, ' ')
        .replace(/(^|\s)[\d./-]+(?=\s|$)/g, ' ') // outras colunas numéricas (matrícula, data...)
        .replace(/\s+/g, ' ')
        .trim();
      const problema = !nome ? 'Sem nome' : !cpfValido(cpf) ? 'CPF inválido' : null;
      return { nome, cpf, problema };
    });
}

export function ImportarColaboradores({ aoFechar, aoImportar }) {
  const { avisar } = useFeedback();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);

  const linhas = useMemo(() => lerLinhas(texto), [texto]);
  const validas = linhas.filter((l) => !l.problema);
  const comProblema = linhas.length - validas.length;

  async function importar() {
    setEnviando(true);
    setErro('');
    try {
      const r = await api('/rh/colaboradores/importar', { method: 'POST', body: { linhas: validas } });
      setResultado(r);
      if (r.criados) {
        avisar(`${r.criados} colaborador(es) cadastrado(s).`);
        aoImportar();
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <Modal aberto titulo="Cadastro em lote concluído" aoFechar={aoFechar} largura="max-w-2xl" rodape={<Botao onClick={aoFechar}>Fechar</Botao>}>
        <div className="space-y-4">
          <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-800 ring-1 ring-green-200">
            <CircleCheck className="size-4 shrink-0" aria-hidden />
            {resultado.criados} pessoa(s) cadastrada(s). Já podem entrar no hub com o CPF.
          </p>
          {resultado.problemas.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800">
                <TriangleAlert className="size-4" aria-hidden />
                {resultado.problemas.length} não foram cadastrada(s):
              </p>
              <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto rounded-lg text-sm ring-1 ring-gray-200">
                {resultado.problemas.map((p) => (
                  <li key={`${p.linha}-${p.cpf}`} className="flex flex-wrap justify-between gap-x-4 px-3 py-2">
                    <span className="text-gray-800">{p.nome || '(sem nome)'} <span className="text-gray-500 tabular-nums">{formatarCpf(p.cpf)}</span></span>
                    <span className="text-amber-700">{p.motivo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      aberto
      titulo="Cadastrar vários colaboradores"
      descricao="Copie as colunas Nome e CPF da planilha (ex.: turma de admissão) e cole abaixo."
      aoFechar={aoFechar}
      largura="max-w-2xl"
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao onClick={importar} carregando={enviando} disabled={!validas.length || validas.length > MAX}>
            {validas.length ? `Cadastrar ${validas.length} pessoa(s)` : 'Cadastrar'}
          </Botao>
        </>
      }
    >
      <div className="space-y-4">
        <textarea
          aria-label="Lista de nomes e CPFs"
          rows={8}
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={'Maria da Silva\t123.456.789-09\nJoão Pereira\t98765432100'}
          className={`${classeInput} font-mono text-xs`}
        />
        {linhas.length > 0 && (
          <>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900 tabular-nums">{validas.length}</strong> pronta(s) para cadastrar
              {comProblema > 0 && <> · <strong className="text-amber-700 tabular-nums">{comProblema}</strong> com problema (serão ignoradas)</>}
              {validas.length > MAX && <span className="text-red-700"> · máximo de {MAX} por vez</span>}
            </p>
            <div className="max-h-56 overflow-y-auto rounded-lg ring-1 ring-gray-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs text-gray-500">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Nome</th>
                    <th scope="col" className="px-3 py-2 font-medium">CPF</th>
                    <th scope="col" className="px-3 py-2 font-medium"><span className="sr-only">Situação</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {linhas.map((l, i) => (
                    <tr key={i} className={l.problema ? 'bg-amber-50/60' : ''}>
                      <td className="px-3 py-1.5 text-gray-800">{l.nome || '—'}</td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-600 tabular-nums">{formatarCpf(l.cpf) || '—'}</td>
                      <td className="px-3 py-1.5 text-right text-xs whitespace-nowrap text-amber-700">{l.problema}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="text-xs text-gray-500">
          Quem já tem cadastro não é duplicado. Todos entram com acesso liberado.
        </p>
        {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erro}</p>}
      </div>
    </Modal>
  );
}
