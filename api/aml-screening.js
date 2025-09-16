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
    tokenUrl: 'https://id.ondato.com/connect/token',
    baseUrl: process.env.ONDATO_BASE_URL || 'https://kycapi.ondato.com/v1/identity-verifications'
  }

  // Function to get OAuth access token
  async function getAccessToken() {
    const tokenResponse = await fetch(ONDATO_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: ONDATO_CONFIG.clientId,
        client_secret: ONDATO_CONFIG.clientSecret,
        scope: 'kyc_api'
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Token request failed: ${tokenResponse.status} ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    return tokenData.access_token
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

    // Get OAuth access token
    console.log('🔐 Getting OAuth access token...')
    const accessToken = await getAccessToken()
    console.log('✅ Access token obtained')

    // Make request to Ondato API
    const response = await fetch(ONDATO_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Ondato-Proxy/1.0'
      },
      body: JSON.stringify({
        setupId: ONDATO_CONFIG.clientId,
        type: type === 'person' ? 'individual' : 'entity',
        personalInformation: {
          name: fullName,
          country: country || undefined,
          birthYear: birthYear ? parseInt(birthYear) : undefined
        },
        amlSettings: {
          threshold: threshold || 50,
          screeningType: 'sanctions_pep_adverse_media'
        }
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
        requestId: `error_${Date.now()}`,
        type: type === 'person' ? 'personne_physique' : 'entite_legale',
        fullName,
        country: country || undefined,
        birthYear: birthYear ? parseInt(birthYear) : undefined,
        threshold: threshold || 50,
        timestamp: new Date().toISOString(),
        matches: [],
        status: 'error',
        errorMessage: userMessage
      })
    }

    // Parse and return successful response
    const data = await response.json()
    console.log('✅ Ondato API Success:', data)

    // Transform Ondato response to match your schema
    const transformedResponse = {
      requestId: data.id || `req_${Date.now()}`,
      type: type === 'person' ? 'personne_physique' : 'entite_legale',
      fullName,
      country: country || undefined,
      birthYear: birthYear ? parseInt(birthYear) : undefined,
      threshold: threshold || 50,
      timestamp: new Date().toISOString(),

      matches: (data.matches || data.screeningResult?.matches || []).map(match => ({
        entityId: match.id || match.entityId || `entity_${Math.random().toString(36).substr(2, 9)}`,
        name: match.name || match.fullName || match.matchedName,
        listName: match.listName || match.source || match.listType || 'Unknown List',
        matchScore: match.score || match.matchScore || match.similarity || 0,
        type: match.type === 'individual' || match.entityType === 'person' ? 'personne_physique' : 'entite_legale',
        country: match.country || match.nationality || undefined,
        additionalInfo: {
          birthYear: match.birthYear || match.dateOfBirth ? new Date(match.dateOfBirth).getFullYear() : undefined,
          aliases: match.aliases || match.alternativeNames || undefined,
          address: match.address || match.location || undefined,
          sourceDate: match.sourceDate || match.lastUpdated || undefined
        }
      })),

      status: data.matches?.length > 0 || data.screeningResult?.matches?.length > 0 ? 'found' : 'not_found',
      errorMessage: undefined
    }

    return res.status(200).json(transformedResponse)

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
      requestId: `error_${Date.now()}`,
      type: type === 'person' ? 'personne_physique' : 'entite_legale',
      fullName: fullName || 'Unknown',
      country: country || undefined,
      birthYear: birthYear ? parseInt(birthYear) : undefined,
      threshold: threshold || 50,
      timestamp: new Date().toISOString(),
      matches: [],
      status: 'error',
      errorMessage: errorMessage
    })
  }
}