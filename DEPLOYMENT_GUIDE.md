# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a Git repository
3. **Ondato API Credentials**: Ensure you have valid Ondato API credentials

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing this code

### 2. Configure Environment Variables

**Important**: You must manually add environment variables in Vercel dashboard. The `.env` file is ignored by Git for security.

**Step-by-step:**

1. **In Vercel dashboard**, go to your project
2. **Click "Settings"** tab
3. **Click "Environment Variables"** in the sidebar
4. **Add these 3 variables one by one:**

| Name | Value |
|------|-------|
| `ONDATO_CLIENT_ID` | `supernovae.amlscreening` |
| `ONDATO_CLIENT_SECRET` | `fce294d19c308d049ee83a121165b2b8715f0ac26abd85b57332d0f6b367f1d7` |
| `ONDATO_BASE_URL` | `https://kycapi.ondato.com/v1/aml-screening` |

5. **Set Environment** to "Production, Preview, and Development"
6. **Click "Save"** for each variable

**Important Notes**:
- Environment variables are NOT in `vercel.json` (security)
- They must be manually configured in Vercel dashboard
- The serverless function reads them from `process.env`
- After adding variables, redeploy your project

### 3. Deploy

1. Click "Deploy" in Vercel
2. Vercel will automatically:
   - Install dependencies
   - Build the React application
   - Deploy the serverless API function
   - Provide you with a live URL

### 4. Test the Deployment

1. Visit your deployed URL
2. Try making an AML screening search
3. Check the browser console for any errors
4. Verify that the API calls are working through `/api/aml-screening`

## Architecture

### Frontend (React + Vite)
- **Build**: Static files deployed to Vercel's CDN
- **Runtime**: Client-side React application
- **API Calls**: Makes requests to `/api/aml-screening`

### Backend (Vercel Serverless Function)
- **File**: `api/aml-screening.js`
- **Runtime**: Node.js serverless function
- **Purpose**: Proxies requests to Ondato API
- **Benefits**:
  - Solves CORS issues
  - Keeps API credentials secure
  - Handles authentication

## File Structure

```
├── api/
│   └── aml-screening.js        # Vercel serverless function
├── src/
│   ├── pages/
│   │   └── index.tsx           # Main application
│   └── components/             # React components
├── .env.local                  # Local environment variables
├── .env.example               # Environment variables template
├── vercel.json                # Vercel configuration
└── package.json               # Dependencies and scripts
```

## Security Features

1. **Environment Variables**: API credentials stored securely in Vercel
2. **CORS**: Proper CORS headers configured in the API function
3. **Rate Limiting**: Can be added to the API function if needed
4. **Input Validation**: Server-side validation of all inputs
5. **Error Handling**: Comprehensive error handling and logging

## Troubleshooting

### Common Issues

1. **API Not Working**: Check environment variables in Vercel dashboard
2. **CORS Errors**: Ensure the API function has proper CORS headers
3. **Build Errors**: Check that all dependencies are in package.json
4. **404 on API**: Verify the API function is in the `api/` directory

### Debugging

1. **Vercel Logs**: Check function logs in Vercel dashboard
2. **Browser Console**: Check for client-side errors
3. **Network Tab**: Monitor API requests in browser dev tools

### Performance Optimization

1. **Caching**: API responses can be cached
2. **CDN**: Static assets served from Vercel's global CDN
3. **Serverless**: Automatic scaling based on demand

## Monitoring

- **Vercel Analytics**: Monitor page views and performance
- **Function Logs**: Monitor API usage and errors
- **Custom Logging**: Add application-specific logging

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Production Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Monitoring**: Set up alerts for API errors
3. **Caching**: Implement caching for better performance
4. **Analytics**: Track usage and performance metrics

## Cost Considerations

- **Vercel Free Tier**: Includes generous limits for hobby projects
- **Serverless Functions**: Pay per execution (first 100GB-hours free)
- **Bandwidth**: Free tier includes 100GB transfer per month

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel](https://github.com/vercel/vercel)
- **This Project**: Check the console logs for debugging information