# Nen Divination — estensione laterale della stanza

Data: 31 ottobre 2026 · branch locale `art-polish-v5` · base `117c671`.

## Ambito effettivo

Questo intervento applica l'ultima specifica allegata **«NEN DIVINATION — ESTENSIONE LATERALE DELLA STANZA»**: completare l'ambiente conservando gli elementi centrali e il funzionamento attuale.

Sono stati letti integralmente i documenti `00` e `01` del pacchetto V5, la checklist `02`, la mappa `03`, l'indice e i riferimenti visivi pertinenti. L'ultima richiesta precisa la distinzione fra tavolo e pavimento e prescrive di conservare anche sprite, vignette e pulsanti. Per questo la consegna riguarda la stanza: le altre modifiche del pacchetto V5 a header, CTA, espressioni, vetro e dialoghi non vengono dichiarate completate.

## Risultato

- Due nuove ali illustrate sostituiscono i margini beige su desktop.
- A sinistra: porzione di lavagna con calligrafia e supporto; a destra: porzione di mobile marrone a pannelli e maniglie.
- Intonaco ocra raccordato alla scena esistente, battiscopa e pavimento scuri.
- Tavolo chiaro con due bordi laterali obliqui: il pavimento è visibile oltre quei bordi e i mobili stanno dietro il tavolo.
- Camera centrale, tappeto, crepe esistenti, Wing, mani, bicchiere e foglia conservati. Il centro generato non viene utilizzato.
- Su smartphone le ali vengono ritagliate dall'inquadratura originale; Wing non viene rimpicciolito per mostrarle.

La quantità visibile di lavagna/mobile dipende dal formato: a 1440×900 rimane una porzione più piccola; a 1920×912, formato vicino allo screenshot dell'utente, l'ambiente laterale è più ampio. Le scritte seguono la lavagna intera e vengono tagliate dal bordo della viewport.

## Implementazione e asset

| File | Modifica |
| --- | --- |
| `src/components/QuizScene.js` | Due immagini decorative laterali, con priorità bassa. Un errore di caricamento di un'ala non segnala come indisponibile il centro della scena. |
| `src/styles/unified-scene.css` | Posizionamento delle ali interamente fuori dal rettangolo della camera originale; dimensioni proporzionali alla stessa camera. Larghezza esplicita del contenitore risultato per evitare un calcolo transitorio errato di WebKit. |
| `public/assets/room-v5/room-left.png` | Ala sinistra, 512×1024 PNG, 678350 byte. |
| `public/assets/room-v5/room-right.png` | Ala destra, 512×1024 PNG, 622604 byte. |
| `.gitignore` | Esclude pacchetto di riferimento e cartelle degli screenshot locali. |
| `scripts/prepare-room-extensions.mjs` | Composizione riproducibile dalla sorgente artistica selezionata. |
| `scripts/review-v5.mjs` | Catture nelle cinque viewport, con quiz e casualità visiva controllati. |
| `scripts/verify-room-evidence.mjs` | Confronto di misure, pixel e integrità degli asset originali; cattura aggiuntiva 1920×912. |
| `e2e/room-extension.spec.js` | Registrazione delle ali, conservazione del centro con due cambi di espressione, copertura desktop e assenza di overflow. |
| `docs/v5-polish/` | Confronto interattivo, provenienza degli asset e misure di verifica. |

**Metodo artistico reale:** generazione con lo strumento integrato `image_gen` dai riferimenti forniti, quindi ritaglio e compositing locale con Canvas. Sono utilizzate solo le regioni ambientali necessarie; raccordo cromatico, geometria dei bordi del tavolo e ritaglio del pavimento sono applicati ai nuovi PNG. La proposta che faceva leggere il piano come pavimento è stata scartata. Non sono stati usati mirroring, duplicazioni del personaggio, sfocatura generale o stretching del centro.

I due nuovi PNG aggiungono circa **1,30 MB**. Sorgenti AI, riferimenti e screenshot non sono asset di produzione. I dettagli e gli hash sono in [ASSET_PROVENANCE.md](docs/v5-polish/ASSET_PROVENANCE.md).

## Conservazione verificata

- I **20 file originali** nelle cartelle `scene-v3` e `divination` sono identici byte per byte al commit di partenza, inclusi i quattro sprite di Wing e tutti gli atlanti delle animazioni.
- Le misure di camera, vignetta, risposte e navigazione coincidono nelle cinque viewport prima e dopo.
- **15 confronti** del rettangolo centrale: 13 identici al pixel; due catture del quiz 1920×1080 differiscono su 182 pixel ciascuna, con scarto massimo di **1 livello RGB**. Nessun pixel supera tale scarto. È distinta la conservazione esatta dei file sorgenti dall'arrotondamento della composizione del browser.
- Il controllo con ali visibili/nascoste confronta inoltre il centro nelle espressioni neutra, sorriso e occhi chiusi, ammettendo soltanto un livello RGB di arrotondamento.

Dati completi: [preservation.json](docs/v5-polish/preservation.json).

Nell'analisi preliminare V5 sono state individuate differenze già esistenti negli sprite: per esempio `(420,980)` è trasparente nel neutro e quasi opaco/grigio nel sorriso e negli occhi chiusi. Tali difetti e le differenze cromatiche fra sprite **non sono stati ritoccati**, rispettando l'ultima richiesta di conservarli. Non vengono quindi presentati come corretti da questa estensione.

## Screenshot e revisione

Aprire [il confronto locale](docs/v5-polish/confronto.html), scegliere schermo e scena, quindi trascinare il cursore.

| Viewport | Browser delle catture | Prima / dopo dell'introduzione |
| --- | --- | --- |
| 1920×1080 | Chromium / Chrome | [Prima](docs/v5-polish/before/desktop-wide-intro.png) · [Dopo](docs/v5-polish/after/desktop-wide-intro.png) |
| 1440×900 | Chromium / Chrome | [Prima](docs/v5-polish/before/desktop-intro.png) · [Dopo](docs/v5-polish/after/desktop-intro.png) |
| 390×844 | WebKit | [Prima](docs/v5-polish/before/iphone-intro.png) · [Dopo](docs/v5-polish/after/iphone-intro.png) |
| 375×667 | WebKit | [Prima](docs/v5-polish/before/iphone-small-intro.png) · [Dopo](docs/v5-polish/after/iphone-small-intro.png) |
| 412×915 | Chromium / Chrome | [Prima](docs/v5-polish/before/android-intro.png) · [Dopo](docs/v5-polish/after/android-intro.png) |
| 1920×912 | Chromium / Chrome | [Ali disattivate](docs/v5-polish/before/desktop-reference-intro.png) · [Ali attivate](docs/v5-polish/after/desktop-reference-intro.png) |

Le prime cinque righe usano la baseline catturata prima delle modifiche. L'ultima confronta lo stesso istante con le sole ali nascoste/visibili. Sono disponibili anche quiz, ultima risposta raggiunta, due cambi di domanda, intermezzo, pre-divinazione e concentrazione; dopo la modifica anche conclusione IT/EN e risultato.

Verifica effettuata con browser locali ed emulazione di viewport/tocco. Non è una prova su iPhone o Android fisici né comprende le barre del browser Safari reale.

## Test

| Comando / controllo | Esito |
| --- | --- |
| `npm test` | 29 test superati, 6 file. |
| `npm run build` | Superato. |
| `npm run test:build` | Superato: app completa e PNG su mobile/desktop sotto `/nen-divination/`, immagini caricate e riferimenti esclusi. |
| `node scripts/review-v5.mjs --before` e `node scripts/review-v5.mjs` | Completati su tutte le cinque viewport. |
| `node scripts/verify-room-evidence.mjs` | Superato; dettagli e tolleranza dei pixel riportati sopra. |
| Confronto HTML e caricamento fallito delle ali | 72 immagini del confronto decodificate; selettori e cursore funzionanti. Una richiesta fallita delle ali lascia utilizzabili scena originale e quattro risposte. |
| `npx playwright test` | Prima esecuzione completa: 247 superati, 40 skip previsti dai filtri di browser/viewport, 7 fallimenti iniziali descritti sotto. |
| `npx playwright test --last-failed --workers=1` | **7/7 superati** con il codice definitivo. Nessun caso della prima esecuzione rimane fallito. |
| `npx playwright test e2e/room-extension.spec.js --project=desktop` | 2 test superati. |
| Riesecuzione mirata dei risultati e della cancellazione hold nei due profili WebKit | Con le dimensioni definitive: 13 superati e un timeout nel passaggio pre-divinazione durante il run parallelo; quest'ultimo caso, rieseguito isolatamente, è passato (1/1). |
| `git diff --check` | Superato. |

La prima versione del nuovo test confrontava i PNG come sequenze di byte e falliva per differenze di un livello RGB sui bordi traslucidi. Il confronto è stato corretto per decodificare i pixel e ammettere esclusivamente tale arrotondamento; il controllo desktop successivo è passato. Nessun asset centrale è stato modificato per soddisfare il test.

La suite ha inoltre evidenziato un difetto transitorio di layout WebKit entrando nel risultato: la scena poteva assumere per il primo layout una larghezza di circa 581 px su viewport 390 px, per poi tornare a 390 px. È stato riprodotto anche nascondendo completamente le ali. Sono state rese esplicite larghezza (`100%`), altezza mobile (`62vw`, corrispondente all'aspect ratio originale `1000:620`) e altezza minima del solo contenitore risultato. Il primo tentativo con la sola larghezza eliminava l'overflow ma lasciava un salto transitorio di altezza; le dimensioni esplicite conservano la geometria finale originale. I controlli interessati sono stati rieseguiti con esito positivo sui due profili WebKit.

## Checklist dell'ultima richiesta

- [x] Fasce beige desktop sostituite con illustrazione ambientale.
- [x] Parete raccordata alla scena esistente, senza ridisegnare le crepe originali.
- [x] Tavolo con lati riconoscibili e pavimento distinto oltre i bordi.
- [x] Lavagna e mobile parziali, senza oggetti aggiuntivi estranei.
- [x] Centro originale conservato, supportato da hash e confronti dei pixel.
- [x] Catture 1920×1080, 1440×900 e 390×844; aggiunte 375×667, Android e formato del riferimento.
- [x] Mobile con scala originale e assenza di overflow nelle viewport controllate.
- [x] Suite completa eseguita e sette casi inizialmente falliti rieseguiti con esito positivo.
- [x] Nessun commit, push, merge o deploy automatico.

## Stato Git e avvio locale

Modifiche lasciate nel working tree del branch `art-polish-v5`, senza commit. `main` non è stato modificato. Le immagini del pacchetto restano escluse da Git; gli screenshot sono locali e non saranno inclusi automaticamente in un commit.

Per rivedere l'app: `npm run dev`, quindi aprire l'indirizzo locale stampato dal server. Il confronto è disponibile al percorso `/docs/v5-polish/confronto.html`. La pubblicazione rimane sotto controllo dell'utente.
