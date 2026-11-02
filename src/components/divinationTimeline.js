export const clamp=n=>Math.max(0,Math.min(1,n));
export const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
export const divinationEffects={
  enhancement:{duration:6200,stages:['stir','rise','meniscus','overflow','settled'],cuts:[.12,.30,.40,.94]},
  emission:{duration:5000,stages:['clear','diffusion','uniform'],cuts:[.12,.88]},
  transmutation:{duration:4800,stages:['ripple','taste','sweet'],cuts:[.30,.90]},
  conjuration:{duration:5600,stages:['clear','materialize','suspended','settled'],cuts:[.10,.40,.85]},
  manipulation:{duration:6000,stages:['tremble','drift','turn','settled'],cuts:[.15,.40,.91]},
  specialization:{duration:7600,stages:['fade','curl','brittle','fragment','sink'],cuts:[.24,.44,.62,.82]},
};
export function sampleDivination(effect,time){
  const spec=divinationEffects[effect];
  if(!spec)return {duration:0,progress:0,stage:'rest',rise:0,colour:0,travel:0,wither:0};
  const progress=clamp(time/spec.duration),stage=spec.stages[spec.cuts.filter(cut=>progress>=cut).length];
  return {duration:spec.duration,progress,stage,rise:smooth((progress-.08)/.32),colour:smooth((progress-.10)/.72),travel:smooth((progress-.10)/.82),wither:clamp((progress-.10)/.66)};
}
export const wingDivination={
  enhancement:{"it":"Guarda… Il livello dell'acqua continua a salire.","en":"Look… The water level keeps rising."},
  emission:{"it":"Hai visto? L'acqua sta assumendo un altro colore.","en":"Did you see that? The water is changing color."},
  transmutation:{"it":"Il sapore è cambiato, l'acqua è diventata dolce.","en":"The taste has changed. The water has become sweet."},
  conjuration:{"it":"Guarda attentamente… Sta comparendo qualcosa nell'acqua.","en":"Look closely… Something is appearing in the water."},
  manipulation:{"it":"Osserva la foglia. Sta reagendo alla tua aura.","en":"Watch the leaf. It's reacting to your aura."},
  specialization:{"it":"La foglia sta appassendo… Una reazione davvero insolita.","en":"The leaf is withering… A truly unusual reaction."},
};
export const wingTransmutationIntro={
  "it": "L'acqua sembra la stessa, eppure…",
  "en": "The water looks the same, and yet…"
};
