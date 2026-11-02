import './styles.css';
import './styles/quiz-scene.css';
import './styles/divination.css';
import './styles/result.css';
import './styles/unified-scene.css';
import { translations, preferredLanguage } from './data/translations.js';
import { nenTypes } from './data/nenTypes.js';
import { createAttempt, selectAnswer, advance, goBack, reveal } from './game/stateMachine.js';
import { quizScene, setupQuizScene } from './components/QuizScene.js';
import { mountWaterScene } from './components/WaterScene.js';
import { wingDivination,wingTransmutationIntro } from './components/divinationTimeline.js';
import { mountHandsMotion } from './components/HandsMotion.js';
import { mountHold } from './components/HoldInteraction.js';
import { resultView } from './components/ResultView.js';
import { icon } from './components/icons.js';
import { shareResult,copyQuizLink } from './game/share.js';
import { createWingReactions } from './game/wingReactions.js';
import { setupCharacterCards } from './components/CharacterCards.js';
import { siteBrand } from './components/SiteBrand.js';

let storage;
try { storage=window.localStorage; } catch { /* The app works without storage. */ }
let lang=preferredLanguage(storage,navigator.language);
let state=createAttempt(), cleanupHold=null, effectTimer=null, exporting=false, holdActive=false;
let reactions=createWingReactions();
let dialogue=null, dialogueTimer=null, dialogueDeadline=0;
const shownReactions=new Set();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('#app').innerHTML=`
  <header class="site-header">${siteBrand()}
  <nav class="language-switch" aria-label="Language"><button data-lang="it" aria-label="Italiano">IT</button><span aria-hidden="true">/</span><button data-lang="en" aria-label="English">EN</button></nav></header>
  <main id="experience"><section class="scene" data-phase="intro" data-effect="none">${quizScene()}<div class="scene-hold-slot"></div><p class="scene-effect-caption" aria-live="polite"></p></section><div id="content" class="content"></div></main>
  <footer class="site-footer"><span class="footer-mark">NEN DIVINATION <span aria-hidden="true">·</span> HUNTER × HUNTER</span><p data-i18n="fan"></p><p data-i18n="privacy"></p></footer>
  <div class="toast" role="status" aria-live="polite"></div>`;
const content=document.querySelector('#content'),scene=document.querySelector('.scene');
const setExpression=setupQuizScene(scene);
const waterScene=mountWaterScene(scene);
const handsMotion=mountHandsMotion(scene);
scene.addEventListener('divinationstage',({detail})=>{
  if(state.phase!=='waterEffect'||detail.effect!=='transmutation')return;
  const sweet=detail.stage==='sweet',line=content.querySelector('.revelation-card p');
  if(line)line.textContent=(sweet?wingDivination.transmutation:wingTransmutationIntro)[lang];
  setExpression(sweet?'smile':'curious');
});
scene.addEventListener('divinationcomplete',()=>{
  if(state.phase!=='waterEffect')return;
  clearTimeout(effectTimer);
  dialogue={kind:'revealed',expression:'smile'};
  render({focus:true});
});
scene.addEventListener('divinationerror',()=>{
  if(state.phase==='waterEffect')scene.querySelector('.scene-effect-caption').textContent=lang==='it'?'Impossibile caricare gli sprite della divinazione. Ricarica la pagina.':'The divination sprites could not load. Please reload the page.';
});
const t=()=>translations[lang];
function translate(){
  document.documentElement.lang=lang;
  document.title='HxH - Nen Divination Test';
  scene.setAttribute('aria-label',t().sceneLabel);
  document.querySelector('.language-switch').setAttribute('aria-label',lang==='it'?'Lingua':'Language');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t()[el.dataset.i18n]);
  document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
  if(state.result && ['waterEffect','result'].includes(state.phase) && dialogue?.kind!=='revealed'){
    scene.querySelector('.scene-effect-caption').textContent=state.phase==='result'?nenTypes[state.result.primary].effect[lang]:t().revealing;
  }
  if(holdActive){const label=document.querySelector('.hold-button span');if(label)label.textContent=t().holding;}
  const progress=document.querySelector('.hold-progress');if(progress)progress.setAttribute('aria-label',t().holding);
}
function focusHeading(){
  const heading=content.querySelector('h1,h2');
  if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
}
function bringContentIntoView(){
  if(['intro','quiz','bonus'].includes(state.phase))return;
  const top=content.getBoundingClientRect().top;
  const headerHeight=document.querySelector('.site-header').offsetHeight;
  if(top<headerHeight || top>innerHeight*.7){
    window.scrollTo({top:window.scrollY+top-headerHeight-20,behavior:reducedMotion.matches?'instant':'smooth'});
  }
}
function render({focus=false}={}){
  clearTimeout(dialogueTimer);
  cleanupHold?.();cleanupHold=null;holdActive=false;
  const tr=t(), phase=state.phase;
  handsMotion.setPhase(phase);
  handsMotion.setActive(false);waterScene.setConcentration(false);
  document.body.dataset.phase=phase;
  scene.dataset.phase=phase;scene.classList.remove('is-holding');
  if(!['waterEffect','result'].includes(phase)){scene.dataset.effect='none';scene.querySelector('.scene-effect-caption').textContent='';}
  // All interactive phases share the same scene, canvas and camera.
  const contentParent=phase==='result'?document.querySelector('#experience'):scene;
  if(content.parentElement!==contentParent)contentParent.append(content);
  document.documentElement.style.setProperty('--accent',phase==='result'?nenTypes[state.result.primary].color:'#c8b998');
  scene.querySelector('.scene-hold-slot').innerHTML='';
  if(dialogue && phase!=='result'){
    const short=dialogue.kind==='short';
    if(dialogue.kind==='revealed')scene.querySelector('.scene-effect-caption').textContent='';
    setExpression(dialogue.expression);
    content.innerHTML=`<section class="interlude" data-dialogue="${short?'short':'important'}" data-kind="${short?dialogue.reaction.id:dialogue.kind}" ${short?`data-reaction="${dialogue.reaction.id}"`:''}><div class="speech-bubble" role="status"><span class="speaker">WING</span><h2>${tr[short?dialogue.reaction.id:dialogue.kind]}</h2></div>${short?'':`<button class="button primary" data-action="resume">${tr.next}${icon('arrow')}</button>`}</section>`;
    if(short){
      dialogueTimer=setTimeout(()=>{dialogue=null;state.pause=false;render({focus:true});},Math.max(0,dialogueDeadline-performance.now()));
    }
  }else if(phase==='intro'){
    setExpression('neutral');
    content.innerHTML=`<section class="intro-card"><div class="speech-bubble"><span class="speaker">WING</span><h1>${tr.intro}</h1></div><button class="button primary" data-action="begin">${tr.begin}${icon('arrow')}</button></section>`;
  }else if(phase==='quiz'||phase==='bonus'){
      setExpression(reactions.expressionForState(state));
      const q=state.questions[state.index],total=state.index<7?7:state.index+1;
      content.innerHTML=`<section class="quiz-card"><div class="speech-bubble"><div class="bubble-scroll" tabindex="0" role="region" aria-label="${tr.question} ${state.index+1}"><div class="question-meta"><span class="speaker">WING</span><span>${tr.question} ${state.index+1} / ${total}</span></div>
      <h1 class="question-title">${q[lang]}</h1></div></div>
      <div class="answers">${q.options.map((o,i)=>`<button class="answer ${state.answers[q.id]===o.id?'is-selected':''}" data-option="${o.id}" aria-pressed="${state.answers[q.id]===o.id}"><span class="answer-letter" aria-hidden="true">${'ABCD'[i]}</span><span>${o[lang]}</span></button>`).join('')}</div>
      <div class="question-navigation"><button class="text-button" data-action="back" ${state.index===0?'disabled':''}>${icon('back')}${tr.back}</button><button class="button next-button" data-action="next" ${!state.answers[q.id]?'disabled':''}>${tr.next}${icon('arrow')}</button></div></section>`;
  }else if(phase==='concentration'){
    setExpression('neutral');
    content.innerHTML=`<section class="focus-card"><div class="speech-bubble"><div class="bubble-scroll" tabindex="0" role="region" aria-label="WING"><span class="speaker">WING</span><h1 data-i18n="focusTitle"></h1><p data-i18n="focus"></p></div></div></section>`;
    scene.querySelector('.scene-hold-slot').innerHTML=`<button class="hold-button" aria-describedby="hold-description"><span data-i18n="hold"></span><small>4.5 s</small></button><div class="hold-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><button class="text-button accessible-reveal" data-action="reveal" data-i18n="accessible"></button><span id="hold-description" class="sr-only" data-i18n="holdHelp"></span><span class="hold-announcement sr-only" aria-live="polite"></span>`;
    const button=scene.querySelector('.hold-button');
    cleanupHold=mountHold({button,progress:scene.querySelector('.hold-progress'),onStart:()=>{
      holdActive=true;handsMotion.setActive(true);waterScene.setConcentration(true);scene.classList.add('is-holding');button.querySelector('span').textContent=t().holding;scene.querySelector('.hold-announcement').textContent=t().holding;
    },onReset:()=>{holdActive=false;handsMotion.setActive(false);waterScene.setConcentration(false);scene.classList.remove('is-holding');button.querySelector('span').textContent=t().hold;scene.querySelector('.hold-announcement').textContent=t().reset;},onComplete:completeHold});
  }else if(phase==='waterEffect'){
    const tasting=state.result.primary==='transmutation',sweet=waterScene.getState().stage==='sweet';
    setExpression(tasting&&sweet?'smile':'curious');
    const dialogue=tasting&&!sweet?wingTransmutationIntro:wingDivination[state.result.primary];
    content.innerHTML=`<section class="revelation-card" aria-live="polite"><div class="speech-bubble"><div class="bubble-scroll" tabindex="0" role="region" aria-label="WING"><span class="speaker">WING</span><h1>${tr.revealing}</h1><p>${dialogue[lang]}</p></div></div></section>`;
  }else if(phase==='result'){
    setExpression('smile');
    content.innerHTML=resultView(state.result,lang,tr);
    setupCharacterCards(content,tr);
  }
  translate();
  if(focus)focusHeading();
}
function completeHold(){
  if(!reveal(state))return;
  render({focus:true});
  scene.dataset.effect=state.result.primary;
  waterScene.setEffect(state.result.primary);
}
let toastTimer;
function toast(message){const el=document.querySelector('.toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),6000);}
document.addEventListener('click',async e=>{
  const language=e.target.closest('[data-lang]');
  if(language){
    const answerScroll=content.querySelector('.answers')?.scrollTop || 0;
    lang=language.dataset.lang;try{storage?.setItem('lang',lang);}catch{ /* optional */ }
    if(state.phase==='concentration')translate();else render();
    const answers=content.querySelector('.answers');if(answers)answers.scrollTop=answerScroll;
    return;
  }
  const option=e.target.closest('[data-option]');
  if(option){
    selectAnswer(state,option.dataset.option);
    content.querySelectorAll('[data-option]').forEach(button=>{
      const selected=button===option;
      button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));
    });
    content.querySelector('[data-action="next"]').disabled=false;
    return;
  }
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  if(action==='begin'){state.phase='quiz';render({focus:true});bringContentIntoView();}
  if(action==='resume'&&dialogue?.kind!=='short'){
    const finished=dialogue?.kind==='revealed';dialogue=null;state.pause=false;
    if(finished){state.phase='result';render({focus:true});window.scrollTo({top:0,behavior:'instant'});}
    else{render({focus:true});bringContentIntoView();}
  }
  if(action==='next'){
    const previous=state.index;advance(state);
    if(state.phase==='concentration')dialogue={kind:'focus',expression:'neutral'};
    else if(state.phase==='bonus'&&state.index>previous)dialogue={kind:'bonus'+(state.index+1),expression:'thinking'};
    else if(state.index>previous){
      const reaction=reactions.forState(state),key=`${state.index}-${state.questions[state.index].id}`;
      if(reaction&&!shownReactions.has(key)){
        shownReactions.add(key);dialogue={kind:'short',reaction,expression:reaction.expression};dialogueDeadline=performance.now()+3000;
      }
    }
    render({focus:true});
    if(state.phase==='concentration')scene.scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'});
    else bringContentIntoView();
  }
  if(action==='back'){goBack(state);render({focus:true});bringContentIntoView();}
  if(action==='reveal')completeHold();
  if(action==='replay'){
    clearTimeout(effectTimer);clearTimeout(dialogueTimer);dialogue=null;shownReactions.clear();state=createAttempt();reactions=createWingReactions();waterScene.reset();scene.dataset.effect='none';render({focus:true});window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});
  }
  if(action==='copy-link'&&state.phase==='result'){
    if(await copyQuizLink())toast(t().linkCopied);
    else{const field=content.querySelector('.copy-link-fallback');field.hidden=false;field.querySelector('input').focus();field.querySelector('input').select();toast(t().copyManual);}
  }
  if(['save','share','story'].includes(action)&&state.phase==='result'&&!exporting){
    exporting=true;
    const controls=content.querySelectorAll('[data-action="save"],[data-action="share"],[data-action="story"]');controls.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');});
    try{const status=await shareResult(state.result,lang,action==='share',action==='story'?'story':'card');toast(t()[status]);}
    catch(error){console.error('PNG export failed',error);toast(t().exportError);}
    finally{exporting=false;controls.forEach(b=>{b.disabled=false;b.removeAttribute('aria-busy');});}
  }
});
render();
