import axios from "axios";
import type { ExampleGraph, GraphDefinition, SimulationResult } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export async function fetchExamples(): Promise<ExampleGraph[]> {
  const response = await api.get<ExampleGraph[]>("/examples");
  return response.data;
}

export async function runSimulation(
  graph: GraphDefinition,
): Promise<SimulationResult> {
  const response = await api.post<SimulationResult>("/max-flow/run", { graph });
  return response.data;
}
