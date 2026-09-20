/* ============================================================
   Il visualizzatore delle slide
   ============================================================
   Un mazzo di slide è un file markdown in `sito/slides/`, con le slide
   separate da una riga di soli trattini. Il nome del file dice a che giorno e
   a che classe appartiene (2026-09-21-3A.md): da lì si ricava anche il link
   per tornare a quel giorno nella pagina della classe.

   Si va avanti con la freccia destra, la barra spaziatrice o toccando la metà
   destra dello schermo; indietro con la freccia sinistra o la metà sinistra.
   Il numero della slide finisce nell'indirizzo, così ricaricando si riprende
   da dove si era — utile se il proiettore fa i capricci.
   ============================================================ */

const SEPARATORE = /^\s*---+\s*$/;
const NOME_MAZZO = /^[\w.\-]+$/;   // niente barre: si apre solo ciò che sta in questa cartella

let slide = [];
let indice = 0;

function dividiInSlide(testo) {
    const pezzi = [[]];
    for (const riga of testo.split('\n')) {
        if (SEPARATORE.test(riga)) pezzi.push([]);
        else pezzi[pezzi.length - 1].push(riga);
    }
    return pezzi.map((righe) => righe.join('\n').trim()).filter((s) => s.length);
}

function mostra(numero) {
    indice = Math.max(0, Math.min(numero, slide.length - 1));
    const foglio = document.querySelector('.slide-corrente');
    foglio.innerHTML = marked.parse(slide[indice]);
    foglio.scrollTop = 0;
    document.querySelector('.contatore').textContent = `${indice + 1} / ${slide.length}`;
    document.querySelector('.indietro').disabled = indice === 0;
    document.querySelector('.avanti').disabled = indice === slide.length - 1;
    history.replaceState(null, '', `#${indice + 1}`);
    componiFormule();
}

function scorri(passo) { mostra(indice + passo); }

function collegaComandi() {
    document.querySelector('.indietro').addEventListener('click', () => scorri(-1));
    document.querySelector('.avanti').addEventListener('click', () => scorri(1));

    document.addEventListener('keydown', (evento) => {
        const tasti = {
            ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1,
            ArrowLeft: -1, ArrowUp: -1, PageUp: -1,
        };
        if (evento.key in tasti) { evento.preventDefault(); scorri(tasti[evento.key]); }
        else if (evento.key === 'Home') mostra(0);
        else if (evento.key === 'End') mostra(slide.length - 1);
        else if (evento.key.toLowerCase() === 'f') {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen().catch(() => {});
        }
    });

    /* Tocco: metà destra avanti, metà sinistra indietro. I link dentro la slide
       restano cliccabili, altrimenti aprire un esercizio diventerebbe un terno. */
    document.querySelector('.slide-corrente').addEventListener('click', (evento) => {
        if (evento.target.closest('a')) return;
        scorri(evento.clientX > window.innerWidth / 2 ? 1 : -1);
    });
}

async function mostraMazzo() {
    const nome = new URLSearchParams(location.search).get('deck') || '';
    const foglio = document.querySelector('.slide-corrente');

    if (!NOME_MAZZO.test(nome)) {
        foglio.innerHTML = '<div class="vuoto"><p>Manca il nome del mazzo di slide nell\'indirizzo.</p></div>';
        return;
    }
    let testo;
    try {
        testo = await scaricaMarkdown(`${nome}.md`);
    } catch (errore) {
        foglio.innerHTML = `<div class="vuoto"><p>Non trovo le slide <code>${nome}</code>.</p></div>`;
        return;
    }

    slide = dividiInSlide(testo);
    if (!slide.length) slide = ['*(mazzo vuoto)*'];

    /* Il nome del file (2026-09-21-3A) dice giorno e classe: il titolo in basso
       riporta proprio a quel giorno, senza passare dalla home. Niente testata in
       alto: su un proiettore lo spazio verticale è tutto per la slide. */
    const pezzi = nome.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const titolo = (slide[0].match(/^#+\s*(.+)$/m) || [, nome])[1];
    document.title = `${titolo} — Slide`;
    const etichetta = document.querySelector('.titolo-mazzo');
    if (pezzi) {
        etichetta.innerHTML = `<a href="../${pezzi[2]}/#${pezzi[1]}">${titolo} · ${pezzi[2]}</a>`;
    } else {
        etichetta.textContent = titolo;
    }

    collegaComandi();
    mostra(Number(location.hash.slice(1)) - 1 || 0);
}

preparaFormule();
document.addEventListener('DOMContentLoaded', mostraMazzo);
