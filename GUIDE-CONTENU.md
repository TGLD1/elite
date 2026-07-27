# Guide : rédiger le contenu de la Séquence 2 (et suivantes)

Tout le contenu vit dans **`data/webdev.json`**. Plus besoin de créer des fichiers HTML :
tu écris juste les activités dans ce fichier, le moteur (`moteur.js`) génère les pages automatiquement.

Ouvre `data/webdev.json`, trouve l'objet `"sequence2"` (déjà présent, vide) et remplis-le.

## 1. Informations générales de la séquence

```json
{
  "id": "sequence2",
  "titre": "Bases du CSS",
  "presentation": "Un paragraphe qui explique ce que couvre la séquence.",
  "competencesAcquises": ["Sélecteurs CSS", "Couleurs et polices", "Mise en page Flexbox"],
  "niveauAcces": "gratuit",
  "activites": [ ... ]
}
```

`niveauAcces` : `"gratuit"`, `"apercu"` ou `"payant"` (le blocage réel du contenu payant sera géré plus tard, avec le backend — pour l'instant c'est juste indicatif).

## 2. Une activité de lecture

Chaque activité est une "carte à cartes" : une ou plusieurs cartes, chacune avec des blocs de contenu.

```json
{
  "id": "activite1",
  "titre": "Qu'est-ce que le CSS ?",
  "duree": "6 min",
  "icone": "c-blue",
  "type": "lecture",
  "niveauAcces": "gratuit",
  "cartes": [
    {
      "titre": "Introduction au CSS",
      "blocs": [
        { "type": "h2", "texte": "Pourquoi le CSS ?" },
        { "type": "p", "texte": "Le CSS permet de mettre en forme vos pages HTML : couleurs, tailles, espacements..." },
        { "type": "p", "texte": "On peut mettre du <strong>gras</strong> ou des <a href=\"https://exemple.com\" target=\"_blank\">liens</a> directement dans le texte." }
      ]
    },
    {
      "blocs": [
        { "type": "liste", "items": ["Premier point", "Deuxième point", "Troisième point"] },
        { "type": "code", "texte": "p {\n  color: blue;\n}" }
      ]
    }
  ]
}
```

**Types de blocs disponibles :**
- `h2` — un titre de section
- `p` — un paragraphe (accepte du HTML simple : `<strong>`, `<em>`, `<a href="...">`)
- `liste` — une liste à puces (`items`: tableau de textes)
- `code` — un bloc de code (texte brut, pas de HTML dedans)
- `html` — pour un cas spécial non couvert ci-dessus (HTML brut, à utiliser avec parcimonie)

`icone` : une des classes couleur existantes → `c-blue`, `c-red`, `c-purple`, `c-yellow`, `c-green`, `c-magenta` (rotation automatique si tu ne précises rien).

## 3. L'activité quiz (toujours la dernière de la séquence)

```json
{
  "id": "activite9",
  "titre": "Test de validation",
  "duree": "10 min",
  "icone": "c-purple",
  "type": "quiz",
  "niveauAcces": "gratuit",
  "introHtml": "<h2>Félicitations ! 🎉</h2><p>Vous avez terminé la Séquence 2. Répondez aux questions pour valider vos acquis.</p>",
  "questions": [
    {
      "question": "Q1. Quelle propriété CSS change la couleur du texte ?",
      "options": [
        { "valeur": "A", "texte": "A. background-color" },
        { "valeur": "B", "texte": "B. color" },
        { "valeur": "C", "texte": "C. text-color" },
        { "valeur": "D", "texte": "D. font-color" }
      ],
      "correct": "B"
    }
  ],
  "messageSucces": "🎉 Félicitations ! Vous avez parfaitement répondu à toutes les questions.",
  "messageErreur": "❌ Oups ! Certaines réponses sont incorrectes.<br><strong>Aucun indice ne vous sera donné.</strong> Réfléchissez bien et recommencez le test."
}
```

## 4. Points importants

- L'**ordre des activités dans le tableau `activites`** détermine l'ordre de navigation (précédent/suivant) et leur numérotation automatique — pas besoin de gérer les liens toi-même.
- Chaque `id` d'activité doit être unique **dans sa séquence** (`activite1`, `activite2`, ...).
- Le JSON est strict : pas de virgule après le dernier élément d'une liste, guillemets doubles obligatoires. Utilise un vérificateur JSON en ligne si tu as un doute (ex. jsonlint.com) avant de pousser.
- Une fois `data/webdev.json` modifié et poussé sur GitHub, tout fonctionne automatiquement — aucun autre fichier à toucher.

## 5. Comment tester avant de pousser

Sur ton téléphone (Termux), le plus simple est de pousser directement sur une branche de test, ou de me montrer le JSON avant de le mettre en ligne — je peux le valider pour toi.
