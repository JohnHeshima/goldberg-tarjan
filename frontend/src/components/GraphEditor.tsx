import type { ChangeEvent } from "react";
import type { GraphDefinition } from "../types";
import { createEdgeId, createNodeId, ensureNodePositions } from "../utils/graph";

type GraphEditorProps = {
  graph: GraphDefinition;
  onChange: (graph: GraphDefinition) => void;
};

function parseNumeric(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function GraphEditor({ graph, onChange }: GraphEditorProps) {
  const formatNodeOption = (nodeId: string) => {
    const node = graph.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) {
      return nodeId;
    }

    if (!node.label || node.label === node.id) {
      return node.id;
    }

    return `${node.label} (${node.id})`;
  };

  const handleNodeChange = (
    index: number,
    field: "id" | "label" | "x" | "y",
    value: string,
  ) => {
    const nextGraph: GraphDefinition = {
      ...graph,
      nodes: graph.nodes.map((node) => ({ ...node })),
      edges: graph.edges.map((edge) => ({ ...edge })),
    };

    const targetNode = nextGraph.nodes[index];
    const previousId = targetNode.id;

    if (field === "x") {
      targetNode.x = parseNumeric(value) ?? null;
    } else if (field === "y") {
      targetNode.y = parseNumeric(value) ?? null;
    } else if (field === "label") {
      targetNode.label = value;
    } else {
      targetNode.id = value;
    }

    if (field === "id" && value && value !== previousId) {
      nextGraph.edges = nextGraph.edges.map((edge) => ({
        ...edge,
        source: edge.source === previousId ? value : edge.source,
        target: edge.target === previousId ? value : edge.target,
      }));
      if (nextGraph.source === previousId) {
        nextGraph.source = value;
      }
      if (nextGraph.sink === previousId) {
        nextGraph.sink = value;
      }
    }

    onChange(nextGraph);
  };

  const handleEdgeChange = (
    index: number,
    field: "id" | "source" | "target" | "capacity",
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    const nextEdges = graph.edges.map((edge, edgeIndex) => {
      if (edgeIndex !== index) {
        return { ...edge };
      }

      if (field === "capacity") {
        return {
          ...edge,
          capacity: Math.max(0, Number(value) || 0),
        };
      }

      return {
        ...edge,
        [field]: value,
      };
    });

    onChange({ ...graph, edges: nextEdges });
  };

  const addNode = () => {
    const id = createNodeId(graph.nodes);
    const nextGraph = ensureNodePositions({
      ...graph,
      nodes: [
        ...graph.nodes,
        {
          id,
          label: id.toUpperCase(),
        },
      ],
    });
    onChange(nextGraph);
  };

  const addEdge = () => {
    if (graph.nodes.length < 2) {
      return;
    }

    const [first, second] = graph.nodes;
    onChange({
      ...graph,
      edges: [
        ...graph.edges,
        {
          id: createEdgeId(graph),
          source: first.id,
          target: second.id,
          capacity: 1,
        },
      ],
    });
  };

  const removeNode = (index: number) => {
    const removedNode = graph.nodes[index];
    const nextNodes = graph.nodes.filter((_, nodeIndex) => nodeIndex !== index);
    const nextEdges = graph.edges.filter(
      (edge) =>
        edge.source !== removedNode.id &&
        edge.target !== removedNode.id,
    );

    const nextSource =
      removedNode.id === graph.source ? nextNodes[0]?.id ?? "" : graph.source;
    const nextSink =
      removedNode.id === graph.sink
        ? nextNodes[nextNodes.length - 1]?.id ?? ""
        : graph.sink;

    onChange({
      nodes: nextNodes,
      edges: nextEdges,
      source: nextSource,
      sink: nextSink === nextSource ? nextNodes[1]?.id ?? nextSource : nextSink,
    });
  };

  const removeEdge = (index: number) => {
    onChange({
      ...graph,
      edges: graph.edges.filter((_, edgeIndex) => edgeIndex !== index),
    });
  };

  return (
    <section className="panel panel-scroll graph-editor-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Édition</p>
          <h2>Graphe du réseau</h2>
        </div>
        <button className="ghost-button" onClick={() => onChange(ensureNodePositions(graph))}>
          Repositionner
        </button>
      </div>

      <div className="stack">
        <p className="editor-intro">
          Toute modification ci-dessous met à jour le graphe affiché à droite en temps réel.
        </p>

        <div className="editor-overview">
          <span className="editor-chip">Sommets {graph.nodes.length}</span>
          <span className="editor-chip">Arcs {graph.edges.length}</span>
          <span className="editor-chip">Source {graph.source || "-"}</span>
          <span className="editor-chip">Puits {graph.sink || "-"}</span>
        </div>

        <div className="editor-config-card">
          <div className="editor-section-head">
            <div>
              <h3>Paramètres globaux</h3>
              <p className="muted">Sélection rapide de la source et du puits du réseau.</p>
            </div>
          </div>

          <div className="inline-grid">
            <label>
              <span>Source</span>
              <select
                value={graph.source}
                onChange={(event) =>
                  onChange({ ...graph, source: event.target.value })
                }
              >
                {graph.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {formatNodeOption(node.id)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Puits</span>
              <select
                value={graph.sink}
                onChange={(event) => onChange({ ...graph, sink: event.target.value })}
              >
                {graph.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {formatNodeOption(node.id)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="editor-section">
          <div className="table-toolbar">
            <div className="editor-section-head">
              <div>
                <h3>Sommets</h3>
                <p className="muted">Renseignez l'identifiant, le libellé et la position de chaque sommet.</p>
              </div>
            </div>
            <button className="editor-add-button editor-add-button-node" onClick={addNode}>
              <span className="editor-add-icon" aria-hidden="true">+</span>
              <span className="editor-add-copy">
                <strong>Ajouter un sommet</strong>
                <small>Crée un nouveau nœud modifiable</small>
              </span>
            </button>
          </div>

          <div className="editor-list">
            {graph.nodes.map((node, index) => (
              <article className="editor-item-card" key={`${node.id}-${index}`}>
                <div className="editor-item-header">
                  <div className="editor-item-title">
                    <span className="item-tag">Sommet {index + 1}</span>
                    <strong>{node.label || "Sommet sans libellé"}</strong>
                  </div>
                  <div className="editor-inline-actions">
                    <span className="item-id">{node.id || "id vide"}</span>
                    <button
                      className="danger-button"
                      onClick={() => removeNode(index)}
                      disabled={graph.nodes.length <= 2}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="editor-field-grid">
                  <label>
                    <span>ID</span>
                    <input
                      value={node.id}
                      placeholder="s"
                      onChange={(event) =>
                        handleNodeChange(index, "id", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>Libellé</span>
                    <input
                      value={node.label ?? ""}
                      placeholder="Source"
                      onChange={(event) =>
                        handleNodeChange(index, "label", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>Position X</span>
                    <input
                      type="number"
                      value={node.x ?? ""}
                      onChange={(event) =>
                        handleNodeChange(index, "x", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>Position Y</span>
                    <input
                      type="number"
                      value={node.y ?? ""}
                      onChange={(event) =>
                        handleNodeChange(index, "y", event.target.value)
                      }
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="editor-section">
          <div className="table-toolbar">
            <div className="editor-section-head">
              <div>
                <h3>Arcs</h3>
                <p className="muted">Définissez la liaison, sa direction et sa capacité en un coup d'œil.</p>
              </div>
            </div>
            <button
              className="editor-add-button editor-add-button-edge"
              onClick={addEdge}
              disabled={graph.nodes.length < 2}
            >
              <span className="editor-add-icon" aria-hidden="true">+</span>
              <span className="editor-add-copy">
                <strong>Ajouter un arc</strong>
                <small>Relie deux sommets du réseau</small>
              </span>
            </button>
          </div>

          <div className="editor-list">
            {graph.edges.map((edge, index) => (
              <article className="editor-item-card" key={`${edge.id ?? "edge"}-${index}`}>
                <div className="editor-item-header">
                  <div className="editor-item-title">
                    <span className="item-tag item-tag-secondary">Arc {index + 1}</span>
                    <strong>
                      {formatNodeOption(edge.source)} vers {formatNodeOption(edge.target)}
                    </strong>
                  </div>
                  <div className="editor-inline-actions">
                    <span className="item-id">{edge.id || "id vide"}</span>
                    <button
                      className="danger-button"
                      onClick={() => removeEdge(index)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="editor-field-grid">
                  <label>
                    <span>ID</span>
                    <input
                      value={edge.id ?? ""}
                      placeholder="e1"
                      onChange={(event) =>
                        handleEdgeChange(index, "id", event)
                      }
                    />
                  </label>

                  <label>
                    <span>Source</span>
                    <select
                      value={edge.source}
                      onChange={(event) =>
                        handleEdgeChange(index, "source", event)
                      }
                    >
                      {graph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {formatNodeOption(node.id)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Cible</span>
                    <select
                      value={edge.target}
                      onChange={(event) =>
                        handleEdgeChange(index, "target", event)
                      }
                    >
                      {graph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {formatNodeOption(node.id)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Capacité</span>
                    <input
                      type="number"
                      min={0}
                      value={edge.capacity}
                      onChange={(event) =>
                        handleEdgeChange(index, "capacity", event)
                      }
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
