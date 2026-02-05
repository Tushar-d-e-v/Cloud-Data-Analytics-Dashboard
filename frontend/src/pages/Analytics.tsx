import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { analyticsAPI, datasetAPI, reportsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Analytics: React.FC = () => {
  const { datasetId } = useParams<{ datasetId: string }>();
  const [selectedMetric, setSelectedMetric] = useState('');

  const { data: datasetResponse } = useQuery(
    ['dataset', datasetId],
    () => datasetAPI.getById(datasetId!),
    { enabled: !!datasetId }
  );

  const { data: metricsResponse } = useQuery(
    ['metrics', datasetId],
    () => analyticsAPI.getMetrics(datasetId!),
    { enabled: !!datasetId }
  );

  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery(
    ['analytics', datasetId, selectedMetric],
    () => analyticsAPI.get(datasetId!, selectedMetric),
    { 
      enabled: !!datasetId && !!selectedMetric,
      retry: false
    }
  );

  const { data: insightsResponse } = useQuery(
    ['insights', datasetId, selectedMetric],
    () => reportsAPI.getInsights(datasetId!, selectedMetric),
    { 
      enabled: !!datasetId && !!selectedMetric && !!analyticsResponse,
      retry: false
    }
  );

  const runAnalyticsMutation = useMutation(
    () => analyticsAPI.run(datasetId!, selectedMetric),
    {
      onSuccess: () => {
        toast.success('Analytics generated successfully!');
        // Refetch analytics data
        window.location.reload();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to run analytics');
      },
    }
  );

  const dataset = datasetResponse?.data?.dataset;
  const metrics = useMemo(() => metricsResponse?.data?.metrics || [], [metricsResponse?.data?.metrics]);
  const analytics = analyticsResponse?.data?.analytics;
  const insights = insightsResponse?.data?.insights || [];

  // Auto-select first metric if available
  React.useEffect(() => {
    if (metrics.length > 0 && !selectedMetric) {
      setSelectedMetric(metrics[0]);
    }
  }, [metrics, selectedMetric]);

  if (!dataset) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const timeSeriesData = analytics?.timeSeriesData || [];
  const anomalies = analytics?.anomalies || [];
  const summary = analytics?.summary;

  // Prepare chart data
  const chartData = [
    {
      x: timeSeriesData.map((d: any) => d.date),
      y: timeSeriesData.map((d: any) => d.value),
      type: 'scatter',
      mode: 'lines+markers',
      name: selectedMetric,
      line: { color: '#1976d2' },
    },
  ];

  // Add anomaly points
  if (anomalies.length > 0) {
    chartData.push({
      x: anomalies.map((a: any) => a.date),
      y: anomalies.map((a: any) => a.value),
      type: 'scatter',
      mode: 'markers',
      name: 'Anomalies',
      marker: {
        color: anomalies.map((a: any) => 
          a.severity === 'high' ? '#d32f2f' : 
          a.severity === 'medium' ? '#ed6c02' : '#2e7d32'
        ),
        size: 10,
        symbol: 'diamond',
      },
    } as any);
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics: {dataset.datasetName}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Metric
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Metric</InputLabel>
                <Select
                  value={selectedMetric}
                  label="Metric"
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  {metrics.map((metric: string) => (
                    <MenuItem key={metric} value={metric}>
                      {metric}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedMetric && !analytics && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => runAnalyticsMutation.mutate()}
                  disabled={runAnalyticsMutation.isLoading}
                >
                  {runAnalyticsMutation.isLoading ? 'Running...' : 'Run Analytics'}
                </Button>
              )}
            </CardContent>
          </Card>

          {summary && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Mean</Typography>
                    <Typography variant="h6">{summary.mean.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Median</Typography>
                    <Typography variant="h6">{summary.median.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Std Dev</Typography>
                    <Typography variant="h6">{summary.stdDev.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Count</Typography>
                    <Typography variant="h6">{summary.count.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {anomalies.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Anomalies ({anomalies.length})
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {anomalies.map((anomaly: any, index: number) => (
                    <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{anomaly.date}</Typography>
                        <Chip
                          label={anomaly.severity}
                          size="small"
                          color={
                            anomaly.severity === 'high' ? 'error' :
                            anomaly.severity === 'medium' ? 'warning' : 'success'
                          }
                        />
                      </Box>
                      <Typography variant="h6">{anomaly.value.toLocaleString()}</Typography>
                      {anomaly.zscore && (
                        <Typography variant="caption" color="text.secondary">
                          Z-Score: {anomaly.zscore.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          {analyticsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : analytics ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Time Series Analysis
                </Typography>
                <Plot
                  data={chartData as any}
                  layout={{
                    title: `${selectedMetric} Over Time`,
                    xaxis: { title: 'Date' },
                    yaxis: { title: selectedMetric },
                    height: 400,
                    showlegend: true,
                  } as any}
                  style={{ width: '100%' }}
                  config={{ responsive: true }}
                />
              </CardContent>
            </Card>
          ) : selectedMetric ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" gutterBottom>
                  No analytics data available
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Run analytics to generate insights for this metric
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => runAnalyticsMutation.mutate()}
                  disabled={runAnalyticsMutation.isLoading}
                >
                  {runAnalyticsMutation.isLoading ? 'Running...' : 'Run Analytics'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Select a metric to analyze
                </Typography>
                <Typography color="text.secondary">
                  Choose a metric from the dropdown to start your analysis
                </Typography>
              </CardContent>
            </Card>
          )}

          {insights.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Insights
                </Typography>
                {insights.map((insight: any, index: number) => (
                  <Alert
                    key={index}
                    severity={
                      insight.severity === 'high' ? 'error' :
                      insight.severity === 'medium' ? 'warning' : 'info'
                    }
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2">{insight.title}</Typography>
                    <Typography variant="body2">{insight.description}</Typography>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;