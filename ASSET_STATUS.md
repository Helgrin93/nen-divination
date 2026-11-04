# Nen Divination V2 — stato della revisione locale

Aggiornato il **27 ottobre 2026**. La scena di divinazione e la scheda risultato V2 sono integrate nell'anteprima; la fedeltà grafica finale resta incompleta per gli asset elencati sotto. Nessun push o deploy eseguito.

## Prova di qualità della divinazione — revisione corrente

### Acqua più leggibile e revisione delle sei reazioni — 4 novembre 2026

Aggiunta una lieve tonalità fredda nel solo volume del liquido, escludendo i
riflessi chiari del vetro. Il trattamento è condiviso dal riposo e dalle sei
reazioni. Nel Potenziamento la ricostruzione sotto il livello dell'acqua ora
estende una riga di colore invece di stirare una fascia di riflessi, eliminando
le bande squadrate. Il ricampionamento di qualità della foglia che appassisce
riduce i bordi seghettati; tempi e movimento dei frammenti sono conservati.
Confronti di quattro istanti per tutte le reazioni in `.verification/before-*.png`
e `.verification/after-*.png`. Il confronto con i fotogrammi storici ammette
solo una differenza cromatica limitata nel rettangolo della foglia ricampionata,
oltre al trattamento statico condiviso: i pixel esterni restano invariati.

### Correzione del doppio livello dell'acqua — 4 novembre 2026

Nel Potenziamento il campione animato comprendeva anche la fascia anteriore
del bordo di vetro: la copia sollevata si sommava al bordo fisso. Il campione
ora contiene soltanto l'interno della superficie. La salita parte dal livello
di riposo e raggiunge il labbro interno, con inserimento graduale della texture;
il bordo del bicchiere viene ripristinato una sola volta. Confronto ravvicinato
di sei istanti in `.verification/water-before.png` e `.verification/water-after.png`.

Integrate tre pose anatomiche dedicate delle mani, un tavolo senza mani e una superficie senza foglia, generati con lo strumento integrato imagegen dal fondale approvato. File in `public/assets/divination/`. Il runtime usa soltanto le impronte delle vecchie mani e della foglia dei nuovi fondali: Wing, tappeto, muro e calice continuano a usare i file originali.

La nuova animazione riguarda esclusivamente Potenziamento e increspature di concentrazione. Le altre cinque reazioni sono statiche, in attesa dell'approvazione richiesta. Rimossi raggi, lineette convergenti, bagliori e vecchie reazioni provvisorie. Punteggi e schermata finale invariati.

Per la rifinitura servono fotogrammi intermedi delle mani, vetro e acqua su livelli originali separati, una foglia con alpha rifinito e una piccola sequenza illustrata del velo d'acqua sul bordo. I tre disegni attuali usano raccordi brevi su canvas; non equivalgono a una sequenza completa disegnata fotogramma per fotogramma. Dettagli e prompt in [divination-quality-notes.md](assets/scene/divination-quality-notes.md). Le sezioni successive descrivono le revisioni precedenti.

## Ripresa: muro con tappeto e quattro espressioni

Su richiesta dell'utente, il muro dietro Wing mostra un tappeto con bordi teal, verde, ocra e rosso e piccole crepe che spuntano ai lati. `public/assets/scene-v3/wall-rug.png` è un fondale senza personaggi, generato con imagegen dal riferimento allegato; prompt completo in `assets/scene/wall-rug.prompt.md`. È un livello separato: file e animazioni di mani, bicchiere e foglia restano invariati, così come layout delle risposte e risultato.

Collegati i quattro PNG trasparenti già presenti in `public/assets/scene-v3/`: neutro, sorriso, occhi chiusi e gesto. Dissolvenza di 240 ms, disattivata con movimento ridotto. Le reazioni occasionali preesistenti mantengono la stessa espressione cambiando lingua, selezionando una risposta o tornando indietro. Se una posa manca, resta visibile quella neutra. Provenienza dei quattro PNG ancora da registrare: non sono certificati come fotogrammi autentici.

Aggiornamento produzione: entrambe le build includono soltanto `unified-goblet-scene.png` e le quattro pose di Wing. Sorgenti e fondali intermedi inutilizzati restano esclusi. Vedere `ASSETS.md` per i permessi non verificati.

## Correzione definitiva delle risposte quiz

Applicate le indicazioni testuali del 27 ottobre: quattro riquadri bianchi traslucidi, angoli arrotondati, lettere A–D a sinistra con separatore verticale sottile e testo scuro. Due colonne su desktop con spazio per il bicchiere, una colonna con scroll interno su smartphone. Hover e selezione chiari e sobri; rimossa anche la spunta colorata dalla risposta selezionata. Domanda nella vignetta bianca con triangolino verso Wing. L'allegato mostrava risposte scure con simboli: per le risposte prevale l'esplicita richiesta testuale di eliminarli. Scena, animazioni e scheda finale conservate.

## Scheda finale compatta

**Revisione successiva dal nuovo mockup:** questa sezione descrive il layout precedente. La scheda corrente ha titolo con palette richiesta, radar a sei colori, potere e affinità in due pannelli, e tre ritratti effettivi per categoria. I 18 file del catalogo Tenrai sono ora integrati localmente, verificati HTTP 200 e decodificati; lo stato dei permessi resta `unverified`. La scena superiore è conservata con confronto di pixel. Anteprima: http://localhost:5173/review/results.html. Dettagli e verifiche: [RESULT_REDESIGN_REPORT.md](RESULT_REDESIGN_REPORT.md).

Applicata la richiesta del 27 ottobre: mantenere la composizione di `reference/RESULT_TARGET_EXACT.png`, con minore sviluppo verticale e le stesse mani della divinazione.

- Hero più basso; stessa immagine, stesso canvas ed effetto finale conservati dalla prova al risultato.
- Titolo serif luminoso senza parole spezzate; descrizione e seconda affinità a sinistra, radar a destra su desktop/tablet.
- Radar con valori reali e colori delle sei categorie; una sola spiegazione espandibile dei punteggi relativi.
- Pannelli e spaziature ridotti. “Cosa significa” resta espandibile; la descrizione dell'effetto è già sul bicchiere e non viene duplicata nel pannello.
- Tre schede personaggio affiancate su desktop; fascia orizzontale scorrevole con tastiera/touch su mobile, per evitare tre schede impilate molto alte.
- Azioni Salva/Condividi affiancate e Riprova su seconda riga nei telefoni. Tutto il testo rimane DOM; radar SVG interattivo/accessibile.

Il riferimento resta una guida compositiva: le mani sono quelle della scena anime disponibile, come richiesto; i ritratti non sono stati copiati dal mockup. L'ordine degli assi radar e i dati del quiz restano invariati.

## Divinazione integrata

`WaterScene.js` anima acqua e foglia su canvas sopra `ANIME_HANDS_GLASS_REFERENCE.png`. Sei effetti: aumento dell'acqua, colore, riflessi per il sapore, cristalli, rotazione della foglia, annerimento e frammentazione. Durata 2,5 s; hold di 4,5 s preservato per mouse, touch e tastiera, con annullamento e alternativa accessibile. Movimento ridotto rispettato.

La foglia viene isolata con una maschera; la zona d'acqua sottostante viene interpolata da pixel vicini dello stesso riferimento. Non sono immagini generate AI. È una soluzione provvisoria: mancano livelli puliti, la ricostruzione può lasciare artefatti e le mani sono già presenti durante il quiz, senza ingresso indipendente.

## Catalogo Tenrai — importazione riuscita

Il 27 ottobre l'[endpoint richiesto](https://api.tenrai.org/v1/anime/11061/characters) ha risposto **HTTP 200 con 205 personaggi**. Tutti i **18 personaggi previsti** sono stati abbinati senza ambiguità. Jikan è stato sostituito nell'importatore; AniList non è stato necessario perché Tenrai è disponibile.

Il catalogo `src/data/characterImages.json` contiene nomi curati e nomi restituiti, ID MAL, URL fonte e immagine effettivi, provider, data, crediti e stato dei permessi. Le associazioni Nen in `src/data/characters.js` non sono importate dall'API e non sono cambiate.

| Nen | Personaggi e ID MAL verificati nella risposta |
| --- | --- |
| Enhancement | Gon Freecss 30; Isaac Netero 14489; Uvogin 5836 |
| Emission | Meruem 23277; Zeno Zoldyck 59; Razor 22518 |
| Transmutation | Killua Zoldyck 27; Hisoka Morow 31; Biscuit Krueger 13898 |
| Conjuration | Kurapika 28; Kite 20594; Shizuku Murasaki 5833 |
| Manipulation | Illumi Zoldyck 57; Morel Mackernasey 29806; Shalnark 5832 |
| Specialization | Chrollo Lucilfer 58; Neferpitou 12300; Pakunoda 5835 |

Shalnark è restituito come **Ryuseih, Shalnark**: aggiunto questo alias esatto, senza cambiare il nome visualizzato. Kurapika conserva la nota sugli occhi scarlatti; Shizuku resta nel catalogo al posto di Shoot del mockup.

### Immagini e permessi

I [termini Tenrai, §§3 e 6](https://tenrai.org/terms) consentono la memorizzazione delle risposte API, ma non concedono una licenza sulle immagini di terzi. La risposta non fornisce permessi specifici sui 18 ritratti. Tutti sono quindi `permissionStatus: unverified`; **nessun ritratto è stato scaricato in `public/assets/characters/`**, che contiene soltanto `.gitkeep`.

Gli URL sono metadati verificati, non immagini automaticamente abilitate nell'app. Nessun hotlink o chiamata all'API durante il quiz. La qualità/stile dei ritratti non è ancora stata verificata visivamente. Per un ritratto utilizzabile, registrare fonte e permesso in `ASSETS.md`, salvarlo localmente e compilare `portraitSrc` e `permissionStatus: authorized` nel catalogo curato.

Aggiornamento metadati: `npm.cmd run assets:characters`. Non richiede chiavi. Errori di rete, risposte vuote/incomplete o identità ambigue conservano il catalogo precedente. L'eventuale comando esplicito `--download-preview` mantiene i download soltanto nella cartella privata `.verification`; non attribuisce permessi e non pubblica immagini.

## Asset scenici effettivi e limiti

| Asset | Stato attuale |
| --- | --- |
| Wing | Quattro PNG preesistenti in `public/assets/scene-v3/`, integrati nell'anteprima locale; fonte e permessi non registrati. Il vecchio ritaglio resta disponibile ma non è montato. |
| Espressioni Wing | Neutro, sorriso, occhi chiusi e gesto, allineati nello stesso contenitore; dissolvenza e fallback al neutro. |
| Stanza | Fondale continuo `unified-goblet-scene.png`: muro con tappeto e crepe, tavolo, mani e calice nella stessa prospettiva. Generato con imagegen dai riferimenti del progetto. |
| Mani, calice e tavolo | Integrati nel fondale continuo; calice arrotondato con stelo e piede. Il vecchio riquadro anime ? conservato come riferimento, ma non montato nell?app. |
| Acqua/foglia | Maschere canvas e ricostruzione locale provvisoria; non asset trasparenti consegnabili. |
| Ritratti | 18 identità/URL recuperati; zero file autorizzati disponibili. |
| Result mockup | Solo guida visiva; nessun testo o ritratto estratto. |

Non si dichiara raggiunta la fedeltà anime finale. La provenienza dei PNG di Wing deve essere completata prima di qualsiasi uso pubblico. I vecchi SVG V1 restano nei sorgenti storici ma non sono montati nel flusso attuale.

## Verifica e anteprima

Screenshot aggiornati in `.verification/`: `desktop-result.png`, `tablet-result.png`, `mobile-result.png`, `small-mobile-result.png`, `mobile-webkit-result.png` e `effect-<tipo>.png`. Intro/quiz/reazione in `.verification/v2/`. Tutti esclusi da Git. Esiti dei controlli in `VALIDATION.md`.

- `npm.cmd run dev`: anteprima locale, normalmente http://localhost:5173/.
- `npm.cmd run assets:scene`: ricrea i montaggi privati con Vite già avviato.
- `npm.cmd run build:review`: build di revisione in `.verification/v2/dist`, con prefisso `/nen-divination/` e asset locali.
- `node scripts/verify-build.mjs --review`: verifica flusso e download PNG della build di revisione.
- `npm.cmd run build`: include la scena completa, escludendo riferimenti privati e sorgenti inutilizzati. Permessi da documentare in `ASSETS.md`.

Dataset, 96 vettori, calibrazione, bonus e state machine sono invariati. Resta da completare il set di asset autorizzati e controllare la fedeltà visiva finale con l'utente.
