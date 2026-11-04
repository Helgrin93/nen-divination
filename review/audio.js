import {coverScores} from '../assets/audio/cover-score.mjs';
import manifest from '../src/assets/audio/manifest.json';
import {musicTracks} from '../src/audio/tracks.js';
if (!import.meta.env.DEV) throw new Error('Audio preview is development-only.');

const phases = ['intro', 'divination', 'result'];
const scores = coverScores;
const area = document.querySelector('#tracks');
for (const [index, score] of scores.entries()) {
  const src = musicTracks[phases[index]].src;
  const seconds = Math.round(manifest.tracks.find(track => track.id === score.id).durationSeconds);
  const card = document.createElement('article');
  card.id = score.id;
  card.dataset.track = score.id;
  card.innerHTML = `<p class="phase">0${index + 1} · ${score.phase}</p><h2>${score.title}</h2>
    <p class="description">${score.description}</p>
    <p class="reference">${score.kind}<span>${score.credit}</span></p>
    <p class="details">${score.bpm} BPM · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} · LOOP</p>`;
  const player = document.createElement('audio');
  player.controls = true; player.preload = 'none'; player.loop = true; player.volume = .22;
  player.setAttribute('aria-label', `${score.phase}: ${score.title}`);
  if (src) player.src = src;
  card.append(player);
  if (src) {
    const download = document.createElement('a');
    download.className = 'download'; download.href = src;
    download.download = src.split('/').pop(); download.textContent = 'Scarica il brano';
    card.append(download);
  }
  const reference = document.createElement('a');
  reference.className = 'download'; reference.href = score.referenceUrl;
  reference.target = '_blank'; reference.rel = 'noreferrer';
  reference.textContent = score.id === 'result' ? 'Confronta con il video · 0:00–1:00 ↗' : 'Confronta con la OST ↗';
  card.append(reference);
  area.append(card);
  player.addEventListener('play', () => {
    for (const other of area.querySelectorAll('audio')) if (other !== player) other.pause();
    card.dataset.playing = 'true';
  });
  player.addEventListener('pause', () => {card.dataset.playing = 'false';});
}
