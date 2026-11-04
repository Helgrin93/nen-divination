// Instrumental study arrangements; original composers credited per track.
// The piano performance is in world-cover.json (Julian Berger).
// Legend: opening flute theme transcribed from the public livepotato score;
// a short, repeated excerpt with a reduced string/percussion accompaniment.
export const coverScores = [
  {
    id: 'intro-quiz', title: 'The World of Adventurers', phase: 'Domande',
    bpm: 141, durationSeconds: 70.32948, kind: 'Cover pianistica',
    description: 'Il tema riconoscibile, eseguito al pianoforte con dinamiche e pedale della cover di Julian Berger.',
    composer: 'Yoshihisa Hirano', credit: 'Arrangiamento pianistico: Julian Berger',
    reference: 'The World of Adventurers',
    referenceUrl: 'https://music.apple.com/us/album/the-world-of-adventurers-kanzenban/1710312881?i=1710312883',
    sourceUrl: 'https://drive.google.com/file/d/144Gk3sgIkxB-bOSSwAn2Ptic3TegMg7A/view',
  },
  {
    id: 'divination', title: 'Legend of the Martial Artist', phase: 'Divinazione',
    bpm: 125, durationSeconds: 34.56, kind: 'Cover del tema iniziale',
    description: 'Il tema al flauto, con ostinato di archi e percussioni leggere. Un estratto ripetuto, contemplativo e rituale.',
    composer: 'Yoshihisa Hirano', credit: 'Trascrizione di riferimento: livepotato · accompagnamento ridotto per questa bozza',
    reference: 'Legend of the Martial Artist',
    referenceUrl: 'https://music.apple.com/us/album/legend-of-the-martial-artist/672111934?i=672112031',
    sourceUrl: 'https://www.noteflight.com/music/titles/8081eaf5-4752-4992-84cd-26497121164c/hunter-x-hunter-legend-of-the-martial-artist',
  },
  {
    id: 'result', title: 'Hyōri Ittai', phase: 'Scheda finale',
    bpm: 150.11, durationSeconds: 60, kind: 'Voce rimossa · 0:00–1:00',
    description: 'Il primo minuto del video scelto, con la voce rimossa: conserva gli strumenti, il ritmo e l’esecuzione della registrazione. Non è una nuova cover; la separazione può lasciare residui vocali o artefatti.',
    composer: 'Yujin Kitagawa, Koji Iwasawa, Kenichi Maeyamada', artist: 'Yuzu',
    credit: 'Yuzu · riferimento di XimeRmusik · separazione vocale UVR-MDX-NET-Voc_FT',
    reference: 'Hyōri Ittai',
    referenceUrl: 'https://www.youtube.com/watch?v=ZV9jaHMnaUI&t=0s',
    sourceUrl: 'https://www.youtube.com/watch?v=ZV9jaHMnaUI',
  },
];

export function legendArrangement() {
  const secondsPerQuarter = 60 / 125, bar = 4.5;
  const events = [];
  function note(channel, pitch, start, duration, velocity) {
    events.push({channel, pitch, start: start * secondsPerQuarter,
      duration: duration * secondsPerQuarter, velocity});
  }
  // Durations are quarters in the reference's 9/8 notation. Ties are merged.
  // E5 G5 B5 / E5 G5 B5 A5 / E5 F#5 G5, followed by a breath.
  const flute = [
    [76, 0, .75], [79, .75, .75], [83, 1.5, 7.5],
    [76, 11.5, .75], [79, 12.25, .75], [83, 13, 1.5], [81, 14.5, 8],
    [76, 22.75, 2/3], [78, 22.75 + 2/3, 2/3],
    [79, 22.75 + 4/3, 8.25 - 4/3],
  ];
  for (let repeat = 0; repeat < 2; repeat++) {
    const offset = repeat * 8 * bar;
    for (const [pitch, start, duration] of flute) {
      // Leave room to breathe at long phrase endings; short notes stay legato.
      note(0, pitch, offset + start + .08, duration - (duration > 4 ? .3 : .025), repeat ? 76 : 72);
    }
  }
  // Reduced version of the reference's recurring E–D–E–B–F#–E figure.
  const figure = [[76, 1/3], [74, 1/3], [76, 17/24], [71, 3/8], [78, 3/4], [76, .5]];
  for (let b = 0; b < 16; b++) {
    let t = b * bar + .75;
    for (const [pitch, length] of figure) {
      note(1, pitch, t, length * .82, 45 + b % 3 * 3);
      t += length;
    }
    note(2, 40, b * bar, bar - .12, 39);
    note(2, 59, b * bar + .025, bar - .18, 30);
    // Quiet low toms supply the ritual pulse without a drum-kit backbeat.
    note(9, 41, b * bar, .15, 38);
    note(9, 45, b * bar + 2.25, .12, 27);
    note(9, 43, b * bar + 3, .12, 30);
  }
  return {duration: 34.56, events, controls: [], programs: [
    {channel: 0, program: 73, volume: 100, pan: 59}, // Flute
    {channel: 1, program: 48, volume: 66, pan: 47}, // Strings
    {channel: 2, program: 42, volume: 45, pan: 75}, // Cello
    {channel: 9, program: 0, bank: 128, volume: 65, pan: 64},
  ]};
}
