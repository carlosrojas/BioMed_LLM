import React, { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, TrendingUp } from "lucide-react";

interface AnalyticsStats {
  total_interactions: number;
  total_with_feedback: number;
  total_thumbs_up: number;
  total_thumbs_down: number;
  thumbs_up_rate: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/llm/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const feedbackRate = stats.total_interactions > 0
    ? (stats.total_with_feedback / stats.total_interactions) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">LLM Analytics</h2>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Interactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Interactions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_interactions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Feedback Received */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Feedback Received</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_with_feedback}</p>
              <p className="text-xs text-gray-500 mt-1">
                {feedbackRate.toFixed(1)}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Thumbs Up */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Thumbs Up</p>
              <p className="text-3xl font-bold text-green-600">{stats.total_thumbs_up}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.thumbs_up_rate || 0) * 100).toFixed(1)}% approval
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Thumbs Down */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Thumbs Down</p>
              <p className="text-3xl font-bold text-red-600">{stats.total_thumbs_down}</p>
              <p className="text-xs text-gray-500 mt-1">
                Needs improvement
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ThumbsDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Approval Rate Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Rate</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Positive Feedback</span>
              <span className="text-sm font-medium text-gray-900">
                {((stats.thumbs_up_rate || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${(stats.thumbs_up_rate || 0) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Negative Feedback</span>
              <span className="text-sm font-medium text-gray-900">
                {((1 - (stats.thumbs_up_rate || 0)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{ width: `${(1 - (stats.thumbs_up_rate || 0)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
