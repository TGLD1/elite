/* ============================================================
   TGLD - Suivi de progression (stockage local, sans backend)
   ============================================================ */
const TGLD = {

    STORAGE_KEY: 'tgld_progress',

    // Rempli dynamiquement par le moteur au chargement des données JSON d'une compétence.
    // Clé = "competenceId:sequenceId" (ex: "webdev:sequence1")
    SEQUENCES: {},

    // Enregistre une séquence (appelé par le moteur après chargement du JSON)
    enregistrerSequence(competenceId, sequenceId, listeIdsActivites) {
        const cle = competenceId + ':' + sequenceId;
        this.SEQUENCES[cle] = { activites: listeIdsActivites };
        return cle;
    },

    _lire() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    },

    _ecrire(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            /* localStorage indisponible : on ignore silencieusement */
        }
    },

    // Marque une activité comme terminée
    marquerTermine(sequence, activite) {
        const data = this._lire();
        if (!data[sequence]) data[sequence] = {};
        data[sequence][activite] = true;
        this._ecrire(data);
    },

    // Une activité est-elle terminée ?
    estTermine(sequence, activite) {
        const data = this._lire();
        return !!(data[sequence] && data[sequence][activite]);
    },

    // Nombre d'activités terminées dans une séquence
    nbTermine(sequence) {
        const data = this._lire();
        if (!data[sequence] || !this.SEQUENCES[sequence]) return 0;
        return this.SEQUENCES[sequence].activites.filter(a => data[sequence][a]).length;
    },

    // Pourcentage de progression d'une séquence (0-100)
    pourcentage(sequence) {
        if (!this.SEQUENCES[sequence]) return 0;
        const total = this.SEQUENCES[sequence].activites.length;
        if (total === 0) return 0;
        return Math.round((this.nbTermine(sequence) / total) * 100);
    },

    // La séquence entière est-elle terminée ?
    sequenceTerminee(sequence) {
        if (!this.SEQUENCES[sequence]) return false;
        return this.nbTermine(sequence) === this.SEQUENCES[sequence].activites.length;
    },

    // Applique la progression sur la barre présente en haut de chaque page d'activité
    appliquerBarreActivite(sequence) {
        const barre = document.getElementById('progress-fill-global');
        if (barre) barre.style.width = this.pourcentage(sequence) + '%';
    },

    // Marque l'activité courante comme terminée, puis suit le lien normalement
    lierValidationActivite(sequence, activite, selecteurLien) {
        const lien = document.querySelector(selecteurLien);
        if (!lien) return;
        lien.addEventListener('click', () => {
            this.marquerTermine(sequence, activite);
        });
    },

    /* ------------------------------------------------------
       Profil local (prénom uniquement, stocké sur l'appareil)
       ------------------------------------------------------ */
    PROFIL_KEY: 'tgld_profil',

    getPrenom() {
        try {
            return localStorage.getItem(this.PROFIL_KEY) || null;
        } catch (e) {
            return null;
        }
    },

    setPrenom(prenom) {
        try {
            localStorage.setItem(this.PROFIL_KEY, prenom.trim());
        } catch (e) {
            /* localStorage indisponible : on ignore silencieusement */
        }
    }
};
