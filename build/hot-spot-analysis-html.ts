import { type Summary, type HotSpot } from './analysis-types';

export const hotSpotAnalysisHtml = (
  firstIssueDate: Date,
  summary: Summary,
  hotspots: HotSpot[]
) => `<!DOCTYPE html>
<html>
<head>
  <title>Bug Hotspots Analysis</title>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/luxon"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
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
    .date-controls {
      display: flex;
      gap: 16px;
      align-items: center;
      margin: 16px 0;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .date-controls label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }
    .date-controls input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .chart-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .chart-title {
      font-size: 16px;
      font-weight: 500;
      color: #1976d2;
      margin-bottom: 16px;
    }
    .tabs {
      margin: 20px 0;
    }

    .tab-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .tab-button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f5f5f5;
      cursor: pointer;
    }

    .tab-button.active {
      background: #2196f3;
      color: white;
      border-color: #1976d2;
    }

    .tab-content {
      display: none;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .tab-content.active {
      display: block;
    }

    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }

    .date-range {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .date-range label {
      font-weight: 500;
    }

    .date-range input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>
  <script>
    function filterByIssue(issueNumber) {
      const rows = document.querySelectorAll('tbody tr');
      const filterPanel = document.getElementById('active-filter');
      const filterText = document.getElementById('filter-text');
      const issueLink = document.getElementById('issue-link');
      const prList = document.getElementById('pr-list');

      // Get PRs for this issue from the first matching row only
      let uniquePrs = [];
      for (const row of rows) {
        const issues = JSON.parse(row.getAttribute('data-issues') || '[]');
        if (issues.includes(parseInt(issueNumber))) {
          uniquePrs = JSON.parse(row.getAttribute('data-prs') || '[]')
            .sort((a, b) => a.number - b.number);
          break; // Only take PRs from the first matching row
        }
      }

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
        ? \`
            <div class="pr-list-header">Related Pull Requests:</div>\${
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

    // Helper to get Monday of the week for a given date
    function getMonday(date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    }

    // Helper to format date as YYYY-MM-DD
    function formatDate(date) {
      return date.toISOString().split('T')[0];
    }

    // Add helper functions for date handling
    function getDefaultDateRange() {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 84); // 12 weeks = 84 days
      return { startDate, endDate };
    }


    function processWeeklyData(issues, startDate, endDate) {
      const weeklyData = new Map();
      const currentDate = new Date(startDate);

      // Initialize all weeks in range
      while (currentDate <= endDate) {
        const weekStart = getWeekStart(currentDate);
        const weekKey = formatDate(weekStart);
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, {
            created: { p0: 0, p1: 0 },
            closed: { p0: 0, p1: 0 },
            cumulative: { created: { p0: 0, p1: 0 }, closed: { p0: 0, p1: 0 } },
          });
        }
        currentDate.setDate(currentDate.getDate() + 7);
      }

      // Process each issue
      issues.forEach((issue) => {
        const createdAt = new Date(issue.createdAt);
        const closedAt = issue.closedAt ? new Date(issue.closedAt) : null;
        const priority = issue.priority.substring(0, 2).toLowerCase();

        if (createdAt >= startDate && createdAt <= endDate) {
          const weekStart = getWeekStart(createdAt);
          const weekKey = formatDate(weekStart);
          const data = weeklyData.get(weekKey);
          if (data) {
            data.created[priority]++;
          }
        }

        if (closedAt && closedAt >= startDate && closedAt <= endDate) {
          const weekStart = getWeekStart(closedAt);
          const weekKey = formatDate(weekStart);
          const data = weeklyData.get(weekKey);
          if (data) {
            data.closed[priority]++;
          }
        }
      });

      // Calculate cumulative totals
      let cumulativeCreatedP0 = 0;
      let cumulativeCreatedP1 = 0;
      let cumulativeClosedP0 = 0;
      let cumulativeClosedP1 = 0;

      Array.from(weeklyData.keys())
        .sort()
        .forEach((weekKey) => {
          const data = weeklyData.get(weekKey);
          cumulativeCreatedP0 += data.created.p0;
          cumulativeCreatedP1 += data.created.p1;
          cumulativeClosedP0 += data.closed.p0;
          cumulativeClosedP1 += data.closed.p1;

          data.cumulative = {
            created: { p0: cumulativeCreatedP0, p1: cumulativeCreatedP1 },
            closed: { p0: cumulativeClosedP0, p1: cumulativeClosedP1 },
          };
        });

      return Array.from(weeklyData.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));
    }


    function getWeekStart(date) {
      const result = new Date(date);
      result.setDate(result.getDate() - result.getDay() + 1); // Monday
      result.setHours(0, 0, 0, 0);
      return result;
    }

    function updateCharts(startDate, endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error('Invalid date range:', { startDate, endDate });
          return;
        }

        const issueDataElement = document.getElementById('issue-data');
        if (!issueDataElement) {
          console.error('Issue data element not found');
          return;
        }

        const issues = JSON.parse(issueDataElement.textContent || '[]');
        const weeklyData = processWeeklyData(issues, start, end);

        // Update creation rate chart
        creationChart.data.datasets[0].data = weeklyData.map(d => ({ x: d.date, y: d.created.p0 }));
        creationChart.data.datasets[1].data = weeklyData.map(d => ({ x: d.date, y: d.created.p1 }));
        creationChart.update();

        // Update closure rate chart
        closureChart.data.datasets[0].data = weeklyData.map(d => ({ x: d.date, y: d.closed.p0 }));
        closureChart.data.datasets[1].data = weeklyData.map(d => ({ x: d.date, y: d.closed.p1 }));
        closureChart.update();

        // Update cumulative chart
        cumulativeChart.data.datasets[0].data = weeklyData.map(d => ({ x: d.date, y: d.cumulative.created.p0 }));
        cumulativeChart.data.datasets[1].data = weeklyData.map(d => ({ x: d.date, y: d.cumulative.closed.p0 }));
        cumulativeChart.data.datasets[2].data = weeklyData.map(d => ({ x: d.date, y: d.cumulative.created.p1 }));
        cumulativeChart.data.datasets[3].data = weeklyData.map(d => ({ x: d.date, y: d.cumulative.closed.p1 }));
        cumulativeChart.update();

      } catch (error) {
        console.error('Error updating charts:', error);
      }
    }

    function showTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
      });

      // Show selected tab
      document.getElementById(tabName + '-tab').classList.add('active');
      document.querySelector(\`.tab-button[onclick="showTab('\${tabName}')"]\`).classList.add('active');

      // Trigger chart resize if showing charts tab
      if (tabName === 'charts') {
        creationChart.resize();
        closureChart.resize();
        cumulativeChart.resize();
      }
    }

    function updateSummary(startDate, endDate) {
      const issueDataElement = document.getElementById('issue-data');
      if (!issueDataElement) return;

      const issues = JSON.parse(issueDataElement.textContent || '[]');
      const filteredIssues = issues.filter(issue => {
        const createdDate = new Date(issue.createdAt);
        return createdDate >= startDate && createdDate <= endDate;
      });

      // Update summary statistics
      const summary = {
        totalHighPriorityIssues: filteredIssues.length,
        activeIssues: filteredIssues.filter(i => i.state === 'OPEN').length,
        closedIssues: filteredIssues.filter(i => i.state === 'CLOSED').length,
        archivedIssues: filteredIssues.filter(i => i.state === 'ARCHIVED').length,
        totalPRs: new Set(filteredIssues.flatMap(i => i.pullRequests.map(pr => pr.number))).size,
        totalFilesChanged: new Set(filteredIssues.flatMap(i => i.pullRequests.flatMap(pr => pr.files.map(f => f.path)))).size,
        totalChanges: filteredIssues.reduce((sum, i) => sum + i.pullRequests.reduce((prSum, pr) =>
          prSum + pr.files.reduce((fileSum, f) => fileSum + f.additions + f.deletions, 0), 0), 0),
        priorities: {
          p0: filteredIssues.filter(i => i.priority === 'P0-Critical').length,
          p1: filteredIssues.filter(i => i.priority === 'P1-High').length
        }
      };

      // Update summary display
      Object.entries(summary).forEach(([key, value]) => {
        const element = document.querySelector(\`.summary-value[data-key="\${key}"]\`);
        if (element) {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              const subElement = document.querySelector(\`.summary-value[data-key="\${key}.\${subKey}"]\`);
              if (subElement) subElement.textContent = subValue;
            });
          } else {
            element.textContent = value;
          }
        }
      });
    }

    function getQuarterDates(offset = 0) {
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), (currentQuarter + offset) * 3, 1);
      const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
      return { start: quarterStart, end: quarterEnd };
    }

    function getLast90Days() {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return { start, end };
    }

    function updatePeriod() {
      const periodSelect = document.getElementById('period-select');
      const startDateInput = document.getElementById('start-date');
      const endDateInput = document.getElementById('end-date');

      let dates;
      switch (periodSelect.value) {
        case 'this-quarter':
          dates = getQuarterDates(0);
          break;
        case 'last-quarter':
          dates = getQuarterDates(-1);
          break;
        case 'last-90':
          dates = getLast90Days();
          break;
        case 'custom':
          // Keep current dates
          return;
      }

      startDateInput.value = formatDate(dates.start);
      endDateInput.value = formatDate(dates.end);
      updateCharts(dates.start, dates.end);
    }

    document.addEventListener('DOMContentLoaded', function() {
      // Creation rate chart (bar chart)
      creationChart = new Chart(document.getElementById('creation-chart'), {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'P0 Created',
              backgroundColor: '#ffcdd2',
              borderColor: '#d32f2f',
              borderWidth: 1,
              data: []
            },
            {
              label: 'P1 Created',
              backgroundColor: '#ffe0b2',
              borderColor: '#f57c00',
              borderWidth: 1,
              data: []
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'MMM d'
                }
              },
              title: {
                display: true,
                text: 'Week Starting'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Issues'
              }
            }
          }
        }
      });

      // Closure rate chart (bar chart)
      closureChart = new Chart(document.getElementById('closure-chart'), {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'P0 Closed',
              backgroundColor: '#c8e6c9',
              borderColor: '#388e3c',
              borderWidth: 1,
              data: []
            },
            {
              label: 'P1 Closed',
              backgroundColor: '#b3e5fc',
              borderColor: '#0288d1',
              borderWidth: 1,
              data: []
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'MMM d'
                }
              },
              title: {
                display: true,
                text: 'Week Starting'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Issues'
              }
            }
          }
        }
      });

      // Cumulative totals chart (line chart)
      cumulativeChart = new Chart(document.getElementById('cumulative-chart'), {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'P0 Created (Total)',
              borderColor: '#d32f2f',
              backgroundColor: '#ffcdd2',
              fill: false,
              data: []
            },
            {
              label: 'P0 Closed (Total)',
              borderColor: '#388e3c',
              backgroundColor: '#c8e6c9',
              fill: false,
              data: []
            },
            {
              label: 'P1 Created (Total)',
              borderColor: '#f57c00',
              backgroundColor: '#ffe0b2',
              fill: false,
              data: []
            },
            {
              label: 'P1 Closed (Total)',
              borderColor: '#0288d1',
              backgroundColor: '#b3e5fc',
              fill: false,
              data: []
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'MMM d'
                }
              },
              title: {
                display: true,
                text: 'Week Starting'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total Issues'
              }
            }
          }
        }
      });

      // Initialize with this quarter's dates
      const defaultDates = getQuarterDates(0);
      const startDateInput = document.getElementById('start-date');
      const endDateInput = document.getElementById('end-date');

      if (startDateInput && endDateInput) {
        startDateInput.value = formatDate(defaultDates.start);
        endDateInput.value = formatDate(defaultDates.end);

        // Add event listeners for date inputs
        startDateInput.addEventListener('change', function() {
          document.getElementById('period-select').value = 'custom';
          const startDate = new Date(this.value);
          const endDate = new Date(endDateInput.value);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            updateCharts(startDate, endDate);
          }
        });

        endDateInput.addEventListener('change', function() {
          document.getElementById('period-select').value = 'custom';
          const startDate = new Date(startDateInput.value);
          const endDate = new Date(this.value);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            updateCharts(startDate, endDate);
          }
        });

        // Initial chart update
        updateCharts(defaultDates.start, defaultDates.end);
      } else {
        console.error('Date input elements not found');
      }
    });
  </script>
</head>
<body>
  <div class="card">
    <h1>Bug Hotspots Analysis</h1>
    <p class="date-range">Analyzing issues from ${firstIssueDate.toLocaleDateString()} to present</p>

    <div class="container">
      <div class="date-range">
        <div>
          <label for="period-select">Period:</label>
          <select id="period-select" onchange="updatePeriod()">
            <option value="this-quarter">This Quarter</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="last-90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div>
          <label for="start-date">From:</label>
          <input type="date" id="start-date">
        </div>
        <div>
          <label for="end-date">To:</label>
          <input type="date" id="end-date">
        </div>
      </div>

      <div class="tabs">
        <div class="tab-buttons">
          <button class="tab-button active" onclick="showTab('summary')">Summary</button>
          <button class="tab-button" onclick="showTab('charts')">Trend Charts</button>
        </div>

        <div id="summary-tab" class="tab-content active">
    <div class="summary-grid">
      <div class="summary-item">
              <div class="summary-value" data-key="totalHighPriorityIssues">${summary.totalHighPriorityIssues}</div>
        <div class="summary-label">High Priority Issues</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="activeIssues">${summary.activeIssues}</div>
        <div class="summary-label">Active Issues</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="closedIssues">${summary.closedIssues}</div>
        <div class="summary-label">Closed Issues</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="archivedIssues">${summary.archivedIssues}</div>
        <div class="summary-label">Archived Issues</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="totalPRs">${summary.totalPRs}</div>
        <div class="summary-label">Related PRs</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="totalFilesChanged">${summary.totalFilesChanged}</div>
        <div class="summary-label">Files Changed</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="totalChanges">${summary.totalChanges}</div>
        <div class="summary-label">Total Changes</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="priorities.p0">${summary.priorities.p0}</div>
        <div class="summary-label">P0-Critical</div>
      </div>
      <div class="summary-item">
              <div class="summary-value" data-key="priorities.p1">${summary.priorities.p1}</div>
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
                      <span class="issue-tag ${issue.priority.toLowerCase()}" onclick="filterByIssue(${issue.number}, '${issue.url}')">
                  #${issue.number}
                        <a href="${issue.url}" class="github-link" onclick="event.stopPropagation();" target="_blank">
                          <svg height="16" width="16" viewBox="0 0 16 16">
                      <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                  </a>
                      </span>
                    `
                )
                .join('')}
            </td>
                  <td class="pull-requests">
                    ${hotspot.issues
                      .flatMap((i) => i.pullRequests)
                      .map(
                        (pr) => `
                      <a href="${pr.url}" class="pr-link" target="_blank" title="${pr.title}">
                        #${pr.number}
                      </a>
                    `
                      )
                      .join('')}
                  </td>
                </tr>
              `
          )
          .join('')}
      </tbody>
    </table>
        </div>

        <div id="charts-tab" class="tab-content">
          <div class="chart-container">
            <h3>Weekly Bug Creation Rate</h3>
            <canvas id="creation-chart"></canvas>
          </div>
          <div class="chart-container">
            <h3>Weekly Bug Closure Rate</h3>
            <canvas id="closure-chart"></canvas>
          </div>
          <div class="chart-container">
            <h3>Cumulative Bug Totals</h3>
            <canvas id="cumulative-chart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <script id="issue-data" type="application/json">
    ${JSON.stringify(
      hotspots.flatMap((h) =>
        h.issues.map((i) => ({
          number: i.number,
          priority: i.priority,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
          closedAt: i.closedAt,
          state: i.state,
          pullRequests: i.pullRequests,
          url: i.url,
        }))
      )
    )}
    </script>
  </div>
</body>
</html>`;
