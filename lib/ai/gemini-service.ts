import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Get the Gemini Pro model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export interface AnalysisRequest {
  reportType: 'inventory' | 'low-stock' | 'movements' | 'locations' | 'analytics'
  data: any[]
  question?: string
  analysisType: 'summary' | 'forecast' | 'risks' | 'insights' | 'custom'
}

export interface AnalysisResponse {
  analysis: string
  keyInsights: string[]
  recommendations: string[]
  riskFactors?: string[]
  forecastData?: any
}

export class GeminiService {
  
  /**
   * Analyze inventory reports using Gemini AI
   */
  static async analyzeReport(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const prompt = this.buildPrompt(request)
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the response to extract structured information
      return this.parseAnalysisResponse(text, request.analysisType)
      
    } catch (error) {
      console.error('Gemini analysis error:', error)
      throw new Error('Failed to analyze report with Gemini AI')
    }
  }

  /**
   * Build a comprehensive prompt for Gemini based on the request
   */
  private static buildPrompt(request: AnalysisRequest): string {
    const { reportType, data, question, analysisType } = request
    
    let basePrompt = `You are an expert inventory management analyst. Please analyze the following ${reportType} report data and provide insights.\n\n`
    
    // Add data context
    basePrompt += `Report Data (${data.length} records):\n`
    basePrompt += JSON.stringify(data, null, 2)
    basePrompt += '\n\n'

    // Add specific analysis instructions based on type
    switch (analysisType) {
      case 'summary':
        basePrompt += `Please provide a comprehensive summary of this ${reportType} data. Focus on:\n`
        basePrompt += `- Overall inventory health and status\n`
        basePrompt += `- Key metrics and totals\n`
        basePrompt += `- Notable patterns or trends\n`
        basePrompt += `- Distribution across locations/categories\n`
        break
        
      case 'forecast':
        basePrompt += `Please analyze trends in this ${reportType} data and provide forecasting insights:\n`
        basePrompt += `- Identify consumption/usage patterns\n`
        basePrompt += `- Predict future stock requirements\n`
        basePrompt += `- Seasonal or cyclical trends\n`
        basePrompt += `- Recommended reorder points\n`
        break
        
      case 'risks':
        basePrompt += `Please identify potential risks and issues in this ${reportType} data:\n`
        basePrompt += `- Stock-out risks and low inventory warnings\n`
        basePrompt += `- Overstocking concerns\n`
        basePrompt += `- Slow-moving or obsolete inventory\n`
        basePrompt += `- Location-specific issues\n`
        break
        
      case 'insights':
        basePrompt += `Please provide strategic insights and optimization opportunities:\n`
        basePrompt += `- Inventory optimization opportunities\n`
        basePrompt += `- Cost reduction potential\n`
        basePrompt += `- Process improvement suggestions\n`
        basePrompt += `- Resource allocation recommendations\n`
        break
        
      case 'custom':
        if (question) {
          basePrompt += `Please answer this specific question about the data: ${question}\n`
        } else {
          basePrompt += `Please provide a comprehensive analysis covering all aspects of the data.\n`
        }
        break
    }

    basePrompt += `\nPlease structure your response as follows:
    
ANALYSIS:
[Provide your main analysis here]

KEY_INSIGHTS:
- [First key insight]
- [Second key insight]
- [Third key insight]

RECOMMENDATIONS:
- [First recommendation]
- [Second recommendation]
- [Third recommendation]`

    if (analysisType === 'risks' || analysisType === 'insights') {
      basePrompt += `\n
RISK_FACTORS:
- [First risk factor]
- [Second risk factor]
- [Third risk factor]`
    }

    return basePrompt
  }

  /**
   * Parse the Gemini response into structured format
   */
  private static parseAnalysisResponse(text: string, analysisType: string): AnalysisResponse {
    const response: AnalysisResponse = {
      analysis: '',
      keyInsights: [],
      recommendations: [],
      riskFactors: []
    }

    // Extract main analysis
    const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]*?)(?=KEY_INSIGHTS:|$)/i)
    if (analysisMatch) {
      response.analysis = analysisMatch[1].trim()
    } else {
      // Fallback: use first paragraph if structured format not found
      response.analysis = text.split('\n\n')[0] || text.substring(0, 500)
    }

    // Extract key insights
    const insightsMatch = text.match(/KEY_INSIGHTS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|RISK_FACTORS:|$)/i)
    if (insightsMatch) {
      response.keyInsights = this.extractBulletPoints(insightsMatch[1])
    }

    // Extract recommendations
    const recommendationsMatch = text.match(/RECOMMENDATIONS:\s*([\s\S]*?)(?=RISK_FACTORS:|$)/i)
    if (recommendationsMatch) {
      response.recommendations = this.extractBulletPoints(recommendationsMatch[1])
    }

    // Extract risk factors if present
    const riskMatch = text.match(/RISK_FACTORS:\s*([\s\S]*?)$/i)
    if (riskMatch) {
      response.riskFactors = this.extractBulletPoints(riskMatch[1])
    }

    return response
  }

  /**
   * Extract bullet points from text
   */
  private static extractBulletPoints(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5) // Limit to 5 items
  }

  /**
   * Generate inventory summary with AI insights
   */
  static async generateInventorySummary(inventoryData: any[]): Promise<AnalysisResponse> {
    return this.analyzeReport({
      reportType: 'inventory',
      data: inventoryData,
      analysisType: 'summary'
    })
  }

  /**
   * Forecast trends based on movement data
   */
  static async forecastTrends(movementData: any[]): Promise<AnalysisResponse> {
    return this.analyzeReport({
      reportType: 'movements',
      data: movementData,
      analysisType: 'forecast'
    })
  }

  /**
   * Identify risks and issues
   */
  static async identifyRisks(reportData: any[], reportType: 'inventory' | 'low-stock' | 'movements'): Promise<AnalysisResponse> {
    return this.analyzeReport({
      reportType,
      data: reportData,
      analysisType: 'risks'
    })
  }
} 