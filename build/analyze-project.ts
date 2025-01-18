import * as fs from 'fs';
import * as path from 'path';

import type {
  HighPriorityChange,
  Summary,
  RepoSummary,
  ProjectItem,
  PullRequest,
} from './analysis-types';
import { bugReportsIndexHtml } from './bug-reports-index-html';
import { hotSpotAnalysisHtml } from './hot-spot-analysis-html';

function generateHeatmapHtml(highPriorityChanges: HighPriorityChange[], summary: Summary): string {
  // Process data for the heatmap
  const fileMap = new Map<
    string,
    {
      bugCount: number;
      lastOccurrence: string;
      issues: Map<number, { priority: string; url: string; pullRequests: PullRequest[] }>;
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
        existing.issues.set(issue.number, {
          priority: issue.priority,
          url: issue.url,
          pullRequests,
        });

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
      unknown.issues.set(issue.number, { priority: issue.priority, url: issue.url, pullRequests });
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
        pullRequests: info.pullRequests,
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

  return hotSpotAnalysisHtml(firstIssueDate, summary, hotspots);
}

function generateIndexHtml(repoSummaries: RepoSummary[]): string {
  // Find overall date range
  const firstIssueDate =
    repoSummaries.length > 0
      ? new Date(Math.min(...repoSummaries.map((s) => s.firstIssueDate.getTime())))
      : new Date();

  return bugReportsIndexHtml(firstIssueDate, repoSummaries);
}

async function analyzeData() {
  // Read repositories data
  const reposData = JSON.parse(
    fs.readFileSync(path.join('.github-data', 'repositories.json'), 'utf8')
  );
  const activeRepos = reposData.data.organization.repositories.nodes
    .filter((repo: any) => !repo.isArchived && repo.name.startsWith('FRW'))
    .map((repo: any) => repo.nameWithOwner);

  console.log('\nFound FRW repositories:');
  activeRepos.forEach((repo) => console.log(`- ${repo}`));
  console.log('');

  // Read project items data
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
  for (const repoName of activeRepos) {
    console.log(`\nProcessing repository: ${repoName}`);

    // Get items for this repo
    const items = repoItems.get(repoName) || [];

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
    const safeRepoName = repoName.replace('/', '-');

    try {
      // Get PRs for this repo
      const pullRequests = JSON.parse(
        fs.readFileSync(path.join('.github-data', `${safeRepoName}-pull-requests.json`), 'utf8')
      ) as PullRequest[];

      console.log(`Found ${pullRequests.length} PRs for ${repoName}`);

      // Process PRs and generate report
      const issuePRMap = new Map<number, PullRequest[]>();
      for (const pr of pullRequests) {
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
              item.fieldValues.nodes.find(
                (field) => field?.field?.name === 'Priority' && field.name
              )?.name || 'Unknown',
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
      fs.writeFileSync(
        `.github-data/${safeRepoName}-high-priority-changes.json`,
        JSON.stringify({ summary, changes: highPriorityChanges }, null, 2)
      );

      const report = generateMarkdownReport(summary, highPriorityChanges);
      fs.writeFileSync(`.github-data/${safeRepoName}-high-priority-report.md`, report);

      const heatmapHtml = generateHeatmapHtml(highPriorityChanges, summary);
      fs.writeFileSync(`.github-data/${safeRepoName}-bug-heatmap.html`, heatmapHtml);

      console.log(`\nAnalysis complete for ${repoName}. Results saved in:`);
      console.log(`- ${safeRepoName}-high-priority-changes.json (raw data)`);
      console.log(`- ${safeRepoName}-high-priority-report.md (formatted report)`);
      console.log(`- ${safeRepoName}-bug-heatmap.html (interactive heatmap)`);

      // Add to summaries
      repoSummaries.push({ repoName, summary, firstIssueDate });
    } catch (error) {
      console.error(`Error processing repository ${repoName}:`, error);
    }
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
