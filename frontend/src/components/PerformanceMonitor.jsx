import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

const PerformanceMonitor = () => {
  const [stats, setStats] = useState({
    cacheHits: 0,
    totalRequests: 0,
    cacheSize: 0
  });
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      const updateStats = () => {
        const cacheStats = apiService.getCacheStats();
        setStats(prev => ({
          ...prev,
          cacheSize: cacheStats.size
        }));
      };

      const interval = setInterval(updateStats, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  // Only render in development mode
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowStats(!showStats)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-blue-700 transition-colors"
      >
        API Stats
      </button>
      
      {showStats && (
        <div className="absolute bottom-12 right-0 bg-black/90 text-white p-4 rounded-lg text-xs font-mono min-w-48 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span className="text-green-400">{stats.cacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Hit Rate:</span>
              <span className="text-blue-400">
                {stats.totalRequests > 0 
                  ? `${Math.round((stats.cacheHits / stats.totalRequests) * 100)}%`
                  : '0%'
                }
              </span>
            </div>
            <button
              onClick={() => {
                apiService.clearCache();
                setStats({ cacheHits: 0, totalRequests: 0, cacheSize: 0 });
              }}
              className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs mt-2 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
