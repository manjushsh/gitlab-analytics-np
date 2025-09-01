# GitLab Analytics Monorepo

A comprehensive analytics tool for GitLab CI/CD pipelines that provides insights into deployment frequency, success rates, and more. This project is designed to help development teams track their performance metrics and identify areas for improvement.

This project is a monorepo containing two services:
- **server/**: Node.js + TypeScript backend (core logic, API, GitLab data processing)
- **client/**: React + Vite frontend (interactive analytics dashboard)

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

## Features

- **Pipeline Analytics**: Track success rates, frequency, and trends of CI/CD pipelines
- **Deployment Metrics**: Measure deployment frequency and lead time
- **Production Success Analysis**: Analyze production deployment success vs. failure rates
- **Interactive Dashboard**: Visualize analytics through an intuitive web interface
- **Configurable Time Periods**: Analyze data over customizable time ranges

## Architecture
See [`requirements/architecture.md`](requirements/architecture.md) and [`requirements/PRD.md`](requirements/PRD.md) for detailed design and requirements.

## Prerequisites

- Node.js (v18+)
- pnpm (v8+)
- GitLab personal access token with API access
- GitLab project with CI/CD pipelines

## Installation

1. Clone the repository:

```bash
git clone https://github.com/manjushsh/gitlab-analytics.git
cd gitlab-analytics
```

2. Install dependencies for the monorepo and all services:

```bash
pnpm install
```

## Configuration

Create a `.env` file in the server directory:

```bash
cd server
cp .env.example .env  # If .env.example exists, otherwise create .env manually
```

Edit the `.env` file with your GitLab credentials:

```
GITLAB_TOKEN=your_gitlab_personal_access_token
GITLAB_PROJECT_ID=your_gitlab_project_id
GITLAB_API_URL=https://gitlab.com/api/v4  # Change if using self-hosted GitLab
PERIOD_DAYS=30  # Analysis period in days
```

## Usage

### Running the entire application

From the root directory:

```bash
# Build and start both server and client
pnpm build
pnpm start:server
```

In a separate terminal:
```bash
pnpm start:client
```

### Start the backend server in development mode - WIP
```bash
pnpm dev:server
```

### Start the frontend client in development mode - WIP
```bash
pnpm dev:client
```

The server will process GitLab pipeline data and generate analytics in the `server/output` directory. The client will provide a web interface to visualize these analytics, available at http://localhost:5173 by default.

## Project Structure
```
gitlab-analytics/
├── client/               # React + Vite frontend
│   ├── src/              # Frontend source code
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── server/               # Node.js + TypeScript backend
│   ├── src/              # Backend source code
│   ├── output/           # Generated analytics data
│   └── package.json      # Backend dependencies
├── go-services/          # Go language services (if used)
├── requirements/         # PRD and architecture docs
├── package.json          # Monorepo root config/scripts
└── README.md             # Project documentation
```

## Development

### Available Scripts

- `pnpm build`: Build both client and server
- `pnpm dev:server`: Run server in development mode
- `pnpm dev:client`: Run client in development mode with hot reloading
- `pnpm start:server`: Run server in production mode
- `pnpm start:client`: Serve the built client

## License
MIT