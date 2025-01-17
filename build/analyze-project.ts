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

async function analyzeData() {
  // Read all data files
  const projectItemsData = JSON.parse(
    fs.readFileSync(path.join('.github-data', 'project-items.json'), 'utf8')
  );

  // Debug: Check the raw data structure
  console.log('Project Items Data Structure:');
  console.log(JSON.stringify(projectItemsData, null, 2));

  const projectItems = projectItemsData.data.organization.projectV2.items.nodes as ProjectItem[];

  console.log(`Found ${projectItems.length} project items`);

  // Get high priority items
  const highPriorityItems = projectItems.filter((item) => {
    // Debug the item structure
    if (!item.content) {
      console.log('Found item without content:', JSON.stringify(item, null, 2));
      return false;
    }

    if (!item.fieldValues?.nodes) {
      console.log(`Item ${item.content.number} has no field values`);
      return false;
    }

    // Check if this is an issue from our repository
    const issueUrl = item.content.url;
    if (!issueUrl || !issueUrl.includes('Outblock/FRW-Extension')) {
      console.log(`Skipping item ${item.content.number} - not from our repository (${issueUrl})`);
      return false;
    }

    const priorityField = item.fieldValues.nodes.find((field) => field?.field?.name === 'Priority');

    if (!priorityField) {
      console.log(`Item ${item.content.number} has no priority field`);
      return false;
    }

    const priority = priorityField.name;
    const status = item.isArchived ? '(archived)' : '(active)';
    console.log(`Item ${item.content.number} ${status} has priority: ${priority}`);

    // Include both archived and non-archived items
    return priority === 'P0-Critical' || priority === 'P1-High';
  });

  console.log('\nSummary of found items:');
  console.log(`Total project items: ${projectItems.length}`);
  console.log(`High priority items from our repo: ${highPriorityItems.length}`);
  console.log(`- Archived: ${highPriorityItems.filter((item) => item.isArchived).length}`);
  console.log(`- Active: ${highPriorityItems.filter((item) => !item.isArchived).length}`);

  const pullRequests = JSON.parse(
    fs.readFileSync(path.join('.github-data', 'pull-requests.json'), 'utf8')
  ) as PullRequest[];

  const issues = JSON.parse(
    fs.readFileSync(path.join('.github-data', 'issues.json'), 'utf8')
  ) as Issue[];

  // Create a map of issue numbers to PRs
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

  // Create the final report data
  const highPriorityChanges: HighPriorityChange[] = highPriorityItems
    .filter((item) => item.content && item.fieldValues?.nodes) // Ensure we have required data
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

  // Generate summary
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
          (prSum, pr) => prSum + pr.changes.reduce((cSum, c) => cSum + c.changes, 0),
          0
        ),
      0
    ),
    priorities: {
      p0: highPriorityChanges.filter((item) => item.issue.priority === 'P0-Critical').length,
      p1: highPriorityChanges.filter((item) => item.issue.priority === 'P1-High').length,
    },
  };

  // Save results
  fs.writeFileSync(
    '.github-data/high-priority-changes.json',
    JSON.stringify({ summary, changes: highPriorityChanges }, null, 2)
  );

  // Generate markdown report
  const report = generateMarkdownReport(summary, highPriorityChanges);
  fs.writeFileSync('.github-data/high-priority-report.md', report);

  console.log('Analysis complete. Results saved in:');
  console.log('- high-priority-changes.json (raw data)');
  console.log('- high-priority-report.md (formatted report)');
}

function generateMarkdownReport(summary: Summary, changes: HighPriorityChange[]): string {
  return `# High Priority Changes Report
Generated on ${new Date().toLocaleString()}

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
