/* ============================================================
   TGLD - Moteur générique de rendu (compétence -> séquence -> activité)
   Lit les données depuis /data/<competence>.json et génère le HTML.
   ============================================================ */
const MOTEUR = {

    _cache: {},

    parametresURL() {
        const p = new URLSearchParams(window.location.search);
        return {
            competence: p.get('competence'),
            sequence: p.get('sequence'),
            activite: p.get('activite')
        };
    },

    async chargerCompetence(competenceId) {
        if (this._cache[competenceId]) return this._cache[competenceId];
        const reponse = await fetch(`data/${competenceId}.json`);
        if (!reponse.ok) throw new Error('Compétence introuvable : ' + competenceId);
        const data = await reponse.json();
        this._cache[competenceId] = data;
        return data;
    },

    trouverSequence(data, sequenceId) {
        return data.sequences.find(s => s.id === sequenceId);
    },

    trouverActivite(sequence, activiteId) {
        return sequence.activites.find(a => a.id === activiteId);
    },

    /* ---------- Rendu de la page d'accueil de séquence ---------- */
    async rendreAccueilSequence() {
        const { competence, sequence } = this.parametresURL();
        const data = await this.chargerCompetence(competence);
        const seq = this.trouverSequence(data, sequence);
        if (!seq) { document.body.innerHTML = '<p style="padding:20px;">Séquence introuvable.</p>'; return; }

        document.title = `Séquence : ${seq.titre}`;
        document.getElementById('titre-sequence').textContent = seq.titre;
        document.getElementById('presentation-sequence').textContent = seq.presentation;

        const skillsEl = document.getElementById('liste-competences');
        skillsEl.innerHTML = seq.competencesAcquises.map(s => `<span>✓ ${s}</span>`).join('');

        const listeEl = document.getElementById('liste-activites');
        const couleurs = ['c-blue', 'c-red', 'c-purple', 'c-yellow', 'c-green', 'c-magenta'];
        listeEl.innerHTML = seq.activites.map((a, i) => {
            const estQuiz = a.type === 'quiz';
            const compteur = estQuiz
                ? `📄 ${a.questions.length} questions`
                : `📄 ${a.cartes.length} page${a.cartes.length > 1 ? 's' : ''}`;
            return `
            <a href="activite.html?competence=${competence}&sequence=${sequence}&activite=${a.id}"
               class="activity-item ${a.icone || couleurs[i % couleurs.length]}"
               ${estQuiz ? 'style="border-left-color: #f39c12;"' : ''}>
                <div class="act-info">
                    <h4>${i + 1}. ${a.titre}</h4>
                    <p><span>🕒 ${a.duree}</span> <span>${compteur}</span></p>
                </div>
                <div class="act-status ${estQuiz ? '' : 'pending'}" data-activite="${a.id}" ${estQuiz ? 'style="background:#f39c12;"' : ''}>${estQuiz ? '★' : '○'}</div>
            </a>`;
        }).join('');

        const cle = TGLD.enregistrerSequence(competence, sequence, seq.activites.map(a => a.id));

        document.querySelectorAll('.act-status[data-activite]').forEach(el => {
            const activite = el.getAttribute('data-activite');
            if (TGLD.estTermine(cle, activite)) {
                el.classList.remove('pending');
                if (!el.classList.contains('c-purple') || el.textContent !== '★') {
                    if (el.textContent !== '★') el.textContent = '✓';
                }
            }
        });

        const pourcentage = TGLD.pourcentage(cle);
        const circonference = 100.53;
        const ring = document.getElementById('ring-circle');
        if (ring) ring.style.strokeDashoffset = circonference - (circonference * pourcentage / 100);
        const ringTxt = document.getElementById('ring-percent');
        if (ringTxt) ringTxt.textContent = pourcentage + '%';

        document.getElementById('lien-retour').href = `index.html`;
    },

    /* ---------- Rendu d'une activité (lecture ou quiz) ---------- */
    async rendreActivite() {
        const { competence, sequence, activite } = this.parametresURL();
        const data = await this.chargerCompetence(competence);
        const seq = this.trouverSequence(data, sequence);
        const act = this.trouverActivite(seq, activite);
        if (!act) { document.body.innerHTML = '<p style="padding:20px;">Activité introuvable.</p>'; return; }

        document.title = `${act.titre}`;
        const cle = TGLD.enregistrerSequence(competence, sequence, seq.activites.map(a => a.id));

        // Navigation précédent/suivant calculée depuis la position dans le tableau
        const index = seq.activites.findIndex(a => a.id === activite);
        const precedente = index > 0 ? seq.activites[index - 1] : null;
        const suivante = index < seq.activites.length - 1 ? seq.activites[index + 1] : null;
        const lienPrec = precedente
            ? `activite.html?competence=${competence}&sequence=${sequence}&activite=${precedente.id}`
            : `sequence.html?competence=${competence}&sequence=${sequence}`;
        const texteLienPrec = precedente ? '← Précédent' : '← Accueil';
        const lienSuiv = suivante
            ? `activite.html?competence=${competence}&sequence=${sequence}&activite=${suivante.id}`
            : `sequence.html?competence=${competence}&sequence=${sequence}`;
        const texteLienSuiv = suivante ? 'Suivant →' : `Fin de la séquence →`;

        const conteneur = document.getElementById('conteneur-activite');

        if (act.type === 'quiz') {
            conteneur.innerHTML = this._html_quiz(act, index + 1);
        } else {
            conteneur.innerHTML = this._html_lecture(act, index + 1);
        }

        document.getElementById('nav-links').innerHTML = `
            <a href="${lienPrec}" class="btn-nav btn-prev">${texteLienPrec}</a>
            <a href="${lienSuiv}" class="btn-nav btn-next" id="lien-suivant">${texteLienSuiv}</a>
        `;

        TGLD.appliquerBarreActivite(cle);

        if (act.type === 'quiz') {
            this._activerQuiz(act, cle, activite);
            // Pour un quiz, le lien "suivant" ne valide pas automatiquement l'activité :
            // la validation se fait uniquement en cas de réussite (voir _activerQuiz)
        } else {
            TGLD.lierValidationActivite(cle, activite, '#lien-suivant');
        }
    },

    _html_bloc(b) {
        switch (b.type) {
            case 'h2': return `<h2>${b.texte}</h2>`;
            case 'p': return `<p>${b.texte}</p>`;
            case 'liste': return `<ul>${b.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
            case 'code': return `<pre><code>${b.texte}</code></pre>`;
            case 'html': return b.texte;
            default: return '';
        }
    },

    _html_lecture(act, numero) {
        const cartesHtml = act.cartes.map(carte => `
            <div class="card">
                <div class="header"><span class="close-icon">✕</span></div>
                ${carte.titre ? `<div class="card-title">${carte.titre}</div>` : ''}
                <div class="content">${carte.blocs.map(b => this._html_bloc(b)).join('')}</div>
            </div>
        `).join('');
        return `
            <h1 class="section-header">Activité ${numero} : ${act.titre}</h1>
            <div class="progress-track-page"><div class="progress-fill" id="progress-fill-global" style="width:0%;"></div></div>
            <div class="activity-container">${cartesHtml}</div>
        `;
    },

    _html_quiz(act, numero) {
        const questionsHtml = act.questions.map((q, i) => `
            <div class="card" data-q="q${i + 1}">
                <div class="content">
                    <div class="test-question">${q.question}</div>
                    <div class="answer-grid">
                        ${q.options.map(o => `<div class="answer-option${o.valeur === q.correct ? ' correct' : ''}" data-value="${o.valeur}">${o.texte}</div>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        return `
            <h1 class="section-header">Activité ${numero} : ${act.titre}</h1>
            <div class="progress-track-page"><div class="progress-fill" id="progress-fill-global" style="width:0%;"></div></div>
            <div class="activity-container">
                <div class="card">
                    <div class="content">${act.introHtml}</div>
                </div>
                ${questionsHtml}
                <div class="card">
                    <div class="content" id="result-content">
                        <h2>Vérification des résultats</h2>
                        <p style="margin-bottom: 20px;">Assurez-vous d'avoir sélectionné une réponse pour chaque question, puis cliquez sur le bouton ci-dessous.</p>
                        <button class="btn-validate" onclick="MOTEUR._verifierQuiz()">Vérifier les résultats</button>
                        <div id="success-msg" class="result-box">${act.messageSucces}</div>
                        <div id="error-msg" class="result-box">
                            ${act.messageErreur}
                            <button class="btn-retry" onclick="MOTEUR._reinitialiserQuiz()">🔄 Recommencer le test</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _activerQuiz(act, cle, activiteId) {
        this._quizCourant = { act, cle, activiteId };
        document.querySelectorAll('.answer-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const grid = opt.parentElement;
                grid.querySelectorAll('.answer-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
    },

    _verifierQuiz() {
        const { act, cle } = this._quizCourant;
        const cartes = document.querySelectorAll('.card[data-q]');
        let toutesRepondues = true;
        let toutesCorrectes = true;

        cartes.forEach((carte, i) => {
            const selection = carte.querySelector('.answer-option.selected');
            if (!selection) { toutesRepondues = false; return; }
            if (selection.getAttribute('data-value') !== act.questions[i].correct) toutesCorrectes = false;
        });

        if (!toutesRepondues) {
            alert('Merci de répondre à toutes les questions avant de valider.');
            return;
        }

        document.querySelector('.btn-validate').style.display = 'none';
        if (toutesCorrectes) {
            document.getElementById('success-msg').classList.add('success');
            document.getElementById('success-msg').style.display = 'block';
            TGLD.marquerTermine(cle, this._quizCourant.activiteId);
        } else {
            document.getElementById('error-msg').classList.add('error');
            document.getElementById('error-msg').style.display = 'block';
        }
    },

    _reinitialiserQuiz() {
        document.querySelectorAll('.answer-option.selected').forEach(o => o.classList.remove('selected'));
        document.getElementById('error-msg').style.display = 'none';
        document.getElementById('error-msg').classList.remove('error');
        document.querySelector('.btn-validate').style.display = 'block';
        window.scrollTo({ top: document.querySelector('.activity-container').offsetTop, behavior: 'smooth' });
    }
};
