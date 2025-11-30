# DeCenter AI App

A Next.js + TypeScript application that provides authentication, API key management, Playground UI, and user profile settings for interacting with the Unreal / IdeoMind API.

This app serves as the frontend for developers using DeCenter AI, giving them a dashboard where they can:

- Passwordless sign-in
- Generate & revoke API keys
- Test models in the Playground

## Tech Stack
| Area | Technology |
| -----| -----------|
| Framework |	Next.js (App Router) |
| Language | TypeScript |
| Authentication & Web3 Library | Thirdweb |
| API Integration |	Unreal API: [https://docs.ideomind.org/openai/v1](https://docs.ideomind.org/) |
| Style |	Tailwind CSS |
| Database |	Supabase (Postgres) |
| Deployment | Vercel |

## Features
1. User Authentication
2. API Key Management
3. Playground
4. Profile Settings

## Unreal API Integration
The app fully uses Unreal’s API:
Docs: [https://docs.ideomind.org/openai/v1](https://docs.ideomind.org/)

Implemented:

- Register for API access
- Verify API token
- Get all API keys
- Create API key
- Delete API key
- List models
- Create chat completion
- Health check

## Project Structure
```

│ middleware.ts
│ .env.local
│
│ ├──src/
│   ├── actions/
│
│   ├── app/
│     ├── layout.tsx              # Root layout & providers
│     ├── page.tsx                # Home
│     ├── (auth)/                 # Authentication pages
│     ├── (private)/              # Private routes e.g Dashboard
│     └── api/                    # Internal Next.js API routes
│
│   ├── components/                 
│                        
│   ├── hooks/                 
│
│   ├── lib/ 
│
│   ├── services/
│
│   ├── styles/
│
│   ├── utils/
│  

```

## Getting Started
1. Install dependencies
```bash
npm install
```

2. Create .env.local
```
Copy .env.example and fill with environment variables
```

3. Run Dev Server
```bash
npm run dev
```

4. Open http://localhost:3000
