import { useState, useEffect } from 'react'
import { Play, Search, User, Building, Clock, ChevronDown, Loader2, AlertCircle, CheckCircle, Globe, Calendar, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchParams {
  type: 'person' | 'entity'
  fullName: string
  country?: string
  birthYear?: number
  threshold: number
}

interface SearchHistory extends SearchParams {
  timestamp: string
  id: string
}

interface OndatoResult {
  success?: boolean
  matches?: Array<{
    id: string
    name: string
    matchScore: number
    listType: string
    reason: string
    country: string
    dateAdded: string
    status: string
    details?: {
      aliases?: string[]
      description?: string
      source?: string
      lastUpdated?: string
    }
  }>
  searchInfo?: {
    query: string
    type: string
    threshold: number
    totalLists?: number
    searchTime?: string
    timestamp: string
    message?: string
    proxiedBy?: string
  }
  error?: string
  details?: string
  timestamp?: string
  type?: string
}

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan',
  'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
]

// Production API configuration - uses Vercel serverless function
const API_CONFIG = {
  baseUrl: '/api/aml-screening'
}

export default function IndexPage() {
  const [searchType, setSearchType] = useState<'person' | 'entity'>('person')
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    birthYear: '',
    threshold: 50
  })
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<OndatoResult | null>(null)
  const [history, setHistory] = useState<SearchHistory[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('ondato-search-history')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const saveToHistory = (searchParams: SearchParams) => {
    const historyItem: SearchHistory = {
      ...searchParams,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    }

    const newHistory = [historyItem, ...history.slice(0, 9)] // Keep last 10 searches
    setHistory(newHistory)
    localStorage.setItem('ondato-search-history', JSON.stringify(newHistory))
  }

  const handleSearch = async () => {
    if (!formData.fullName.trim()) {
      alert('Le nom complet est requis')
      return
    }

    setIsLoading(true)
    setResults(null)

    const searchParams: SearchParams = {
      type: searchType === 'person' ? 'person' : 'entity',
      fullName: formData.fullName.trim(),
      threshold: formData.threshold
    }

    if (searchType === 'person') {
      if (formData.country) searchParams.country = formData.country
      if (formData.birthYear) searchParams.birthYear = parseInt(formData.birthYear)
    }

    try {
      console.log('🔍 Making AML screening request:', searchParams)

      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.message || 'API request failed'}`)
      }

      const data = await response.json()
      console.log('✅ AML screening results:', data)
      setResults(data)
      saveToHistory(searchParams)

    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error)

      let errorMessage = 'Erreur lors de la recherche. Veuillez réessayer.'

      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.'
        } else if (error.message.includes('401')) {
          errorMessage = 'Erreur d\'authentification. Vérifiez vos identifiants.'
        } else if (error.message.includes('404')) {
          errorMessage = 'Endpoint API non trouvé. Vérifiez la configuration.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Données de recherche invalides.'
        }
      }

      setResults({
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatHistoryDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Criblage
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Plateforme de vérification AML avancée
          </p>
        </motion.div>

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 -z-10" />
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Recherche intelligente</h3>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                Recherchez une personne ou une organisation dans les listes de sanction.
                Remplissez les informations pour lancer une recherche, ou consultez votre
                historique des dernières recherches.
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                <span>Développé avec</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">Ondato</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Play className="w-5 h-5" />
              <span className="font-medium">Regarder le tutoriel</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/20 -z-10" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Nouvelle recherche</h2>
          </div>

          <div className="space-y-6">
            {/* Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Type de recherche *
              </label>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSearchType('person')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                    searchType === 'person'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <User className={`w-5 h-5 ${
                      searchType === 'person' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className="font-medium">Personne physique</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSearchType('entity')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                    searchType === 'entity'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Building className={`w-5 h-5 ${
                      searchType === 'entity' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className="font-medium">Entité légale</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Form Fields */}
            <AnimatePresence mode="wait">
              <motion.div
                key={searchType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Full Name */}
                <div className="lg:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <User className="w-4 h-4" />
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                    placeholder="Entrez le nom complet"
                    required
                  />
                </div>

                {/* Country (only for person) */}
                {searchType === 'person' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Globe className="w-4 h-4" />
                      Pays
                    </label>
                    <div className="relative">
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 appearance-none"
                      >
                        <option value="">Sélectionner un pays</option>
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </motion.div>
                )}

                {/* Birth Year (only for person) */}
                {searchType === 'person' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Calendar className="w-4 h-4" />
                      Année de naissance
                    </label>
                    <input
                      type="number"
                      value={formData.birthYear}
                      onChange={(e) => handleInputChange('birthYear', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                      placeholder="1990"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </motion.div>
                )}

                {/* Threshold */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: searchType === 'person' ? 0.3 : 0.1 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
                    Seuil de correspondance: {formData.threshold}%
                  </label>
                  <div className="bg-white/70 p-4 rounded-xl border-2 border-gray-200">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.threshold}
                      onChange={(e) => handleInputChange('threshold', parseInt(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #fee2e2 0%, #fef3c7 50%, #dcfce7 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span className="text-red-500 font-medium">0% - Faible</span>
                      <span className="text-green-600 font-medium">100% - Élevé</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={isLoading}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Recherche en cours...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>Lancer la recherche</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/30 -z-10" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  {results.error ? (
                    <AlertCircle className="w-6 h-6 text-white" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {results.error ? 'Erreur' : 'Résultats de la recherche'}
                </h2>
              </div>
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                <pre className="text-sm text-slate-700 overflow-auto max-h-96 font-mono leading-relaxed">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/30 -z-10" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Historique des recherches</h2>
              </div>
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group flex justify-between items-center p-4 bg-white/70 hover:bg-white/90 rounded-xl border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg transition-colors">
                        {item.type === 'person' ? (
                          <User className="w-4 h-4 text-slate-600" />
                        ) : (
                          <Building className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                          {item.fullName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium">
                            {item.type === 'person' ? 'Personne' : 'Entité'}
                          </span>
                          {item.type === 'person' && item.country && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {item.country}
                            </span>
                          )}
                          {item.type === 'person' && item.birthYear && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.birthYear}
                            </span>
                          )}
                          <span>Seuil: {item.threshold}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatHistoryDate(item.timestamp)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}