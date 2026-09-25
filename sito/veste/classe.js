/* ============================================================
   La pagina di una classe: l'elenco dei giorni di lezione
   ============================================================
   Legge `lezioni.md` della cartella in cui si trova (è la pagina stessa a dire
   quale) e lo trasforma in un giorno per ogni titolo `##`. Dentro un giorno, i
   titoli `###` diventano le sezioni — materiale, slide, compiti — e una
   sezione che non c'è, o che è vuota, semplicemente non compare.

   Con `?giorno=2026-09-23` nell'indirizzo la stessa pagina mostra quel giorno
   da solo: è l'indirizzo corto `/<classe>/2026-09-23` dopo il passaggio da
   404.html.

   Il file markdown resta la fonte: qui non si inventa niente, si dispone.
   ============================================================ */

/* Come si chiama una sezione e che faccia ha, a partire dal suo titolo nel
   markdown. Le scritture accettate sono più d'una di proposito: scrivendo di
   fretta la sera prima, "Compiti" e "A casa" devono valere uguale. */
const SEZIONI = [
    { nome: 'materiale', titolo: 'Materiale',
      scritture: ['link', 'link utili', 'materiale', 'risorse', 'materiali'] },
    { nome: 'slide', titolo: 'Slide',
      scritture: ['slide', 'slides', 'presentazione', 'presentazioni'] },
    { nome: 'casa', titolo: 'A casa',
      scritture: ['a casa', 'casa', 'compiti', 'compiti a casa', 'da fare a casa', 'per casa'] },
];

function tipoDiSezione(titolo) {
    const pulito = normalizza(titolo);
    const nota = SEZIONI.find((s) => s.scritture.includes(pulito));
    return nota || { nome: 'altro', titolo: titolo.trim() };
}

/* Spezza i token del file in giorni. Tutto quello che sta prima del primo `##`
   è l'intestazione della classe (titolo `#` ed eventuale riga di presentazione). */
/* Il giorno chiesto nell'indirizzo. La forma comoda è quella corta —
   `/4BLS/2026-09-23` — che 404.html traduce in `?giorno=2026-09-23`: qui si
   legge solo quest'ultima, così la pagina funziona anche servita in locale. */
function giornoChiesto() {
    const chiesto = (new URLSearchParams(location.search).get('giorno') || '').trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(chiesto) ? chiesto : null;
}

function dividiInGiorni(tokens) {
    const intestazione = [];
    const giorni = [];
    let corrente = null;

    for (const token of tokens) {
        if (token.type === 'heading' && token.depth === 2) {
            const data = leggiData(token.text);
            corrente = { data, testoTitolo: token.text, sezioni: [], note: [] };
            giorni.push(corrente);
            continue;
        }
        if (!corrente) {
            intestazione.push(token);
            continue;
        }
        if (token.type === 'heading' && token.depth === 3) {
            corrente.sezioni.push({ tipo: tipoDiSezione(token.text), corpo: [] });
            continue;
        }
        const ultima = corrente.sezioni[corrente.sezioni.length - 1];
        (ultima ? ultima.corpo : corrente.note).push(token);
    }
    return { intestazione, giorni };
}

function haSostanza(tokens) {
    return tokens.some((t) => (t.raw || '').trim().length > 0);
}

function disegnaGiorno(giorno, tokens, conLink = true) {
    const articolo = document.createElement('article');
    articolo.className = 'giorno';

    let intestazione = giorno.testoTitolo;
    if (giorno.data) {
        articolo.id = giorno.data.chiave;
        intestazione = dataPerEsteso(giorno.data.data);
        if (giorno.data.titolo) intestazione += ` — ${giorno.data.titolo}`;
        if (eOggi(giorno.data.data)) articolo.classList.add('oggi');
    }

    /* La data è anche l'indirizzo del giorno: un tocco e si ha quella lezione
       da sola, da mandare a chi era assente o da proiettare senza le altre. */
    const etichetta = conLink && giorno.data
        ? `<a class="permalink" href="?giorno=${giorno.data.chiave}">${intestazione}</a>`
        : intestazione;
    const titolo = document.createElement('h2');
    titolo.innerHTML = `<span>${etichetta}</span>`;
    if (articolo.classList.contains('oggi')) {
        titolo.innerHTML += '<span class="etichetta-oggi">oggi</span>';
    }
    articolo.appendChild(titolo);

    if (haSostanza(giorno.note)) {
        const note = document.createElement('div');
        note.className = 'note';
        note.innerHTML = inHtml(giorno.note, tokens);
        articolo.appendChild(note);
    }

    for (const sezione of giorno.sezioni) {
        if (!haSostanza(sezione.corpo)) continue;   // sezione vuota: non si disegna
        const blocco = document.createElement('section');
        blocco.className = `sezione sezione--${sezione.tipo.nome}`;
        blocco.innerHTML = `<h3>${sezione.tipo.titolo}</h3>` + inHtml(sezione.corpo, tokens);
        articolo.appendChild(blocco);
    }
    return articolo;
}

async function mostraClasse() {
    const contenuto = document.querySelector('.contenuto');
    const nomeCartella = decodeURIComponent(
        location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '').split('/').pop()
    );
    let tokens;
    try {
        tokens = marked.lexer(await scaricaMarkdown('lezioni.md'));
    } catch (errore) {
        contenuto.innerHTML = `<div class="vuoto"><p>Non trovo il file delle lezioni di questa classe.</p>
            <p>Dovrebbe stare in <code>sito/${nomeCartella}/lezioni.md</code>.</p></div>`;
        return;
    }

    const { intestazione, giorni } = dividiInGiorni(tokens);
    const primoTitolo = intestazione.find((t) => t.type === 'heading' && t.depth === 1);
    const nome = primoTitolo ? primoTitolo.text : nomeCartella;
    const presentazione = intestazione.find((t) => t.type === 'paragraph');

    const elenco = document.createElement('div');
    elenco.className = 'giorni';
    const chiesto = giornoChiesto();

    if (chiesto) {
        /* Un giorno solo. Dentro la sua scheda la data non è più un link: si è
           già lì, e il modo di tornare all'elenco è scritto sotto il titolo. */
        const scelto = giorni.find((g) => g.data && g.data.chiave === chiesto);
        document.title = scelto
            ? `${dataPerEsteso(scelto.data.data)} — ${nome}`
            : `${nome} — Lezioni`;
        const ritorno = '<a href=".">tutti i giorni della classe</a>';
        contenuto.innerHTML = `<h1 class="titolo">${nome}</h1>` +
            `<p class="sottotitolo">${scelto ? 'Una lezione sola — ' : ''}${ritorno}</p>`;
        if (scelto) {
            elenco.appendChild(disegnaGiorno(scelto, tokens, false));
        } else {
            const quando = leggiData(chiesto);
            elenco.innerHTML = `<div class="vuoto"><p>In questa classe non c'è nessuna lezione
                di ${quando ? dataPerEsteso(quando.data) : chiesto}.</p></div>`;
        }
        contenuto.appendChild(elenco);
    } else {
        document.title = `${nome} — Lezioni`;
        contenuto.innerHTML = `<h1 class="titolo">${nome}</h1>` +
            (presentazione ? `<p class="sottotitolo">${presentazione.text}</p>` : '');

        /* Dal più recente: in classe si apre la pagina per vedere il giorno di oggi,
           non per scorrere fino in fondo l'anno scolastico. */
        const ordinati = giorni.slice().sort((a, b) => {
            if (!a.data || !b.data) return 0;
            return b.data.data - a.data.data;
        });
        for (const giorno of ordinati) elenco.appendChild(disegnaGiorno(giorno, tokens));
        contenuto.appendChild(elenco);

        if (!giorni.length) {
            elenco.innerHTML = '<div class="vuoto"><p>Ancora nessuna lezione segnata.</p></div>';
        }
    }

    disegnaTestata('..', nome);
    const configurazione = await leggiConfigurazione('../classi.json');
    disegnaPiede(configurazione.docente || '');
    componiFormule();
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}

preparaFormule();
document.addEventListener('DOMContentLoaded', mostraClasse);
