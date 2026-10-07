# AegisFlow

> AI API Gateway for secure, reliable, and cost-aware AI integrations.

AegisFlow is an **AI API Gateway** that sits between an application and external AI providers.

It provides a centralized layer for:

- Authentication
- API key management
- Rate limiting
- Redis caching
- Request logging
- Usage tracking
- Provider credential management
- AI request handling

**Current release: v1.0.0**

---

## 🚀 Why AegisFlow?

Direct AI integrations can create several practical problems:

- Repeated API requests can increase costs.
- Rogue loops can consume API budgets quickly.
- Missing rate limits can cause uncontrolled usage.
- AI requests can introduce significant latency.
- Provider API keys need to be handled securely.
- Developers need visibility into requests, tokens, latency, failures, and costs.

AegisFlow adds a gateway layer between the application and the AI provider.

```text
┌──────────────────────┐
│   Your Application   │
│  Web / Mobile / API  │
└──────────┬───────────┘
           │
           │ AegisFlow API Key
           ▼
┌────────────────────────────┐
│         AegisFlow          │
│                            │
│  Authentication            │
│  Rate Limiting             │
│  Redis Caching             │
│  Request Logging           │
│  Usage Tracking             │
│  Provider Credentials      │
└─────────────┬──────────────┘
              │
              ▼
       ┌───────────────┐
       │  AI Provider  │
       │   OpenRouter  │
       └───────────────┘

Features
🔐 Authentication & Security
- User signup and login
- JWT-based authentication
- Google OAuth
- GitHub OAuth
- AegisFlow API key authentication
- API key hashing
- Secure provider credential management
- Password reset flow
- Token expiration and validation
⚡ Performance
- Redis-based response caching
- Configurable cache TTL
- Duplicate request detection through cache keys
- Request latency tracking
- Redis-backed OAuth temporary state
🚦 Rate Limiting
AegisFlow provides request rate limiting to help prevent uncontrolled AI API usage.
This helps protect applications from:
- Accidental request loops
- Excessive traffic
- Unexpected API consumption
- Uncontrolled AI spending
📊 Usage & Monitoring
AegisFlow tracks important request and usage metrics, including:
- Total requests
- Successful requests
- Failed requests
- Cache hits
- Cache hit rate
- Average latency
- Prompt tokens
- Completion tokens
- Total tokens
- Estimated cost
🔑 Provider Credential Management
Provider credentials can be managed through AegisFlow instead of exposing provider API keys directly to client applications.
Current Provider
- OpenRouter
Planned Providers
- OpenAI
- Google Gemini
- Anthropic Claude
Multi-provider support is planned for AegisFlow v2.
📖 API Documentation
AegisFlow uses FastAPI and provides interactive Swagger/OpenAPI documentation.
When running locally:
http://127.0.0.1:8000/docs

🛠️ Tech Stack
Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Redis
- HTTPX
Frontend
- React
- TypeScript
- Vite
Authentication
- JWT
- Google OAuth
- GitHub OAuth
Infrastructure
- Docker
- Docker Compose
- Git
- GitHub
- Render
AI
- OpenRouter API
🏗️ Architecture
                    ┌───────────────────┐
                    │  React / Client   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    AegisFlow      │
                    │      FastAPI      │
                    └─────────┬─────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
          PostgreSQL        Redis        OpenRouter

🔄 Request Flow
A typical AI request follows this flow:
Client Application
        │
        ▼
AegisFlow API
        │
        ├── Authenticate API Key
        │
        ├── Check Rate Limit
        │
        ├── Build Cache Key
        │
        ├── Check Redis Cache
        │       │
        │       ├── HIT ──────► Return Cached Response
        │       │
        │       └── MISS
        │
        ├── Send Request to AI Provider
        │
        ├── Store Response in Redis
        │
        ├── Record Request & Usage
        │
        └── Return Response

This architecture helps reduce unnecessary provider calls while giving the application a centralized control layer.
💾 Redis Caching
AegisFlow uses Redis to cache eligible AI responses.
A cache key is generated from request characteristics so that repeated equivalent requests can reuse an existing response.
The current cache TTL is configured for:
300 seconds

Example:
First Request
     │
     ▼
Cache MISS
     │
     ▼
AI Provider
     │
     ▼
Response
     │
     ├── Store in Redis
     ▼
Client


Same Request
     │
     ▼
Cache HIT
     │
     ▼
Cached Response

Caching can reduce duplicate AI provider calls and unnecessary spending.
🚦 Rate Limiting
AegisFlow applies rate limiting to help control API usage.
For example, an accidental application loop could generate:
while True:    call_ai()


Without a gateway, this could rapidly consume provider quota.
With AegisFlow:
Application
     │
     ▼
 AegisFlow
     │
     ├── Allowed ────────► AI Provider
     │
     └── Rate Limited ──► Request Rejected

🔑 API Keys
Applications authenticate with AegisFlow using an AegisFlow API key.
The key is sent using:
X-AegisFlow-Key: <your-key>

API keys are hashed before persistent storage rather than storing the raw key directly.
Security Recommendation
AegisFlow API keys should be stored on the server side of the consuming application.
Do not expose private API keys in:
- React client code
- Browser JavaScript
- Mobile application source code
- Public GitHub repositories
🔐 Authentication
AegisFlow supports multiple authentication mechanisms.
Email & Password
Signup
  ↓
Password Hash
  ↓
PostgreSQL
  ↓
Login
  ↓
JWT Access Token

Google OAuth
Users can authenticate using their Google account.
GitHub OAuth
Users can authenticate using their GitHub account.
Password Reset
AegisFlow provides a secure password reset flow using short-lived reset tokens and transactional email.
Reset tokens are hashed before being stored.
🗄️ PostgreSQL
PostgreSQL stores persistent application data such as:
- Users
- AegisFlow API keys
- AI requests
- Provider credentials
- OAuth accounts
- Password reset tokens
- Usage-related request information
SQLAlchemy is used as the ORM/database abstraction layer.
🔴 Redis
Redis is used for high-speed and temporary data such as:
- AI response caching
- OAuth state
- OAuth exchange codes
- Rate-limit related state
Redis complements PostgreSQL by handling short-lived data and frequently accessed cache data.
📁 Project Structure
aegisflow/
│
├── app/
│   │
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── api_keys.py
│   │       ├── chat.py
│   │       ├── health.py
│   │       ├── providers.py
│   │       ├── requests.py
│   │       ├── usage.py
│   │       └── user_api_keys.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── redis.py
│   │   └── security.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── api_key.py
│   │   ├── ai_request.py
│   │   ├── provider_credential.py
│   │   ├── oauth_account.py
│   │   └── password_reset_token.py
│   │
│   ├── schemas/
│   │   └── auth.py
│   │
│   ├── services/
│   │   ├── oauth_service.py
│   │   ├── password_reset_service.py
│   │   ├── email_service.py
│   │   ├── cache_service.py
│   │   └── provider services
│   │
│   └── main.py
│
├── frontend/
│   └── src/
│
├── tests/
│
├── docker-compose.yml
├── requirements.txt
└── README.md

💻 Running Locally
1. Clone the Repository
git clone https://github.com/Ayush09742/aegisflow.git
cd aegisflow

2. Create a Virtual Environment
Windows:
python -m venv .venv

Activate it:
.\.venv\Scripts\Activate.ps1

3. Install Dependencies
pip install -r requirements.txt

4. Configure Environment Variables
Create a .env file.
Example structure:
OPENROUTER_API_KEY=your_key

DATABASE_URL=your_postgresql_url

JWT_SECRET=your_jwt_secret

PROVIDER_CREDENTIAL_ENCRYPTION_KEY=your_encryption_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

OAUTH_FRONTEND_URL=http://127.0.0.1:5173
OAUTH_BACKEND_URL=http://127.0.0.1:8000

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME=AegisFlow

REDIS_HOST=localhost
REDIS_PORT=6379

Never commit your .env file or real credentials to GitHub.

5. Start PostgreSQL and Redis
If using Docker:
docker compose up -d

Verify the containers:
docker ps

6. Start FastAPI
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload

The API will be available at:
http://127.0.0.1:8000

Swagger documentation:
http://127.0.0.1:8000/docs

Health check:
http://127.0.0.1:8000/health

🧪 Testing
Run the test suite:
pytest

The test suite covers important backend functionality including:
- Authentication
- API keys
- Rate limiting
- Request handling
- Related backend services
☁️ Deployment
AegisFlow can be deployed as separate frontend and backend services.
Example:
                    Internet
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
       React Frontend      FastAPI Backend
           Render              Render
                                │
                   ┌────────────┼────────────┐
                   ▼            ▼            ▼
               PostgreSQL     Redis      OpenRouter

Production deployments require environment variables to be configured through the hosting provider.
Never store production secrets directly inside source code.
📌 Version 1.0.0
AegisFlow v1.0.0 establishes the core AI gateway infrastructure.
Included
- AI gateway
- OpenRouter integration
- API key authentication
- Rate limiting
- Redis caching
- PostgreSQL persistence
- Usage tracking
- Request logging
- JWT authentication
- Google OAuth
- GitHub OAuth
- Password reset
- Provider credential management
- React dashboard
- Swagger/OpenAPI documentation
- Docker-based development
- Production deployment
🛣️ Roadmap
Version 1.x
Future improvements may include:
- Better observability
- Improved usage analytics
- Better error handling
- Performance improvements
- Production hardening
- Documentation improvements
Version 2.0 — Multi-Provider AI Gateway
The major goal for AegisFlow v2 is to support multiple AI providers through one gateway.
Planned Providers
                    ┌── OpenRouter
                    │
Application → AegisFlow ├── OpenAI
                    │
                    ├── Google Gemini
                    │
                    └── Anthropic Claude

Planned Features
- Multi-provider API credentials
- Provider selection
- Model selection
- Provider fallback
- Smart routing
- Per-provider usage tracking
- Per-model cost tracking
- Provider health monitoring
- Advanced budget controls
- Improved analytics
The goal is to allow developers to integrate with multiple AI providers without building and maintaining separate gateway logic for each provider.
🎯 Project Goal
AegisFlow is built around a simple idea:
Make AI integrations easier to control, monitor, secure, and scale.

Instead of every application implementing its own:
- API key management
- Rate limiting
- Caching
- Request logging
- Usage tracking
- Provider integrations
AegisFlow provides these capabilities through a centralized gateway layer.
👨‍💻 Author
Tanishk Awasthi
BCA Student | Backend & AI Infrastructure Enthusiast
Interested in:
- Backend Engineering
- AI Infrastructure
- Generative AI
- APIs
- Cloud & Deployment
- Software Engineering
📜 License
Add your preferred license before distributing the project publicly.
⭐ Support
If you find AegisFlow interesting, feel free to explore the project, provide feedback, or suggest improvements.
Built with Python, FastAPI, PostgreSQL, Redis, React, TypeScript, Docker, and a lot of debugging. 🚀
