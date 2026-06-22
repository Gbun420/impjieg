import { buildMatchScoreDeps, matchScoreWithDeps } from "./logic";

export async function POST(request: Request) {
  return matchScoreWithDeps(request, buildMatchScoreDeps());
}
