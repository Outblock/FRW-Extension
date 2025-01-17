import InfoIcon from '@mui/icons-material/Info';
import { Box, Card, CardContent, Typography, Alert, AlertTitle } from '@mui/material';
import React, { useEffect, useState } from 'react';

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

interface BugHotspot {
  file: string;
  function: string;
  bugCount: number;
  lastOccurrence: string;
  associatedIssues: string[];
}

interface HeatmapProps {
  data?: BugHotspot[];
}

const processHighPriorityData = (data: HighPriorityChange[]): BugHotspot[] => {
  // Create a map to aggregate changes by file
  const fileMap = new Map<
    string,
    {
      bugCount: number;
      lastOccurrence: string;
      issues: Set<string>;
    }
  >();

  // Process each high priority issue
  data.forEach(({ issue, pullRequests }) => {
    // Process each PR's changes
    pullRequests.forEach((pr) => {
      pr.changes.forEach((change) => {
        const file = change.path;
        const existing = fileMap.get(file) || {
          bugCount: 0,
          lastOccurrence: issue.updatedAt,
          issues: new Set<string>(),
        };

        // Update the file's stats
        existing.bugCount += 1;
        existing.lastOccurrence =
          new Date(existing.lastOccurrence) > new Date(issue.updatedAt)
            ? existing.lastOccurrence
            : issue.updatedAt;
        existing.issues.add(`#${issue.number} (${issue.priority})`);

        fileMap.set(file, existing);
      });
    });
  });

  // Convert the map to our BugHotspot format
  return Array.from(fileMap.entries()).map(([file, stats]) => ({
    file,
    function: '', // We don't have function-level data yet
    bugCount: stats.bugCount,
    lastOccurrence: stats.lastOccurrence,
    associatedIssues: Array.from(stats.issues),
  }));
};

const BugHeatmap: React.FC<HeatmapProps> = ({ data = [] }) => {
  const [hotspots, setHotspots] = useState<BugHotspot[]>(data);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    // Load and process the high priority issues data
    fetch('/.github-data/high-priority-changes.json')
      .then((response) => response.json())
      .then((highPriorityData: HighPriorityChange[]) => {
        const processedData = processHighPriorityData(highPriorityData);
        setHotspots(processedData);
      })
      .catch((error) => {
        console.error('Error loading high priority changes:', error);
      });
  }, []);

  // Guard clause for empty data
  if (!hotspots || hotspots.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bug Hotspots Analysis
          </Typography>
          <Alert severity="info" icon={<InfoIcon />}>
            No bug data available. Please run the analysis first.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Group data by file
  const fileGroups = hotspots.reduce(
    (acc, item) => {
      if (!acc[item.file]) {
        acc[item.file] = [];
      }
      acc[item.file].push(item);
      return acc;
    },
    {} as Record<string, BugHotspot[]>
  );

  // Calculate max bug count for color scaling
  const maxBugCount = Math.max(...hotspots.map((d) => d.bugCount));

  // Get intensity of color based on bug count
  const getIntensity = (count: number) => {
    const intensity = Math.floor((count / maxBugCount) * 255);
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bug Hotspots Analysis
          </Typography>

          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
            <AlertTitle>Information</AlertTitle>
            Showing bug frequency heatmap across {Object.keys(fileGroups).length} files. The
            intensity indicates the number of high priority issues affecting each file.
          </Alert>

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(fileGroups).map(([file, hotspots]) => {
              const totalBugs = hotspots.reduce((sum, h) => sum + h.bugCount, 0);
              const isSelected = selectedFile === file;

              return (
                <Box key={file} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: getIntensity(totalBugs),
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => setSelectedFile(isSelected ? null : file)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ fontWeight: 'medium' }}>{file}</Typography>
                      <Typography variant="body2">
                        {totalBugs} issue{totalBugs !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>

                  {isSelected && (
                    <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {hotspots.map((hotspot) => (
                        <Box
                          key={`${file}:${hotspot.function}`}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: getIntensity(hotspot.bugCount),
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {file}
                            </Typography>
                            <Typography variant="body2">
                              {hotspot.bugCount} issue{hotspot.bugCount !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            Last occurrence: {new Date(hotspot.lastOccurrence).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Related issues: {hotspot.associatedIssues.join(', ')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BugHeatmap;
