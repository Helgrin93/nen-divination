import { nenTypes } from '../data/nenTypes.js';
import { nenRadar } from './NenRadar.js';
import { characterCards } from './CharacterCards.js';
import { icon } from './icons.js';
import {resultPresentation} from '../data/resultPresentation.js';

export function resultView(result, lang, t) {
  const type = nenTypes[result.primary];
  const primary=resultPresentation[result.primary],secondary=resultPresentation[result.secondary];
  const symbol=(data)=>`<span class="nen-symbol" aria-hidden="true">${data.symbol}</span>`;
  return `<div class="result-view" data-result-type="${result.primary}" style="--accent:${primary.colour};--title-length:${type.name.length}">
    <section class="result-main panel"><div class="result-copy"><p class="eyebrow">${t.resultLabel}</p><h1 class="nen-title" tabindex="-1">${type.name}</h1>
      <p class="nen-subtitle" lang="it">${type.it}</p>
      <p class="personality">${type.personality[lang]}</p>
    </div>${nenRadar(result.radar,t)}</section>
    <section class="result-insights" aria-label="${t.power}">
      <article class="power-card panel">${symbol(primary)}<div class="insight-copy"><p class="eyebrow">${t.power}</p><h2>${lang==='it'?type.it:type.name}</h2><p class="power-description">${primary.ability[lang]}</p></div></article>
      <article class="affinity-card panel" style="--affinity-colour:${secondary.colour}">${symbol(secondary)}<div class="insight-copy"><p class="eyebrow">${t.secondary}</p><h2>${nenTypes[result.secondary].name}</h2>${result.gap<=.35?`<p class="affinity-close">${t.close}</p>`:''}<p class="affinity-description">${secondary.secondary[lang]}</p></div></article>
    </section>
    <section class="characters panel"><h2 id="characters-heading">${t.characters}</h2><div class="character-grid">${characterCards(result.primary,lang,t)}</div><button class="characters-toggle" data-action="characters" aria-expanded="false" aria-controls="extra-characters">${t.showMore}</button><div id="extra-characters" class="character-expansion" inert aria-hidden="true"><div><div class="character-grid">${characterCards(result.primary,lang,t,{extra:true})}</div></div></div></section>
    <div class="result-actions"><button class="button" data-action="save">${icon('download')}${t.save}</button><button class="button share-button" data-action="share">${icon('share')}${t.share}</button><button class="button" data-action="replay">${icon('replay')}${t.replay}</button></div>
    <div class="story-actions"><button class="button" data-action="story">${icon('download')}${t.story}</button><button class="button" data-action="copy-link">${icon('share')}${t.copyLink}</button></div><label class="copy-link-fallback" hidden>${t.copyManual}<input type="url" value="https://helgrin93.github.io/nen-divination/" readonly></label>
  </div>`;
}
