from __future__ import annotations

from app.models.schemas import EdgeInput, ExampleGraph, GraphInput, NodeInput


def get_example_graphs() -> list[ExampleGraph]:
    return [
        ExampleGraph(
            id="classic_clrs",
            title="Exemple classique de flot maximum",
            description=(
                "Petit réseau orienté souvent utilisé pour illustrer "
                "les algorithmes de flot maximum."
            ),
            graph=GraphInput(
                source="s",
                sink="t",
                nodes=[
                    NodeInput(id="s", label="Source", x=80, y=220),
                    NodeInput(id="a", label="A", x=260, y=100),
                    NodeInput(id="b", label="B", x=260, y=320),
                    NodeInput(id="c", label="C", x=480, y=100),
                    NodeInput(id="d", label="D", x=480, y=320),
                    NodeInput(id="t", label="Puits", x=700, y=220),
                ],
                edges=[
                    EdgeInput(id="e1", source="s", target="a", capacity=16),
                    EdgeInput(id="e2", source="s", target="b", capacity=13),
                    EdgeInput(id="e3", source="a", target="b", capacity=10),
                    EdgeInput(id="e4", source="b", target="a", capacity=4),
                    EdgeInput(id="e5", source="a", target="c", capacity=12),
                    EdgeInput(id="e6", source="b", target="d", capacity=14),
                    EdgeInput(id="e7", source="c", target="b", capacity=9),
                    EdgeInput(id="e8", source="d", target="c", capacity=7),
                    EdgeInput(id="e9", source="c", target="t", capacity=20),
                    EdgeInput(id="e10", source="d", target="t", capacity=4),
                ],
            ),
        ),
        ExampleGraph(
            id="urban_transport",
            title="Réseau de transport urbain",
            description=(
                "Un réseau plus interprétable en logistique, avec hubs "
                "intermédiaires et plusieurs goulets d'étranglement."
            ),
            graph=GraphInput(
                source="depot",
                sink="centre",
                nodes=[
                    NodeInput(id="depot", label="Dépôt", x=80, y=220),
                    NodeInput(id="hub_nord", label="Hub Nord", x=250, y=80),
                    NodeInput(id="hub_sud", label="Hub Sud", x=250, y=360),
                    NodeInput(id="tri_est", label="Tri Est", x=450, y=120),
                    NodeInput(id="tri_ouest", label="Tri Ouest", x=450, y=320),
                    NodeInput(id="centre", label="Centre", x=680, y=220),
                ],
                edges=[
                    EdgeInput(id="u1", source="depot", target="hub_nord", capacity=18),
                    EdgeInput(id="u2", source="depot", target="hub_sud", capacity=11),
                    EdgeInput(id="u3", source="hub_nord", target="tri_est", capacity=9),
                    EdgeInput(id="u4", source="hub_nord", target="tri_ouest", capacity=7),
                    EdgeInput(id="u5", source="hub_sud", target="tri_est", capacity=8),
                    EdgeInput(id="u6", source="hub_sud", target="tri_ouest", capacity=10),
                    EdgeInput(id="u7", source="tri_est", target="centre", capacity=13),
                    EdgeInput(id="u8", source="tri_ouest", target="centre", capacity=12),
                    EdgeInput(id="u9", source="tri_est", target="tri_ouest", capacity=4),
                ],
            ),
        ),
    ]
