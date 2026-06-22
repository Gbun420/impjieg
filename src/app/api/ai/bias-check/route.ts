import { biasCheckWithDeps, buildBiasCheckDeps } from "./logic";

export async function POST(request: Request) {
  return biasCheckWithDeps(request, buildBiasCheckDeps());
}
