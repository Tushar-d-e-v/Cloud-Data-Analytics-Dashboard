'use client';

import { useQuery } from '@tanstack/react-query';
import { datasetAPI } from '@/lib/api';

export default function DatasetDebug() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['datasets-debug'],
    queryFn: async () => {
      console.log('Making API call to:', process.env.NEXT_PUBLIC_API_URL);
      const response = await datasetAPI.getAll();
      console.log('Full Response:', response);
      console.log('Response Data:', response.data);
      console.log('Datasets:', response.data?.data?.datasets);
      return response;
    }
  });

  return (
    <div className="bg-gray-100 text-black p-4 rounded-lg mb-4 text-xs">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div className="space-y-1">
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? JSON.stringify(error) : 'None'}</p>
        <p>Has Data: {data ? 'Yes' : 'No'}</p>
        {data && (
          <>
            <p>Response Status: {data.status}</p>
            <p>Datasets Count: {data.data?.data?.datasets?.length || 0}</p>
            <pre className="bg-white text-black p-2 rounded mt-2 overflow-auto max-h-40">
              {JSON.stringify(data.data, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
