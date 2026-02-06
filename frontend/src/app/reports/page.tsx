'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { datasetAPI, reportsAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

export default function Reports() {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const { data: datasetsResponse } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetAPI.getAll
  });

  const generateReportMutation = useMutation({
    mutationFn: ({ datasetId, metrics }: { datasetId: string; metrics: string[] }) =>
      reportsAPI.generate(datasetId, metrics),
    onSuccess: (response) => {
      setGeneratedReport(response.data);
      toast.success('Report generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Report generation failed');
    }
  });

  const datasets = datasetsResponse?.data.data?.datasets?.filter((d: any) => d.status === 'processed') || [];
  
  const availableMetrics = [
    'mean',
    'median',
    'mode',
    'standardDeviation',
    'variance',
    'correlation',
    'distribution'
  ];

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleGenerateReport = () => {
    if (!selectedDataset) {
      toast.error('Please select a dataset');
      return;
    }
    if (selectedMetrics.length === 0) {
      toast.error('Please select at least one metric');
      return;
    }

    generateReportMutation.mutate({
      datasetId: selectedDataset,
      metrics: selectedMetrics
    });
  };

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">
            Generate comprehensive analytics reports for your datasets.
          </p>
        </div>

        {/* Report Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Report</h2>
          
          {/* Dataset Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Dataset
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a dataset...</option>
              {datasets.map((dataset: any) => (
                <option key={dataset._id} value={dataset._id}>
                  {dataset.datasetName}
                </option>
              ))}
            </select>
          </div>

          {/* Metrics Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Metrics
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableMetrics.map((metric) => (
                <label key={metric} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={() => handleMetricToggle(metric)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {metric}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generateReportMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Generated Report */}
        {generatedReport && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Generated Report</h2>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(generatedReport, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'analytics-report.json';
                  link.click();
                }}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Download Report
              </button>
            </div>

            <div className="space-y-6">
              {/* Report Summary */}
              {generatedReport.data?.summary && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(generatedReport.data.summary).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600 capitalize">{key}</p>
                        <p className="text-lg font-semibold">
                          {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics Results */}
              {generatedReport.data?.metrics && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Metrics</h3>
                  <div className="space-y-4">
                    {Object.entries(generatedReport.data.metrics).map(([metric, data]: [string, any]) => (
                      <div key={metric} className="border border-gray-200 rounded p-4">
                        <h4 className="font-medium text-gray-900 capitalize mb-2">{metric}</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {generatedReport.data?.insights && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Insights</h3>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <ul className="space-y-2">
                      {generatedReport.data.insights.map((insight: string, index: number) => (
                        <li key={index} className="text-sm text-blue-800">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}