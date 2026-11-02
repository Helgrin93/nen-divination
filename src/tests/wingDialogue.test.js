import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {translations} from '../data/translations.js';
import {wingDivination,wingTransmutationIntro,sampleDivination,divinationEffects} from '../components/divinationTimeline.js';
import {SHORT_COMMENT_MS,revelationLine} from '../game/wingDialogue.js';
const approved=JSON.parse(readFileSync(new URL('../../e2e/fixtures/wing-dialogues-approved.json',import.meta.url),'utf8'));
const keys={1:'intro',2:'interesting',3:'understood',4:'letsSee',5:'curious',6:'veryGood',7:'bonus8',8:'bonus9',10:'divinationIntro',11:'revealing',19:'revealed'};
const reactions={12:'enhancement',13:'emission',15:'transmutation',16:'conjuration',17:'manipulation',18:'specialization'};
describe('Personally approved Wing dialogue',()=>{
 it('matches every approved IT/EN phrase and punctuation exactly',()=>{
  for(const lang of['it','en']){
   for(const [n,key]of Object.entries(keys))expect(translations[lang][key]).toBe(approved[lang][n]);
   for(const [n,type]of Object.entries(reactions))expect(wingDivination[type][lang]).toBe(approved[lang][n]);
   expect(wingTransmutationIntro[lang]).toBe(approved[lang][14]);
   expect(translations[lang]).not.toHaveProperty('focus');expect(translations[lang]).not.toHaveProperty('focusTitle');
  }
  expect(SHORT_COMMENT_MS).toBe(2000);
 });
 it('shows observational lines only once the unchanged effect has started',()=>{
  for(const [effect,start]of Object.entries({enhancement:.08,emission:.08,conjuration:.10,manipulation:0,specialization:.10})){
   const frame=p=>({effect,elapsed:p*divinationEffects[effect].duration,...sampleDivination(effect,p*divinationEffects[effect].duration)});
   expect(revelationLine(effect,frame(start))).toBeNull();
   expect(revelationLine(effect,frame(start+.01))).toBe(wingDivination[effect]);
  }
 });
 it('gives transmutation a natural pause and time to read discovery without changing its duration',()=>{
  const frame=elapsed=>({effect:'transmutation',elapsed,...sampleDivination('transmutation',elapsed)});
  expect(revelationLine('transmutation',frame(1999))).toBe(wingTransmutationIntro);
  expect(revelationLine('transmutation',frame(2000))).toBe(wingDivination.transmutation);
  expect(divinationEffects.transmutation.duration).toBe(4800);
 });
});
