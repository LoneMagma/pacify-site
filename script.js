const projects = [
  {name:'FreeShelf', section:'flagship', desc:'Find the good deals. A web project for spotting free games.', repo:'https://github.com/LoneMagma/FreeShelf', live:'https://freeshelf.pacify.site', icon:'web', tags:[['Web Project','web'],['Product','practice']], available:true},
  {name:'Jen1', section:'flagship', desc:'A movie discovery space for browsing, searching, and finally finding something worth watching.', repo:'https://github.com/LoneMagma/Jen1', live:'https://jen1.pacify.site', icon:'web', tags:[['Web Project','web'],['Media','software']], available:true},
  {name:'SOUL', section:'flagship', desc:'An evolving desktop AI entity. Version 1.6 is installable; Released for windows.', repo:'https://github.com/LoneMagma/SOUL', icon:'ai', tags:[['Software','software'],['AI','ai']], available:false},
  {name:'Poscure', section:'flagship', desc:'A timed figure and gesture drawing tool for artists. Put in the reference, set the timer and draw.', repo:'https://github.com/LoneMagma/Poscure', live:'https://poscure.pacify.site', icon:'practice', tags:[['Tool','tool'],['Practice','practice']], available:true},

  {name:'FocusED', section:'main', desc:'An Android focus tool that adds pauses and friction between impulse opening that distracting thing.', repo:'https://github.com/LoneMagma/FocusED', live:'https://focused.pacify.site', icon:'software', tags:[['Software','software'],['Practice','practice']], available:true},
  {name:'ShellNote', section:'main', desc:'Terminal-native notes with Vim-style movement, persistence with a small AI companion living beside the text.', repo:'https://github.com/LoneMagma/shellnote', live:'https://shellnote.pacify.site', icon:'terminal', tags:[['Tool','tool'],['Terminal','terminal'],['Software','software']], available:true},
  {name:'Intention', section:'main', desc:'A browser extension for using Instagram on purpose while intentionally getting in the way of feed shaped rabbit holes.', repo:'https://github.com/LoneMagma/intention--extension', live:'https://intention.pacify.site', icon:'tool', tags:[['Tool','tool'],['Web Extension','web']], available:true},
  {name:'PrepZero', section:'main', desc:'Impromptu speaking practice: prompt, think, record, transcribe, review.', repo:'https://github.com/LoneMagma/PrepZero', live:'https://prepzero.vercel.app', icon:'web', tags:[['Web Project','web'],['Practice','practice']], available:true},

  {name:'NewZ', section:'peripheral', desc:'News filtered into something closer to useful information.', repo:'https://github.com/LoneMagma/NewZ', icon:'web', tags:[['Web Project','web'],['Experiment','experiment']], available:false},
  {name:'BurnLab', section:'peripheral', desc:'A sovereign lab in your pocket: portable shell tooling and an offline development mindset.', repo:'https://github.com/LoneMagma/BurnLab', icon:'software', tags:[['Software','software'],['Experiment','experiment']], available:false},
  {name:'Key4ce', section:'peripheral', desc:'Terminal-based typing practice. Small, local, stubbornly keyboard-first.', repo:'https://github.com/LoneMagma/Key4ce', icon:'terminal', tags:[['Tool','tool'],['Terminal','terminal'],['Practice','practice']], available:false},
  {name:'Pacify / DefyAI', section:'peripheral', desc:'A dual-mode conversational CLI system. One side pacifies. The other side defies.', repo:'https://github.com/LoneMagma/Pacify-DefyAI', icon:'ai', tags:[['Software','software'],['AI','ai'],['Experiment','experiment']], available:false},
  {name:'Pacificia', section:'peripheral', desc:'The one that started it all. Try it?', live:'https://pacificia.vercel.app', icon:'ai', tags:[['Presence','software'],['AI','ai'],['Experiment','experiment']], available:false},

  {name:'graphiic', section:'experiment', desc:'In development. The repository is the only honest source of truth for now.', repo:'https://github.com/LoneMagma/graphiic', icon:'experiment', tags:[['Experiment','experiment']], available:false},
  {name:'purrpause', section:'experiment', desc:'In development.', repo:'https://github.com/LoneMagma/purrpause', icon:'experiment', tags:[['Experiment','experiment']], available:false}
];

const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');
const weatherButton = document.getElementById('weather-toggle');
const weatherImg = document.querySelector('.weather-icon img');
const stored = localStorage.getItem('pacify-theme-mode');

function systemTheme(){ return media.matches ? 'dark' : 'light'; }
function setTheme(mode, persist=true){
  const theme = mode === 'system' ? systemTheme() : mode;
  root.dataset.theme = theme;
  root.dataset.themeMode = mode;
  weatherButton.setAttribute('aria-pressed', theme === 'dark');
  weatherImg.src = theme === 'dark' ? 'assets/weather-dark.svg' : 'assets/weather-light.svg';
  document.querySelector('[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#182027' : '#efe4d0');
  if (persist) localStorage.setItem('pacify-theme-mode', mode);
}
setTheme(stored === 'light' || stored === 'dark' ? stored : 'system', false);

weatherButton.addEventListener('click', ()=>{
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
});
media.addEventListener('change', ()=>{ if(root.dataset.themeMode === 'system') setTheme('system', false); });

const map = {
  flagship: document.getElementById('flagship-grid'),
  main: document.getElementById('main-grid'),
  peripheral: document.getElementById('peripheral-grid'),
  experiment: document.getElementById('experiments-grid')
};
const template = document.getElementById('project-template');
const inkSprite = 'assets/project-icons.svg';

function tagHTML([label, kind]){ return `<span class="tag tag-${kind}">${label}</span>`; }
function card(p, i){
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.name = p.name.toLowerCase();
  node.dataset.href = p.live || p.repo;
  node.setAttribute('aria-label', `${p.name}: ${p.available ? 'open project' : 'open source'}`);

  const artArea = node.querySelector('.project-art');
  artArea.innerHTML = '';

  const blocked = ['jen1'];
  const canFrame = p.available && p.live && !blocked.includes(p.name.toLowerCase());
  if (canFrame) {
    const iframe = document.createElement('iframe');
    iframe.src = p.live;
    iframe.loading = 'lazy';
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.title = `${p.name} preview`;
    iframe.setAttribute('aria-hidden', 'true');
    artArea.appendChild(iframe);
    artArea.classList.add('project-art--iframe');
  } else if (p.available && p.live) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `${inkSprite}#${p.icon}`);
    svg.appendChild(use);
    artArea.appendChild(svg);
  } else {
    const githubSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    githubSvg.setAttribute('aria-hidden', 'true');
    githubSvg.classList.add('github-icon');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `${inkSprite}#github`);
    githubSvg.appendChild(use);
    artArea.appendChild(githubSvg);
    artArea.classList.add('project-art--shell');
    const label = document.createElement('span');
    label.className = 'shell-label';
    label.textContent = 'source only';
    artArea.appendChild(label);
  }

  node.querySelector('h3').textContent = p.name;
  node.querySelector('.project-index').textContent = String(i+1).padStart(2,'0');
  node.querySelector('.project-desc').textContent = p.desc;
  node.querySelector('.tag-row').innerHTML = p.tags.map(tagHTML).join('');
  const link = node.querySelector('.project-open');
  link.href = p.live || p.repo;
  link.querySelector('span').textContent = p.live ? 'open' : 'source';
  node.addEventListener('click', e=>{ if(e.target.closest('a')) return; window.open(p.live || p.repo, '_blank', 'noopener,noreferrer'); });
  node.addEventListener('keydown', e=>{ if((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')){ e.preventDefault(); window.open(p.live || p.repo, '_blank', 'noopener,noreferrer'); }});
  return node;
}

Object.entries(map).forEach(([section, container])=>{
  projects.filter(p=>p.section===section).forEach((p,i)=>container.appendChild(card(p,i)));
});

let lastY = window.scrollY;
window.addEventListener('scroll', ()=>{
  const y = window.scrollY;
  root.style.setProperty('--map-shift', `${Math.sin(y/900) * 18}px`);
  lastY = y;
},{passive:true});

