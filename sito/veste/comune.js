/* ============================================================
   Gli attrezzi comuni a tutte le pagine del sito
   ============================================================
   Il sito non ha un passaggio di compilazione: i file markdown che stanno nel
   repo sono gli stessi che il browser scarica e trasforma in pagina. Qui ci
   sono i pezzi che servono dappertutto — testata e piede, il markdown, le
   formule, le date in italiano — così le pagine vere (home, classe, slide)
   contengono solo la loro logica.
   ============================================================ */

/* Le lavagne di scuola hanno browser vecchi di anni. La libreria del markdown
   usa due funzioni arrivate in Chrome solo nel 2021 (`.at()` e `Object.hasOwn`):
   senza, ogni lettura si rompe e la pagina dice che il file non c'è. Qui le si
   aggiunge a mano, solo dove mancano. Girano prima di qualunque lettura, perché
   la libreria le chiama soltanto quando legge un file, non quando si carica. */
function aggiungiSeManca(oggetto, nome, funzione) {
    if (!oggetto[nome]) {
        Object.defineProperty(oggetto, nome, { value: funzione, writable: true, configurable: true });
    }
}
function elementoInPosizione(n) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    return n < 0 || n >= this.length ? undefined : this[n];
}
aggiungiSeManca(Array.prototype, 'at', elementoInPosizione);
aggiungiSeManca(String.prototype, 'at', elementoInPosizione);
aggiungiSeManca(Object, 'hasOwn', (oggetto, chiave) => Object.prototype.hasOwnProperty.call(oggetto, chiave));

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio',
              'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

/* Le date accettate in un titolo di giorno: 2026-09-21 oppure 21/09/2026.
   Quello che segue la data (dopo un trattino o due punti) è il titolo del giorno. */
const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})\s*(?:[—–\-:]\s*(.*))?$/;
const DATA_ITA = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:[—–\-:]\s*(.*))?$/;

function leggiData(testo) {
    const pulito = testo.trim();
    let anno, mese, giorno, titolo;
    let pezzi = pulito.match(DATA_ISO);
    if (pezzi) {
        [, anno, mese, giorno, titolo] = pezzi;
    } else if ((pezzi = pulito.match(DATA_ITA))) {
        [, giorno, mese, anno, titolo] = pezzi;
    } else {
        return null;
    }
    const data = new Date(Number(anno), Number(mese) - 1, Number(giorno));
    if (isNaN(data)) return null;
    return { data, titolo: (titolo || '').trim(), chiave: chiaveData(data) };
}

function chiaveData(data) {
    const due = (n) => String(n).padStart(2, '0');
    return `${data.getFullYear()}-${due(data.getMonth() + 1)}-${due(data.getDate())}`;
}

function dataPerEsteso(data) {
    return `${GIORNI[data.getDay()]} ${data.getDate()} ${MESI[data.getMonth()]} ${data.getFullYear()}`;
}

function eOggi(data) {
    return chiaveData(data) === chiaveData(new Date());
}

/* Toglie accenti e maiuscole: serve a riconoscere i titoli delle sezioni
   ("A casa", "a Casa", "À casa") senza pretendere che siano scritti uguali. */
function normalizza(testo) {
    return testo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/* Un gruppo di token di marked va ri-convertito in HTML da solo: `links`
   contiene le definizioni dei link in stile [nome]: url, che vivono nel
   documento intero e andrebbero perse affettando l'elenco. */
function inHtml(tokens, tuttiITokens) {
    if (!tokens.length) return '';
    const gruppo = tokens.slice();
    gruppo.links = (tuttiITokens && tuttiITokens.links) || {};
    return marked.parser(gruppo);
}

async function scaricaMarkdown(percorso) {
    const risposta = await fetch(percorso, { cache: 'no-cache' });
    if (!risposta.ok) throw new Error(`${percorso}: ${risposta.status}`);
    return await risposta.text();
}

/* MathJax arriva dalla CDN come su math-rocks, con gli stessi delimitatori:
   $...$ in riga, $$...$$ a blocco. Se la rete manca, la pagina resta leggibile
   con le formule in chiaro invece di rompersi. */
function preparaFormule() {
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
        },
        options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'] },
    };
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    document.head.appendChild(script);
}

function componiFormule() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
    }
}

/* La testata è uguale ovunque: il titolo a sinistra riporta alla home del sito,
   l'indicazione a destra dice dove si è (la classe, il giorno delle slide). */
function disegnaTestata(radice, dove, linkDove) {
    const testata = document.createElement('header');
    testata.className = 'testata';
    const destra = dove
        ? `<a class="dove" href="${linkDove || '.'}">${dove}</a>`
        : '';
    testata.innerHTML = `<nav>
        <a class="marchio" href="${radice}"><span aria-hidden="true">✓</span>Lezioni</a>
        ${destra}
    </nav>`;
    document.body.prepend(testata);
}

function disegnaPiede(testo) {
    const piede = document.createElement('footer');
    piede.className = 'piede';
    piede.textContent = `${testo} © ${new Date().getFullYear()}`;
    document.body.appendChild(piede);
}

async function leggiConfigurazione(percorso) {
    try {
        const risposta = await fetch(percorso, { cache: 'no-cache' });
        if (risposta.ok) return await risposta.json();
    } catch (errore) { /* la home sa cavarsela anche senza */ }
    return { titolo: 'Lezioni', docente: '', classi: [] };
}
