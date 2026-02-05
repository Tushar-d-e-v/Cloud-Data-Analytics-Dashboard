import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { datasetAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: datasetsResponse, isLoading } = useQuery(
    'datasets',
    datasetAPI.getAll
  );

  const datasets = datasetsResponse?.data?.datasets || [];
  const processedDatasets = datasets.filter((d: any) => d.status === 'processed');
  const processingDatasets = datasets.filter((d: any) => d.status === 'processing');

  const stats = [
    {
      title: 'Total Datasets',
      value: datasets.length,
      icon: <StorageIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Ready for Analytics',
      value: processedDatasets.length,
      icon: <AnalyticsIcon fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Processing',
      value: processingDatasets.length,
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#ed6c02',
    },
    {
      title: 'Anomalies Detected',
      value: '—',
      icon: <WarningIcon fontSize="large" />,
      color: '#d32f2f',
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome to your analytics dashboard. Monitor your datasets and insights.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/datasets')}
                  startIcon={<StorageIcon />}
                >
                  Upload New Dataset
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/reports')}
                  startIcon={<AnalyticsIcon />}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Datasets
              </Typography>
              {datasets.length === 0 ? (
                <Typography color="text.secondary">
                  No datasets uploaded yet. Upload your first dataset to get started.
                </Typography>
              ) : (
                <Box>
                  {datasets.slice(0, 3).map((dataset: any) => (
                    <Box
                      key={dataset._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                      borderBottom="1px solid #eee"
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {dataset.datasetName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(dataset.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: dataset.status === 'processed' ? '#e8f5e8' : '#fff3e0',
                          color: dataset.status === 'processed' ? '#2e7d32' : '#ed6c02',
                        }}
                      >
                        {dataset.status}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;