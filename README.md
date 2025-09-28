# CorpTools API Server

A Node.js API server that provides both local user management and external CorpTools API integration.

## Architecture

This server separates concerns between:
- **Local User Management**: User registration, login, and authentication handled locally
- **External CorpTools API**: Company operations, services, invoices, and other business data via CorpTools API

## Features

### Local User Management
- User registration (`POST /api/register`)
- User authentication (`POST /api/auth`)
- Local user storage (in-memory for development)

### External CorpTools API Integration
- Company operations (`GET/POST /api/companies`)
- Individual company management (`GET/PATCH /api/companies/:id`)
- Account information (`GET /api/auth`)
- Services, invoices, payment methods via main API handler

## API Endpoints

### Authentication & Users
- `GET /api/auth` - Get account info from CorpTools API
- `POST /api/auth` - Login user (local authentication)
- `POST /api/register` - Create new user account (local)

### Companies
- `GET /api/companies` - Get all companies (CorpTools API)
- `POST /api/companies` - Create new company (CorpTools API)
- `GET /api/companies/:id` - Get specific company (CorpTools API)
- `PATCH /api/companies/:id` - Update company (CorpTools API)

### Other Services
- `GET /api?action=services` - Get services (CorpTools API)
- `GET /api?action=invoices` - Get invoices (CorpTools API)
- `GET /api?action=payment-methods` - Get payment methods (CorpTools API)

## Environment Configuration

### Option 1: Copy the template file
```bash
cp config.env .env
```

### Option 2: Create your own `.env` file
Create a `.env` file in the root directory with:

```env
# CorpTools API Configuration
CORPTOOLS_ACCESS_KEY=your_access_key_here
CORPTOOLS_SECRET_KEY=your_secret_key_here

# Debug mode (optional)
DEBUG=false

# Server Configuration
PORT=3000
```

**Note**: The `config.env` file contains the default CorpTools API credentials for development. For production, replace with your own credentials.

## Installation

```bash
npm install
```

## Usage

```bash
# Development
npm run dev

# Production
npm start
```

## Base Request Module

The server uses a centralized `base_request.js` module that handles:
- JWT token generation for CorpTools API
- HTTP requests to CorpTools API
- Error handling and response formatting
- Query parameter handling

This follows the same pattern as the JavaScript examples in the CorpTools-API-Examples repository.