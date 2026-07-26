/* ============================================================
   TGLD - Suivi de progression (stockage local, sans backend)
   ============================================================ */
const TGLD = {

    STORAGE_KEY: 'tgld_progress',

    SEQUENCES: {
        sequence1: {
            titre: 'Introduction au HTML',
            activites: ['activite1', 'activite2', 'activite3', 'activite4', 'activite5', 'activite6', 'activite7', 'activite8', 'activite9']
        }
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
        if (!data[sequence]) return 0;
        return this.SEQUENCES[sequence].activites.filter(a => data[sequence][a]).length;
    },

    // Pourcentage de progression d'une séquence (0-100)
    pourcentage(sequence) {
        const total = this.SEQUENCES[sequence].activites.length;
        return Math.round((this.nbTermine(sequence) / total) * 100);
    },

    // La séquence entière est-elle terminée ?
    sequenceTerminee(sequence) {
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
