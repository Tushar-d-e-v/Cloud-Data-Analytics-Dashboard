'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Datasets() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: datasetsResponse, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetAPI.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: datasetAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success('Dataset deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete dataset');
    }
  });

  const datasets = datasetsResponse?.data.data?.datasets || [];

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !datasetName.trim()) {
      toast.error('Please provide both dataset name and file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('datasetName', datasetName.trim());

    try {
      await datasetAPI.upload(formData);
      toast.success('Dataset uploaded successfully');
      setFile(null);
      setDatasetName('');
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dataset?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <div>
        {/* <DatasetDebug /> */}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Datasets</h1>
          <p className="mt-2 text-gray-600">
            Upload and manage your data files for analysis.
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Dataset</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label htmlFor="datasetName" className="block text-sm font-medium text-gray-700 mb-1">
                Dataset Name
              </label>
              <input
                type="text"
                id="datasetName"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Enter a name for your dataset"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                CSV File
              </label>
              <input
                type="file"
                id="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-sm text-gray-500">CSV files only</p>
            </div>
            <button
              type="submit"
              disabled={!file || !datasetName.trim() || uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Dataset'}
            </button>
          </form>
        </div>

        {/* Datasets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Datasets</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : datasets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No datasets uploaded yet. Upload your first dataset above.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {datasets.map((dataset: any) => (
                <div key={dataset._id} className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {dataset.datasetName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(dataset.uploadedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rows: {dataset.rowCount} | Columns: {dataset.columnCount}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        dataset.status === 'processed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {dataset.status}
                    </span>
                    {dataset.status === 'processed' && (
                      <Link
                        href={`/analytics/${dataset._id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Analyze
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(dataset._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}