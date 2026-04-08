import type { GraphDefinition, SimulationResult } from "../types";

type StatsPanelProps = {
  graph: GraphDefinition;
  simulation: SimulationResult | null;
};

export function StatsPanel({ graph, simulation }: StatsPanelProps) {
  const graphCapacity = graph.edges.reduce((total, edge) => total + edge.capacity, 0);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Statistiques</p>
          <h2>Indicateurs</h2>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Sommets</span>
          <strong>{graph.nodes.length}</strong>
        </article>
        <article className="metric-card">
          <span>Arcs</span>
          <strong>{graph.edges.length}</strong>
        </article>
        <article className="metric-card">
          <span>Capacité totale</span>
          <strong>{graphCapacity.toFixed(2)}</strong>
        </article>
      </div>

      {simulation ? (
        <div className="metric-grid">
          <article className="metric-card">
            <span>Etapes</span>
            <strong>{simulation.stats.step_count}</strong>
          </article>
          <article className="metric-card">
            <span>Push</span>
            <strong>{simulation.stats.push_count}</strong>
          </article>
          <article className="metric-card">
            <span>Relabel</span>
            <strong>{simulation.stats.relabel_count}</strong>
          </article>
          <article className="metric-card">
            <span>Push saturants</span>
            <strong>{simulation.stats.saturating_push_count}</strong>
          </article>
          <article className="metric-card">
            <span>Push non saturants</span>
            <strong>{simulation.stats.non_saturating_push_count}</strong>
          </article>
          <article className="metric-card">
            <span>Temps</span>
            <strong>{simulation.stats.elapsed_ms.toFixed(3)} ms</strong>
          </article>
        </div>
      ) : null}
    </section>
  );
}
