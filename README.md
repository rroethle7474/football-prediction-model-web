# NFL Stats Predictor

## Project Description
Frontend project to predict nfl stats based on trained models using previous statistics. 

Production URL: https://www.jclleague.com/

## Technologies Used

This project is built with the following technologies:

- **Next.js** - React framework for server-rendered applications
- **React** - Frontend library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **TypeScript** - Static type-checking for JavaScript

## Running Locally

To run this project locally, follow these steps:

1. Clone the repository
   ```bash
   git clone [your-repository-url]
   cd nfl-stats-predictor
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory and add your environment variables (see Environment Variables section below)

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Routes

The application includes the following main routes:

- **Home (/)** - Landing page with an introduction to the NFL Stats Predictor
- **Predict (/predict)** - Make predictions using trained models
- **Build Model (/build-model)** - Create and configure new prediction models
- **Train Model (/train-model)** - Train models with historical NFL data

## Environment Variables

The following environment variables are required to run the application: (see .env file)

| Variable | Description |
|----------|-------------|
| [NEXT_PUBLIC_API_BASE_URL] | [API URL run locally based on this repo: https://github.com/rroethle7474/football-prediction-model-api ] |


## Deployment

The frontend and API used for this project are currently hosted within Azure.
