from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from time import perf_counter

from app.models.schemas import (
    AlgorithmStep,
    EdgeState,
    ExecutionStats,
    GraphInput,
    SimulationResult,
    StepDetails,
    VertexState,
)


EPSILON = 1e-9


@dataclass
class ResidualEdge:
    to: str
    rev: int
    capacity: float
    original_edge_index: int | None
    forward: bool


@dataclass
class OriginalEdgeRecord:
    id: str
    source: str
    target: str
    capacity: float
    flow: float = 0.0
    residual_edge_index: int = -1


class PushRelabelEngine:
    def __init__(self, graph: GraphInput) -> None:
        self.graph = graph
        self.nodes = graph.nodes
        self.source = graph.source
        self.sink = graph.sink
        self.node_lookup = {node.id: node for node in graph.nodes}
        self.heights = {node.id: 0 for node in graph.nodes}
        self.excess = {node.id: 0.0 for node in graph.nodes}
        self.adjacency: dict[str, list[int]] = {node.id: [] for node in graph.nodes}
        self.residual_edges: list[ResidualEdge] = []
        self.original_edges: list[OriginalEdgeRecord] = []
        self.steps: list[AlgorithmStep] = []
        self.execution_log: list[str] = []
        self.push_count = 0
        self.relabel_count = 0
        self.saturating_push_count = 0
        self.non_saturating_push_count = 0
        self.max_active_vertices = 0
        self.iterations = 0

        self._build_graph()

    def _build_graph(self) -> None:
        for index, edge in enumerate(self.graph.edges):
            edge_id = edge.id or f"e{index + 1}"
            original_edge = OriginalEdgeRecord(
                id=edge_id,
                source=edge.source,
                target=edge.target,
                capacity=float(edge.capacity),
            )
            forward_index = self._add_residual_edge(
                edge.source,
                edge.target,
                float(edge.capacity),
                original_edge_index=index,
                forward=True,
            )
            self._add_residual_edge(
                edge.target,
                edge.source,
                0.0,
                original_edge_index=index,
                forward=False,
                reverse_of=forward_index,
            )
            original_edge.residual_edge_index = forward_index
            self.original_edges.append(original_edge)

    def _add_residual_edge(
        self,
        source: str,
        target: str,
        capacity: float,
        original_edge_index: int | None,
        forward: bool,
        reverse_of: int | None = None,
    ) -> int:
        if reverse_of is None:
            edge_index = len(self.residual_edges)
            reverse_index = edge_index + 1
            edge = ResidualEdge(
                to=target,
                rev=reverse_index,
                capacity=capacity,
                original_edge_index=original_edge_index,
                forward=forward,
            )
            self.residual_edges.append(edge)
            self.adjacency[source].append(edge_index)
            return edge_index

        edge_index = len(self.residual_edges)
        edge = ResidualEdge(
            to=target,
            rev=reverse_of,
            capacity=capacity,
            original_edge_index=original_edge_index,
            forward=forward,
        )
        self.residual_edges.append(edge)
        self.adjacency[source].append(edge_index)
        return edge_index

    def run(self) -> SimulationResult:
        started_at = perf_counter()

        self.heights[self.source] = len(self.nodes)
        self._record_step(
            action="initialize",
            message=(
                f"Initialisation du preflot: hauteur({self.source}) = {len(self.nodes)}."
            ),
            active_vertex=self.source,
        )

        for edge_index in list(self.adjacency[self.source]):
            edge = self.residual_edges[edge_index]
            if edge.capacity <= EPSILON:
                continue
            amount = edge.capacity
            self._push(self.source, edge_index, amount)
            self.push_count += 1
            self.saturating_push_count += 1
            self.iterations += 1
            self._record_step(
                action="push",
                message=(
                    f"Preflot initial: envoi de {amount:.2f} unite(s) "
                    f"de {self.source} vers {edge.to}."
                ),
                active_vertex=self.source,
                details=StepDetails(
                    edge_id=self.original_edges[edge.original_edge_index].id
                    if edge.original_edge_index is not None
                    else None,
                    from_node=self.source,
                    to_node=edge.to,
                    pushed_amount=amount,
                ),
            )

        active_vertices = deque(self._current_active_vertices())
        self.max_active_vertices = max(self.max_active_vertices, len(active_vertices))

        while active_vertices:
            vertex = active_vertices.popleft()
            if self._is_inactive(vertex):
                continue

            while self.excess[vertex] > EPSILON:
                admissible_edge = self._find_admissible_edge(vertex)
                if admissible_edge is None:
                    previous_height = self.heights[vertex]
                    self._relabel(vertex)
                    self.relabel_count += 1
                    self.iterations += 1
                    self._record_step(
                        action="relabel",
                        message=(
                            f"Relabel du sommet {vertex}: hauteur "
                            f"{previous_height} -> {self.heights[vertex]}."
                        ),
                        active_vertex=vertex,
                        details=StepDetails(
                            previous_height=previous_height,
                            new_height=self.heights[vertex],
                        ),
                    )
                    continue

                target = self.residual_edges[admissible_edge].to
                residual_capacity = self.residual_edges[admissible_edge].capacity
                amount = min(self.excess[vertex], residual_capacity)
                target_was_inactive = self._is_inactive(target)
                self._push(vertex, admissible_edge, amount)
                self.push_count += 1
                self.iterations += 1
                if abs(amount - residual_capacity) <= EPSILON:
                    self.saturating_push_count += 1
                else:
                    self.non_saturating_push_count += 1

                original_index = self.residual_edges[admissible_edge].original_edge_index
                edge_id = (
                    self.original_edges[original_index].id
                    if original_index is not None
                    else None
                )
                self._record_step(
                    action="push",
                    message=(
                        f"Push de {amount:.2f} unite(s) de {vertex} vers {target}."
                    ),
                    active_vertex=vertex,
                    details=StepDetails(
                        edge_id=edge_id,
                        from_node=vertex,
                        to_node=target,
                        pushed_amount=amount,
                    ),
                )

                if (
                    target not in {self.source, self.sink}
                    and target_was_inactive
                    and self.excess[target] > EPSILON
                ):
                    active_vertices.append(target)

            if not self._is_inactive(vertex):
                active_vertices.append(vertex)

            self.max_active_vertices = max(
                self.max_active_vertices, len(self._current_active_vertices())
            )

        self._record_step(
            action="complete",
            message=f"Execution terminee. Flot maximum = {self._total_flow():.2f}.",
            active_vertex=None,
        )

        elapsed_ms = (perf_counter() - started_at) * 1000
        final_vertices = self._snapshot_vertices()
        final_edges = self._snapshot_edges()

        return SimulationResult(
            maximum_flow=self._total_flow(),
            steps=self.steps,
            execution_log=self.execution_log,
            stats=ExecutionStats(
                step_count=len(self.steps),
                push_count=self.push_count,
                relabel_count=self.relabel_count,
                saturating_push_count=self.saturating_push_count,
                non_saturating_push_count=self.non_saturating_push_count,
                max_active_vertices=self.max_active_vertices,
                iterations=self.iterations,
                elapsed_ms=round(elapsed_ms, 3),
            ),
            final_vertices=final_vertices,
            final_edges=final_edges,
        )

    def _find_admissible_edge(self, vertex: str) -> int | None:
        for edge_index in self.adjacency[vertex]:
            edge = self.residual_edges[edge_index]
            if edge.capacity > EPSILON and self.heights[vertex] == self.heights[edge.to] + 1:
                return edge_index
        return None

    def _push(self, vertex: str, edge_index: int, amount: float) -> None:
        edge = self.residual_edges[edge_index]
        reverse_edge = self.residual_edges[edge.rev]

        edge.capacity -= amount
        reverse_edge.capacity += amount

        self.excess[vertex] -= amount
        self.excess[edge.to] += amount

        if edge.original_edge_index is not None:
            original_edge = self.original_edges[edge.original_edge_index]
            if edge.forward:
                original_edge.flow += amount
            else:
                original_edge.flow -= amount

    def _relabel(self, vertex: str) -> None:
        candidate_heights = [
            self.heights[self.residual_edges[edge_index].to]
            for edge_index in self.adjacency[vertex]
            if self.residual_edges[edge_index].capacity > EPSILON
        ]
        if not candidate_heights:
            raise ValueError(f"Aucun arc residuel sortant disponible pour {vertex}.")
        self.heights[vertex] = min(candidate_heights) + 1

    def _is_inactive(self, vertex: str) -> bool:
        return vertex in {self.source, self.sink} or self.excess[vertex] <= EPSILON

    def _current_active_vertices(self) -> list[str]:
        active = [
            node.id
            for node in self.nodes
            if node.id not in {self.source, self.sink} and self.excess[node.id] > EPSILON
        ]
        return active

    def _total_flow(self) -> float:
        total = sum(
            edge.flow for edge in self.original_edges if edge.source == self.source
        ) - sum(edge.flow for edge in self.original_edges if edge.target == self.source)
        return round(total, 6)

    def _snapshot_vertices(self) -> list[VertexState]:
        active_vertices = set(self._current_active_vertices())
        return [
            VertexState(
                id=node.id,
                label=node.label or node.id,
                height=self.heights[node.id],
                excess=round(self.excess[node.id], 6),
                is_source=node.id == self.source,
                is_sink=node.id == self.sink,
                is_active=node.id in active_vertices,
                x=node.x,
                y=node.y,
            )
            for node in self.nodes
        ]

    def _snapshot_edges(self) -> list[EdgeState]:
        snapshot: list[EdgeState] = []
        for index, edge in enumerate(self.original_edges):
            residual = self.residual_edges[edge.residual_edge_index]
            reverse = self.residual_edges[residual.rev]
            snapshot.append(
                EdgeState(
                    id=edge.id,
                    source=edge.source,
                    target=edge.target,
                    capacity=edge.capacity,
                    flow=round(edge.flow, 6),
                    residual_forward=round(residual.capacity, 6),
                    residual_backward=round(reverse.capacity, 6),
                    is_saturated=residual.capacity <= EPSILON,
                )
            )
        return snapshot

    def _record_step(
        self,
        action: str,
        message: str,
        active_vertex: str | None,
        details: StepDetails | None = None,
    ) -> None:
        step = AlgorithmStep(
            index=len(self.steps),
            action=action,
            message=message,
            active_vertex=active_vertex,
            active_vertices=self._current_active_vertices(),
            total_flow=self._total_flow(),
            vertices=self._snapshot_vertices(),
            edges=self._snapshot_edges(),
            details=details or StepDetails(),
        )
        self.steps.append(step)
        self.execution_log.append(message)
        self.max_active_vertices = max(
            self.max_active_vertices, len(step.active_vertices)
        )
