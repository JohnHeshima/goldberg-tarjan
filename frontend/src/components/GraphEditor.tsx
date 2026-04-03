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
    <section className="panel panel-scroll">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Edition</p>
          <h2>Graphe du reseau</h2>
        </div>
        <button className="ghost-button" onClick={() => onChange(ensureNodePositions(graph))}>
          Repositionner
        </button>
      </div>

      <div className="stack">
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
                  {node.label || node.id}
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
                  {node.label || node.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="table-toolbar">
          <h3>Sommets</h3>
          <button className="secondary-button" onClick={addNode}>
            Ajouter un sommet
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Libelle</th>
                <th>X</th>
                <th>Y</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {graph.nodes.map((node, index) => (
                <tr key={`${node.id}-${index}`}>
                  <td>
                    <input
                      value={node.id}
                      onChange={(event) =>
                        handleNodeChange(index, "id", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={node.label ?? ""}
                      onChange={(event) =>
                        handleNodeChange(index, "label", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={node.x ?? ""}
                      onChange={(event) =>
                        handleNodeChange(index, "x", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={node.y ?? ""}
                      onChange={(event) =>
                        handleNodeChange(index, "y", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="danger-button"
                      onClick={() => removeNode(index)}
                      disabled={graph.nodes.length <= 2}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-toolbar">
          <h3>Arcs</h3>
          <button className="secondary-button" onClick={addEdge}>
            Ajouter un arc
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Source</th>
                <th>Cible</th>
                <th>Capacite</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {graph.edges.map((edge, index) => (
                <tr key={`${edge.id ?? "edge"}-${index}`}>
                  <td>
                    <input
                      value={edge.id ?? ""}
                      onChange={(event) =>
                        handleEdgeChange(index, "id", event)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={edge.source}
                      onChange={(event) =>
                        handleEdgeChange(index, "source", event)
                      }
                    >
                      {graph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.label || node.id}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={edge.target}
                      onChange={(event) =>
                        handleEdgeChange(index, "target", event)
                      }
                    >
                      {graph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.label || node.id}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={edge.capacity}
                      onChange={(event) =>
                        handleEdgeChange(index, "capacity", event)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="danger-button"
                      onClick={() => removeEdge(index)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
