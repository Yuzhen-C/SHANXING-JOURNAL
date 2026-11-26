import './style.css';
import { createScrollWorld } from './scrollWorld';
import { summitView } from './summit';
import { trailMap } from './trailMap';
import { chapterNames, stops } from './stops';
import { icon } from './icons';
import { photoCredits } from './photoCredits';
import { narration } from './audioCatalog';
import { Sound } from './sound';

const app = document.querySelector<HTMLDivElement>('#app')!;
const base = import.meta.env.BASE_URL;
const total = stops.length;
const visited = new Set<number>();
const num = (value: number) => String(value).padStart(2, '0');
const legNames = ['步入天外村','乘车前往中天门','乘索道前往南天门','沿山脊前往天街','步行前往碧霞祠','拾级前往大观峰','登向玉皇顶','登顶远眺'];
const snippets = [
  '从山脚的天地广场乘大巴出发，沿盘山公路绕入溪谷。约半小时后，便到半山腰的中天门。',
  '红门古道与盘山公路在此相会。下车步行至索道站，缆车越过松林和山谷，向南天门升去。',
  '索道上站外，朱红山门立在十八盘尽头。回首可见石阶直落山谷，穿门便进入岱顶。',
  '山脊上铺着一条石板街，一侧是商铺屋檐，一侧可眺望群峰。沿街向东，便到碧霞祠。',
  '碧霞祠依山而建，殿中供奉碧霞元君。当地人亲切地称她为“泰山奶奶”。',
  '仰望大观峰崖壁，唐玄宗撰写的《纪泰山铭》刻在岩面上。循着摩崖旁的石阶继续向上。',
  '玉皇顶是泰山主峰，海拔约一千五百四十五米。走过最后一段石阶，四周的群峰在脚下铺开。',
];
let current = -1;
let moving = false;
let opening = false;
let pendingDestination: number | null = null;
let dialogTrigger: HTMLElement | null = null;
let noticeTimer = 0;
const inkStrip = '<i class="gold-line" aria-hidden="true"></i>';
let manualLandscape = false;

function syncViewportHeight() {
  requestAnimationFrame(() => {
    const width = Math.round(window.visualViewport?.width ?? window.innerWidth);
    const height = Math.round(window.visualViewport?.height ?? window.innerHeight);
    document.documentElement.style.setProperty('--visual-viewport-width', `${width}px`);
    document.documentElement.style.setProperty('--visual-viewport-height', `${height}px`);
    const intro = document.getElementById('orientation-intro');
    if (width > height && intro && !intro.hidden) dismissOrientationIntro();
    if (manualLandscape && width > height) setManualLandscape(false);
  });
}

syncViewportHeight();
window.addEventListener('resize', syncViewportHeight, { passive: true });
window.addEventListener('orientationchange', syncViewportHeight, { passive: true });
window.visualViewport?.addEventListener('resize', syncViewportHeight, { passive: true });

const worldMark = `<svg viewBox="0 0 46 43" fill="none" aria-hidden="true"><rect x="1" y="1" width="44" height="41" rx="3" stroke="currentColor"/><rect x="3.5" y="3.5" width="39" height="36" rx="1" stroke="currentColor" opacity=".52"/><circle cx="30" cy="12" r="3.4" fill="currentColor"/><path d="m7 30 9-13 4 5 7-11 12 19H7Zm6-3 4-6 3 5 6-9 6 10m-4-4 3-3 6 10M9 33h28" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const mapArt = trailMap();
app.innerHTML = `<div class="page">
  <header class="mast shell"><button class="brand" data-act="cover" aria-label="山行手记，回到封面"><span class="brand-mark">${worldMark}</span><span class="brand-name">山行手记<small>SHANXING JOURNAL</small></span></button>
    <div class="audio-controls"><button class="sound-control" data-act="music"></button><button class="sound-control" data-act="voice"></button><button class="orientation-control" data-act="orientation" aria-pressed="false" aria-label="旋转为横屏布局" title="旋转为横屏布局"><span class="sound-glyph">${icon('landscape',16)}</span></button></div>
  </header>
  <main class="shell">
    <section class="painting" id="painting" data-phase="cover" aria-label="泰山山水动画游历">
      <div id="world"></div><div class="paper-light" aria-hidden="true"></div>
      <div class="cover-copy"><p class="kicker">${inkStrip} 山东 · 泰安</p><div class="title-line"><h1>泰山行记</h1><span class="title-seal" aria-hidden="true">東<br>岳</span></div>
        <p class="subtitle">从天外村到玉皇顶</p><p class="cover-desc">${narration.intro!.text}</p>
        <div class="cover-actions"><button class="primary" id="depart" data-act="next">启程登山 ${icon('arrow',18)}</button></div></div>
      <div id="motion-note" class="motion-note" hidden></div>
      <div id="field-note" class="field-note" hidden></div><div id="summit" hidden></div>
    </section>
    <nav class="route" aria-label="登山进度"><div class="route-head"><h2>登山足迹</h2><button class="map-mobile" data-act="map" aria-label="打开路线图">${icon('map',14)} 路线图</button></div>
      <div class="milestones">${stops.map((s,i)=>`<button class="milestone" data-step="${i}" aria-label="前往${s.name}"><i><span></span></i><b>${s.name}</b></button>`).join('')}</div></nav>
  </main>
  <div class="orientation-intro" id="orientation-intro" role="dialog" aria-modal="true" aria-labelledby="orientation-intro-title" hidden>
    <div class="orientation-intro-card"><h2 id="orientation-intro-title">横屏看山水更舒展</h2><p>点右上角横屏图标，再将手机横放</p><button type="button" data-act="orientation-dismiss">知道了</button></div>
  </div>
  </div>
  <div id="dialog-wrap" class="dialog-wrap" hidden><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="close" data-act="close" aria-label="关闭">${icon('close',20)}</button><div id="dialog-body"></div></section></div>
  <div id="notice" class="notice" role="status"></div><div id="live" class="sr" aria-live="polite"></div>`;

const el = (id: string) => document.getElementById(id)!;
const scene = el('painting');
const note = el('field-note');
const motion = el('motion-note');
const summit = el('summit');
const dialog = el('dialog-wrap');
const world = createScrollWorld(el('world'));
void world.travel(-1, {instant:true});

function setManualLandscape(active: boolean) {
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  manualLandscape = active && width <= height;
  document.querySelector('.page')?.classList.toggle('manual-landscape', manualLandscape);
  dialog.classList.toggle('manual-landscape', manualLandscape && dialog.classList.contains('photo-mode'));
  const button = document.querySelector<HTMLButtonElement>('[data-act="orientation"]')!;
  const label = manualLandscape ? '恢复竖屏布局' : '旋转为横屏布局';
  button.innerHTML = `<span class="sound-glyph">${icon(manualLandscape ? 'portrait' : 'landscape', 16)}</span>`;
  button.setAttribute('aria-pressed', String(manualLandscape));
  button.setAttribute('aria-label', label);
  button.title = label;
  el('live').textContent = manualLandscape ? '已切换为横屏布局。' : '已恢复竖屏布局。';
  if (manualLandscape) dismissOrientationIntro();
}

function dismissOrientationIntro() {
  const intro = el('orientation-intro');
  intro.hidden = true;
  document.querySelector('.page')?.classList.remove('orientation-intro-active');
  const button = document.querySelector<HTMLButtonElement>('[data-act="orientation"]');
  button?.classList.remove('is-spotlit');
  button?.removeAttribute('aria-describedby');
  try { sessionStorage.setItem('taishan-orientation-hint-seen', '1'); } catch { /* Storage may be disabled in embedded browsers. */ }
}

function showOrientationIntro() {
  if (!matchMedia('(max-width: 600px) and (orientation: portrait)').matches) return;
  try { if (sessionStorage.getItem('taishan-orientation-hint-seen') === '1') return; } catch { /* Show the hint when storage is unavailable. */ }
  el('orientation-intro').hidden = false;
  document.querySelector('.page')?.classList.add('orientation-intro-active');
  const button = document.querySelector<HTMLButtonElement>('[data-act="orientation"]');
  button?.classList.add('is-spotlit');
  button?.setAttribute('aria-describedby', 'orientation-intro-title');
  button?.focus({ preventScroll: true });
}

function toast(message: string) {
  el('notice').textContent = message;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => { el('notice').textContent=''; }, 3600);
}
function continueJourney() {
  if (pendingDestination !== null && dialog.hidden && !document.hidden) void go(pendingDestination);
}
function completeNarration() {
  if (moving) return;
  if (opening) pendingDestination = 0;
  else if (current === total - 1) pendingDestination = total;
  continueJourney();
}
const sound = new Sound(track => {
  sound[track] = false;
  setSoundControls();
  toast(track === 'voice' ? '讲解暂未播放，点“讲解”可重试' : '配乐暂未播放，点“配乐”可重试');
  if (track === 'voice' && opening) completeNarration();
}, completeNarration);

function setOpening(active: boolean) {
  opening = active;
  const button = el('depart') as HTMLButtonElement;
  button.disabled = active;
  button.innerHTML = active ? `${icon('voice',16)} 开篇讲解中` : `启程登山 ${icon('arrow',18)}`;
}

function setSoundControls() {
  for (const [track, name] of [['music','配乐'],['voice','讲解']] as const) {
    const button = document.querySelector<HTMLButtonElement>(`[data-act="${track}"]`)!;
    button.innerHTML = `<span class="sound-glyph">${icon(track,16)}</span>`;
    button.setAttribute('aria-pressed', String(sound[track]));
    const label=`${name}${sound[track] ? '已开，点按关闭' : '已关，点按开启'}`;
    button.setAttribute('aria-label', label);
    button.title=label;
  }
}
function updateTrail() {
  for (const [i,button] of Array.from(document.querySelectorAll<HTMLButtonElement>('.milestone')).entries()) {
    button.classList.toggle('visited',visited.has(i));
    if (current===i) button.setAttribute('aria-current','step');
    else button.removeAttribute('aria-current');
    button.disabled = moving;
  }
}
function showNote(i: number) {
  const stop = stops[i]!;
  const photo = photoCredits[stop.key]!;
  note.innerHTML = `<article class="station-window" aria-label="${stop.name}实景小窗">
    <div class="window-edging"></div><button class="field-photo" type="button" data-act="photo" aria-label="查看${stop.name}实景大图"><img src="${base}${photo.file}" style="object-position:${photo.position ?? '50% 50%'}" alt="${photo.alt}"><span>${icon('photo',12)} 实景 · 放大</span></button>
    <div class="field-text"><div class="field-order">第${chapterNames[i]}景 <i></i> ${stop.segment}</div><h2>${stop.name}</h2><p>${snippets[i]}</p></div>
    <div class="field-actions"><button data-act="script">${icon('voice',15)} 讲解词</button><button class="primary small" data-act="next">${i === total-1 ? '登顶远眺' : '下一景'} ${icon('arrow',16)}</button></div>
  </article>`;
  note.hidden = false;
  const origin = world.anchor();
  note.style.setProperty('--from-x', `${origin.x - note.offsetLeft - note.offsetWidth / 2}px`);
  note.style.setProperty('--from-y', `${origin.y - note.offsetTop - note.offsetHeight / 2}px`);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    note.classList.remove('unfold');
    void note.offsetWidth;
    note.classList.add('unfold');
  }
}
async function go(target: number) {
  if (moving || target < -1 || target > total) return;
  moving=true;
  pendingDestination=null;
  if (opening) setOpening(false);
  sound.visit();
  if (target === total) {
    sound.summit();
    const sunriseImage = new Image();
    sunriseImage.src = base + photoCredits.yuhuangSunrise!.file;
  }
  const stop=stops[target];
  if (stop) {
    sound.prepare(stop.key);
    const nextImage=new Image();
    nextImage.src=base+photoCredits[stop.key]!.file;
  }
  scene.dataset.phase='travel';
  scene.setAttribute('aria-busy','true');
  updateTrail();
  if (target >= 0) {
    motion.innerHTML=`<span class="moving-dot"></span>${legNames[target]}`;
    motion.hidden=false;
  }
  if (!note.hidden) note.classList.add('leaving');
  note.classList.remove('unfold');
  summit.hidden=true;
  await world.travel(target);
  note.hidden=true;
  note.classList.remove('leaving');
  motion.hidden=true;
  current=target;
  moving=false;
  scene.removeAttribute('aria-busy');
  if (target === total) {
    scene.dataset.phase='summit';
    summit.innerHTML=summitView(visited.size);
    summit.hidden=false;
    el('live').textContent=`登顶完成，已游览${visited.size}站。`;
  } else if (stop) {
    scene.dataset.phase='stop';
    visited.add(target);
    showNote(target);
    el('live').textContent=`第${chapterNames[target]}景，${stop.name}。`;
    sound.visit(stop.key);
  } else {
    scene.dataset.phase='cover';
    el('live').textContent='泰山行记，游记封面';
  }
  updateTrail();
}
function next() {
  if (moving || opening || !dialog.hidden || current === total) return;
  if (current === -1 && sound.voice) {
    setOpening(true);
    el('live').textContent = '正在播放开篇，讲解结束后前往天外村。';
    sound.visit('intro');
    return;
  }
  void go(current+1);
}
function showDialog(html: string, variant: 'photo' | 'default' = 'default') {
  dialogTrigger=document.activeElement instanceof HTMLElement ? document.activeElement : null;
  el('dialog-body').innerHTML=html;
  dialog.classList.toggle('photo-mode', variant === 'photo');
  dialog.classList.toggle('manual-landscape', variant === 'photo' && manualLandscape);
  dialog.querySelector('.dialog')?.classList.toggle('photo-dialog', variant === 'photo');
  dialog.hidden=false;
  document.body.classList.add('no-scroll');
  dialog.querySelector<HTMLButtonElement>('.close')!.focus();
}
function closeDialog(allowFinish = true) {
  dialog.hidden=true;
  dialog.classList.remove('photo-mode');
  dialog.classList.remove('manual-landscape');
  dialog.querySelector('.dialog')?.classList.remove('photo-dialog');
  document.body.classList.remove('no-scroll');
  dialogTrigger?.focus();
  if (allowFinish) continueJourney();
}
function mapDialog() {
  showDialog(`<p class="kicker">${inkStrip} 天外村至玉皇顶</p><h2 id="dialog-title">登山路线</h2><div class="inside-map">${mapArt}</div>
    <ol class="map-list">${stops.map((s,i)=>`<li><button data-step="${i}" ${moving?'disabled':''}><span>${num(i+1)}</span><b>${s.name}</b><small>${s.segment}</small>${icon('arrow',14)}</button></li>`).join('')}</ol><button class="map-sources" data-act="credits">${icon('book',14)} 图文来源</button>`);
}
function credits() {
  const items=stops.map(s=>{
    const p=photoCredits[s.key]!;
    return `<li><b>${s.name}</b><span><a href="${p.source}" target="_blank" rel="noopener noreferrer">${p.credit}</a> · <a href="${p.licenseUrl}" target="_blank" rel="noopener noreferrer">${p.license}</a></span></li>`;
  });
  const sunrise=photoCredits.yuhuangSunrise!;
  items.push(`<li><b>玉皇顶云海日出</b><span><a href="${sunrise.source}" target="_blank" rel="noopener noreferrer">${sunrise.credit}</a> · <a href="${sunrise.licenseUrl}" target="_blank" rel="noopener noreferrer">${sunrise.license}</a></span></li>`);
  showDialog(`<h2 id="dialog-title">图文来源</h2><h3>实景摄影</h3><p>照片来自维基共享资源，已按页面展示尺寸优化。</p><ul class="source-list">${items.join('')}</ul><h3>路线与景点</h3><p><a href="https://whlyj.taian.gov.cn/art/2023/9/27/art_334292_10298869.html" target="_blank" rel="noopener noreferrer">泰安市文化和旅游局《登泰山旅游攻略》</a><br><a href="https://tsgw.taian.gov.cn/art/2021/6/16/art_162237_10286435.html" target="_blank" rel="noopener noreferrer">泰山风景名胜区管理委员会 · 泰山石刻</a></p><h3>山水与声音</h3><p>山水长卷、路线图和器乐曲《岱岳》为本游记原创。普通话讲解采用语音合成，标题使用马善政毛笔楷书。</p>`);
}
app.addEventListener('click', event=>{
  if (!(event.target instanceof Element)) return;
  const target=event.target;
  const intro = el('orientation-intro');
  if (!intro.hidden) {
    const introButton = target.closest<HTMLButtonElement>('button');
    if (introButton?.dataset.act === 'orientation') {
      setManualLandscape(!manualLandscape);
      return;
    }
    if (introButton?.dataset.act === 'orientation-dismiss' || target === intro) dismissOrientationIntro();
    return;
  }
  if (target===dialog || (dialog.classList.contains('photo-mode') && target===dialog.querySelector('.dialog'))) {closeDialog();return;}
  const button=target.closest<HTMLButtonElement>('button');
  if (!button) {
    if (scene.contains(target) && dialog.hidden && !summit.contains(target) && !window.getSelection()?.toString()) next();
    return;
  }
  if (button.dataset.step!==undefined) {
    if(moving) return;
    const destination=Number(button.dataset.step);
    if (!dialog.hidden) closeDialog(false);
    if (destination!==current) void go(destination);
    if (scene.getBoundingClientRect().top < 0) window.scrollTo(0,0);
    return;
  }
  switch(button.dataset.act) {
    case 'next': next();break;
    case 'cover': if (!moving && current!==-1) void go(-1);break;
    case 'restart': if (!moving) {visited.clear();void go(-1);} break;
    case 'music':case 'voice':
      sound.toggle(button.dataset.act);
      setSoundControls();
      if (button.dataset.act === 'voice' && !sound.voice && opening) completeNarration();
      break;
    case 'orientation':setManualLandscape(!manualLandscape);break;
    case 'map': if(!moving) mapDialog();break;
    case 'close':closeDialog();break;
    case 'credits':credits();break;
    case 'photo': {
      const stop=stops[current];
      if (moving) break;
      const photo=current===total ? photoCredits.yuhuangSunrise! : stop && photoCredits[stop.key];
      if (!photo) break;
      const subject=stop?.name ?? '玉皇顶云海日出';
      showDialog(`<h2 id="dialog-title" class="sr">${subject}实景大图</h2><figure class="photo-lightbox"><img src="${base}${photo.file}" style="object-position:${photo.position ?? '50% 50%'}" alt="${photo.alt}"><figcaption>${subject} · 实景照片</figcaption></figure>`, 'photo');
      break;
    }
    case 'script': {
      const s=stops[current];
      if (!s || moving) break;
      showDialog(`<h2 id="dialog-title">${s.name} · 讲解词</h2><p>${narration[s.key]!.text}</p><button class="primary small" data-act="repeat">${icon('replay',15)} 重听讲解</button>`);break;
    }
    case 'repeat': pendingDestination=null;if(!sound.voice) sound.toggle('voice');else sound.repeat();setSoundControls();break;
  }
});
document.addEventListener('keydown',event=>{
  if (!el('orientation-intro').hidden) {
    if (event.key === 'Escape') dismissOrientationIntro();
    if (event.key === 'Tab') {
      const orientation = document.querySelector<HTMLButtonElement>('[data-act="orientation"]');
      const dismiss = document.querySelector<HTMLButtonElement>('[data-act="orientation-dismiss"]');
      if (event.shiftKey && document.activeElement === orientation) {
        event.preventDefault();
        dismiss?.focus();
      } else if (!event.shiftKey && document.activeElement === dismiss) {
        event.preventDefault();
        orientation?.focus();
      }
    }
    return;
  }
  if (!dialog.hidden) {
    if(event.key==='Escape') closeDialog();
    if(event.key==='Tab'){
      const tabbable=Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a'));
      if(event.shiftKey && document.activeElement===tabbable[0]){event.preventDefault();tabbable.at(-1)?.focus();}
      else if(!event.shiftKey && document.activeElement===tabbable.at(-1)){event.preventDefault();tabbable[0]?.focus();}
    }
    return;
  }
  if(event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if(event.key==='ArrowRight'){event.preventDefault();next();}
  if(event.key==='ArrowLeft' && current>=0){event.preventDefault();void go(current-1);}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) sound.suspend();
  else {sound.resume();continueJourney();}
});
window.addEventListener('pagehide',()=>sound.suspend());
window.addEventListener('pageshow',()=>{ sound.resume(); continueJourney(); });
if(import.meta.hot) import.meta.hot.dispose(()=>{
  world.destroy();
  sound.suspend();
  window.removeEventListener('resize', syncViewportHeight);
  window.removeEventListener('orientationchange', syncViewportHeight);
  window.visualViewport?.removeEventListener('resize', syncViewportHeight);
});
setSoundControls();
updateTrail();
showOrientationIntro();
