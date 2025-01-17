#!/bin/bash

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub first using: gh auth login"
    exit 1
fi

# Create data directory
mkdir -p .github-data

# Get project data
echo "Fetching project data..."
gh api graphql -f query='
  query {
    organization(login: "Outblock") {
      projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          number
          title
          shortDescription
          closed
          url
        }
      }
    }
  }
' > .github-data/projects.json

# Display available projects
echo "Available projects:"
jq -r '.data.organization.projectsV2.nodes[] | "\(.number): \(.title) \(if .closed then "(closed)" else "" end)\n  URL: \(.url)\n  Description: \(.shortDescription // "No description")\n"' .github-data/projects.json

# Set project number to 2
PROJECT_NUMBER=2
echo "Project number set to: $PROJECT_NUMBER"

# Get project items
echo "Fetching project items..."

# Initialize variables for pagination
cursor=""
has_next_page="true"
first_batch="true"

# Create a temporary file for accumulating results
echo '{"data":{"organization":{"projectV2":{"title":null,"items":{"nodes":[]}}}}}' > .github-data/project-items.json

while [ "$has_next_page" = "true" ]; do
  # Construct the cursor argument
  cursor_arg=""
  if [ "$first_batch" = "false" ]; then
    cursor_arg=", after: \"$cursor\""
  fi

  # Fetch the next batch
  gh api graphql -f query="
    query(\$projectNumber: Int!) {
      organization(login: \"Outblock\") {
        projectV2(number: \$projectNumber) {
          title
          items(first: 100${cursor_arg}) {
            nodes {
              isArchived
              content {
                ... on Issue {
                  number
                  title
                  createdAt
                  updatedAt
                  state
                  url
                }
              }
              fieldValues(first: 8) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    field {
                      ... on ProjectV2SingleSelectField {
                        name
                      }
                    }
                    name
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  " -F projectNumber=$PROJECT_NUMBER > .github-data/temp_batch.json

  # Extract pagination info for next iteration
  has_next_page=$(jq -r '.data.organization.projectV2.items.pageInfo.hasNextPage' .github-data/temp_batch.json)
  cursor=$(jq -r '.data.organization.projectV2.items.pageInfo.endCursor' .github-data/temp_batch.json)

  # Merge this batch with previous results
  if [ "$first_batch" = "true" ]; then
    mv .github-data/temp_batch.json .github-data/project-items.json
    first_batch="false"
  else
    # Combine the nodes arrays from both files
    jq -s '
      .[0].data.organization.projectV2.items.nodes += .[1].data.organization.projectV2.items.nodes |
      .[0]
    ' .github-data/project-items.json .github-data/temp_batch.json > .github-data/temp_combined.json
    mv .github-data/temp_combined.json .github-data/project-items.json
  fi

  # Count items so far
  current_count=$(jq '.data.organization.projectV2.items.nodes | length' .github-data/project-items.json)
  echo "Fetched $current_count items so far..."
done

rm -f .github-data/temp_batch.json

# Debug output
echo "Project items fetched. Checking data..."
total_items=$(jq '.data.organization.projectV2.items.nodes | length' .github-data/project-items.json)
archived_items=$(jq '.data.organization.projectV2.items.nodes | map(select(.isArchived == true)) | length' .github-data/project-items.json)
echo "Total items found: $total_items"
echo "Archived items: $archived_items"

# Get all issues from the repository
echo "Fetching repository issues..."
gh issue list --repo Outblock/FRW-Extension --json number,title,state,createdAt,updatedAt,url,labels -L 1000 > .github-data/issues.json

# Get all pull requests from the repository
echo "Fetching repository pull requests..."
gh pr list --repo Outblock/FRW-Extension --json number,title,state,createdAt,mergedAt,url,files,body,headRefName --state all -L 100 > .github-data/pull-requests.json

# For each PR, fetch its first commit message separately to avoid hitting limits
echo "Fetching PR commit messages..."
for pr_number in $(jq -r '.[].number' .github-data/pull-requests.json); do
  commit_message=$(gh pr view $pr_number --repo Outblock/FRW-Extension --json commits --jq '.commits[0].messageHeadline')
  # Add the commit message back to the PR data
  jq --arg pr "$pr_number" --arg msg "$commit_message" \
    'map(if (.number|tostring) == $pr then . + {"firstCommitMessage": $msg} else . end)' \
    .github-data/pull-requests.json > .github-data/temp.json && mv .github-data/temp.json .github-data/pull-requests.json
done

echo "Data fetching complete. Files saved in .github-data/"
