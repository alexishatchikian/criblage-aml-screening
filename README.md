# 🛡️ Criblage - AML Screening Platform

A modern, production-ready AML (Anti-Money Laundering) screening platform built with React, TypeScript, and integrated with Ondato's AML screening API.

## ✨ Features

- **🔍 AML Screening**: Search individuals and entities against global sanctions lists
- **👤 Person Screening**: Screen individuals with name, country, and birth year
- **🏢 Entity Screening**: Screen legal entities and organizations
- **📊 Match Results**: Detailed match information with confidence scores
- **📝 Search History**: Persistent search history with localStorage
- **🎨 Beautiful UI**: Modern design with smooth animations and micro-interactions
- **🚀 Fast Performance**: Built with Vite for optimal development and production performance

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Vercel Serverless Functions** (Node.js)
- **Ondato AML API** integration
- **Environment-based configuration**

## 🚀 Quick Start

### Development

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Open browser**: Navigate to `http://localhost:5174`

### Production Deployment

See the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed Vercel deployment instructions.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
ONDATO_CLIENT_ID=your_ondato_client_id
ONDATO_CLIENT_SECRET=your_ondato_client_secret
ONDATO_BASE_URL=https://kycapi.ondato.com/v1/aml-screening
```

## 📁 Project Structure

```
├── api/
│   └── aml-screening.js        # Vercel serverless API proxy
├── src/
│   ├── pages/
│   │   └── index.tsx           # Main application page
│   └── components/             # Reusable React components
├── .env.local                  # Environment variables
├── vercel.json                 # Vercel deployment configuration
└── DEPLOYMENT_GUIDE.md         # Detailed deployment instructions
```

## 🔒 Security Features

- **API Proxy**: Ondato credentials secured on server-side
- **Input Validation**: Comprehensive validation of all user inputs
- **Error Handling**: Graceful error handling with user-friendly messages
- **CORS Protection**: Proper CORS configuration for API security

## 📊 API Integration

The application integrates with Ondato's AML screening API through a serverless function that:

- Proxies requests to avoid CORS issues
- Keeps API credentials secure
- Handles authentication and error responses
- Provides consistent response formatting

## 🎯 Usage

1. **Select screening type**: Choose between "Personne physique" (Individual) or "Entité légale" (Legal entity)
2. **Enter details**: Fill in the required information (name is mandatory)
3. **Set threshold**: Adjust the matching threshold (0-100%)
4. **Search**: Click "Lancer la recherche" to perform the screening
5. **Review results**: View detailed match information and save to history

## 🔍 Development Notes

- **Hot Module Replacement**: Instant updates during development
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code quality and consistency enforcement
- **Responsive Design**: Works perfectly on all device sizes

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🌐 Deployment

This application is optimized for deployment on Vercel with:

- Automatic builds from Git
- Serverless function deployment
- Environment variable management
- Global CDN distribution

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 📞 Support

- Check browser console for debugging information
- Review API logs in Vercel dashboard
- Ensure all environment variables are properly configured
