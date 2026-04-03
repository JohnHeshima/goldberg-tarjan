export type NodeDefinition = {
  id: string;
  label?: string | null;
  x?: number | null;
  y?: number | null;
};

export type EdgeDefinition = {
  id?: string | null;
  source: string;
  target: string;
  capacity: number;
};

export type GraphDefinition = {
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
  source: string;
  sink: string;
};

export type ExampleGraph = {
  id: string;
  title: string;
  description: string;
  graph: GraphDefinition;
};

export type VertexState = {
  id: string;
  label: string;
  height: number;
  excess: number;
  is_source: boolean;
  is_sink: boolean;
  is_active: boolean;
  x?: number | null;
  y?: number | null;
};

export type EdgeState = {
  id: string;
  source: string;
  target: string;
  capacity: number;
  flow: number;
  residual_forward: number;
  residual_backward: number;
  is_saturated: boolean;
};

export type StepDetails = {
  edge_id?: string | null;
  from_node?: string | null;
  to_node?: string | null;
  pushed_amount?: number | null;
  previous_height?: number | null;
  new_height?: number | null;
};

export type AlgorithmStep = {
  index: number;
  action: "initialize" | "push" | "relabel" | "complete";
  message: string;
  active_vertex?: string | null;
  active_vertices: string[];
  total_flow: number;
  vertices: VertexState[];
  edges: EdgeState[];
  details: StepDetails;
};

export type ExecutionStats = {
  step_count: number;
  push_count: number;
  relabel_count: number;
  saturating_push_count: number;
  non_saturating_push_count: number;
  max_active_vertices: number;
  iterations: number;
  elapsed_ms: number;
};

export type SimulationResult = {
  maximum_flow: number;
  steps: AlgorithmStep[];
  execution_log: string[];
  stats: ExecutionStats;
  final_vertices: VertexState[];
  final_edges: EdgeState[];
};

export type SimulationMode = "step" | "full";
