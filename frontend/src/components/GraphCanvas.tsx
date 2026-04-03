import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type OnNodeDrag,
} from "@xyflow/react";
import type { AlgorithmStep, GraphDefinition } from "../types";

type GraphCanvasProps = {
  graph: GraphDefinition;
  step: AlgorithmStep | null;
  onNodePositionChange: (nodeId: string, x: number, y: number) => void;
};

function getNodeMetrics(graph: GraphDefinition, step: AlgorithmStep | null) {
  const vertices = new Map(step?.vertices.map((vertex) => [vertex.id, vertex]) ?? []);
  return graph.nodes.map((node) => {
    const vertex = vertices.get(node.id);
    const position = {
      x: node.x ?? vertex?.x ?? 0,
      y: node.y ?? vertex?.y ?? 0,
    };

    const label = vertex
      ? `${vertex.label}\nh=${vertex.height} | e=${vertex.excess.toFixed(2)}`
      : `${node.label ?? node.id}\nmode edition`;

    const style = vertex?.is_source
      ? {
          background: "#0f766e",
          color: "#f8fafc",
          border: "2px solid #5eead4",
        }
      : vertex?.is_sink
        ? {
            background: "#9a3412",
            color: "#fff7ed",
            border: "2px solid #fdba74",
          }
        : vertex?.is_active
          ? {
              background: "#f59e0b",
              color: "#1c1917",
              border: "2px solid #fde68a",
            }
          : {
              background: "#f4f1ea",
              color: "#1f2937",
              border: "1px solid rgba(30, 41, 59, 0.18)",
            };

    return {
      id: node.id,
      position,
      data: { label },
      style: {
        ...style,
        width: 140,
        minHeight: 70,
        borderRadius: 18,
        padding: 12,
        fontWeight: 700,
        whiteSpace: "pre-line",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
      },
    } satisfies Node;
  });
}

function getEdgeMetrics(graph: GraphDefinition, step: AlgorithmStep | null): Edge[] {
  const edgesById = new Map(step?.edges.map((edge) => [edge.id, edge]) ?? []);
  const highlightedEdge = step?.details.edge_id ?? null;

  return graph.edges.map((edge, index) => {
    const edgeId = edge.id ?? `e${index + 1}`;
    const current = edgesById.get(edgeId);
    const isCurrent = highlightedEdge === edgeId;

    return {
      id: edgeId,
      source: edge.source,
      target: edge.target,
      animated: isCurrent,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
      },
      label: current
        ? `${current.flow.toFixed(2)} / ${current.capacity.toFixed(2)}`
        : `0 / ${edge.capacity.toFixed(2)}`,
      style: {
        stroke: isCurrent ? "#c2410c" : current?.is_saturated ? "#dc2626" : "#475569",
        strokeWidth: isCurrent ? 3.5 : 2.25,
      },
      labelStyle: {
        fontWeight: 700,
        fill: "#111827",
      },
      labelBgStyle: {
        fill: "#fffbeb",
        fillOpacity: 0.95,
      },
      labelBgBorderRadius: 10,
      labelBgPadding: [6, 4],
    };
  });
}

export function GraphCanvas({
  graph,
  step,
  onNodePositionChange,
}: GraphCanvasProps) {
  const nodes = getNodeMetrics(graph, step);
  const edges = getEdgeMetrics(graph, step);

  const handleNodeDragStop: OnNodeDrag = (_, node) => {
    onNodePositionChange(node.id, node.position.x, node.position.y);
  };

  return (
    <section className="panel graph-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Visualisation</p>
          <h2>Reseau interactif</h2>
        </div>
        {step ? <span className="status-pill">{step.action.toUpperCase()}</span> : null}
      </div>

      <div className="graph-shell">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          minZoom={0.3}
          onNodeDragStop={handleNodeDragStop}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background gap={24} size={1} color="rgba(148, 163, 184, 0.25)" />
        </ReactFlow>
      </div>
    </section>
  );
}
