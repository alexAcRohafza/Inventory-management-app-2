'use client'

import { useState } from 'react'
import { AnalysisResponse } from '@/lib/ai/gemini-service'

interface AIAnalysisPanelProps {
  reportData: any[]
  reportType: 'inventory' | 'low-stock' | 'movements' | 'locations'
  className?: string
}

export default function AIAnalysisPanel({ reportData, reportType, className = '' }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'summary' | 'forecast' | 'risks' | 'insights' | 'custom'>('summary')

  const analyzeWithAI = async (analysisType: string, question?: string) => {
    if (!reportData || reportData.length === 0) {
      setError('No data available for analysis')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/analyze-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          data: reportData,
          analysisType,
          question: question || undefined
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setAnalysis(result.analysis)
      } else {
        setError(result.error || 'Failed to analyze report')
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalysisTypeChange = (type: 'summary' | 'forecast' | 'risks' | 'insights' | 'custom') => {
    setSelectedAnalysisType(type)
    if (type !== 'custom') {
      analyzeWithAI(type)
    }
  }

  const handleCustomAnalysis = () => {
    if (customQuestion.trim()) {
      analyzeWithAI('custom', customQuestion)
    }
  }

  const analysisTypeLabels = {
    summary: { label: 'Summary & Overview', icon: '📊', desc: 'Get a comprehensive summary of your data' },
    forecast: { label: 'Trends & Forecasting', icon: '📈', desc: 'Identify trends and predict future needs' },
    risks: { label: 'Risk Analysis', icon: '⚠️', desc: 'Identify potential risks and issues' },
    insights: { label: 'Strategic Insights', icon: '💡', desc: 'Get optimization recommendations' },
    custom: { label: 'Custom Analysis', icon: '🤔', desc: 'Ask your own specific questions' }
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-200 bg-white/50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Smart Report Analysis</h3>
            <p className="text-sm text-gray-600">Powered by Gemini AI</p>
          </div>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="p-6 space-y-4">
        {/* Analysis Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Analysis Type:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(analysisTypeLabels).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleAnalysisTypeChange(key as any)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedAnalysisType === key
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span>{config.icon}</span>
                  <span className="font-medium text-sm">{config.label}</span>
                </div>
                <p className="text-xs text-gray-600">{config.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Question Input */}
        {selectedAnalysisType === 'custom' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Ask a specific question about your data:
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g., Which items should I reorder first? What's my inventory turnover rate?"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleCustomAnalysis}
                disabled={loading || !customQuestion.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">AI is analyzing your data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-800 font-medium">Analysis Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-4">
            {/* Main Analysis */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📋</span>
                Analysis Summary
              </h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{analysis.analysis}</p>
              </div>
            </div>

            {/* Key Insights */}
            {analysis.keyInsights && analysis.keyInsights.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {analysis.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-blue-800 text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-green-800 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {analysis.riskFactors && analysis.riskFactors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {analysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span className="text-red-800 text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Data Summary */}
        <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
          Analyzing {reportData?.length || 0} records from {reportType} report
          {reportData?.length > 1000 && ' (limited to first 1000 records)'}
        </div>
      </div>
    </div>
  )
} 