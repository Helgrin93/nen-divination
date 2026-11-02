import { nenTypes } from '../data/nenTypes.js';
import {resultPresentation,resultRadarOrder as radarOrder} from '../data/resultPresentation.js';
import nenSymbols from '../data/nenSymbols.json';

export function radarPoint(index, radius, cx = 300, cy = 270) {
  const angle = (index * 60 - 90) * Math.PI / 180;
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

// Label positions stay outside the grid and medallions, including at 320px.
export const radarLabels = [
  {x:300,y:37,anchor:'middle'}, {x:590,y:143,anchor:'end'},
  {x:590,y:394,anchor:'end'}, {x:300,y:480,anchor:'middle'},
  {x:10,y:394,anchor:'start'}, {x:10,y:143,anchor:'start'},
];

export function radarSvg(values, t, accent='var(--accent)') {
  const points = radius => radarOrder.map((_, i) => radarPoint(i, radius).join(',')).join(' ');
  const summary=radarOrder.map(id=>`${nenTypes[id].name}: ${values[id]}%`).join(', ');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="nen-radar" viewBox="0 0 600 540" role="img" aria-label="${t.relative}. ${summary}">
    <title>${t.relative}. ${summary}</title>
    ${[.2,.4,.6,.8,1].map(s => `<polygon points="${points(150*s)}" fill="none" stroke="${s===1?'#81909d':'#34434c'}" stroke-width="${s===1?1.8:1}"/>`).join('')}
    ${radarOrder.map((_,i) => `<path d="M300 270 ${radarPoint(i,150).join(' ')}" stroke="#34434c" stroke-width="1"/>`).join('')}
    <g class="radar-shape"><polygon points="${radarOrder.map((type,i) => radarPoint(i,150*values[type]/100).join(',')).join(' ')}" fill="${accent}" fill-opacity=".3" stroke="${accent}" stroke-width="2.5"/>
    ${radarOrder.map((type,i) => {const [x,y]=radarPoint(i,150*values[type]/100);return `<circle cx="${x}" cy="${y}" r="3" fill="#f0e9d2"/>`;}).join('')}</g>
    ${radarOrder.map((type,i) => {
      const [x,y]=radarPoint(i,150),colour=resultPresentation[type].colour,label=radarLabels[i],glyph=nenSymbols[type];
      return `<g class="radar-axis" data-nen="${type}" data-value="${values[type]}">
        <circle class="radar-medallion" cx="${x}" cy="${y}" r="23" fill="#071017" stroke="${colour}" stroke-width="2"/>
        <circle cx="${x}" cy="${y}" r="18.5" fill="${colour}"/>
        <svg class="radar-kanji" x="${x-13}" y="${y-13}" width="26" height="26" viewBox="${glyph.viewBox}" fill="#080d13" aria-label="${glyph.symbol}"><title>${glyph.symbol}</title><path d="${glyph.path}"/></svg>
        <text class="radar-name" x="${label.x}" y="${label.y}" text-anchor="${label.anchor}" fill="${colour}" font-family="Georgia,serif" font-size="30">${nenTypes[type].name}</text>
        <text class="radar-value" x="${label.x}" y="${label.y+45}" text-anchor="${label.anchor}" fill="${colour}" font-family="Georgia,serif" font-size="39">${values[type]}%</text>
      </g>`;
    }).join('')}
  </svg>`;
}

export function nenRadar(values,t) {
  return `<figure class="radar-figure"><figcaption class="sr-only">${t.relative}</figcaption>${radarSvg(values,t)}</figure>`;
}
