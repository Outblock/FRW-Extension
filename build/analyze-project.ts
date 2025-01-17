import * as fs from 'fs';
import * as path from 'path';

interface ProjectItem {
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

interface PullRequest {
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

interface Issue {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  labels: Array<{
    name: string;
  }>;
}

interface HighPriorityChange {
  issue: {
    number: number;
    title: string;
    state: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    isArchived: boolean;
    priority: string;
  };
  pullRequests: Array<{
    number: number;
    title: string;
    state: string;
    url: string;
    createdAt: string;
    mergedAt: string | null;
    changes: Array<{
      path: string;
      additions: number;
      deletions: number;
      changes: number;
    }>;
  }>;
}

interface Summary {
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

interface RepoSummary {
  repoName: string;
  summary: Summary;
  firstIssueDate: Date;
}

function generateHeatmapHtml(highPriorityChanges: HighPriorityChange[], summary: Summary): string {
  // Process data for the heatmap
  const fileMap = new Map<
    string,
    {
      bugCount: number;
      lastOccurrence: string;
      issues: Map<number, { priority: string; url: string }>;
    }
  >();

  // Process each high priority issue
  highPriorityChanges.forEach(({ issue, pullRequests }) => {
    let hasFiles = false;
    pullRequests.forEach((pr) => {
      pr.changes.forEach((change) => {
        hasFiles = true;
        const file = change.path;
        const existing = fileMap.get(file) || {
          bugCount: 0,
          lastOccurrence: issue.createdAt,
          issues: new Map(),
        };

        existing.bugCount += 1;
        existing.lastOccurrence =
          new Date(existing.lastOccurrence) > new Date(issue.createdAt)
            ? existing.lastOccurrence
            : issue.createdAt;
        existing.issues.set(issue.number, { priority: issue.priority, url: issue.url });

        fileMap.set(file, existing);
      });
    });

    // If no files were found for this issue, add it to "unknown source file"
    if (!hasFiles) {
      const unknown = fileMap.get('unknown source file') || {
        bugCount: 0,
        lastOccurrence: issue.createdAt,
        issues: new Map(),
      };
      unknown.bugCount += 1;
      unknown.lastOccurrence =
        new Date(unknown.lastOccurrence) > new Date(issue.createdAt)
          ? unknown.lastOccurrence
          : issue.createdAt;
      unknown.issues.set(issue.number, { priority: issue.priority, url: issue.url });
      fileMap.set('unknown source file', unknown);
    }
  });

  // Convert to array and sort by file path
  const hotspots = Array.from(fileMap.entries())
    .map(([file, data]) => ({
      file,
      bugCount: data.bugCount,
      lastOccurrence: data.lastOccurrence,
      issues: Array.from(data.issues.entries()).map(([number, info]) => ({
        number,
        priority: info.priority,
        url: info.url,
      })),
    }))
    .sort((a, b) => a.file.localeCompare(b.file));

  // Calculate max bug count for color scaling
  const maxBugCount = Math.max(...hotspots.map((d) => d.bugCount));

  // Generate the HTML
  const firstIssueDate =
    highPriorityChanges.length > 0
      ? new Date(Math.min(...highPriorityChanges.map((c) => new Date(c.issue.createdAt).getTime())))
      : new Date();

  return `<!DOCTYPE html>
<html>
<head>
  <title>Bug Hotspots Analysis</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .alert {
      background: #e3f2fd;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .alert-icon {
      color: #1976d2;
      font-size: 24px;
    }
    .hotspot {
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 8px;
      transition: filter 0.2s;
    }
    .hotspot:hover {
      filter: brightness(0.95);
    }
    .file-name {
      font-family: monospace;
      font-size: 14px;
      width: 30%;
    }
    .issue-count {
      width: 100px;
    }
    .issue-tag {
      display: inline-block;
      padding: 2px 6px;
      margin: 2px;
      border-radius: 4px;
      background: #e3f2fd;
      cursor: pointer;
    }
    .issue-tag:hover {
      background: #bbdefb;
    }
    .github-link {
      display: inline-block;
      margin-left: 4px;
      color: #666;
      opacity: 0.7;
      vertical-align: middle;
    }
    .github-link:hover {
      opacity: 1;
    }
    .filtered-row {
      display: none;
    }
    #active-filter {
      display: none;
      margin: 16px 0;
      padding: 8px 16px;
      background: #e3f2fd;
      border-radius: 4px;
      align-items: center;
      justify-content: space-between;
    }
    #filter-text {
      font-weight: 500;
    }
    #clear-filter {
      padding: 4px 8px;
      background: #bbdefb;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    #clear-filter:hover {
      background: #90caf9;
    }
    tr[data-intensity] {
      transition: filter 0.2s;
    }
    tr[data-intensity]:hover {
      filter: brightness(0.95);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-item {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 8px;
    }
    .summary-label {
      font-size: 14px;
      color: #666;
    }
    h1 {
      margin: 0 0 24px 0;
      color: #1976d2;
    }
    .date-range {
      color: #666;
      font-size: 14px;
      margin: 0 0 20px;
      text-align: center;
    }
  </style>
  <script>
    function filterByIssue(issueNumber) {
      const rows = document.querySelectorAll('tbody tr');
      const filterPanel = document.getElementById('active-filter');
      const filterText = document.getElementById('filter-text');
      const issueLink = document.getElementById('issue-link');

      rows.forEach(row => {
        const issues = JSON.parse(row.getAttribute('data-issues') || '[]');
        if (!issues.includes(parseInt(issueNumber))) {
          row.style.display = 'none';
        } else {
          row.style.display = '';
        }
      });

      filterPanel.style.display = 'flex';
      filterText.textContent = \`Showing files affected by issue #\${issueNumber}\`;
      issueLink.href = \`https://github.com/Outblock/FRW-Extension/issues/\${issueNumber}\`;
    }

    function clearFilter() {
      const rows = document.querySelectorAll('tbody tr');
      const filterPanel = document.getElementById('active-filter');

      rows.forEach(row => row.style.display = '');
      filterPanel.style.display = 'none';
    }
  </script>
</head>
<body>
  <div class="card">
    <h1>Bug Hotspots Analysis</h1>
    <p class="date-range">Analyzing issues from ${firstIssueDate.toLocaleDateString()} to present</p>

    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-value">${summary.totalHighPriorityIssues}</div>
        <div class="summary-label">High Priority Issues</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.activeIssues}</div>
        <div class="summary-label">Active Issues</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.closedIssues}</div>
        <div class="summary-label">Closed Issues</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.archivedIssues}</div>
        <div class="summary-label">Archived Issues</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.totalPRs}</div>
        <div class="summary-label">Related PRs</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.totalFilesChanged}</div>
        <div class="summary-label">Files Changed</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.totalChanges}</div>
        <div class="summary-label">Total Changes</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.priorities.p0}</div>
        <div class="summary-label">P0-Critical</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.priorities.p1}</div>
        <div class="summary-label">P1-High</div>
      </div>
    </div>

    <div class="alert">
      <div class="alert-icon">ℹ️</div>
      <div>
        Showing bug frequency heatmap across ${hotspots.length} files.
        The intensity indicates the number of high priority issues affecting each file.
        Click on an issue number to filter the view.
      </div>
    </div>

    <div id="active-filter">
      <span id="filter-text"></span>
      <div>
        <a id="issue-link" href="#" target="_blank">View Issue</a>
        <button id="clear-filter" onclick="clearFilter()">Clear Filter</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="file-name">File</th>
          <th class="issue-count">Issues</th>
          <th>Related Issues</th>
        </tr>
      </thead>
      <tbody>
        ${hotspots
          .map(
            (hotspot) => `
          <tr data-issues='${JSON.stringify(hotspot.issues.map((i) => i.number))}'>
            <td class="file-name">${hotspot.file}</td>
            <td class="issue-count">${hotspot.bugCount}</td>
            <td class="issues">
              ${hotspot.issues
                .map(
                  (issue) => `
                <span class="issue-tag ${issue.priority.toLowerCase()}" onclick="filterByIssue(${issue.number})">
                  #${issue.number}
                  <a href="${issue.url}" target="_blank" onclick="event.stopPropagation()">
                    <svg width="12" height="12" viewBox="0 0 16 16" style="vertical-align: middle;">
                      <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                  </a>
                </span>`
                )
                .join('')}
            </td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

function generateIndexHtml(repoSummaries: RepoSummary[]): string {
  // Find overall date range
  const firstIssueDate =
    repoSummaries.length > 0
      ? new Date(Math.min(...repoSummaries.map((s) => s.firstIssueDate.getTime())))
      : new Date();

  return `<!DOCTYPE html>
<html>
<head>
  <title>Bug Reports Index</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1976d2;
      text-align: center;
      margin-top: 0;
    }
    .repo-grid {
      display: grid;
      gap: 20px;
      margin-top: 20px;
    }
    .repo-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #e0e0e0;
    }
    .repo-card h2 {
      margin-top: 0;
      color: #1976d2;
    }
    .repo-card h2 a {
      color: inherit;
      text-decoration: none;
    }
    .repo-card h2 a:hover {
      text-decoration: underline;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }
    .stat {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
      margin-top: 5px;
    }
    .links {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }
    .links a {
      color: #1976d2;
      text-decoration: none;
      font-size: 14px;
    }
    .links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Bug Reports Index</h1>
    <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
    <p style="text-align: center; color: #666;">Analyzing issues from ${firstIssueDate.toLocaleDateString()} to present</p>

    <div class="repo-grid">
      ${repoSummaries
        .map(({ repoName, summary }) => {
          const safeRepoName = repoName.replace('/', '-');
          return `
        <div class="repo-card">
          <h2><a href="./${safeRepoName}-bug-heatmap.html">${repoName}</a></h2>
          <div class="stats">
            <div class="stat">
              <div class="stat-label">Total Issues</div>
              <div class="stat-value">${summary.totalHighPriorityIssues}</div>
            </div>
            <div class="stat">
              <div class="stat-label">P0 Critical</div>
              <div class="stat-value">${summary.priorities.p0}</div>
            </div>
            <div class="stat">
              <div class="stat-label">P1 High</div>
              <div class="stat-value">${summary.priorities.p1}</div>
            </div>
          </div>
          <div class="links">
            <a href="./${safeRepoName}-bug-heatmap.html">View Heatmap</a> |
            <a href="./${safeRepoName}-high-priority-report.md">View Report</a>
          </div>
        </div>`;
        })
        .join('\n')}
    </div>
  </div>
</body>
</html>`;
}

async function analyzeData() {
  // Read all data files
  const projectItemsData = JSON.parse(
    fs.readFileSync(path.join('.github-data', 'project-items.json'), 'utf8')
  );

  const projectItems = projectItemsData.data.organization.projectV2.items.nodes as ProjectItem[];
  console.log(`Found ${projectItems.length} project items`);

  // Group items by repository
  const repoItems = new Map<string, ProjectItem[]>();

  projectItems.forEach((item) => {
    if (!item.content?.url) return;

    // Extract repo from URL, e.g., "https://github.com/Outblock/FRW-Extension/issues/123"
    const repoMatch = item.content.url.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!repoMatch) return;

    const repoName = repoMatch[1];
    if (!repoItems.has(repoName)) {
      repoItems.set(repoName, []);
    }
    repoItems.get(repoName)?.push(item);
  });

  // Collect summaries for index
  const repoSummaries: RepoSummary[] = [];

  // Process each repository
  for (const [repoName, items] of repoItems) {
    console.log(`\nProcessing repository: ${repoName}`);

    // Get high priority items for this repo
    const highPriorityItems = items.filter((item) => {
      if (!item.content) {
        console.log('Found item without content:', JSON.stringify(item, null, 2));
        return false;
      }

      if (!item.fieldValues?.nodes) {
        console.log(`Item ${item.content.number} has no field values`);
        return false;
      }

      const priorityField = item.fieldValues.nodes.find(
        (field) => field?.field?.name === 'Priority'
      );

      if (!priorityField) {
        console.log(`Item ${item.content.number} has no priority field`);
        return false;
      }

      const priority = priorityField.name;
      const status = item.isArchived ? '(archived)' : '(active)';
      console.log(`Item ${item.content.number} ${status} has priority: ${priority}`);

      return priority === 'P0-Critical' || priority === 'P1-High';
    });

    console.log(`\nSummary for ${repoName}:`);
    console.log(`Total project items: ${items.length}`);
    console.log(`High priority items: ${highPriorityItems.length}`);
    console.log(`- Archived: ${highPriorityItems.filter((item) => item.isArchived).length}`);
    console.log(`- Active: ${highPriorityItems.filter((item) => !item.isArchived).length}`);

    // Get PRs for this repo
    const repoShortName = repoName.split('/')[1];
    const pullRequests = JSON.parse(
      fs.readFileSync(path.join('.github-data', 'pull-requests.json'), 'utf8')
    ) as PullRequest[];

    // Filter PRs to only include those from the current repo
    const repoPRs = pullRequests.filter((pr) => {
      return pr.url.includes(repoName);
    });

    console.log(`Found ${repoPRs.length} PRs for ${repoName}`);

    // Process PRs and generate report as before...
    const issuePRMap = new Map<number, PullRequest[]>();
    for (const pr of repoPRs) {
      // Get issue numbers from various sources
      const issueNumbers = new Set<number>();

      // From branch name - format: "321-some-title"
      const branchMatch = pr.headRefName.match(/^(\d+)-/);
      if (branchMatch) {
        const num = parseInt(branchMatch[1]);
        if (num > 0 && num !== 123) {
          issueNumbers.add(num);
          console.log(`Found issue number ${num} in branch name: ${pr.headRefName}`);
        }
      }

      // From PR title
      const titleRefs = [
        ...(pr.title.match(/#(\d+)/g) || []).map((ref) => parseInt(ref.slice(1))),
        ...(pr.title.match(/[Ff]ix(?:es)?\s+#(\d+)/g) || []).map((ref) =>
          parseInt(ref.match(/\d+/)?.[0] || '0')
        ),
      ];
      titleRefs.forEach((num) => {
        if (num !== 123) issueNumbers.add(num); // Ignore template number
      });

      // From PR body
      const bodyRefs = [
        ...(pr.body?.match(/#(\d+)/g) || []).map((ref) => parseInt(ref.slice(1))),
        ...(
          pr.body?.match(
            /(?:fix|fixes|fixed|close|closes|closed|resolve|resolves|resolved)\s+#(\d+)/gi
          ) || []
        ).map((ref) => parseInt(ref.match(/\d+/)?.[0] || '0')),
      ];
      bodyRefs.forEach((num) => {
        if (num !== 123) issueNumbers.add(num); // Ignore template number
      });

      // From first commit message
      if (pr.firstCommitMessage) {
        const commitRefs = [
          ...(pr.firstCommitMessage.match(/#(\d+)/g) || []).map((ref) => parseInt(ref.slice(1))),
          ...(
            pr.firstCommitMessage.match(
              /(?:fix|fixes|fixed|close|closes|closed|resolve|resolves|resolved)\s+#(\d+)/gi
            ) || []
          ).map((ref) => parseInt(ref.match(/\d+/)?.[0] || '0')),
        ];
        commitRefs.forEach((num) => {
          if (num !== 123) issueNumbers.add(num); // Ignore template number
        });
      }

      // Remove invalid numbers
      issueNumbers.delete(0);
      issueNumbers.delete(pr.number); // Remove self-references

      // Debug output for PR linking
      if (issueNumbers.size > 0) {
        console.log(
          `PR #${pr.number} (${pr.headRefName}) links to issues:`,
          Array.from(issueNumbers)
        );
      } else {
        console.log(`PR #${pr.number} has no valid issue links`);
      }

      // Add PR to each referenced issue
      for (const issueNumber of issueNumbers) {
        if (!issuePRMap.has(issueNumber)) {
          issuePRMap.set(issueNumber, []);
        }
        issuePRMap.get(issueNumber)?.push(pr);
      }
    }

    console.log(`Found links to ${issuePRMap.size} issues in PRs`);

    const highPriorityChanges: HighPriorityChange[] = highPriorityItems
      .filter((item) => item.content && item.fieldValues?.nodes)
      .map((item) => ({
        issue: {
          number: item.content.number,
          title: item.content.title,
          state: item.content.state,
          url: item.content.url,
          createdAt: item.content.createdAt,
          updatedAt: item.content.updatedAt,
          isArchived: item.isArchived,
          priority:
            item.fieldValues.nodes.find((field) => field?.field?.name === 'Priority' && field.name)
              ?.name || 'Unknown',
        },
        pullRequests: (issuePRMap.get(item.content.number) || [])
          .filter((pr) => pr && pr.files) // Ensure PR has required data
          .map((pr) => ({
            number: pr.number,
            title: pr.title,
            state: pr.state,
            url: pr.url,
            createdAt: pr.createdAt,
            mergedAt: pr.mergedAt,
            changes: pr.files.map((file) => ({
              path: file.path,
              additions: file.additions,
              deletions: file.deletions,
              changes: file.changes,
            })),
          })),
      }));

    // Skip if no high priority issues
    if (highPriorityChanges.length === 0) {
      console.log(`No high priority issues found for ${repoName}, skipping report generation`);
      continue;
    }

    const firstIssueDate = new Date(
      Math.min(...highPriorityChanges.map((c) => new Date(c.issue.createdAt).getTime()))
    );

    const summary = {
      totalHighPriorityIssues: highPriorityChanges.length,
      activeIssues: highPriorityChanges.filter((item) => item.issue.state === 'OPEN').length,
      closedIssues: highPriorityChanges.filter((item) => item.issue.state === 'CLOSED').length,
      archivedIssues: highPriorityChanges.filter((item) => item.issue.isArchived).length,
      totalPRs: highPriorityChanges.reduce((sum, item) => sum + item.pullRequests.length, 0),
      totalFilesChanged: highPriorityChanges.reduce(
        (sum, item) =>
          sum +
          item.pullRequests.reduce(
            (prSum, pr) => prSum + new Set(pr.changes.map((c) => c.path)).size,
            0
          ),
        0
      ),
      totalChanges: highPriorityChanges.reduce(
        (sum, item) =>
          sum +
          item.pullRequests.reduce(
            (prSum, pr) =>
              prSum + pr.changes.reduce((cSum, c) => cSum + (c.additions + c.deletions), 0),
            0
          ),
        0
      ),
      priorities: {
        p0: highPriorityChanges.filter((item) => item.issue.priority === 'P0-Critical').length,
        p1: highPriorityChanges.filter((item) => item.issue.priority === 'P1-High').length,
      },
    };

    // Save results with repo name in filename
    const safeRepoName = repoName.replace('/', '-');
    fs.writeFileSync(
      `.github-data/${safeRepoName}-high-priority-changes.json`,
      JSON.stringify({ summary, changes: highPriorityChanges }, null, 2)
    );

    const report = generateMarkdownReport(summary, highPriorityChanges);
    fs.writeFileSync(`.github-data/${safeRepoName}-high-priority-report.md`, report);

    const heatmapHtml = generateHeatmapHtml(highPriorityChanges, summary);
    fs.writeFileSync(`.github-data/${safeRepoName}-bug-heatmap.html`, heatmapHtml);

    // Only copy to UI folder if it's the FRW-Extension repo
    if (repoName === 'Outblock/FRW-Extension') {
      fs.writeFileSync(
        'src/ui/views/dev/high-priority-changes.json',
        JSON.stringify({ summary, changes: highPriorityChanges }, null, 2)
      );
    }

    console.log(`\nAnalysis complete for ${repoName}. Results saved in:`);
    console.log(`- ${safeRepoName}-high-priority-changes.json (raw data)`);
    console.log(`- ${safeRepoName}-high-priority-report.md (formatted report)`);
    console.log(`- ${safeRepoName}-bug-heatmap.html (interactive heatmap)`);

    // Add to summaries
    repoSummaries.push({ repoName, summary, firstIssueDate });
  }

  // Only generate index if there are repos with high priority issues
  if (repoSummaries.length > 0) {
    const indexHtml = generateIndexHtml(repoSummaries);
    fs.writeFileSync('.github-data/index.html', indexHtml);
    console.log('- index.html (repository index)');
  } else {
    console.log('No repositories with high priority issues found, skipping index generation');
  }
}

function generateMarkdownReport(summary: Summary, changes: HighPriorityChange[]): string {
  const firstIssueDate =
    changes.length > 0
      ? new Date(Math.min(...changes.map((c) => new Date(c.issue.createdAt).getTime())))
      : new Date();

  return `# High Priority Changes Report
Generated on ${new Date().toLocaleString()}
Analyzing issues from ${firstIssueDate.toLocaleDateString()} to present

## Summary
- Total high priority issues: ${summary.totalHighPriorityIssues}
- Active issues: ${summary.activeIssues}
- Closed issues: ${summary.closedIssues}
- Archived issues: ${summary.archivedIssues}
- Total related PRs: ${summary.totalPRs}
- Total files changed: ${summary.totalFilesChanged}
- Total changes: ${summary.totalChanges}

### Priority Breakdown
- P0-Critical: ${summary.priorities.p0}
- P1-High: ${summary.priorities.p1}

## Issues and Changes
${changes
  .map(
    (item) => `
### Issue #${item.issue.number} - ${item.issue.title}
- Priority: ${item.issue.priority}
- State: ${item.issue.state}
- Created: ${new Date(item.issue.createdAt).toLocaleDateString()}
- Last Updated: ${new Date(item.issue.updatedAt).toLocaleDateString()}
- Archived: ${item.issue.isArchived}
- URL: ${item.issue.url}

${
  item.pullRequests.length > 0
    ? `#### Related Pull Requests:
${item.pullRequests
  .map(
    (pr) => `
- PR [#${pr.number}](${pr.url}) - ${pr.title}
  - Created: ${new Date(pr.createdAt).toLocaleDateString()}
  - State: ${pr.state}
  ${pr.mergedAt ? `- Merged: ${new Date(pr.mergedAt).toLocaleDateString()}` : ''}

  Changed Files:
  ${pr.changes
    .map(
      (file) => `  - ${file.path}
    - Added: ${file.additions} lines
    - Deleted: ${file.deletions} lines
    - Total changes: ${file.changes}`
    )
    .join('\n  ')}`
  )
  .join('\n')}`
    : 'No linked pull requests found.'
}
`
  )
  .join('\n---\n')}`;
}

analyzeData().catch((error) => {
  console.error('Analysis failed:', error);
  process.exit(1);
});
