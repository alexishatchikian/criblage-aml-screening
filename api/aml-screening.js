// Vercel serverless function for Ondato AML screening API proxy
export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    })
  }

  // Get Ondato credentials from environment variables (more secure)
  const ONDATO_CONFIG = {
    clientId: process.env.ONDATO_CLIENT_ID || 'supernovae.amlscreening',
    clientSecret: process.env.ONDATO_CLIENT_SECRET || 'fce294d19c308d049ee83a121165b2b8715f0ac26abd85b57332d0f6b367f1d7',
    baseUrl: process.env.ONDATO_BASE_URL || 'https://kycapi.ondato.com/v1/aml-screening'
  }

  try {
    const { type, fullName, country, birthYear, threshold } = req.body

    // Validate required fields
    if (!fullName || !type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'fullName and type are required'
      })
    }

    console.log('🔍 Making AML screening request:', {
      type,
      fullName,
      country,
      birthYear,
      threshold
    })

    // Make request to Ondato API
    const response = await fetch(ONDATO_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ONDATO_CONFIG.clientSecret}`,
        'X-Client-Id': ONDATO_CONFIG.clientId,
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Ondato-Proxy/1.0'
      },
      body: JSON.stringify({
        type: type === 'person' ? 'individual' : 'entity', // Map to Ondato API format
        name: fullName,
        country: country || undefined,
        birthYear: birthYear ? parseInt(birthYear) : undefined,
        threshold: threshold || 50
      })
    })

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Ondato API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })

      // Map Ondato API errors to user-friendly messages
      let userMessage = 'Erreur lors de la recherche AML'
      if (response.status === 401) {
        userMessage = 'Erreur d\'authentification avec le service AML'
      } else if (response.status === 400) {
        userMessage = 'Données de recherche invalides'
      } else if (response.status === 429) {
        userMessage = 'Trop de requêtes. Veuillez réessayer plus tard.'
      } else if (response.status >= 500) {
        userMessage = 'Service AML temporairement indisponible'
      }

      return res.status(response.status).json({
        error: userMessage,
        details: `HTTP ${response.status}: ${errorText}`,
        timestamp: new Date().toISOString()
      })
    }

    // Parse and return successful response
    const data = await response.json()
    console.log('✅ Ondato API Success:', data)

    return res.status(200).json({
      success: true,
      ...data,
      searchInfo: {
        ...data.searchInfo,
        proxiedBy: 'Vercel',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Server Error:', error)

    // Handle different types of errors
    let errorMessage = 'Erreur interne du serveur'
    let statusCode = 500

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Impossible de contacter le service AML'
      statusCode = 503
    } else if (error.name === 'SyntaxError') {
      errorMessage = 'Réponse invalide du service AML'
      statusCode = 502
    }

    return res.status(statusCode).json({
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString(),
      type: 'server_error'
    })
  }
}