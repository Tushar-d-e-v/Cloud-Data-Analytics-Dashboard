import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { datasetAPI } from '../services/api';
import toast from 'react-hot-toast';

const Datasets: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    datasetName: '',
    timeColumn: '',
    metricColumn: '',
    file: null as File | null,
  });

  const { data: datasetsResponse, isLoading } = useQuery(
    'datasets',
    datasetAPI.getAll
  );

  const uploadMutation = useMutation(
    (formData: FormData) => datasetAPI.upload(formData),
    {
      onSuccess: () => {
        toast.success('Dataset uploaded successfully!');
        setUploadDialog(false);
        setUploadData({ datasetName: '', timeColumn: '', metricColumn: '', file: null });
        queryClient.invalidateQueries('datasets');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Upload failed');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => datasetAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Dataset deleted successfully!');
        queryClient.invalidateQueries('datasets');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Delete failed');
      },
    }
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadData(prev => ({ ...prev, file: acceptedFiles[0] }));
      }
    },
  });

  const handleUpload = () => {
    if (!uploadData.file || !uploadData.datasetName) {
      toast.error('Please provide a dataset name and select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('datasetName', uploadData.datasetName);
    if (uploadData.timeColumn) formData.append('timeColumn', uploadData.timeColumn);
    if (uploadData.metricColumn) formData.append('metricColumn', uploadData.metricColumn);

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const datasets = datasetsResponse?.data?.datasets || [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Datasets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialog(true)}
        >
          Upload Dataset
        </Button>
      </Box>

      {datasets.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>
              No datasets uploaded yet
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Upload your first dataset to start analyzing your data
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUploadDialog(true)}
              sx={{ mt: 2 }}
            >
              Upload Dataset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {datasets.map((dataset: any) => (
            <Grid item xs={12} md={6} lg={4} key={dataset._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" noWrap>
                      {dataset.datasetName}
                    </Typography>
                    <Chip
                      label={dataset.status}
                      size="small"
                      color={
                        dataset.status === 'processed' ? 'success' :
                        dataset.status === 'processing' ? 'warning' : 'error'
                      }
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Uploaded: {new Date(dataset.uploadedAt).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Records: {dataset.recordCount?.toLocaleString() || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Columns: {dataset.columns?.join(', ') || 'N/A'}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box>
                      {dataset.status === 'processed' && (
                        <Button
                          size="small"
                          startIcon={<AnalyticsIcon />}
                          onClick={() => navigate(`/analytics/${dataset._id}`)}
                        >
                          Analyze
                        </Button>
                      )}
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(dataset._id, dataset.datasetName)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Dataset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dataset Name"
            fullWidth
            variant="outlined"
            value={uploadData.datasetName}
            onChange={(e) => setUploadData(prev => ({ ...prev, datasetName: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Time Column (optional)"
            fullWidth
            variant="outlined"
            value={uploadData.timeColumn}
            onChange={(e) => setUploadData(prev => ({ ...prev, timeColumn: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Metric Column (optional)"
            fullWidth
            variant="outlined"
            value={uploadData.metricColumn}
            onChange={(e) => setUploadData(prev => ({ ...prev, metricColumn: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? '#f5f5f5' : 'transparent',
            }}
          >
            <input {...getInputProps()} />
            {uploadData.file ? (
              <Typography>{uploadData.file.name}</Typography>
            ) : (
              <Typography color="text.secondary">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop a CSV or JSON file here, or click to select'}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploadMutation.isLoading}
          >
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Datasets;