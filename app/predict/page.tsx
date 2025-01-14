'use client'

import { useState, useEffect } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { getPrediction, getModels } from '@/app/services/prediction';

const NFL_TEAMS = [
  'Arizona', 'Atlanta', 'Baltimore', 'Buffalo',
  'Carolina', 'Chicago', 'Cincinnati', 'Cleveland',
  'Dallas', 'Denver', 'Detroit', 'Green Bay',
  'Houston', 'Indianapolis', 'Jacksonville', 'Kansas City',
  'Las Vegas', 'LA Chargers', 'LA Rams', 'Miami',
  'Minnesota', 'New England', 'New Orleans', 'NY Giants',
  'NY Jets', 'Philadelphia', 'Pittsburgh', 'San Francisco',
  'Seattle', 'Tampa Bay', 'Tennessee', 'Washington'
]

interface PredictionResults {
  awayPassingYards: number;
  awayPassingAttempts: number;
  homePassingYards: number;
  homePassingAttempts: number;
  awayRushingYards: number;
  awayRushingAttempts: number;
  homeRushingYards: number;
  homeRushingAttempts: number;
  awayTimeOfPossession: string;
  homeTimeOfPossession: string;
}

export default function Predict() {
  const [awayTeam, setAwayTeam] = useState('')
  const [homeTeam, setHomeTeam] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PredictionResults | null>(null)
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('')

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await getModels();
        setModels(response.models);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };

    fetchModels();
  }, []);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      console.log(homeTeam, awayTeam);
      
      const result = await getPrediction(homeTeam, awayTeam, selectedModel);
      console.log(result);
      // Transform the API response to match your current results structure
      setResults({
        awayPassingYards: result.predictions.away_team.passing_yards,
        awayPassingAttempts: result.predictions.away_team.passing_attempts,
        homePassingYards: result.predictions.home_team.passing_yards,
        homePassingAttempts: result.predictions.home_team.passing_attempts,
        awayRushingYards: result.predictions.away_team.rushing_yards,
        awayRushingAttempts: result.predictions.away_team.rushing_attempts,
        homeRushingYards: result.predictions.home_team.rushing_yards,
        homeRushingAttempts: result.predictions.home_team.rushing_attempts,
        awayTimeOfPossession: formatTimeOfPossession(result.predictions.away_team.time_of_possession),
        homeTimeOfPossession: formatTimeOfPossession(result.predictions.home_team.time_of_possession)
      });
    } catch (error) {
      console.error('Failed to get prediction:', error);
      // Optionally add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format time of possession
  const formatTimeOfPossession = (minutes: number) => {
    const wholeMinutes = Math.floor(minutes);
    const seconds = Math.round((minutes - wholeMinutes) * 60);
    return `${wholeMinutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto mt-8 p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Predict NFL Game Stats</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Away Team
            </label>
            <Select onValueChange={setAwayTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select away team" />
              </SelectTrigger>
              <SelectContent>
                {NFL_TEAMS.filter(team => team !== homeTeam).map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Home Team
            </label>
            <Select onValueChange={setHomeTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select home team" />
              </SelectTrigger>
              <SelectContent>
                {NFL_TEAMS.filter(team => team !== awayTeam).map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Model
            </label>
            <Select onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={handlePredict}
          disabled={!awayTeam || !homeTeam || isLoading}
          className="w-full md:w-auto md:px-8 mx-auto block"
        >
          {isLoading ? 'Predicting...' : 'Predict'}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {results && (
        <div className="mt-8 bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Prediction Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 p-4 rounded-lg bg-muted">
              <h3 className="text-xl font-bold text-center">{awayTeam}</h3>
              <div className="space-y-2">
                <p className="flex justify-between"><span>Passing Yards:</span> <span>{results.awayPassingYards}</span></p>
                <p className="flex justify-between"><span>Passing Attempts:</span> <span>{results.awayPassingAttempts}</span></p>
                <p className="flex justify-between"><span>Rushing Yards:</span> <span>{results.awayRushingYards}</span></p>
                <p className="flex justify-between"><span>Rushing Attempts:</span> <span>{results.awayRushingAttempts}</span></p>
                <p className="flex justify-between"><span>Time of Possession:</span> <span>{results.awayTimeOfPossession}</span></p>
              </div>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-muted">
              <h3 className="text-xl font-bold text-center">{homeTeam}</h3>
              <div className="space-y-2">
                <p className="flex justify-between"><span>Passing Yards:</span> <span>{results.homePassingYards}</span></p>
                <p className="flex justify-between"><span>Passing Attempts:</span> <span>{results.homePassingAttempts}</span></p>
                <p className="flex justify-between"><span>Rushing Yards:</span> <span>{results.homeRushingYards}</span></p>
                <p className="flex justify-between"><span>Rushing Attempts:</span> <span>{results.homeRushingAttempts}</span></p>
                <p className="flex justify-between"><span>Time of Possession:</span> <span>{results.homeTimeOfPossession}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}