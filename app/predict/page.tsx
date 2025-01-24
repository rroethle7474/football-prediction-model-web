'use client'

import { useState, useEffect } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getPrediction, getModels } from '@/app/services/prediction'
import ReactMarkdown from 'react-markdown'

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

interface ModelInfo {
  name: string;
  description: string[];
  tags: string[];
  lastModified: string;
  readme: string | null;
}

export default function Predict() {
  const [awayTeam, setAwayTeam] = useState('')
  const [homeTeam, setHomeTeam] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PredictionResults | null>(null)
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedDocModel, setSelectedDocModel] = useState('')

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await getModels();
        if (response.status === 'success' && Array.isArray(response.models)) {
          const modelsData: ModelInfo[] = response.models.map(model => ({
            name: model.name,
            description: Array.isArray(model.description) ? model.description : 
                        typeof model.description === 'string' ? [model.description] : [],
            tags: Array.isArray(model.tags) ? model.tags : [],
            lastModified: model.lastModified || new Date().toISOString(),
            readme: model.readme || null
          }));
          setModels(modelsData);
          if (modelsData.length > 0) {
            setSelectedDocModel(modelsData[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
  
    fetchModels();
  }, []);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const result = await getPrediction(homeTeam, awayTeam, selectedModel);
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
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeOfPossession = (minutes: number) => {
    const wholeMinutes = Math.floor(minutes);
    const seconds = Math.round((minutes - wholeMinutes) * 60);
    return `${wholeMinutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectedModelInfo = models.find(model => model.name === selectedDocModel);

  return (
    <div className="container mx-auto mt-8 p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">NFL Game Stats Predictor</h1>
      
      <Tabs defaultValue="predict" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="predict">Make Prediction</TabsTrigger>
          <TabsTrigger value="docs">Model Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predict">
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
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              onClick={handlePredict}
              disabled={!awayTeam || !homeTeam || !selectedModel || isLoading}
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
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Model Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Select value={selectedDocModel} onValueChange={setSelectedDocModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model to view documentation" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {selectedModelInfo ? (
                  selectedModelInfo.readme ? (
                    <ReactMarkdown>{selectedModelInfo.readme}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground italic">No README file available for this model</p>
                  )
                ) : (
                  <p className="text-muted-foreground italic">Select a model to view its documentation</p>
                )}
              </div>

              {selectedModelInfo && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium mb-2">Additional Information</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Last Modified: {new Date(selectedModelInfo.lastModified).toLocaleDateString()}</p>
                    {selectedModelInfo.tags.length > 0 && (
                      <p className="mt-1">
                        Tags: {selectedModelInfo.tags.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}