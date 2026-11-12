// Colori disponibili: modifica solo questa lista (nome Material -> colore dell'anteprima)
const COLORS = {
  'indigo':      '#3f51b5',
  'blue':        '#2196f3',
  'teal':        '#009688',
  'green':       '#4caf50',
  'yellow':      '#ffeb3b',
  'orange':      '#ff9800',
  'deep-orange': '#ff5722',
  'red':         '#f44336',
  'pink':        '#e91e63',
  'deep-purple': '#673ab7',
};
// Colori primari che non esistono come accent in Material: l'accent resta quello di default
const NO_ACCENT = ['brown', 'grey', 'blue-grey', 'black', 'white'];
const KEY = 'site-palette-color';

document$.subscribe(() => {
  const apply = name => {
    document.body.setAttribute('data-md-color-primary', name);
    if (!NO_ACCENT.includes(name)) document.body.setAttribute('data-md-color-accent', name);
  };

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved && COLORS[saved]) apply(saved);

  if (document.querySelector('#palette-picker')) return;   // il pulsante si crea una volta sola

  const wrap = document.createElement('div');
  wrap.id = 'palette-picker';
  wrap.innerHTML = `
    <button class="md-header__button md-icon" type="button" title="Scegli il colore" aria-label="Scegli il colore">
      <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8m-5.5 9A1.5 1.5 0 0 1 5 10.5 1.5 1.5 0 0 1 6.5 9 1.5 1.5 0 0 1 8 10.5 1.5 1.5 0 0 1 6.5 12m3-4A1.5 1.5 0 0 1 8 6.5 1.5 1.5 0 0 1 9.5 5 1.5 1.5 0 0 1 11 6.5 1.5 1.5 0 0 1 9.5 8m5 0A1.5 1.5 0 0 1 13 6.5 1.5 1.5 0 0 1 14.5 5 1.5 1.5 0 0 1 16 6.5 1.5 1.5 0 0 1 14.5 8m3 4a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 17.5 9 1.5 1.5 0 0 1 19 10.5 1.5 1.5 0 0 1 17.5 12"/></svg>
    </button>
    <div class="palette-menu" hidden></div>`;

  const menu = wrap.querySelector('.palette-menu');
  Object.entries(COLORS).forEach(([name, hex]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'palette-swatch';
    b.title = name;
    b.style.background = hex;
    b.addEventListener('click', () => {
      apply(name);
      try { localStorage.setItem(KEY, name); } catch (e) {}
      menu.hidden = true;
    });
    menu.append(b);
  });

  wrap.querySelector('button').addEventListener('click', e => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('click', () => { menu.hidden = true; });

  document.querySelector('.md-header__inner')
    .insertBefore(wrap, document.querySelector('.md-search') || null);
});