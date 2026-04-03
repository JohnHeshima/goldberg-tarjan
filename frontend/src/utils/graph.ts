import type { ExampleGraph, GraphDefinition, NodeDefinition } from "../types";

export const fallbackExamples: ExampleGraph[] = [
  {
    id: "classic_clrs",
    title: "Exemple classique",
    description: "Réseau de démonstration pour illustrer le flot maximum.",
    graph: {
      source: "s",
      sink: "t",
      nodes: [
        { id: "s", label: "Source", x: 80, y: 220 },
        { id: "a", label: "A", x: 260, y: 100 },
        { id: "b", label: "B", x: 260, y: 320 },
        { id: "c", label: "C", x: 480, y: 100 },
        { id: "d", label: "D", x: 480, y: 320 },
        { id: "t", label: "Puits", x: 700, y: 220 },
      ],
      edges: [
        { id: "e1", source: "s", target: "a", capacity: 16 },
        { id: "e2", source: "s", target: "b", capacity: 13 },
        { id: "e3", source: "a", target: "b", capacity: 10 },
        { id: "e4", source: "b", target: "a", capacity: 4 },
        { id: "e5", source: "a", target: "c", capacity: 12 },
        { id: "e6", source: "b", target: "d", capacity: 14 },
        { id: "e7", source: "c", target: "b", capacity: 9 },
        { id: "e8", source: "d", target: "c", capacity: 7 },
        { id: "e9", source: "c", target: "t", capacity: 20 },
        { id: "e10", source: "d", target: "t", capacity: 4 },
      ],
    },
  },
];

export function cloneGraph(graph: GraphDefinition): GraphDefinition {
  return {
    source: graph.source,
    sink: graph.sink,
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  };
}

export function ensureNodePositions(graph: GraphDefinition): GraphDefinition {
  const nodesWithoutPosition = graph.nodes.some(
    (node) => node.x == null || node.y == null,
  );

  if (!nodesWithoutPosition) {
    return cloneGraph(graph);
  }

  const source = graph.source;
  const sink = graph.sink;
  const middleNodes = graph.nodes.filter(
    (node) => node.id !== source && node.id !== sink,
  );

  const positionedNodes = graph.nodes.map((node) => {
    if (node.x != null && node.y != null) {
      return { ...node };
    }

    if (node.id === source) {
      return { ...node, x: 80, y: 220 };
    }

    if (node.id === sink) {
      return { ...node, x: 700, y: 220 };
    }

    const index = middleNodes.findIndex((candidate) => candidate.id === node.id);
    const columns = Math.max(1, Math.ceil(middleNodes.length / 2));
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      ...node,
      x: 250 + column * 200,
      y: 120 + row * 180,
    };
  });

  return {
    ...graph,
    nodes: positionedNodes,
  };
}

export function createNodeId(nodes: NodeDefinition[]): string {
  let index = nodes.length + 1;
  while (nodes.some((node) => node.id === `v${index}`)) {
    index += 1;
  }
  return `v${index}`;
}

export function createEdgeId(graph: GraphDefinition): string {
  let index = graph.edges.length + 1;
  while (graph.edges.some((edge) => edge.id === `e${index}`)) {
    index += 1;
  }
  return `e${index}`;
}
