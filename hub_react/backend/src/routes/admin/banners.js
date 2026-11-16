import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../../config.js';
import { proximaOrdem, query, queryOne, salvarOrdem } from '../../db.js';
import { HttpError, flag, idParam, imagemDoCampo, listaDeIds, uploadImagens, urlOpcional } from '../../util.js';
import { urlBanner } from '../publico.js';

const router = Router();
const upload = uploadImagens('imagem', 'popup');

// O que acontece ao clicar no banner
const ACOES = ['nenhuma', 'link', 'popup'];

async function salvarArquivo(imagem) {
  const nome = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${imagem.ext}`;
  await fs.mkdir(config.pastas.banners, { recursive: true });
  await fs.writeFile(path.join(config.pastas.banners, nome), imagem.buffer);
  return nome;
}

async function removerArquivo(nome) {
  if (!nome) return;
  await fs.rm(path.join(config.pastas.banners, path.basename(nome)), { force: true });
}

async function buscar(id) {
  const banner = await queryOne('SELECT id, imagem_nome, popup_nome FROM banners WHERE id = ?', [id]);
  if (!banner) throw new HttpError(404, 'Banner não encontrado.');
  return banner;
}

const temLink = (url) => Boolean(url && url !== '#');

/** Lê "ao clicar" do formulário e valida o que cada opção exige. */
function acaoDoFormulario(req, bannerAtual = null) {
  const acao = ACOES.includes(req.body.acao) ? req.body.acao : temLink(req.body.link_url) ? 'link' : 'nenhuma';
  const link = acao === 'link' ? urlOpcional(req.body.link_url) : '';
  if (acao === 'link' && !link) throw new HttpError(400, 'Informe o link que o banner deve abrir.');
  const popup = imagemDoCampo(req, 'popup');
  if (acao === 'popup' && !popup && !bannerAtual?.popup_nome) {
    throw new HttpError(400, 'Escolha a imagem que deve aparecer ao clicar no banner.');
  }
  return { acao, link, popup };
}

router.get('/', async (req, res) => {
  const banners = await query('SELECT id, imagem_nome, link_url, popup_nome, ativo, ordem FROM banners ORDER BY ordem, id');
  res.json(banners.map((b) => ({
    id: b.id,
    imagem: urlBanner(b.imagem_nome),
    imagem_nome: b.imagem_nome,
    link_url: temLink(b.link_url) ? b.link_url : '',
    popup: b.popup_nome ? urlBanner(b.popup_nome) : null,
    acao: b.popup_nome ? 'popup' : temLink(b.link_url) ? 'link' : 'nenhuma',
    ativo: Boolean(b.ativo),
    ordem: b.ordem,
  })));
});

router.post('/', upload, async (req, res) => {
  const imagem = imagemDoCampo(req, 'imagem', { obrigatoria: true, mensagem: 'Escolha a imagem do banner.' });
  const { link, popup } = acaoDoFormulario(req);
  const ordem = await proximaOrdem('banners');
  const nome = await salvarArquivo(imagem);
  const nomePopup = popup ? await salvarArquivo(popup) : null;
  const r = await query('INSERT INTO banners (imagem_nome, link_url, popup_nome, ativo, ordem) VALUES (?, ?, ?, ?, ?)', [
    nome, link || '#', nomePopup, flag(req.body.ativo ?? '1'), ordem,
  ]);
  res.status(201).json({ id: r.insertId });
});

router.put('/ordem', async (req, res) => {
  await salvarOrdem('banners', listaDeIds(req.body?.ids));
  res.status(204).end();
});

router.put('/:id', upload, async (req, res) => {
  const banner = await buscar(idParam(req));
  const imagem = imagemDoCampo(req, 'imagem');
  const { acao, link, popup } = acaoDoFormulario(req, banner);

  await query('UPDATE banners SET link_url = ?, ativo = ? WHERE id = ?', [link || '#', flag(req.body.ativo), banner.id]);
  if (imagem) {
    const nome = await salvarArquivo(imagem);
    await query('UPDATE banners SET imagem_nome = ? WHERE id = ?', [nome, banner.id]);
    await removerArquivo(banner.imagem_nome);
  }
  if (popup) {
    const nome = await salvarArquivo(popup);
    await query('UPDATE banners SET popup_nome = ? WHERE id = ?', [nome, banner.id]);
    await removerArquivo(banner.popup_nome);
  } else if (acao !== 'popup' && banner.popup_nome) {
    await query('UPDATE banners SET popup_nome = NULL WHERE id = ?', [banner.id]);
    await removerArquivo(banner.popup_nome);
  }
  res.status(204).end();
});

router.patch('/:id/ativo', async (req, res) => {
  const banner = await buscar(idParam(req));
  await query('UPDATE banners SET ativo = ? WHERE id = ?', [flag(req.body?.ativo), banner.id]);
  res.status(204).end();
});

router.delete('/:id', async (req, res) => {
  const banner = await buscar(idParam(req));
  await query('DELETE FROM banners WHERE id = ?', [banner.id]);
  await removerArquivo(banner.imagem_nome);
  await removerArquivo(banner.popup_nome);
  res.status(204).end();
});

export default router;
