# Goldberg-Tarjan Visual Lab

Plateforme pedagogique pour comprendre, manipuler et visualiser l'algorithme de Goldberg-Tarjan (Push-Relabel) applique au probleme du flot maximum.

Le projet combine:
- un backend `FastAPI` qui execute l'algorithme,
- un frontend `React + Vite + TypeScript` qui permet d'editer un graphe,
- une visualisation interactive des sommets, arcs, hauteurs, exces et etapes de calcul.

## 1. Pourquoi cet algorithme

L'algorithme de Goldberg-Tarjan sert a resoudre un probleme central en recherche operationnelle et en theorie des graphes: trouver le flot maximum entre une source et un puits dans un reseau capacitaire.

En pratique, ce type de modele apparait dans:
- les reseaux de transport,
- les reseaux de communication,
- la circulation de ressources dans une chaine logistique,
- certains problemes d'affectation, de planification et de repartition de capacite.

Contrairement aux approches basees sur la recherche repetee de chemins augmentants, Push-Relabel travaille avec deux notions internes tres importantes:
- la `hauteur` de chaque sommet,
- l'`exces` de flot present sur les sommets intermediaires.

Le principe est le suivant:
1. on sature initialement les arcs sortant de la source,
2. on pousse le flot depuis les sommets actifs vers des voisins admissibles,
3. si aucun push n'est possible, on releve (`relabel`) la hauteur du sommet,
4. on repete jusqu'a ce qu'il n'existe plus de sommet actif hors source et puits.

Cette approche est tres interessante pedagogiquement parce qu'elle montre:
- comment evoluent les contraintes de capacite,
- comment l'etat interne de l'algorithme change pas a pas,
- pourquoi la notion de sommet actif est essentielle,
- comment le flot maximum emerge d'une suite d'operations locales.

## 2. Ce que permet la plateforme

La plateforme a ete construite pour rendre l'algorithme visible et manipulable.

Elle permet de:
- charger des graphes d'exemple,
- creer un graphe personnalise,
- ajouter, modifier ou supprimer des sommets,
- ajouter, modifier ou supprimer des arcs,
- choisir la source et le puits,
- repositionner automatiquement les sommets,
- executer l'algorithme en mode complet,
- naviguer etape par etape dans la simulation,
- visualiser le journal d'execution,
- lire les statistiques de calcul,
- observer les hauteurs, exces, arcs et actions `push` / `relabel` en temps reel.

Autrement dit, ce n'est pas seulement une API de calcul. C'est un laboratoire visuel pour experimenter l'algorithme.

## 3. Architecture du projet

```text
GOLDBERG-TARJAN/
├── README.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── core/
│   │   │   └── push_relabel.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   └── examples.py
│   │   └── main.py
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── src/
        ├── api/
        │   └── client.ts
        ├── components/
        │   ├── ControlPanel.tsx
        │   ├── GraphCanvas.tsx
        │   ├── GraphEditor.tsx
        │   ├── LogPanel.tsx
        │   ├── StatsPanel.tsx
        │   └── StepInspector.tsx
        ├── utils/
        │   └── graph.ts
        ├── App.tsx
        ├── main.tsx
        ├── styles.css
        └── types.ts
```

## 4. Organisation fonctionnelle

### Backend

Le backend expose une API REST pour:
- verifier l'etat du service,
- recuperer des graphes de demonstration,
- lancer une simulation de flot maximum.

Fichiers clefs:
- `backend/app/main.py`: configuration de l'application FastAPI et du CORS
- `backend/app/api/routes.py`: endpoints REST
- `backend/app/core/push_relabel.py`: coeur de l'algorithme
- `backend/app/models/schemas.py`: schemas d'entree et de sortie
- `backend/app/services/examples.py`: jeux de donnees de demonstration

### Frontend

Le frontend sert d'interface d'experimentation.

Fichiers clefs:
- `frontend/src/App.tsx`: orchestration generale
- `frontend/src/api/client.ts`: appels au backend
- `frontend/src/components/GraphEditor.tsx`: edition du graphe
- `frontend/src/components/GraphCanvas.tsx`: visualisation interactive
- `frontend/src/components/ControlPanel.tsx`: commandes de simulation
- `frontend/src/components/StepInspector.tsx`: lecture detaillee de l'etat courant
- `frontend/src/components/LogPanel.tsx`: journal d'execution
- `frontend/src/components/StatsPanel.tsx`: resume quantitatif

## 5. Lancer le projet

### Prerequis

- Python 3.10+ recommande
- Node.js 18+ recommande
- npm

### Demarrer le backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend disponible sur:
- `http://127.0.0.1:8000`
- documentation Swagger: `http://127.0.0.1:8000/docs`

Verification rapide:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

Reponse attendue:

```json
{"status":"ok"}
```

### Demarrer le frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend disponible sur:
- `http://127.0.0.1:5173`

### Variable d'environnement optionnelle

Le frontend pointe par defaut vers:

```text
http://127.0.0.1:8000/api/v1
```

Si necessaire, creer une variable d'environnement:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## 6. Comment utiliser la plateforme

### Etape 1. Ouvrir l'interface

Ouvrir dans le navigateur:

```text
http://127.0.0.1:5173
```

### Etape 2. Choisir un graphe

Dans le panneau de controle:
- charger un exemple predefini,
- ou partir d'un graphe que vous allez modifier manuellement.

### Etape 3. Editer le reseau

Dans la carte `Graphe du reseau`:
- definir la `source`,
- definir le `puits`,
- ajouter un sommet,
- modifier son `id`, son libelle et sa position,
- ajouter un arc,
- choisir sa source, sa cible et sa capacite,
- supprimer les elements inutiles.

Les changements sont repercutes directement dans la visualisation du graphe.

### Etape 4. Lancer la simulation

Depuis le panneau de controle:
- lancer l'execution complete,
- ou demarrer une lecture pas a pas selon les controles disponibles.

Le backend calcule alors:
- le flot maximum final,
- la suite des etats intermediaires,
- les operations effectuees,
- les statistiques globales.

### Etape 5. Lire les resultats

La plateforme permet ensuite d'observer:
- le graphe courant,
- les sommets actifs,
- les exces,
- les hauteurs,
- le journal des actions,
- les statistiques d'execution,
- l'etat detaille de chaque etape.

## 7. Scenario type d'utilisation

Voici un parcours simple pour une demonstration:

1. lancer backend et frontend,
2. ouvrir l'interface,
3. charger un exemple preconfigure,
4. observer le graphe initial,
5. lancer la simulation,
6. avancer etape par etape,
7. commenter les operations `push` et `relabel`,
8. modifier ensuite une capacite ou ajouter un arc,
9. relancer la simulation,
10. comparer le nouveau resultat.

Ce workflow est utile pour:
- un cours,
- une demonstration devant enseignant,
- une prise en main individuelle,
- une verification experimentale sur des petits graphes.

## 8. API exposee

### `GET /api/v1/health`

Retourne l'etat du backend.

Exemple:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

### `GET /api/v1/examples`

Retourne les graphes d'exemple charges par le backend.

Exemple:

```bash
curl http://127.0.0.1:8000/api/v1/examples
```

### `POST /api/v1/max-flow/run`

Execute l'algorithme de Push-Relabel sur un graphe fourni.

Exemple de payload:

```json
{
  "graph": {
    "source": "s",
    "sink": "t",
    "nodes": [
      { "id": "s", "label": "Source", "x": 80, "y": 220 },
      { "id": "a", "label": "A", "x": 260, "y": 100 },
      { "id": "t", "label": "Puits", "x": 700, "y": 220 }
    ],
    "edges": [
      { "id": "e1", "source": "s", "target": "a", "capacity": 10 },
      { "id": "e2", "source": "a", "target": "t", "capacity": 7 }
    ]
  }
}
```

Exemple `curl`:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/max-flow/run \
  -H "Content-Type: application/json" \
  -d '{
    "graph": {
      "source": "s",
      "sink": "t",
      "nodes": [
        { "id": "s", "label": "Source", "x": 80, "y": 220 },
        { "id": "a", "label": "A", "x": 260, "y": 100 },
        { "id": "t", "label": "Puits", "x": 700, "y": 220 }
      ],
      "edges": [
        { "id": "e1", "source": "s", "target": "a", "capacity": 10 },
        { "id": "e2", "source": "a", "target": "t", "capacity": 7 }
      ]
    }
  }'
```

## 9. Ce qu'il faut observer pendant une simulation

Pour bien comprendre l'algorithme, surveiller en priorite:
- quels sommets deviennent actifs,
- quand un `push` est possible,
- quand un `relabel` devient necessaire,
- comment evoluent les exces,
- comment la hauteur guide le sens des pushes,
- a quel moment l'etat final devient stable.

La plateforme est utile justement parce qu'elle relie ces notions abstraites a un etat graphique et a un journal lisible.

## 10. Jeux de demonstration

Les graphes de demonstration sont definis dans:
- `backend/app/services/examples.py`
- `frontend/src/utils/graph.ts` pour le fallback local

## 11. Depannage rapide

### Le backend ne demarre pas

Verifier qu'aucun processus n'occupe deja le port `8000`.

Exemple:

```bash
ss -ltnp | rg ':8000'
```

### Le frontend ne charge pas les exemples

Verifier:
- que le backend tourne,
- que `http://127.0.0.1:8000/api/v1/health` repond,
- que la variable `VITE_API_BASE_URL` est correcte si vous l'utilisez.

### Une dependance frontend n'est pas trouvee

Relancer:

```bash
cd frontend
npm install
```

## 12. Finalite du projet

Ce projet a ete concu pour faire plus qu'afficher un resultat final.

Il sert a:
- comprendre la logique interne de Goldberg-Tarjan,
- illustrer un algorithme de flot maximum de maniere interactive,
- offrir un support de presentation academique,
- tester rapidement des variantes de graphes via une interface exploitable.

Si vous cherchez un support de demonstration clair, modifiable et immediatement executable, cette plateforme remplit precisement ce role.
