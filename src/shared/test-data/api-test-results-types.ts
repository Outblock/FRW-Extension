export type FetchDetail = {
  url: string;
  params: Record<string, unknown>;
  requestInit?: RequestInit;
  responseData: Record<string, unknown> | Array<Record<string, unknown>> | null;
  status: number | null;
  statusText: string | null;
};

export type ApiTestResult = {
  functionName: string;
  functionGroup: string;
  functionParams?: Record<string, unknown>;
  functionResponse?: unknown;
  fetchDetails: FetchDetail[];
  timestamp?: number;
  error?: string;
};

export type ApiTestResults = Record<string, ApiTestResult[]>;
