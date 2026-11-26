const paths: Record<string, string> = {
  mountain: '<path d="m1 19 7.5-12 3 5L15 4l8 15H1Z"/><path d="m6 11.8 2.5 1.3 1.7-2.1m2.6-2.1L15 10l1.7-2.2"/>',
  music: '<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.4"/><ellipse cx="17" cy="16" rx="3" ry="2.4"/>',
  voice: '<path d="M3 9v6h4l5 4V5L7 9H3Zm12-1c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  layers: '<path d="m3 8 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5m-18 5 9 5 9-5"/>',
  map: '<path d="m2 6 7-3 6 3 7-3v15l-7 3-6-3-7 3V6Zm7-3v15m6-12v15"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/>',
  book: '<path d="M2.5 5c3.5-1.5 6.5-1 9.5 1 3-2 6-2.5 9.5-1v14c-3.5-1.5-6.5-1-9.5 1-3-2-6-2.5-9.5-1V5Zm9.5 1v14"/>',
  photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1.3"/><path d="m5 18 5-5 3 3 3-5 4 6"/>',
  brush: '<path d="M9 14 19 3c1.3-1.2 3-.2 2.1 1.4L13 18Zm-.5 1C4 14 6 20 2 20c6 2 12 0 8.5-4Z"/>',
  close: '<path d="m6 6 12 12m0-12L6 18"/>',
  replay: '<path d="M3 10a9 9 0 1 1 1 7m-1-13v6h6"/>',
  play: '<path d="m7 4 13 8-13 8z"/>',
  landscape: '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M8 17v2m8-2v2"/>',
  portrait: '<rect x="7" y="3" width="10" height="18" rx="1.5"/><path d="M10 17h4"/>',
};

export function icon(name: string, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ''}</svg>`;
}
