# Critical Infrastructure Robustness Analysis Using SPQR Trees

Advanced robustness analysis system for critical infrastructure networks.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://urban-flow-guardian-main.vercel.app)

## 🚀 Live Demo
Access the live application here: **[https://urban-flow-guardian-main.vercel.app](https://urban-flow-guardian-main.vercel.app)**

## About

This system leverages **SPQR Tree decomposition** (Hopcroft-Tarjan algorithm) to identify structural vulnerabilities in critical infrastructure networks. By decomposing networks into Series, Parallel, and Rigid components, it detects biconnected components, articulation points, and bridges to evaluate network resilience against single-point failures.

## Technologies

This project is built with:

- **Vite** - Next-generation frontend build tool
- **TypeScript** - Type-safe JavaScript
- **React** - Component-based UI library
- **shadcn/ui** - Beautifully designed components
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd urban-flow-guardian

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Deployment

Build the project for production:

```sh
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

## License

MIT License
