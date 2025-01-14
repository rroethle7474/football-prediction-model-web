import Papa from 'papaparse';

export interface ValidationResponse {
  isValid: boolean;
  message?: string;
}

interface StatsCSVHeader {
  Rank: string;
  Team: string;
  '2024': string;
  Last3: string;
  Last1: string;
  Home: string;
  Away: string;
  '2023': string;
}

interface TOPCSVHeader {
  Rank: string;
  Team: string;
  '2024-min': string;
  '2024-sec': string;
  'Last3-min': string;
  'Last3-sec': string;
  'Last1-min': string;
  'Last1-sec': string;
  'Home-min': string;
  'Home-sec': string;
  'Away-min': string;
  'Away-sec': string;
  '2023-min': string;
  '2023-sec': string;
}

const NFL_TEAMS = [
  'Arizona', 'Atlanta', 'Baltimore', 'Buffalo',
  'Carolina', 'Chicago', 'Cincinnati', 'Cleveland',
  'Dallas', 'Denver', 'Detroit', 'Green Bay',
  'Houston', 'Indianapolis', 'Jacksonville', 'Kansas City',
  'Las Vegas', 'LA Chargers', 'LA Rams', 'Miami',
  'Minnesota', 'New England', 'New Orleans', 'NY Giants',
  'NY Jets', 'Philadelphia', 'Pittsburgh', 'San Francisco',
  'Seattle', 'Tampa Bay', 'Tennessee', 'Washington'
];

const STATS_HEADERS = ['Rank', 'Team', '2024', 'Last3', 'Last1', 'Home', 'Away', '2023'];

const TOP_HEADERS = [
  'Rank', 'Team',
  '2024-min', '2024-sec',
  'Last3-min', 'Last3-sec',
  'Last1-min', 'Last1-sec',
  'Home-min', 'Home-sec',
  'Away-min', 'Away-sec',
  '2023-min', '2023-sec'
];

const ACTUAL_RESULTS_HEADERS = [
    'MatchupId', 'Team', 'IsHomeTeam', 'PassingYards', 'PassingAttempts', 'RushingYards', 'RushingAttempts', 'TOP-min', 'TOP-sec'
]

interface ResultsCSVHeader {
  MatchupId: string;
  Team: string;
  IsHomeTeam: string;
  PassingYards: string;
  PassingAttempts: string;
  RushingYards: string;
  RushingAttempts: string;
  'TOP-min': string;
  'TOP-sec': string;
}

export const validateFeaturesCSV = (file: File, isTimeOfPossession = false): Promise<ValidationResponse> => {
  return new Promise((resolve) => {
    Papa.parse<StatsCSVHeader | TOPCSVHeader>(file, {
      header: true,
      delimiter: ',', // Explicitly set the delimiter
      skipEmptyLines: true, // Skip empty lines
      complete: (results) => {
        // Log parsing results for debugging
        console.log('Parsed headers:', Object.keys(results.data[0] || {}));
        console.log('First row:', results.data[0]);
        console.log('Parse errors:', results.errors);

        // Check if parsing was successful
        if (results.errors.length > 0) {
          resolve({
            isValid: false,
            message: `CSV parsing error: ${results.errors[0].message} (Row: ${results.errors[0].row})`
          });
          return;
        }

        // Check if any data was parsed
        if (results.data.length === 0) {
          resolve({
            isValid: false,
            message: 'No data found in CSV file'
          });
          return;
        }

        // Determine which headers to check based on file type
        const requiredHeaders = isTimeOfPossession ? TOP_HEADERS : STATS_HEADERS;

        // Validate headers
        const headers = Object.keys(results.data[0] || {});
        const missingHeaders = requiredHeaders.filter(
          header => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          resolve({
            isValid: false,
            message: `Missing required headers: ${missingHeaders.join(', ')}`
          });
          return;
        }

        // Get all teams from the CSV
        const teamsInCSV = new Set(
          results.data
            .map(row => row.Team)
            .filter(team => team) // Remove empty entries
        );

        // Check for missing teams
        const missingTeams = NFL_TEAMS.filter(team => !teamsInCSV.has(team));
        if (missingTeams.length > 0) {
          resolve({
            isValid: false,
            message: `Missing entries for teams: ${missingTeams.join(', ')}`
          });
          return;
        }

        // Check for extra teams
        const extraTeams = Array.from(teamsInCSV).filter(
          team => !NFL_TEAMS.includes(team)
        );
        if (extraTeams.length > 0) {
          resolve({
            isValid: false,
            message: `Unknown teams found: ${extraTeams.join(', ')}`
          });
          return;
        }

        // Check for duplicate teams
        const teamCounts = results.data.reduce<Record<string, number>>((acc, row) => {
          acc[row.Team] = (acc[row.Team] || 0) + 1;
          return acc;
        }, {});

        const duplicateTeams = Object.entries(teamCounts)
          .filter(([_, count]) => count > 1)
          .map(([team]) => team);

        if (duplicateTeams.length > 0) {
          resolve({
            isValid: false,
            message: `Duplicate entries found for teams: ${duplicateTeams.join(', ')}`
          });
          return;
        }

        // All validations passed
        resolve({
          isValid: true
        });
      }
    });
  });
};

export const validateResultsCSV = (file: File): Promise<ValidationResponse> => {
  return new Promise((resolve) => {
    Papa.parse<ResultsCSVHeader>(file, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      complete: (results) => {
        // Log parsing results for debugging
        console.log('Parsed headers:', Object.keys(results.data[0] || {}));
        console.log('First row:', results.data[0]);
        console.log('Parse errors:', results.errors);

        // Check if parsing was successful
        if (results.errors.length > 0) {
          resolve({
            isValid: false,
            message: `CSV parsing error: ${results.errors[0].message} (Row: ${results.errors[0].row})`
          });
          return;
        }

        // Check if any data was parsed
        if (results.data.length === 0) {
          resolve({
            isValid: false,
            message: 'No data found in CSV file'
          });
          return;
        }

        // Validate headers
        const headers = Object.keys(results.data[0] || {});
        const missingHeaders = ACTUAL_RESULTS_HEADERS.filter(
          header => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          resolve({
            isValid: false,
            message: `Missing required headers: ${missingHeaders.join(', ')}`
          });
          return;
        }

        // All validations passed
        resolve({
          isValid: true
        });
      }
    });
  });
};