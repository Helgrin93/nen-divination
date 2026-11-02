import { describe,it,expect } from 'vitest';
import { createAttempt,selectAnswer,advance,goBack,beginConcentration,reveal } from '../game/stateMachine.js';
import { seededRandom } from '../game/questionPicker.js';
import { preferredLanguage,translations } from '../data/translations.js';

function play(seed){
  const random=seededRandom(seed),s=createAttempt(random);s.phase='quiz';
  while(['quiz','bonus'].includes(s.phase)){
    s.pause=false;const q=s.questions[s.index];selectAnswer(s,q.options[Math.floor(random()*4)].id);advance(s);
  }
  return s;
}
describe('Attempt navigation and bonus flow',()=>{
  it('keeps question order, option order and answers while going back',()=>{
    const s=createAttempt(seededRandom(8));s.phase='quiz';
    const original=s.questions.map(q=>[q.id,q.options.map(o=>o.id)]);
    selectAnswer(s,s.questions[0].options[2].id);advance(s);goBack(s);
    expect(s.index).toBe(0);expect(s.answers[s.questions[0].id]).toBe(s.questions[0].options[2].id);
    expect(s.questions.map(q=>[q.id,q.options.map(o=>o.id)])).toEqual(original);
  });
  it('does not advance without an answer and pauses only after the fourth',()=>{
    const s=createAttempt(seededRandom(3));s.phase='quiz';advance(s);expect(s.index).toBe(0);
    for(let i=0;i<4;i++){selectAnswer(s,s.questions[s.index].options[0].id);advance(s);}
    expect(s.index).toBe(4);expect(s.pause).toBe(true);expect(s.result).toBeNull();
    s.pause=false;goBack(s);advance(s);expect(s.pause).toBe(false);
  });
  it('exercises 7/8/9 paths, never repeats and caps at nine questions',()=>{
    const lengths=new Set();
    for(let seed=0;seed<300;seed++){
      const s=play(seed);lengths.add(s.questions.length);
      expect(s.phase).toBe('divinationIntro');expect(s.questions.length).toBeLessThanOrEqual(9);
      expect(new Set(s.questions.map(q=>q.id)).size).toBe(s.questions.length);
      expect(s.result.needsBonus).toBe(false);
    }
    expect([...lengths].sort()).toEqual([7,8,9]);
  });
  it('invalidates adaptive questions after an earlier answer changes',()=>{
    let s;for(let seed=0;seed<100;seed++){s=play(seed);if(s.questions.length===9)break;}
    s.phase='bonus';s.index=7;selectAnswer(s,s.questions[7].options.find(o=>o.id!==s.answers[s.questions[7].id]).id);
    expect(s.questions).toHaveLength(8);expect(s.result).toBeNull();
    s.index=2;s.phase='quiz';selectAnswer(s,s.questions[2].options.find(o=>o.id!==s.answers[s.questions[2].id]).id);
    expect(s.questions).toHaveLength(7);expect(Object.keys(s.answers)).toHaveLength(7);
  });
  it('hold only reveals a computed result, cannot trigger twice or change the winner',()=>{
    const empty=createAttempt(seededRandom(4));empty.phase='concentration';expect(reveal(empty)).toBe(false);
    const s=play(91),result=structuredClone(s.result);
    expect(reveal(s)).toBe(false);expect(beginConcentration(s)).toBe(true);expect(beginConcentration(s)).toBe(false);
    expect(reveal(s)).toBe(true);expect(reveal(s)).toBe(false);expect(s.result).toEqual(result);
  });
  it('a replay creates a clean attempt',()=>{
    const random=seededRandom(15),a=createAttempt(random),b=createAttempt(random);
    expect(a.questions.map(q=>q.id)).not.toEqual(b.questions.map(q=>q.id));expect(b.answers).toEqual({});expect(b.result).toBeNull();expect(b.phase).toBe('intro');
  });
});
describe('Localization',()=>{
  it('has matching nonempty IT/EN UI keys',()=>{
    expect(Object.keys(translations.it).sort()).toEqual(Object.keys(translations.en).sort());
    for(const lang of ['it','en'])Object.values(translations[lang]).forEach(text=>expect(text.length).toBeGreaterThan(0));
  });
  it('honours saved preference and survives blocked storage',()=>{
    expect(preferredLanguage({getItem:()=> 'it'},'en-US')).toBe('it');
    expect(preferredLanguage({getItem:()=> 'en'},'it-IT')).toBe('en');
    expect(preferredLanguage({getItem:()=>{throw Error();}},'en-GB')).toBe('en');
    expect(preferredLanguage(null,'fr-FR')).toBe('it');
  });
});
