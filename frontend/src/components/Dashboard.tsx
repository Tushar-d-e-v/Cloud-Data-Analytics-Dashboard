'use client';

import { useQuery } from '@tanstack/react-query';
import { datasetAPI } from '@/lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const { data: datasetsResponse, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetAPI.getAll
  });

  const datasets = datasetsResponse?.data.data?.datasets || [];
  const processedDatasets = datasets.filter((d: any) => d.status === 'processed');
  const processingDatasets = datasets.filter((d: any) => d.status === 'processing');

  const stats = [
    {
      title: 'Total Datasets',
      value: datasets.length,
      color: 'bg-blue-500',
    },
    {
      title: 'Ready for Analytics',
      value: processedDatasets.length,
      color: 'bg-green-500',
    },
    {
      title: 'Processing',
      value: processingDatasets.length,
      color: 'bg-yellow-500',
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your analytics dashboard. Monitor your datasets and insights.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <div className="w-6 h-6 bg-white rounded opacity-80"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/datasets"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              📊 Upload New Dataset
            </Link>
            <Link
              href="/reports"
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              📈 Generate Report
            </Link>
          </div>
        </div>

        {/* Recent Datasets */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Datasets</h2>
          {datasets.length === 0 ? (
            <p className="text-gray-500">
              No datasets uploaded yet. Upload your first dataset to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {datasets.slice(0, 3).map((dataset: any) => (
                <div
                  key={dataset._id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{dataset.datasetName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(dataset.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      dataset.status === 'processed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {dataset.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}