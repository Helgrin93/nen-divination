import {wingDivination,wingTransmutationIntro} from '../components/divinationTimeline.js';

export const SHORT_COMMENT_MS=2000;
export const TASTE_DISCOVERY_MS=2000;

// Presentation follows the existing renderer; no effect timings are changed.
export function revelationLine(effect,frame){
  if(frame.effect!==effect)return null;
  if(effect==='transmutation')return frame.elapsed<TASTE_DISCOVERY_MS&&frame.stage!=='sweet'
    ? wingTransmutationIntro:wingDivination.transmutation;
  const visible={
    enhancement:frame.rise>0,
    emission:frame.progress>.08,
    conjuration:frame.progress>.10,
    manipulation:frame.progress>0,
    specialization:frame.wither>0,
  };
  return visible[effect]?wingDivination[effect]:null;
}
