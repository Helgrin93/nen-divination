# Estensione ambientale — origine degli asset

Data: 31 ottobre 2026. Intervento locale sul branch `art-polish-v5`.

I due PNG di produzione sono composizioni delle sole ali ambientali. Gli asset di Wing, mani, tappeto, vetro, acqua e animazioni rimangono quelli del progetto.

## Sorgente artistica

È stato usato realmente lo strumento integrato `image_gen`, con i due screenshot dell'ultima richiesta come riferimenti: primo screenshot per il centro da conservare, secondo per ambiente, prospettiva, lavagna e armadio. La proposta che faceva leggere il piano come pavimento è stata scartata.

La sorgente selezionata, senza personaggi, mani, bicchiere o interfaccia, è stata generata nel file:

`C:/Users/Helg/.codex/generated_images/01a18fcf-541a-7a91-9c73-b8325db8700a/exec-d68b0346-c3a1-4649-9287-a4709bffcbd0.png`

Una copia di lavorazione è in `.verification/room-extension-source.png`, esclusa da Git e dalla build. Il centro generato di questa sorgente è stato scartato integralmente.

SHA-256 della sorgente: `7ba655c0bfda4e1bc651343bb2197ab53eb9ffa84f18268386f915bcc80878e0`.

## Composizione locale

`scripts/prepare-room-extensions.mjs` ritaglia la lavagna e il mobile dai lati della sorgente, compone intonaco, battiscopa e pavimento, registra il colore delle giunzioni e ritaglia le estensioni del tavolo secondo due diagonali. Il legno del tavolo viene da una regione vuota della sorgente generata, priva di mani e bicchiere. Nessuna duplicazione degli sprite entra nelle ali.

La registrazione cromatica interessa esclusivamente i nuovi asset laterali. Non viene applicato alcun filtro al centro né riscritto un file originale.

Output locali, entrambi **512 × 1024 PNG**:

- `public/assets/room-v5/room-left.png`
- `public/assets/room-v5/room-right.png`

| Output | Byte | SHA-256 |
| --- | ---: | --- |
| Sinistra | 678350 | `6903a3d5b2442da437ec387c9d02e6257254d9b836e4039d4c4f3fc8bcde1676` |
| Destra | 622604 | `2629a5de744d6774d848e7889a0a621406bb983c8bc1b85b9ff4597c3a285745` |

Il renderer conserva la camera originale di **1536 × 1024**. Ciascuna ala è larga un terzo della camera e si trova interamente all'esterno del suo rettangolo. Il bordo posteriore del tavolo resta a `y=653`; i nuovi lati vanno dal vertice interno `(0/1536, 653)` verso l'esterno e il basso. La loro scala segue quella della camera, senza coordinate legate a una singola viewport.

Per rigenerare gli output: mantenere la sorgente privata nel percorso indicato, avviare il server Vite sulla porta 5173 ed eseguire `node scripts/prepare-room-extensions.mjs`. La generazione AI non è ripetibile al pixel; il compositing locale usa invece la sorgente selezionata e parametri espliciti.

La build include soltanto i due output finali. Non include screenshot, istruzioni, sorgenti AI o immagini del pacchetto V5.
