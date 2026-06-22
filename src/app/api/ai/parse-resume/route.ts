import { buildParseResumeDeps, parseResumeWithDeps } from "./logic";

export async function POST(request: Request) {
  return parseResumeWithDeps(request, buildParseResumeDeps());
}
