export interface ProjectItem {
  isArchived: boolean;
  content: {
    number: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    state: string;
    url: string;
  };
  fieldValues: {
    nodes: Array<{
      field: {
        name: string;
      };
      name: string;
    }>;
  };
}

export interface PullRequest {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  mergedAt: string | null;
  url: string;
  body: string;
  headRefName: string;
  firstCommitMessage?: string;
  files: Array<{
    path: string;
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

export interface Issue {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  url: string;
  labels?: Array<{
    name: string;
  }>;
}

export interface HighPriorityChange {
  issue: Issue & {
    isArchived: boolean;
    priority: string;
  };
  pullRequests: Array<PullRequest>;
}

export interface Summary {
  totalHighPriorityIssues: number;
  activeIssues: number;
  closedIssues: number;
  archivedIssues: number;
  totalPRs: number;
  totalFilesChanged: number;
  totalChanges: number;
  priorities: {
    p0: number;
    p1: number;
  };
}

export interface RepoSummary {
  repoName: string;
  summary: Summary;
  firstIssueDate: Date;
}

export interface HotSpot {
  file: string;
  bugCount: number;
  lastOccurrence: Date;
  issues: Array<{
    number: number;
    priority: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    state: string;
    closedAt: string | null;
    pullRequests: Array<{
      number: number;
      title: string;
      url: string;
      files: Array<{
        path: string;
        additions: number;
        deletions: number;
        changes: number;
      }>;
    }>;
  }>;
}
