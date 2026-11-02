// Development-only preview. Samples use the existing quiz and scoring engine.
import '../src/styles.css';
import '../src/styles/quiz-scene.css';
import '../src/styles/divination.css';
import '../src/styles/result.css';
import '../src/styles/unified-scene.css';
import './results.css';
import {quizScene,setupQuizScene} from '../src/components/QuizScene.js';
import {mountWaterScene} from '../src/components/WaterScene.js';
import {mountHandsMotion} from '../src/components/HandsMotion.js';
import {resultView} from '../src/components/ResultView.js';
import {createAttempt,selectAnswer,advance} from '../src/game/stateMachine.js';
import {shareResult,copyQuizLink} from '../src/game/share.js';
import {nenTypes} from '../src/data/nenTypes.js';
import {translations} from '../src/data/translations.js';
import {setupCharacterCards} from '../src/components/CharacterCards.js';
import {siteBrand} from '../src/components/SiteBrand.js';
if(!import.meta.env.DEV)throw new Error('Result preview is development-only.');

function sample(type){
 let seed=56;const random=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
 const attempt=createAttempt(random);attempt.phase='quiz';
 while(['quiz','bonus'].includes(attempt.phase)){
  attempt.pause=false;const q=attempt.questions[attempt.index],answer=[...q.options].sort((a,b)=>b.weights[type]-a.weights[type])[0];selectAnswer(attempt,answer.id);advance(attempt);
 }return attempt.result;
}
const samples=Object.fromEntries(Object.keys(nenTypes).map(type=>[type,sample(type)]));
document.body.dataset.phase='result';
document.querySelector('#app').innerHTML=`<header class="site-header">${siteBrand()}<nav class="language-switch" aria-label="Lingua"><button data-lang="it">IT</button><span>/</span><button data-lang="en">EN</button></nav></header><main id="experience"><section class="scene" data-phase="result">${quizScene()}<p class="scene-effect-caption"></p></section><div id="content" class="content"></div></main><aside class="result-review-controls"><label>Anteprima <select data-result-type>${Object.entries(nenTypes).map(([id,t])=>`<option value="${id}">${t.it}</option>`).join('')}</select></label><a href="/">Apri il quiz</a></aside><div class="toast" role="status"></div>`;
const scene=document.querySelector('.scene'),water=mountWaterScene(scene),hands=mountHandsMotion(scene),expression=setupQuizScene(scene);
const requested=new URLSearchParams(location.search).get('type');
let type=Object.hasOwn(nenTypes,requested)?requested:'conjuration',lang='it',busy=false;
hands.setPhase('result');expression('smile');document.querySelector('[data-result-type]').value=type;
function render(effect=false){
 document.documentElement.lang=lang;scene.dataset.effect=type;
 document.querySelector('.scene-effect-caption').textContent=nenTypes[type].effect[lang];
 document.querySelector('#content').innerHTML=resultView(samples[type],lang,translations[lang]);
 setupCharacterCards(document.querySelector('#content'),translations[lang]);
 for(const button of document.querySelectorAll('[data-lang]'))button.setAttribute('aria-pressed',String(button.dataset.lang===lang));
 if(effect){water.setEffect(type,{restart:true});water.pause();water.seek(water.getState().duration);}
}
document.querySelector('[data-result-type]').addEventListener('change',e=>{type=e.target.value;render(true);});
document.addEventListener('click',async e=>{
 const language=e.target.closest('[data-lang]');if(language){lang=language.dataset.lang;render();return;}
 const action=e.target.closest('[data-action]')?.dataset.action;
 if(action==='replay'){location.href='/';return;}
 if(action==='copy-link'){const copied=await copyQuizLink();if(!copied){const field=document.querySelector('.copy-link-fallback');field.hidden=false;field.querySelector('input').focus();field.querySelector('input').select();}const toast=document.querySelector('.toast');toast.textContent=translations[lang][copied?'linkCopied':'copyManual'];toast.classList.add('visible');return;}
 if(!['save','share','story'].includes(action)||busy)return;
 busy=true;try{const status=await shareResult(samples[type],lang,action==='share',action==='story'?'story':'card');const toast=document.querySelector('.toast');toast.textContent=translations[lang][status];toast.classList.add('visible');setTimeout(()=>toast.classList.remove('visible'),5000);}finally{busy=false;}
});
while(!water.getState().ready)await new Promise(requestAnimationFrame);
render(true);window.resultsReview={samples,water,hands};
