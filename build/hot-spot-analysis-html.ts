export const hotSpotAnalysisHtml = (firstIssueDate, summary, hotspots) => `<!DOCTYPE html>
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
      border-left: 4px solid transparent;
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
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 4px;
    }
    #active-filter > div:first-child {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    tr[data-bug-count] {
      transition: filter 0.2s;
    }
    tr[data-bug-count]:hover {
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
    .pr-link {
      display: inline-block;
      padding: 2px 6px;
      margin: 2px;
      border-radius: 4px;
      background: #e8f5e9;
      color: #2e7d32;
      text-decoration: none;
      font-size: 14px;
    }
    .pr-link:hover {
      background: #c8e6c9;
    }
    .pull-requests {
      font-family: monospace;
    }
    #pr-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .pr-list-header {
      font-weight: 500;
      color: #1976d2;
      margin-bottom: 4px;
    }
    .no-prs {
      color: #666;
      font-style: italic;
    }
    #pr-list .pr-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #fff;
      border-radius: 4px;
      text-decoration: none;
      color: #2e7d32;
    }
    #pr-list .pr-link:hover {
      background: #f5f5f5;
    }
    tr[data-bug-count="1"] .file-name { border-color: #ffcdd2; }
    tr[data-bug-count="2"] .file-name { border-color: #ef9a9a; }
    tr[data-bug-count="3"] .file-name { border-color: #e57373; }
    tr[data-bug-count="4"] .file-name { border-color: #ef5350; }
    tr[data-bug-count="5"] .file-name { border-color: #f44336; }
    tr[data-bug-count="many"] .file-name { border-color: #d32f2f; }
  </style>
  <script>
    function filterByIssue(issueNumber) {
      const rows = document.querySelectorAll('tbody tr');
      const filterPanel = document.getElementById('active-filter');
      const filterText = document.getElementById('filter-text');
      const issueLink = document.getElementById('issue-link');
      const prList = document.getElementById('pr-list');

      // Get all PRs for this issue from the data attributes
      const allPrs = new Set();
      rows.forEach(row => {
        const issues = JSON.parse(row.getAttribute('data-issues') || '[]');
        if (issues.includes(parseInt(issueNumber))) {
          const prs = JSON.parse(row.getAttribute('data-prs') || '[]');
          prs.forEach(pr => allPrs.add(JSON.stringify(pr))); // Use stringify to dedupe objects
        }
      });

      // Convert back to objects and sort by PR number
      const uniquePrs = Array.from(allPrs)
        .map(pr => JSON.parse(pr))
        .sort((a, b) => a.number - b.number);

      // Show/hide rows
      rows.forEach(row => {
        const issues = JSON.parse(row.getAttribute('data-issues') || '[]');
        row.style.display = !issues.includes(parseInt(issueNumber)) ? 'none' : '';
      });

      // Update filter panel
      filterPanel.style.display = 'flex';
      filterText.textContent = \`Showing files affected by issue #\${issueNumber}\`;
      issueLink.href = \`https://github.com/Outblock/FRW-Extension/issues/\${issueNumber}\`;

      // Update PR list
      prList.innerHTML = uniquePrs.length > 0
        ? \`<div class="pr-list-header">Related Pull Requests:</div>\${
            uniquePrs.map(pr => \`
              <a href="\${pr.url}" target="_blank" class="pr-link" title="\${pr.title}">
                #\${pr.number}
                <svg width="12" height="12" viewBox="0 0 16 16" style="vertical-align: middle;">
                  <path fill="currentColor" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
                </svg>
                \${pr.title}
              </a>
            \`).join('')
          }\`
        : '<div class="no-prs">No pull requests found</div>';
    }

    function clearFilter() {
      const rows = document.querySelectorAll('tbody tr');
      const filterPanel = document.getElementById('active-filter');
      const prList = document.getElementById('pr-list');

      rows.forEach(row => row.style.display = '');
      filterPanel.style.display = 'none';
      prList.innerHTML = '';
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
        The color intensity indicates the number of high priority issues affecting each file.
        Click on an issue number to filter the view.
      </div>
    </div>

    <div id="active-filter">
      <div>
        <span id="filter-text"></span>
        <a id="issue-link" href="#" target="_blank">View Issue</a>
      </div>
      <div id="pr-list"></div>
      <button id="clear-filter" onclick="clearFilter()">Clear Filter</button>
    </div>

    <table>
      <thead>
        <tr>
          <th class="file-name">File</th>
          <th class="issue-count">Issues</th>
          <th>Related Issues</th>
          <th>Pull Requests</th>
        </tr>
      </thead>
      <tbody>
        ${hotspots
          .map(
            (hotspot) => `
          <tr data-issues='${JSON.stringify(hotspot.issues.map((i) => i.number))}'
              data-prs='${JSON.stringify(
                hotspot.issues.flatMap((i) =>
                  i.pullRequests.map((pr) => ({
                    number: pr.number,
                    title: pr.title,
                    url: pr.url,
                  }))
                )
              )}'
              data-bug-count="${hotspot.bugCount > 5 ? 'many' : hotspot.bugCount}"
          >
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
            <td class="pull-requests">
              ${hotspot.issues
                .flatMap((issue) => {
                  return issue.pullRequests.map(
                    (pr) => `
                    <a href="${pr.url}" target="_blank" class="pr-link" title="${pr.title}">
                      #${pr.number}
                      <svg width="12" height="12" viewBox="0 0 16 16" style="vertical-align: middle;">
                        <path fill="currentColor" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
                      </svg>
                    </a>
                  `
                  );
                })
                .join(' ')}
            </td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
