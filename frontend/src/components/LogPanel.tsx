import type { SimulationResult } from "../types";

type LogPanelProps = {
  simulation: SimulationResult | null;
  currentStepIndex: number;
};

export function LogPanel({ simulation, currentStepIndex }: LogPanelProps) {
  return (
    <section className="panel panel-scroll">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Trace</p>
          <h2>Journal d'exécution</h2>
        </div>
      </div>

      {simulation ? (
        <ol className="log-list">
          {simulation.execution_log.map((entry, index) => (
            <li
              key={`${entry}-${index}`}
              className={index === currentStepIndex ? "active-log-entry" : ""}
            >
              <span className="log-index">{index + 1}</span>
              <p>{entry}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">
          Le journal de simulation apparaîtra ici avec le détail des pushes et relabels.
        </p>
      )}
    </section>
  );
}
