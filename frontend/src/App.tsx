import { useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { fetchExamples, runSimulation } from "./api/client";
import { ControlPanel } from "./components/ControlPanel";
import { GraphCanvas } from "./components/GraphCanvas";
import { GraphEditor } from "./components/GraphEditor";
import { LogPanel } from "./components/LogPanel";
import { StatsPanel } from "./components/StatsPanel";
import { StepInspector } from "./components/StepInspector";
import type {
  ExampleGraph,
  GraphDefinition,
  SimulationMode,
  SimulationResult,
} from "./types";
import { cloneGraph, ensureNodePositions, fallbackExamples } from "./utils/graph";

function getExampleGraph(exampleList: ExampleGraph[], exampleId: string): GraphDefinition {
  const example =
    exampleList.find((candidate) => candidate.id === exampleId) ?? exampleList[0];
  return ensureNodePositions(cloneGraph(example.graph));
}

export default function App() {
  const [examples, setExamples] = useState<ExampleGraph[]>(fallbackExamples);
  const [selectedExampleId, setSelectedExampleId] = useState(fallbackExamples[0].id);
  const [baselineGraph, setBaselineGraph] = useState<GraphDefinition>(
    getExampleGraph(fallbackExamples, fallbackExamples[0].id),
  );
  const [graph, setGraph] = useState<GraphDefinition>(baselineGraph);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExamples() {
      try {
        const data = await fetchExamples();
        if (data.length === 0) {
          return;
        }

        setExamples(data);
        const initialId = data[0].id;
        const nextGraph = getExampleGraph(data, initialId);
        setSelectedExampleId(initialId);
        setBaselineGraph(nextGraph);
        setGraph(nextGraph);
      } catch {
        setError(
          "Impossible de joindre l'API pour charger les exemples. Les données locales de démonstration restent disponibles.",
        );
      }
    }

    loadExamples();
  }, []);

  const currentStep = simulation?.steps[currentStepIndex] ?? null;

  const currentExampleDescription = useMemo(() => {
    return (
      examples.find((example) => example.id === selectedExampleId)?.description ??
      fallbackExamples[0].description
    );
  }, [examples, selectedExampleId]);

  const handleStructuralGraphChange = (nextGraph: GraphDefinition) => {
    setGraph(ensureNodePositions(nextGraph));
    setSimulation(null);
    setCurrentStepIndex(0);
    setError(null);
  };

  const handleNodePositionChange = (nodeId: string, x: number, y: number) => {
    setGraph((currentGraph) => ({
      ...currentGraph,
      nodes: currentGraph.nodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node,
      ),
    }));
  };

  const handleExampleSelect = (exampleId: string) => {
    const nextGraph = getExampleGraph(examples, exampleId);
    setSelectedExampleId(exampleId);
    setBaselineGraph(nextGraph);
    setGraph(nextGraph);
    setSimulation(null);
    setCurrentStepIndex(0);
    setError(null);
  };

  const handleRun = async (mode: SimulationMode) => {
    setLoading(true);
    setError(null);
    const normalizedGraph = ensureNodePositions(graph);
    setGraph(normalizedGraph);

    try {
      const result = await runSimulation(normalizedGraph);
      setSimulation(result);
      setCurrentStepIndex(mode === "step" ? 0 : result.steps.length - 1);
    } catch (runError) {
      setSimulation(null);
      setCurrentStepIndex(0);
      setError(
        runError instanceof Error
          ? runError.message
          : "La simulation a échoué. Vérifiez la cohérence du graphe et l'état du backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGraph(cloneGraph(baselineGraph));
    setSimulation(null);
    setCurrentStepIndex(0);
    setError(null);
  };

  const handleStepChange = (nextIndex: number) => {
    if (!simulation) {
      return;
    }

    const boundedIndex = Math.min(
      Math.max(nextIndex, 0),
      simulation.steps.length - 1,
    );
    setCurrentStepIndex(boundedIndex);
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Goldberg-Tarjan / Push-Relabel</p>
          <h1>Laboratoire visuel du flot maximum</h1>
          <p className="hero-text">
            Simulation complète de l’algorithme avec API FastAPI, interface React, graphe interactif
            et inspection pas à pas des excès, hauteurs et pushes.
          </p>
        </div>
        <div className="hero-card">
          <span className="hero-label">Scénario actif</span>
          <strong>{examples.find((example) => example.id === selectedExampleId)?.title}</strong>
          <p>{currentExampleDescription}</p>
        </div>
      </header>

      <section className="main-grid">
        <div className="left-column">
          <ControlPanel
            examples={examples}
            selectedExampleId={selectedExampleId}
            onExampleSelect={handleExampleSelect}
            onRun={handleRun}
            onReset={handleReset}
            onPrevious={() => handleStepChange(currentStepIndex - 1)}
            onNext={() => handleStepChange(currentStepIndex + 1)}
            onStepChange={handleStepChange}
            simulation={simulation}
            currentStepIndex={currentStepIndex}
            loading={loading}
            error={error}
          />
          <StatsPanel graph={graph} simulation={simulation} />
          <GraphEditor graph={graph} onChange={handleStructuralGraphChange} />
        </div>

        <div className="center-column">
          <GraphCanvas
            graph={graph}
            step={currentStep}
            onNodePositionChange={handleNodePositionChange}
          />
          <StepInspector step={currentStep} />
        </div>

        <div className="right-column">
          <LogPanel simulation={simulation} currentStepIndex={currentStepIndex} />
        </div>
      </section>
    </main>
  );
}
