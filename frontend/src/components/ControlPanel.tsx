import type { ExampleGraph, SimulationMode, SimulationResult } from "../types";

type ControlPanelProps = {
  examples: ExampleGraph[];
  selectedExampleId: string;
  onExampleSelect: (id: string) => void;
  onRun: (mode: SimulationMode) => void;
  onReset: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStepChange: (index: number) => void;
  simulation: SimulationResult | null;
  currentStepIndex: number;
  loading: boolean;
  error: string | null;
};

export function ControlPanel({
  examples,
  selectedExampleId,
  onExampleSelect,
  onRun,
  onReset,
  onPrevious,
  onNext,
  onStepChange,
  simulation,
  currentStepIndex,
  loading,
  error,
}: ControlPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Pilotage</p>
          <h2>Simulation</h2>
        </div>
      </div>

      <div className="stack">
        <label>
          <span>Exemples préchargés</span>
          <select
            value={selectedExampleId}
            onChange={(event) => onExampleSelect(event.target.value)}
          >
            {examples.map((example) => (
              <option key={example.id} value={example.id}>
                {example.title}
              </option>
            ))}
          </select>
        </label>

        <div className="button-row">
          <button className="primary-button" onClick={() => onRun("step")} disabled={loading}>
            Exécution pas à pas
          </button>
          <button className="secondary-button" onClick={() => onRun("full")} disabled={loading}>
            Exécution complète
          </button>
          <button className="ghost-button" onClick={onReset} disabled={loading}>
            Réinitialiser le graphe
          </button>
        </div>

        {simulation ? (
          <>
            <div className="step-nav">
              <button className="ghost-button" onClick={onPrevious}>
                Précédent
              </button>
              <button className="ghost-button" onClick={onNext}>
                Suivant
              </button>
            </div>

            <label>
              <span>
                Etape {currentStepIndex + 1} / {simulation.steps.length}
              </span>
              <input
                type="range"
                min={0}
                max={simulation.steps.length - 1}
                value={currentStepIndex}
                onChange={(event) => onStepChange(Number(event.target.value))}
              />
            </label>

            <div className="kpi-highlight">
              <span>Flot maximum</span>
              <strong>{simulation.maximum_flow.toFixed(2)}</strong>
            </div>
          </>
        ) : (
          <p className="muted">
            Lancez l’algorithme pour afficher les pushes, relabels, hauteurs et excès.
          </p>
        )}

        {error ? <div className="error-banner">{error}</div> : null}
      </div>
    </section>
  );
}
