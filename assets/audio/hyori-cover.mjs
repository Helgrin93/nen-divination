// Current result: the selected recording with vocals removed, NOT a cover.
// hyori-transcription.json retains the rejected symbolic arrangement for history.
export function hyoriArrangement() {
  return {kind:'isolated-instrumental', duration:60, fadeInSeconds:.012,
    fadeOutSeconds:1.2, events:[], controls:[],
    pcmFiles:['instrumental-left','instrumental-right'].map(side =>
      `.verification/audio/reference-study/target-${side}.f32`)};
}
