import { questions } from '../data/questions.js';
import { pickQuestions, shuffle } from './questionPicker.js';
import { evaluate } from './scoring.js';
import { pickBonus } from './bonusPicker.js';

export function createAttempt(random = Math.random) {
  const pool = new Map(questions.map(q => [q.id, { ...q, options: shuffle(q.options, random) }]));
  return { phase: 'intro', questions: pickQuestions(random).map(q => pool.get(q.id)), pool, answers: {}, index: 0, result: null, pause: false, reactionSeen: false };
}

export function selectAnswer(state, optionId) {
  if (!['quiz', 'bonus'].includes(state.phase) || state.pause) return;
  const q = state.questions[state.index];
  if (!q.options.some(o => o.id === optionId)) throw new Error('Invalid option');
  if (state.answers[q.id] && state.answers[q.id] !== optionId) {
    // Adaptive questions must be selected again after an earlier answer changes.
    const keep = state.index < 7 ? 7 : state.index + 1;
    for (const old of state.questions.slice(keep)) delete state.answers[old.id];
    state.questions = state.questions.slice(0, keep);
    state.result = null;
  }
  state.answers[q.id] = optionId;
}

export function advance(state) {
  if (!['quiz', 'bonus'].includes(state.phase) || state.pause) return;
  const q = state.questions[state.index];
  if (!state.answers[q.id]) return;
  if (state.index < 6) {
    state.index++;
    if (state.index === 4 && !state.reactionSeen) {
      state.pause = true;
      state.reactionSeen = true;
    }
    return;
  }
  const used = state.questions.slice(0, state.index + 1);
  const result = evaluate(used, state.answers);
  if (result.needsBonus) {
    const next = pickBonus(used, result.primary, result.secondary);
    // The next adaptive choice is deterministic; option order was fixed at attempt creation.
    state.questions = [...used, state.pool.get(next.id)];
    state.index++;
    state.phase = 'bonus';
  } else {
    state.questions = used;
    state.result = result;
    state.phase = 'divinationIntro';
  }
}

export function goBack(state) {
  if (!['quiz', 'bonus'].includes(state.phase) || state.pause || state.index === 0) return;
  state.index--;
  state.phase = state.index < 7 ? 'quiz' : 'bonus';
}

export function beginConcentration(state) {
  if (state.phase !== 'divinationIntro' || !state.result) return false;
  state.phase = 'concentration';
  return true;
}

export function reveal(state) {
  if (state.phase !== 'concentration' || !state.result) return false;
  state.phase = 'waterEffect';
  return true;
}
