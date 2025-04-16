# SoundScape AI

AI-powered audio environments that adapt to your surroundings and mood in real-time.

## Live Demo

Visit the live application at [https://sound-scape-ai-psi.vercel.app/](https://sound-scape-ai-psi.vercel.app/)

## Features

- AI-generated audio environments based on mood and context
- User authentication with Supabase
- Personalized user profiles and settings
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sagexd08/SoundScape-Ai.git
   cd SoundScape-Ai
   ```

2. Install dependencies:
   ```bash
   npm install
   cd Frontend
   npm install
   ```

3. Create a `.env.local` file in the Frontend directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   cd Frontend
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploying to Vercel

1. Fork this repository to your GitHub account.
2. Create a new project on Vercel and connect it to your GitHub repository.
3. Add the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy the project.

### GitHub Actions Deployment

This project includes a GitHub Actions workflow for automatic deployment to Vercel. To use it:

1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Push to the main branch to trigger a deployment.

## Supabase Setup

1. Create a new Supabase project.
2. Enable Email/Password authentication in the Auth settings.
3. Set up the following tables in your Supabase database:
   - Users (handled automatically by Supabase Auth)
   - Profiles (for additional user data)
   - Audio tracks
   - User preferences

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.com/) for authentication and database services
- [Vercel](https://vercel.com/) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com/) for UI components
