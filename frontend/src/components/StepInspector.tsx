import type { AlgorithmStep } from "../types";

type StepInspectorProps = {
  step: AlgorithmStep | null;
};

export function StepInspector({ step }: StepInspectorProps) {
  if (!step) {
    return (
      <section className="panel panel-scroll">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Analyse</p>
            <h2>Etat courant</h2>
          </div>
        </div>
        <p className="muted">
          Aucun etat disponible pour l’instant. Executez la simulation pour explorer chaque operation.
        </p>
      </section>
    );
  }

  return (
    <section className="panel panel-scroll">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Analyse</p>
          <h2>Etat courant</h2>
        </div>
        <div className={`action-tag action-${step.action}`}>Etape {step.index + 1}</div>
      </div>

      <div className="stack">
        <div className="metric-grid">
          <article className="metric-card">
            <span>Action</span>
            <strong>{step.action}</strong>
          </article>
          <article className="metric-card">
            <span>Sommet actif</span>
            <strong>{step.active_vertex ?? "-"}</strong>
          </article>
          <article className="metric-card">
            <span>Flot cumule</span>
            <strong>{step.total_flow.toFixed(2)}</strong>
          </article>
        </div>

        <div className="step-callout">
          <p>{step.message}</p>
          <div className="chip-row">
            {step.active_vertices.map((vertexId) => (
              <span key={vertexId} className="chip">
                {vertexId}
              </span>
            ))}
            {step.active_vertices.length === 0 ? (
              <span className="chip muted-chip">Aucun sommet actif</span>
            ) : null}
          </div>
        </div>

        <div className="detail-grid">
          <article className="detail-card">
            <h3>Operation</h3>
            <dl>
              <div>
                <dt>Arc</dt>
                <dd>{step.details.edge_id ?? "-"}</dd>
              </div>
              <div>
                <dt>De</dt>
                <dd>{step.details.from_node ?? "-"}</dd>
              </div>
              <div>
                <dt>Vers</dt>
                <dd>{step.details.to_node ?? "-"}</dd>
              </div>
              <div>
                <dt>Push</dt>
                <dd>
                  {step.details.pushed_amount != null
                    ? step.details.pushed_amount.toFixed(2)
                    : "-"}
                </dd>
              </div>
              <div>
                <dt>Hauteur avant</dt>
                <dd>{step.details.previous_height ?? "-"}</dd>
              </div>
              <div>
                <dt>Hauteur apres</dt>
                <dd>{step.details.new_height ?? "-"}</dd>
              </div>
            </dl>
          </article>

          <article className="detail-card">
            <h3>Sommets</h3>
            <div className="mini-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sommet</th>
                    <th>h(v)</th>
                    <th>e(v)</th>
                    <th>Etat</th>
                  </tr>
                </thead>
                <tbody>
                  {step.vertices.map((vertex) => (
                    <tr key={vertex.id}>
                      <td>{vertex.label}</td>
                      <td>{vertex.height}</td>
                      <td>{vertex.excess.toFixed(2)}</td>
                      <td>
                        {vertex.is_source
                          ? "source"
                          : vertex.is_sink
                            ? "puits"
                            : vertex.is_active
                              ? "actif"
                              : "normal"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
