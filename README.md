# Goldberg-Tarjan Visual Lab

Projet complet de demonstration de l'algorithme de Goldberg-Tarjan (Push-Relabel) applique au probleme du flot maximum dans un reseau de transport.

## 1. Architecture du projet

### Backend `FastAPI`
- `backend/app/core/push_relabel.py`
  Moteur de calcul du flot maximum.
- `backend/app/models/schemas.py`
  Contrats Pydantic pour l'entree, les etats de simulation et les statistiques.
- `backend/app/api/routes.py`
  Endpoints REST pour les exemples et l'execution de l'algorithme.
- `backend/app/services/examples.py`
  Jeux de donnees precharges.

### Frontend `React + Vite + TypeScript`
- `frontend/src/App.tsx`
  Orchestration de l'interface et des appels API.
- `frontend/src/components/GraphEditor.tsx`
  Saisie et edition des sommets, arcs, capacites, source et puits.
- `frontend/src/components/GraphCanvas.tsx`
  Visualisation interactive du graphe avec `@xyflow/react`.
- `frontend/src/components/StepInspector.tsx`
  Affichage detaille des etats intermediaires.
- `frontend/src/components/LogPanel.tsx`
  Journal de l'execution.
- `frontend/src/components/StatsPanel.tsx`
  Statistiques de calcul et informations globales.
- `frontend/src/components/ControlPanel.tsx`
  Boutons de simulation, reset et navigation dans les etapes.

### Flux applicatif
1. L'utilisateur cree ou charge un graphe.
2. Le frontend envoie la definition du reseau au backend.
3. Le backend execute Push-Relabel et capture chaque etape.
4. Le frontend affiche:
   - le flot maximum final,
   - les hauteurs,
   - les excès,
   - les sommets actifs,
   - les operations `push` et `relabel`,
   - le journal detaille,
   - les statistiques d'execution.

## 2. Arborescence

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

## 3. API exposee

### `GET /api/v1/health`
Retourne l'etat de sante du backend.

### `GET /api/v1/examples`
Retourne les exemples precharges.

### `POST /api/v1/max-flow/run`
Execute l'algorithme de Push-Relabel sur un graphe.

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

## 4. Fonctionnalites livrees

- implementation correcte de Push-Relabel,
- backend FastAPI separe de la logique metier,
- frontend React moderne,
- graphe interactif avec deplacement des sommets,
- execution pas a pas,
- execution complete,
- reset du graphe,
- exemples precharges,
- affichage du flot maximum final,
- affichage des etats intermediaires,
- journal detaille,
- statistiques d'execution.

## 5. Instructions d'execution

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Le backend demarre sur `http://127.0.0.1:8000`.

Documentation Swagger:

`http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend demarre sur `http://127.0.0.1:5173`.

### Variable d'environnement frontend optionnelle

Si besoin, definir:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## 6. Donnees de demonstration

Les jeux de donnees precharges sont definis dans:

- `backend/app/services/examples.py`
- `frontend/src/utils/graph.ts` (fallback local)

## 7. Qualite de la demonstration

Le projet est structure pour:

- une demonstration academique,
- une presentation enseignant,
- des essais manuels sur des graphes saisis via interface.
