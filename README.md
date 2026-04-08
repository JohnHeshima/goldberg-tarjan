# Goldberg-Tarjan Visual Lab

Plateforme pédagogique pour comprendre, manipuler et visualiser l'algorithme de Goldberg-Tarjan (Push-Relabel) appliqué au problème du flot maximum.

Le projet combine :
- un backend `FastAPI` qui exécute l'algorithme ;
- un frontend `React + Vite + TypeScript` qui permet d'éditer un graphe ;
- une visualisation interactive des sommets, arcs, hauteurs, excès et étapes de calcul.

## 1. Pourquoi cet algorithme

L'algorithme de Goldberg-Tarjan sert à résoudre un problème central en recherche opérationnelle et en théorie des graphes : trouver le flot maximum entre une source et un puits dans un réseau capacitaire.

En pratique, ce type de modèle apparaît dans :
- les réseaux de transport ;
- les réseaux de communication ;
- la circulation de ressources dans une chaîne logistique ;
- certains problèmes d'affectation, de planification et de répartition de capacité.

Contrairement aux approches fondées sur la recherche répétée de chemins augmentants, Push-Relabel travaille avec deux notions internes très importantes :
- la `hauteur` de chaque sommet ;
- l'`excès` de flot présent sur les sommets intermédiaires.

Le principe est le suivant :
1. on sature initialement les arcs sortant de la source ;
2. on pousse le flot depuis les sommets actifs vers des voisins admissibles ;
3. si aucun push n'est possible, on relève (`relabel`) la hauteur du sommet ;
4. on répète jusqu'à ce qu'il n'existe plus de sommet actif hors source et puits.

Cette approche est très intéressante pédagogiquement parce qu'elle montre :
- comment évoluent les contraintes de capacité ;
- comment l'état interne de l'algorithme change pas à pas ;
- pourquoi la notion de sommet actif est essentielle ;
- comment le flot maximum émerge d'une suite d'opérations locales.

## 2. Ce que permet la plateforme

La plateforme a été construite pour rendre l'algorithme visible et manipulable.

Elle permet de :
- charger des graphes d'exemple ;
- créer un graphe personnalisé ;
- ajouter, modifier ou supprimer des sommets ;
- ajouter, modifier ou supprimer des arcs ;
- choisir la source et le puits ;
- repositionner automatiquement les sommets ;
- exécuter l'algorithme en mode complet ;
- naviguer étape par étape dans la simulation ;
- visualiser le journal d'exécution ;
- lire les statistiques de calcul ;
- observer les hauteurs, excès, arcs et actions `push` / `relabel` en temps réel.

Autrement dit, ce n'est pas seulement une API de calcul. C'est un laboratoire visuel pour expérimenter l'algorithme.

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

Le backend expose une API REST pour :
- vérifier l'état du service ;
- récupérer des graphes de démonstration ;
- lancer une simulation de flot maximum.

Fichiers clés :
- `backend/app/main.py` : configuration de l'application FastAPI et du CORS ;
- `backend/app/api/routes.py` : endpoints REST ;
- `backend/app/core/push_relabel.py` : cœur de l'algorithme ;
- `backend/app/models/schemas.py` : schémas d'entrée et de sortie ;
- `backend/app/services/examples.py` : jeux de données de démonstration.

### Frontend

Le frontend sert d'interface d'expérimentation.

Fichiers clés :
- `frontend/src/App.tsx` : orchestration générale ;
- `frontend/src/api/client.ts` : appels au backend ;
- `frontend/src/components/GraphEditor.tsx` : édition du graphe ;
- `frontend/src/components/GraphCanvas.tsx` : visualisation interactive ;
- `frontend/src/components/ControlPanel.tsx` : commandes de simulation ;
- `frontend/src/components/StepInspector.tsx` : lecture détaillée de l'état courant ;
- `frontend/src/components/LogPanel.tsx` : journal d'exécution ;
- `frontend/src/components/StatsPanel.tsx` : résumé quantitatif.

## 5. Lancer le projet

### Prérequis

- Python 3.10+ recommandé ;
- Node.js 18+ recommandé ;
- npm.

### Démarrer le backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend disponible sur :
- `http://127.0.0.1:8000`
- documentation Swagger : `http://127.0.0.1:8000/docs`

Vérification rapide :

```bash
curl http://127.0.0.1:8000/api/v1/health
```

Réponse attendue :

```json
{"status":"ok"}
```

### Démarrer le frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend disponible sur :
- `http://127.0.0.1:5173`

### Variable d'environnement optionnelle

Le frontend pointe par défaut vers :

```text
http://127.0.0.1:8000/api/v1
```

Si nécessaire, créez une variable d'environnement :

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## 6. Comment utiliser la plateforme

### Étape 1. Ouvrir l'interface

Ouvrir dans le navigateur :

```text
http://127.0.0.1:5173
```

### Étape 2. Choisir un graphe

Dans le panneau de contrôle :
- charger un exemple prédéfini ;
- ou partir d'un graphe que vous allez modifier manuellement.

### Étape 3. Éditer le réseau

Dans la carte `Graphe du réseau` :
- définir la `source` ;
- définir le `puits` ;
- ajouter un sommet ;
- modifier son `id`, son libellé et sa position ;
- ajouter un arc ;
- choisir sa source, sa cible et sa capacité ;
- supprimer les éléments inutiles.

Les changements sont répercutés directement dans la visualisation du graphe.

### Étape 4. Lancer la simulation

Depuis le panneau de contrôle :
- lancer l'exécution complète ;
- ou démarrer une lecture pas à pas selon les contrôles disponibles.

Le backend calcule alors :
- le flot maximum final ;
- la suite des états intermédiaires ;
- les opérations effectuées ;
- les statistiques globales.

### Étape 5. Lire les résultats

La plateforme permet ensuite d'observer :
- le graphe courant ;
- les sommets actifs ;
- les excès ;
- les hauteurs ;
- le journal des actions ;
- les statistiques d'exécution ;
- l'état détaillé de chaque étape.

## 7. Scénario type d'utilisation

Voici un parcours simple pour une démonstration :

1. lancer backend et frontend ;
2. ouvrir l'interface ;
3. charger un exemple préconfiguré ;
4. observer le graphe initial ;
5. lancer la simulation ;
6. avancer étape par étape ;
7. commenter les opérations `push` et `relabel` ;
8. modifier ensuite une capacité ou ajouter un arc ;
9. relancer la simulation ;
10. comparer le nouveau résultat.

Ce workflow est utile pour :
- un cours ;
- une démonstration devant enseignant ;
- une prise en main individuelle ;
- une vérification expérimentale sur des petits graphes.

## 8. API exposée

### `GET /api/v1/health`

Retourne l'état du backend.

Exemple :

```bash
curl http://127.0.0.1:8000/api/v1/health
```

### `GET /api/v1/examples`

Retourne les graphes d'exemple chargés par le backend.

Exemple :

```bash
curl http://127.0.0.1:8000/api/v1/examples
```

### `POST /api/v1/max-flow/run`

Exécute l'algorithme de Push-Relabel sur un graphe fourni.

Exemple de payload :

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

Exemple `curl` :

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

Pour bien comprendre l'algorithme, surveillez en priorité :
- quels sommets deviennent actifs ;
- quand un `push` est possible ;
- quand un `relabel` devient nécessaire ;
- comment évoluent les excès ;
- comment la hauteur guide le sens des pushes ;
- à quel moment l'état final devient stable.

La plateforme est utile justement parce qu'elle relie ces notions abstraites à un état graphique et à un journal lisible.

## 10. Jeux de démonstration

Les graphes de démonstration sont définis dans :
- `backend/app/services/examples.py`
- `frontend/src/utils/graph.ts` pour le fallback local

## 11. Dépannage rapide

### Le backend ne démarre pas

Vérifiez qu'aucun processus n'occupe déjà le port `8000`.

Exemple :

```bash
ss -ltnp | rg ':8000'
```

### Le frontend ne charge pas les exemples

Vérifiez :
- que le backend tourne ;
- que `http://127.0.0.1:8000/api/v1/health` répond ;
- que la variable `VITE_API_BASE_URL` est correcte si vous l'utilisez.

### Une dépendance frontend n'est pas trouvée

Relancer :

```bash
cd frontend
npm install
```

## 12. Finalité du projet

Ce projet a été conçu pour faire plus qu'afficher un résultat final.

Il sert à :
- comprendre la logique interne de Goldberg-Tarjan ;
- illustrer un algorithme de flot maximum de manière interactive ;
- offrir un support de présentation académique ;
- tester rapidement des variantes de graphes via une interface exploitable.

Si vous cherchez un support de démonstration clair, modifiable et immédiatement exécutable, cette plateforme remplit précisément ce rôle.
