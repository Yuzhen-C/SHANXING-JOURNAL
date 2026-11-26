import './summit.css';

// Load the small local subset during the ascent so the reveal starts in brush lettering.
document.fonts?.load('1em SummitBrush', '会').catch(() => {});

const summitSeal = `<svg class="summit-seal" viewBox="0 0 112 112" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="summit-ink" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop stop-color="#ba5539"/><stop offset=".65" stop-color="#993d2d"/><stop offset="1" stop-color="#813225"/>
    </linearGradient>
    <clipPath id="summit-round"><circle cx="56" cy="56" r="44.2"/></clipPath>
  </defs>
  <path fill="url(#summit-ink)" stroke="#bd8857" stroke-width="1.1" d="M56.4 3.7C84.4 3.1 108.9 26.2 108.1 55.8c.8 28.9-22.5 52.1-51.8 52.3C27.1 108.7 4.3 85 3.8 56.3 3.6 27.3 27.1 4.4 56.4 3.7Z"/>
  <g fill="none" stroke="#f2d59e">
    <circle cx="56" cy="56" r="48" stroke-width="1.3"/>
    <circle cx="56" cy="56" r="45.5" stroke-width=".45" stroke-dasharray="42 1 10 2 70 1.5"/>
    <g clip-path="url(#summit-round)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="72" cy="39" r="7.5" fill="#e8c486" stroke="none"/>
      <path d="M14 57h14m-6-3h15m35-22h12m-4 3h8m-3 18h10" stroke-width=".9"/>
      <path d="m8 79 16-18 9 5 10-12 9 6 11-10 13 10 5-3 17 10 9-4" stroke-width="1.15" opacity=".75"/>
      <path d="m7 86 21-17 8 4 17-25 8 4 4-3 11 14 6 2 14 13 8-4" fill="#a44632" stroke-width="2.15"/>
      <path d="m39 74 14-23-3 12 4-3-10 14m15-18 6-5-2 7 10 10m-7-8 10 13m-35 2-13 9m31-10-9 10" stroke-width="1.1"/>
      <path d="M46.5 47.5h15v2H45m3-3v-4h10v4m-5.2-4v4m-8.8-5c5-.4 7.3-2.1 9.4-5.1 2.2 2.8 5 4.5 9.6 4.9l-1.5 1.1H45.3Z" fill="#edcc90" stroke-width=".7"/>
      <path d="M19 85c7-2 11-1 15-1m45-4 9 3m-53 2 7-2m19-1 8 1" stroke-width=".8"/>
    </g>
  </g>
  <path d="M49 27c3.5-.9 5.5-.1 7.2 1.4 1.1-2.1 2.8-3.4 5.3-3.9m-24.8 7.2c1.7-.5 3.2-.1 4.4.9.7-1.5 1.9-2.3 3.5-2.8" fill="none" stroke="#edcc90" stroke-width="1.1" stroke-linecap="round"/>
  <path d="M49 91.5h14" stroke="#f3d298" stroke-width=".65"/>
</svg>`;

export function summitView(visited: number): string {
  const count = Number.isFinite(visited) ? Math.max(0, Math.min(7, Math.trunc(visited))) : 0;
  return `<figure class="summit-poem">
    <blockquote><span>会当凌绝顶，</span><span>一览众山小</span></blockquote>
    <figcaption>杜甫《望岳》</figcaption>
  </figure>
  <section class="summit-award" aria-labelledby="summit-title">
    <div class="summit-award-head">
      ${summitSeal}
      <div class="summit-award-inscription">
        <p class="summit-award-label"><span aria-hidden="true"></span>登顶 MVP</p>
        <h2 id="summit-title">玉皇顶</h2>
      </div>
    </div>
    <dl class="summit-stats">
      <div><dt>玉皇顶海拔</dt><dd><small>约</small> 1,545 <small>米</small></dd></div>
      <div><dt>本次足迹</dt><dd>${count}<span> / 7</span> <small>站</small></dd></div>
    </dl>
    <button class="summit-restart" type="button" data-act="restart">
      <svg aria-hidden="true" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9a6.5 6.5 0 1 1 1.6 5.5M3 4.7v4.9h4.9"/></svg>再游一次
    </button>
  </section>`;
}
