'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsAPI, datasetAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const params = useParams();
  const datasetId = params.datasetId as string;
  const [selectedMetric, setSelectedMetric] = useState('');
  const queryClient = useQueryClient();

  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: () => datasetAPI.getById(datasetId)
  });

  const { data: metricsResponse, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['metrics', datasetId],
    queryFn: () => analyticsAPI.getMetrics(datasetId),
    enabled: !!datasetId
  });

  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics', datasetId, selectedMetric],
    queryFn: async () => {
      try {
        return await analyticsAPI.get(datasetId, selectedMetric);
      } catch (error: any) {
        // If 404, automatically run analytics
        if (error.response?.status === 404) {
          console.log('Analytics not found, running analytics automatically...');
          await analyticsAPI.run(datasetId, selectedMetric);
          // Retry getting the analytics
          return await analyticsAPI.get(datasetId, selectedMetric);
        }
        throw error;
      }
    },
    enabled: !!selectedMetric,
    retry: false
  });

  const runAnalyticsMutation = useMutation({
    mutationFn: ({ metric }: { metric: string }) => 
      analyticsAPI.run(datasetId, metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', datasetId] });
      toast.success('Analytics completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Analytics failed');
    }
  });

  // Debug logging
  // console.log('Dataset:', dataset);
  // console.log('Metrics Response:', metricsResponse);
  // console.log('Analytics Data:', analyticsData);
  // console.log('Analytics Error:', analyticsError);

  const metrics = metricsResponse?.data?.data?.metrics || [];
  const analytics = analyticsData?.data?.data?.analytics;
  const datasetName = dataset?.data?.data?.dataset?.datasetName || 'Loading...';

  const handleRunAnalytics = () => {
    if (!selectedMetric) {
      toast.error('Please select a metric');
      return;
    }
    runAnalyticsMutation.mutate({ metric: selectedMetric });
  };

  if (datasetLoading || metricsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Dataset: {datasetName}
          </p>
        </div>

        {/* Debug Info */}
        {(datasetError || metricsError) && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
            <p className="text-red-800">Error loading data. Check console for details.</p>
          </div>
        )}

        {/* Metrics Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Metric</h2>
          {metrics.length === 0 ? (
            <p className="text-gray-500 mb-4">No metrics available. Check API response.</p>
          ) : (
            <div className="flex flex-wrap gap-4 mb-4">
              {metrics.map((metric: string) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-md ${
                    selectedMetric === metric
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          )}
          {selectedMetric && analyticsLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading analytics data...</span>
            </div>
          )}
        </div>

        {/* Results */}
        {selectedMetric && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Results: {selectedMetric}
            </h2>
            
            {analyticsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                {analytics.summary && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Summary Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(analytics.summary).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-600 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chart Data */}
                {analytics.timeSeriesData && analytics.timeSeriesData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Trend Visualization</h3>
                    <div className="bg-white p-4 rounded border">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={analytics.timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name={selectedMetric}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Bar Chart</h3>
                      <div className="bg-white p-4 rounded border">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={analytics.timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                              dataKey="value" 
                              fill="#10b981" 
                              name={selectedMetric}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anomalies */}
                {analytics.anomalies && analytics.anomalies.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4 text-red-600 text-black">
                      Anomalies Detected ({analytics.anomalies.length})
                    </h3>
                    <div className="space-y-2">
                      {analytics.anomalies.map((anomaly: any, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 p-3 rounded">
                          <p className="text-sm text-black">
                            <strong>Date:</strong> {anomaly.date} | <strong>Value:</strong> {anomaly.value} | <strong>Reason:</strong> {anomaly.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No results available. Run analytics to see data.
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}