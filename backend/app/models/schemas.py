from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class NodeInput(BaseModel):
    id: str = Field(..., min_length=1)
    label: str | None = None
    x: float | None = None
    y: float | None = None


class EdgeInput(BaseModel):
    id: str | None = None
    source: str = Field(..., min_length=1)
    target: str = Field(..., min_length=1)
    capacity: float = Field(..., ge=0)

    @field_validator("capacity")
    @classmethod
    def validate_capacity(cls, value: float) -> float:
        if value < 0:
            raise ValueError("La capacité doit être positive ou nulle.")
        return float(value)


class GraphInput(BaseModel):
    nodes: list[NodeInput]
    edges: list[EdgeInput]
    source: str
    sink: str

    @model_validator(mode="after")
    def validate_graph(self) -> "GraphInput":
        node_ids = [node.id for node in self.nodes]
        if len(node_ids) != len(set(node_ids)):
            raise ValueError("Chaque sommet doit avoir un identifiant unique.")

        if self.source == self.sink:
            raise ValueError("La source et le puits doivent être différents.")

        if self.source not in node_ids:
            raise ValueError("La source n'existe pas dans la liste des sommets.")

        if self.sink not in node_ids:
            raise ValueError("Le puits n'existe pas dans la liste des sommets.")

        unknown_nodes = [
            edge.id or f"{edge.source}->{edge.target}"
            for edge in self.edges
            if edge.source not in node_ids or edge.target not in node_ids
        ]
        if unknown_nodes:
            raise ValueError(
                "Tous les arcs doivent référencer des sommets existants. "
                f"Arcs invalides: {', '.join(unknown_nodes)}"
            )

        return self


class SimulationRequest(BaseModel):
    graph: GraphInput


class VertexState(BaseModel):
    id: str
    label: str
    height: int
    excess: float
    is_source: bool
    is_sink: bool
    is_active: bool
    x: float | None = None
    y: float | None = None


class EdgeState(BaseModel):
    id: str
    source: str
    target: str
    capacity: float
    flow: float
    residual_forward: float
    residual_backward: float
    is_saturated: bool


class StepDetails(BaseModel):
    edge_id: str | None = None
    from_node: str | None = None
    to_node: str | None = None
    pushed_amount: float | None = None
    previous_height: int | None = None
    new_height: int | None = None


class AlgorithmStep(BaseModel):
    index: int
    action: Literal["initialize", "push", "relabel", "complete"]
    message: str
    active_vertex: str | None = None
    active_vertices: list[str]
    total_flow: float
    vertices: list[VertexState]
    edges: list[EdgeState]
    details: StepDetails = Field(default_factory=StepDetails)


class ExecutionStats(BaseModel):
    step_count: int
    push_count: int
    relabel_count: int
    saturating_push_count: int
    non_saturating_push_count: int
    max_active_vertices: int
    iterations: int
    elapsed_ms: float


class SimulationResult(BaseModel):
    maximum_flow: float
    steps: list[AlgorithmStep]
    execution_log: list[str]
    stats: ExecutionStats
    final_vertices: list[VertexState]
    final_edges: list[EdgeState]


class ExampleGraph(BaseModel):
    id: str
    title: str
    description: str
    graph: GraphInput
