import React, { useState } from 'react';
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
  Checkbox,
  ListItemText,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { datasetAPI, reportsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const { data: datasetsResponse } = useQuery('datasets', datasetAPI.getAll);

  const generateReportMutation = useMutation(
    ({ datasetId, metrics }: { datasetId: string; metrics: string[] }) =>
      reportsAPI.generate(datasetId, metrics),
    {
      onSuccess: (response) => {
        setGeneratedReport(response.data.report);
        toast.success('Report generated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to generate report');
      },
    }
  );

  const datasets = datasetsResponse?.data?.datasets?.filter(
    (d: any) => d.status === 'processed'
  ) || [];

  const selectedDatasetObj = datasets.find((d: any) => d._id === selectedDataset);
  const availableMetrics = selectedDatasetObj?.columns?.filter((col: string) => 
    !['id', 'date', 'time', 'timestamp', 'created_at', 'updated_at'].includes(col.toLowerCase())
  ) || [];

  const handleGenerateReport = () => {
    if (!selectedDataset || selectedMetrics.length === 0) {
      toast.error('Please select a dataset and at least one metric');
      return;
    }

    generateReportMutation.mutate({
      datasetId: selectedDataset,
      metrics: selectedMetrics,
    });
  };

  const handleMetricChange = (event: any) => {
    const value = event.target.value;
    setSelectedMetrics(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Generate comprehensive analytics reports for your datasets
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Report
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Dataset</InputLabel>
                <Select
                  value={selectedDataset}
                  label="Dataset"
                  onChange={(e) => {
                    setSelectedDataset(e.target.value);
                    setSelectedMetrics([]);
                  }}
                >
                  {datasets.map((dataset: any) => (
                    <MenuItem key={dataset._id} value={dataset._id}>
                      {dataset.datasetName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedDataset && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Metrics</InputLabel>
                  <Select
                    multiple
                    value={selectedMetrics}
                    onChange={handleMetricChange}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {availableMetrics.map((metric: string) => (
                      <MenuItem key={metric} value={metric}>
                        <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                        <ListItemText primary={metric} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateReport}
                disabled={
                  !selectedDataset ||
                  selectedMetrics.length === 0 ||
                  generateReportMutation.isLoading
                }
              >
                {generateReportMutation.isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {generateReportMutation.isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : generatedReport ? (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Analytics Report
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Dataset</Typography>
                    <Typography variant="h6">{generatedReport.datasetName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Generated</Typography>
                    <Typography variant="h6">
                      {new Date(generatedReport.generatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {generatedReport.summary.totalMetrics}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Metrics
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {generatedReport.summary.successfulMetrics}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Successful
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {generatedReport.summary.totalAnomalies}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Anomalies
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom>
                  Metric Analysis Results
                </Typography>

                {generatedReport.metrics.map((metricResult: any, index: number) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Typography sx={{ flexGrow: 1 }}>
                          {metricResult.metric}
                        </Typography>
                        {metricResult.success ? (
                          <Alert severity="success" sx={{ py: 0 }}>Success</Alert>
                        ) : (
                          <Alert severity="error" sx={{ py: 0 }}>Failed</Alert>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {metricResult.success ? (
                        <Box>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">Mean</Typography>
                              <Typography variant="h6">
                                {metricResult.data.summary.mean.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">Median</Typography>
                              <Typography variant="h6">
                                {metricResult.data.summary.median.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">Std Dev</Typography>
                              <Typography variant="h6">
                                {metricResult.data.summary.stdDev.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">Anomalies</Typography>
                              <Typography variant="h6">
                                {metricResult.data.anomalies.length}
                              </Typography>
                            </Grid>
                          </Grid>

                          {metricResult.data.anomalies.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Top Anomalies:
                              </Typography>
                              {metricResult.data.anomalies.slice(0, 3).map((anomaly: any, i: number) => (
                                <Alert
                                  key={i}
                                  severity={
                                    anomaly.severity === 'high' ? 'error' :
                                    anomaly.severity === 'medium' ? 'warning' : 'info'
                                  }
                                  sx={{ mb: 1 }}
                                >
                                  <Typography variant="body2">
                                    <strong>{anomaly.date}:</strong> {anomaly.value.toLocaleString()}
                                    {anomaly.zscore && ` (Z-Score: ${anomaly.zscore.toFixed(2)})`}
                                  </Typography>
                                </Alert>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Alert severity="error">
                          {metricResult.error}
                        </Alert>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" gutterBottom>
                  No report generated yet
                </Typography>
                <Typography color="text.secondary">
                  Select a dataset and metrics to generate your first report
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;