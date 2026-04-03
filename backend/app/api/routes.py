from __future__ import annotations

from fastapi import APIRouter

from app.core.push_relabel import PushRelabelEngine
from app.models.schemas import ExampleGraph, SimulationRequest, SimulationResult
from app.services.examples import get_example_graphs


router = APIRouter(prefix="/api/v1")


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/examples", response_model=list[ExampleGraph])
def list_examples() -> list[ExampleGraph]:
    return get_example_graphs()


@router.post("/max-flow/run", response_model=SimulationResult)
def run_max_flow(request: SimulationRequest) -> SimulationResult:
    engine = PushRelabelEngine(request.graph)
    return engine.run()
