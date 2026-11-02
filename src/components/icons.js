const paths = {
  audio: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  audioOff: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 6 6m0-6-6 6"/>',
  leaf: '<path d="M5 20C4 9 12 4 21 3c0 10-4 17-16 17Zm0 0L17 8M10 14l-1-4m5 0 4 1"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
  share: '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-3M9 14l6 3"/>',
  replay: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
  hand: '<path d="M8 13V7a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v9c0 4-3 6-6 6h-2c-3 0-5-2-7-5l-2-3a2 2 0 0 1 3-2l2 2Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
export function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
}
export const emblem = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="m24 3 18 10.5v21L24 45 6 34.5v-21Z" stroke="currentColor"/><path d="m24 11 11 6.5v13L24 37l-11-6.5v-13Z" stroke="currentColor" opacity=".4"/><path d="M17 31c0-11 7-15 16-16-1 10-5 17-16 16Zm0 0 12-12" stroke="currentColor"/></svg>';
