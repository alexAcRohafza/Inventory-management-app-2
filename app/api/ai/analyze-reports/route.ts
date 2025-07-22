import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GeminiService, AnalysisRequest } from '@/lib/ai/gemini-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { reportType, data, question, analysisType } = body

    // Validate required fields
    if (!reportType || !data || !analysisType) {
      return NextResponse.json({ 
        error: 'Missing required fields: reportType, data, and analysisType are required' 
      }, { status: 400 })
    }

    // Validate reportType
    const validReportTypes = ['inventory', 'low-stock', 'movements', 'locations', 'analytics']
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json({ 
        error: `Invalid reportType. Must be one of: ${validReportTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validate analysisType
    const validAnalysisTypes = ['summary', 'forecast', 'risks', 'insights', 'custom']
    if (!validAnalysisTypes.includes(analysisType)) {
      return NextResponse.json({ 
        error: `Invalid analysisType. Must be one of: ${validAnalysisTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validate data array
    if (!Array.isArray(data)) {
      return NextResponse.json({ 
        error: 'Data must be an array' 
      }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ 
        error: 'Data array cannot be empty' 
      }, { status: 400 })
    }

    // Limit data size to prevent token overflow
    const maxRecords = 1000
    let analyzedData = data
    if (data.length > maxRecords) {
      analyzedData = data.slice(0, maxRecords)
      console.log(`Data truncated from ${data.length} to ${maxRecords} records for analysis`)
    }

    // Create analysis request
    const analysisRequest: AnalysisRequest = {
      reportType,
      data: analyzedData,
      question,
      analysisType
    }

    // Call Gemini service for analysis
    const analysisResult = await GeminiService.analyzeReport(analysisRequest)

    // Return the analysis results
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      metadata: {
        reportType,
        analysisType,
        recordsAnalyzed: analyzedData.length,
        totalRecords: data.length,
        analysisDate: new Date().toISOString(),
        question: question || null
      }
    })

  } catch (error: any) {
    console.error('AI analysis error:', error)
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json({ 
        error: 'Invalid or missing Gemini API key',
        details: 'Please check your Gemini API key configuration'
      }, { status: 401 })
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json({ 
        error: 'API quota exceeded',
        details: 'Please try again later or check your Gemini API quotas'
      }, { status: 429 })
    }

    return NextResponse.json({ 
      error: 'Failed to analyze report',
      details: error.message || 'Internal server error during AI analysis'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return API information and capabilities
    return NextResponse.json({
      service: 'Gemini AI Analysis',
      status: process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
      capabilities: {
        reportTypes: ['inventory', 'low-stock', 'movements', 'locations', 'analytics'],
        analysisTypes: ['summary', 'forecast', 'risks', 'insights', 'custom'],
        maxRecords: 1000
      },
      usage: {
        endpoint: '/api/ai/analyze-reports',
        method: 'POST',
        requiredFields: ['reportType', 'data', 'analysisType'],
        optionalFields: ['question']
      }
    })

  } catch (error: any) {
    console.error('API info error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve API information',
      details: error.message 
    }, { status: 500 })
  }
} 