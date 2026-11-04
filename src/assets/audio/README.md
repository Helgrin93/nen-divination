# Colonna sonora di Nen Divination

Le domande e la divinazione usano **cover strumentali di temi di Yoshihisa
Hirano**. La scheda finale usa **Hyōri Ittai**, l'ending degli **Yuzu**:
il primo minuto del video scelto dall'utente, elaborato per rimuovere la voce.
Questa terza traccia deriva dalla registrazione e **non è una nuova cover**.

| Fase | File | Versione attuale | Durata |
| --- | --- | --- | --- |
| Apertura e domande | `intro-quiz.mp3` | **The World of Adventurers**, cover pianistica | 70 s |
| Divinazione | `divination.mp3` | **Legend of the Martial Artist**, tema iniziale ripetuto al flauto, accompagnamento ridotto | 35 s |
| Scheda finale | `result.mp3` | **Hyōri Ittai**, registrazione del video scelto con voce rimossa, 0:00–1:00 | 60 s |

La divinazione conserva la direzione **contemplativa e rituale** scelta
dall'utente. La notazione di riferimento è in 9/8 a 125 quarti/minuto;
questo numero non indica il BPM certificato della registrazione originale.
Le cover non ricostruiscono integralmente l'orchestrazione delle OST:
la prima è pianistica; la seconda ha un accompagnamento semplificato.
Hyōri Ittai conserva invece tempo, intonazione e strumenti della registrazione:
il tempo misurato sul riferimento è circa 150 BPM, senza risincronizzazione.

## Ascolto

Avviare `npm.cmd run dev` e aprire lo
[studio musicale locale](http://localhost:5173/review/audio.html).
Le schede indicano il tipo di cover e i crediti; offrono ascolto,
ricerca, volume, download e un collegamento alla OST per il confronto.
Un brano avviato ferma gli altri. La pagina rimane fuori dalla build pubblica.

Nel quiz rimangono volume 0,22, dissolvenze di 280 ms e preferenza di
silenziamento salvata. Il brano della divinazione parte all'avvio effettivo della
concentrazione e prosegue fino alla conclusione di Wing. Il finale parte con
la scheda risultato. I file sono stereo 44,1 kHz, MP3 a 160 kbps.

## Partiture, riferimenti e crediti

- **The World of Adventurers**: musica di Yoshihisa Hirano;
  arrangiamento pianistico di **Julian Berger**, dal
  [MIDI pubblicato dall'arrangiatore](https://drive.google.com/file/d/144Gk3sgIkxB-bOSSwAn2Ptic3TegMg7A/view).
  [Video della cover](https://youtu.be/1zEnYte5TOU).
  [Eventi della performance](../../../assets/audio/world-cover.json): note,
  tempi, dinamiche e pedale conservati, con silenzio iniziale accorciato e coda aggiunta.
- **Legend of the Martial Artist**: musica di Yoshihisa Hirano;
  tema iniziale letto dalla
  [trascrizione pubblica di livepotato](https://www.noteflight.com/music/titles/8081eaf5-4752-4992-84cd-26497121164c/hunter-x-hunter-legend-of-the-martial-artist).
  Le legature del flauto sono unite; l'estratto è ripetuto con una piccola variazione
  dinamica. Archi, bordone e percussioni costituiscono un accompagnamento ridotto.
- **Hyōri Ittai**, degli **Yuzu**: musica di **Yujin Kitagawa, Koji Iwasawa e
  Kenichi Maeyamada**. Riferimento richiesto dall'utente:
  [video di XimeRmusik](https://www.youtube.com/watch?v=ZV9jaHMnaUI), da **0:00 a 1:00**.
  Dopo il rifiuto delle due ricostruzioni, la versione corrente usa separazione
  vocale **UVR-MDX-NET-Voc_FT** tramite `web-audio-separation@0.3.1`.
  Sottrae la voce stimata da entrambi i canali del riferimento, conservando
  l'accompagnamento stereo. Non ricostruisce note o accordi e non aggiunge
  strumenti sintetizzati. La linea cantata è rimossa, non suonata da un violino.
  Possono restare residui vocali, riverbero del canto o artefatti: la pulizia
  della separazione non è certificata dai test di integrazione.
  La vecchia [trascrizione simbolica](../../../assets/audio/hyori-transcription.json)
  è conservata come materiale storico rifiutato e non viene renderizzata.
  [configurazione del rendering](../../../assets/audio/hyori-cover.mjs).
  [Edizione originale degli Yuzu](https://yuzu-official.com/contents/discography/b7f23316-de5a-443c-b5ff-390cd8a17305).
  Audio sorgente, modello e stem PCM rimangono in `.verification/audio/reference-study/`,
  esclusi da Git e dalla build. Il nuovo MP3 deriva dalla registrazione scelta.
  Dissolvenze di 12 ms all'inizio e 1,2 s alla fine attenuano il taglio di 60 secondi.

Gli originali sono nel [catalogo ufficiale NTV](https://www.ntv.co.jp/hunterhunter/music/index.html).
Le prime due tracce sono nuove esecuzioni; il finale contiene l'accompagnamento
della registrazione del video indicato. Questa lavorazione non attribuisce al
progetto diritti sulle composizioni, sulle trascrizioni o sulla registrazione.

Gli strumenti campionati provengono da **GeneralUser GS 2.0.3**, di
[S. Christian Collins](https://www.schristiancollins.com/generaluser.php).
La licenza v2.0 inclusa nel banco permette l'uso per produrre registrazioni.
Il banco è usato soltanto per le prime due tracce. Il sintetizzatore e il modello
di separazione restano strumenti locali: la build contiene soltanto gli MP3.

## Rigenerare le cover

La partitura e i metadati sono in
[cover-score.mjs](../../../assets/audio/cover-score.mjs); il rendering è in
[render-covers.mjs](../../../scripts/render-covers.mjs).
Occorre Node 22 o successivo. Installare gli strumenti locali insieme:

```powershell
npm.cmd install --prefix .verification/audio-tools --no-audit --no-fund --package-lock=false js-synthesizer@1.13.0 @breezystack/lamejs@1.2.7
```

Scaricare GeneralUser GS dal sito dell'autore o dal suo
[repository](https://github.com/mrbumpy409/GeneralUser-GS), quindi collocare il
banco in `.verification/audio/soundfonts/GeneralUser-GS.sf2`.
Il renderer verifica questo SHA-256 per evitare cambiamenti silenziosi di timbro:

```text
9575028c7a1f589f5770fccc8cff2734566af40cd26ed836944e9a5152688cfe
```

```powershell
npm.cmd run assets:audio
```

Il comando salva prima una copia delle tracce e del manifest in
`.verification/audio/backups/`, completa i rendering e sostituisce
`intro-quiz.mp3`, `divination.mp3` e `result.mp3`.
Per rigenerare solo la cover finale:

```powershell
npm.cmd run assets:audio -- --track=result
```

Per il finale occorrono gli stem stereo già separati, `target-instrumental-left.f32`
e `target-instrumental-right.f32`, nella cartella locale `reference-study`: float32
little-endian, 44.100 Hz, 60 secondi ciascuno. `hyori-cover.mjs` li identifica;
il renderer verifica dimensioni e campioni finiti prima della sostituzione.
I file non sono inclusi nel repository: per riprodurre la separazione servono
la registrazione di riferimento e il modello indicato sopra. Gli strumenti
di studio locali sono `.verification/audio/run-separation.mjs` e
`.verification/audio/separate-study.html`.

Le prime due tracce renderizzano due cicli per conservare le code del loop.
Il finale codifica direttamente gli stem. Entrambi i percorsi normalizzano
i livelli e aggiornano provenienza, durate e hash nel manifest.
L'encoder MP3 può introdurre una breve discontinuità nel loop a seconda del browser.

Le prime tre bozze ascoltate dall'utente sono conservate localmente in
`.verification/audio/v1/`. Per ricrearle separatamente:

```powershell
npm.cmd run assets:audio:originals -- --mp3
```

Questo comando scrive in `.verification/audio/originals/`, senza sovrascrivere
le cover dell'app. Le vecchie partiture sono in
[original-score.mjs](../../../assets/audio/original-score.mjs).
La prima versione rifiutata di Hyōri Ittai, di 40 secondi, è conservata in
`.verification/audio/rejected-hyori-v1/`.

## Sostituzione e verifiche

`src/audio/tracks.js` rileva i nomi `intro-quiz`, `divination`, `result` nei formati
`.mp3`, `.m4a`, `.ogg`, `.wav`. Tenere un solo formato per ciascun nome e aggiornare
metadati, crediti e hash dopo una sostituzione. Un file assente lascia silenziosa
soltanto la fase corrispondente. L'avvio rispetta il gesto richiesto dal browser.

```powershell
npm.cmd run build
npm.cmd run test:audio
npx.cmd playwright test e2e/audio-review.spec.js --project=desktop --project=small-mobile
```

`test:audio` controlla gli MP3 reali sotto `/nen-divination/`: hash, decodifica,
durata, stereo, livelli, cambio delle tre fasi, loop e mute/riavvio. Il report è
in `.verification/audio/production-check.json`. Questi controlli verificano
l'integrazione tecnica, non certificano la fedeltà musicale: per quella resta
necessario il confronto d'ascolto. La verifica su iPhone fisico resta da svolgere.
