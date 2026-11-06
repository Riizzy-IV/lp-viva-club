/* =========================================================
   VIVA CLUB — interações da LP
   ========================================================= */

/* Galeria de lazer (ordem do Figma). `start` = card exibido primeiro. */
const GALERIA = [
  { src: 'assets/img/lazer-salao-jogos.webp', title: 'Salão de Jogos' },
  { src: 'assets/img/lazer-quadra.webp', title: 'Quadra Poliesportiva' },
  { src: 'assets/img/lazer-playground.webp', title: 'Playground' },
  { src: 'assets/img/lazer-brinquedoteca.webp', title: 'Brinquedoteca' },
  { src: 'assets/img/lazer-brinquedoteca-2.webp', title: 'Brinquedoteca' },
  { src: 'assets/img/lazer-piscina.webp', title: 'Piscina', start: true },
  { src: 'assets/img/lazer-gourmet.webp', title: 'Espaço Gourmet' },
  { src: 'assets/img/lazer-hall.webp', title: 'Hall Social' },
  { src: 'assets/img/lazer-bicicletario.webp', title: 'Bicicletário', pos: '50% 64.62%' },
  { src: 'assets/img/lazer-market.webp', title: 'Market' },
  { src: 'assets/img/lazer-lavanderia.webp', title: 'Lavanderia' },
];

/* Plantas por final (mesmos dados do Touch ATTA / book, pág. 22 a 30).
   fotos: [arquivo em assets/img/apto, nome do ambiente] */
const PLANTAS = [
  { final: 1, area: '56,08', desc: '2 Dorms (1 suíte) + Varanda', fotos: [['tipo1-living', 'Living'], ['tipo1-suite', 'Suíte']] },
  { final: 2, area: '60,23', desc: '2 Dorms (1 suíte) + Varanda', fotos: [['tipo2-living', 'Living'], ['tipo2-cozinha', 'Cozinha'], ['tipo2-suite', 'Suíte']] },
  { final: 3, area: '58,77', desc: '2 Dorms (1 suíte) + Varanda', fotos: [['tipo3-living', 'Living'], ['tipo3-cozinha', 'Cozinha'], ['tipo3-suite', 'Suíte']] },
  { final: 4, area: '39', desc: 'Studio + Varanda', fotos: [['tipo4', 'Studio']] },
  { final: 5, area: '39,09', desc: 'Studio + Varanda', fotos: [['tipo5', 'Studio']] },
  { final: 6, area: '39', desc: 'Studio + Varanda', fotos: [['tipo6-living', 'Living'], ['tipo6-suite', 'Dormitório']] },
  { final: 7, area: '58,77', desc: '2 Dorms (1 suíte) + Varanda', fotos: [['tipo3-cozinha', 'Cozinha'], ['tipo3-living', 'Living'], ['tipo3-suite', 'Suíte']] },
  { final: 8, area: '60,23', desc: '2 Dorms (1 suíte) + Varanda', fotos: [['tipo2-suite', 'Suíte'], ['tipo2-living', 'Living'], ['tipo2-cozinha', 'Cozinha']] },
  { final: 9, area: '56,08', desc: '2 Dorms (1 suíte) + Varanda', fotos: [['tipo1-suite', 'Suíte'], ['tipo1-living', 'Living']] },
];
const STUDIOS = [4, 5, 6];

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initImplantacao();
  initGaleria();
  initPlantas();
  initLightbox();
  initVideo();
  initForm();
});

/* ---------- Header ---------- */
function initHeader() {
  const header = document.getElementById('header');
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open) => {
    mobile.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  burger.addEventListener('click', () => setOpen(!mobile.classList.contains('is-open')));
  mobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}

/* ---------- Implantação: hover lista <-> pinos ---------- */
function initImplantacao() {
  const wrap = document.querySelector('.lazer__implantacao');
  if (!wrap) return;
  const items = [...wrap.querySelectorAll('.lazer__list li')];
  const pins = [...wrap.querySelectorAll('.implantacao__pin')];
  const byNum = (els, n) => els.find((el) => (el.querySelector('.num') || el).textContent.trim() === n);

  items.forEach((li) => {
    const n = li.querySelector('.num').textContent.trim();
    const name = li.textContent.replace(n, '').replace(/^\s*-\s*/, '').trim();
    li.dataset.n = n;
    const pin = byNum(pins, n);
    if (pin) { pin.dataset.n = n; pin.dataset.label = name; pin.setAttribute('aria-label', `${n} - ${name}`); }
  });

  let current = null;
  const setActive = (n) => {
    if (n === current) return;
    current = n;
    wrap.classList.toggle('has-active', !!n);
    [...items, ...pins].forEach((el) => el.classList.toggle('is-active', !!n && el.dataset.n === n));
  };

  [...items, ...pins].forEach((el) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setActive(el.dataset.n); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') setActive(null); });
    el.addEventListener('click', (e) => {
      if (el.classList.contains('implantacao__pin')) e.stopPropagation(); // não abre o lightbox
      // toque (mobile): alterna o destaque
      if (!window.matchMedia('(hover: hover)').matches) setActive(current === el.dataset.n ? null : el.dataset.n);
    });
  });
}

/* ---------- Galeria de lazer ---------- */
function initGaleria() {
  const track = document.getElementById('galeriaTrack');
  if (!track) return;

  // Carrossel infinito: 3 cópias da lista; a navegação acontece na cópia do meio
  // e, ao sair dela, o scroll é reposicionado (sem animação) numa cópia idêntica.
  const COPIES = 3;
  const total = GALERIA.length;
  const card = (item, i, clone) => `
    <figure class="galeria__card" data-index="${i}"${clone ? ' aria-hidden="true"' : ''}>
      <img src="${item.src}" alt="${clone ? '' : `${item.title} do Viva Club - imagem ilustrativa`}" loading="lazy"${item.pos ? ` style="object-position:${item.pos}"` : ''}>
      <figcaption class="galeria__caption"><strong>${item.title}</strong><span>Imagem meramente ilustrativa.</span></figcaption>
      <button class="expand-btn" type="button" aria-label="Ampliar ${item.title}"${clone ? ' tabindex="-1"' : ''}><i class="fas fa-expand"></i></button>
    </figure>`;
  track.innerHTML = Array.from({ length: COPIES }, (_, c) =>
    GALERIA.map((item, i) => card(item, i, c !== 1)).join('')).join('');

  const cards = [...track.children];
  const offsetOf = (i) => cards[i].offsetLeft - cards[0].offsetLeft;
  const step = () => offsetOf(1);
  const setWidth = () => offsetOf(total);
  const startIndex = Math.max(0, GALERIA.findIndex((g) => g.start));

  const jump = (left) => track.scrollTo({ left, behavior: 'instant' });
  // Mantém o scroll dentro da cópia do meio
  const normalize = () => {
    const w = setWidth();
    if (track.scrollLeft < w - step() / 2) jump(track.scrollLeft + w);
    else if (track.scrollLeft >= 2 * w - step() / 2) jump(track.scrollLeft - w);
  };

  // Começa no card inicial (Piscina) da cópia do meio, alinhado ao container
  const goToStart = () => jump(offsetOf(total + startIndex));
  requestAnimationFrame(goToStart);
  window.addEventListener('load', goToStart, { once: true });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => jump(Math.round(track.scrollLeft / step()) * step()), 150);
  });

  // Reposiciona quando a rolagem termina (setas, swipe, trackpad)
  let scrollT;
  const onScrollEnd = () => { if (!down) normalize(); };
  if ('onscrollend' in window) track.addEventListener('scrollend', onScrollEnd);
  else track.addEventListener('scroll', () => { clearTimeout(scrollT); scrollT = setTimeout(onScrollEnd, 140); }, { passive: true });

  const move = (dir) => {
    normalize();
    track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };
  document.getElementById('galeriaNext')?.addEventListener('click', () => move(1));
  document.getElementById('galeriaPrev')?.addEventListener('click', () => move(-1));

  // Arrastar com o mouse (desktop)
  let down = false, moved = false, startX = 0, startLeft = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto';
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    track.scrollLeft = startLeft - dx;
    // atravessa a "emenda" durante o arrasto sem travar
    const w = setWidth();
    if (track.scrollLeft < w / 2) { startLeft += w; track.scrollLeft += w; }
    else if (track.scrollLeft > 2.5 * w) { startLeft -= w; track.scrollLeft -= w; }
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false; track.style.scrollSnapType = ''; track.style.scrollBehavior = '';
    // encaixa no card mais próximo
    track.scrollTo({ left: Math.round(track.scrollLeft / step()) * step(), behavior: 'smooth' });
  });

  track.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); moved = false; return; }
    const card = e.target.closest('.galeria__card');
    if (!card) return;
    const item = GALERIA[card.dataset.index];
    openLightbox(item.src, item.title);
  });
}

/* ---------- Plantas ---------- */
function initPlantas() {
  const tabs = document.getElementById('plantasTabs');
  if (!tabs) return;
  const el = (id) => document.getElementById(id);
  const card = document.querySelector('.plantas__card');
  const fotosBox = el('plantaFotos');
  let current = 0;
  let foto = 0;

  tabs.innerHTML = PLANTAS.map((p, i) => `
    <button class="plantas__tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-index="${i}">Final  ${p.final}</button>`).join('');

  // Planta-chave (SVG) com as 9 unidades do pavimento; clicar troca o final
  const key = el('plantaKey');
  key.setAttribute('viewBox', `-3 -3 ${KEYPLAN.w + 6} ${KEYPLAN.h + 6}`);
  key.innerHTML = KEYPLAN.units.map((u) =>
    `<path class="key__unit${STUDIOS.includes(u.final) ? ' key__unit--studio' : ''}" data-final="${u.final}" d="${u.d}"><title>Final ${u.final}</title></path>`).join('')
    + `<path class="key__walls" d="${KEYPLAN.walls}"/>`
    + KEYPLAN.units.map((u) =>
      `<g class="key__num" data-final="${u.final}"><circle cx="${u.cx}" cy="${u.cy}" r="6.2"/><text x="${u.cx}" y="${u.cy + 2.3}" text-anchor="middle">${u.final}</text></g>`).join('');
  key.addEventListener('click', (e) => {
    const t = e.target.closest('[data-final]');
    if (t) render(PLANTAS.findIndex((p) => p.final === Number(t.dataset.final)));
  });

  const showFoto = (i) => {
    const p = PLANTAS[current];
    foto = (i + p.fotos.length) % p.fotos.length;
    const [file, nome] = p.fotos[foto];
    el('plantaPersp').src = `assets/img/apto/${file}.webp`;
    el('plantaPersp').alt = `${nome} do apartamento Final ${p.final} - imagem ilustrativa`;
    el('plantaFotoNome').textContent = nome;
    fotosBox.querySelectorAll('button').forEach((b, j) => {
      b.classList.toggle('is-active', j === foto);
      b.setAttribute('aria-selected', String(j === foto));
    });
  };

  const render = (index) => {
    current = (index + PLANTAS.length) % PLANTAS.length;
    const p = PLANTAS[current];
    tabs.querySelectorAll('.plantas__tab').forEach((t, i) => {
      t.classList.toggle('is-active', i === current);
      t.setAttribute('aria-selected', String(i === current));
    });
    // mantém a aba ativa visível (mobile) sem rolar a página
    const tab = tabs.children[current];
    tabs.scrollTo({ left: tab.offsetLeft - (tabs.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });

    key.querySelectorAll('[data-final]').forEach((n) => n.classList.toggle('is-active', Number(n.dataset.final) === p.final));

    el('plantaImg').src = `assets/img/plantas/final-${p.final}.webp`;
    el('plantaImg').alt = `Planta humanizada do Final ${p.final}`;
    el('plantaFinal').textContent = `Final ${p.final}`;
    el('plantaArea').textContent = `${p.area}m²`;
    el('plantaDesc').textContent = p.desc;

    fotosBox.innerHTML = p.fotos.length > 1
      ? p.fotos.map(([, nome], j) => `<button type="button" role="tab" data-foto="${j}">${nome}</button>`).join('')
      : '';
    showFoto(0);

    card.classList.remove('is-switching');
    void card.offsetWidth; // reinicia a animação de troca
    card.classList.add('is-switching');
  };

  fotosBox.addEventListener('click', (e) => {
    const b = e.target.closest('[data-foto]');
    if (b) showFoto(Number(b.dataset.foto));
  });
  tabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.plantas__tab');
    if (tab) render(Number(tab.dataset.index));
  });
  el('plantaNext').addEventListener('click', () => render(current + 1));
  el('plantaPrev').addEventListener('click', () => render(current - 1));

  render(0);
  card.classList.remove('is-switching');
  // pré-carrega as plantas para a troca ser instantânea
  window.addEventListener('load', () => PLANTAS.forEach((p) => { new Image().src = `assets/img/plantas/final-${p.final}.webp`; }), { once: true });

  el('plantaImg').addEventListener('click', (e) => openLightbox(e.currentTarget.src, e.currentTarget.alt));
  el('plantaPersp').addEventListener('click', (e) => openLightbox(e.currentTarget.src, e.currentTarget.alt));
}

/* ---------- Lightbox ---------- */
function openLightbox(src, alt) {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  img.alt = alt || '';
  box.classList.add('is-open');
  box.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const box = document.getElementById('lightbox');
  box.classList.remove('is-open');
  box.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initLightbox() {
  const box = document.getElementById('lightbox');
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  box.addEventListener('click', (e) => { if (e.target === box) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  document.querySelectorAll('[data-lightbox]').forEach((node) => {
    node.addEventListener('click', () => openLightbox(node.dataset.lightbox, node.dataset.lightboxAlt));
  });
  document.querySelectorAll('[data-expand]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const img = document.querySelector(btn.dataset.expand);
      if (img) openLightbox(img.src, img.alt);
    });
  });
}

/* ---------- Vídeo conceito ---------- */
function initVideo() {
  const box = document.getElementById('videoBox');
  const play = document.getElementById('videoPlay');
  if (!box || !play) return;
  play.addEventListener('click', () => {
    const id = box.dataset.youtube;
    if (!id) return; // TODO: definir data-youtube no HTML
    box.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="Vídeo conceito Viva Club" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
}

/* ---------- Formulário ---------- */
function initForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;
  const phone = document.getElementById('telefone');
  const feedback = document.getElementById('formFeedback');

  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 11);
    let v = d;
    if (d.length > 0) v = `(${d.slice(0, 2)}`;
    if (d.length >= 3) v += `) ${d.slice(2, d.length > 10 ? 7 : 6)}`;
    if (d.length >= 7) v += `-${d.slice(d.length > 10 ? 7 : 6)}`;
    phone.value = v;
  });

  const setMsg = (text, type) => {
    feedback.textContent = text;
    feedback.className = `form__feedback${type ? ` is-${type}` : ''}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      telefone: form.telefone.value.trim(),
    };
    const invalid = [];
    if (fields.nome.length < 3) invalid.push(form.nome);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) invalid.push(form.email);
    if (fields.telefone.replace(/\D/g, '').length < 10) invalid.push(form.telefone);

    form.querySelectorAll('.form__input').forEach((i) => i.classList.toggle('is-invalid', invalid.includes(i)));
    if (invalid.length) { setMsg('Confira os campos destacados.', 'error'); invalid[0].focus(); return; }
    if (!form.consentimento.checked) { setMsg('É preciso concordar com os termos para continuar.', 'error'); return; }

    const btn = form.querySelector('.form__submit');
    btn.disabled = true;
    try {
      // TODO: integrar com o CRM / endpoint de leads do Viva Club.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'lead_viva_club', form: 'contato' });
      form.reset();
      setMsg('Recebemos seus dados! Em breve um corretor entrará em contato.', 'success');
    } catch (err) {
      setMsg('Não foi possível enviar agora. Tente novamente.', 'error');
    } finally {
      btn.disabled = false;
    }
  });
}
