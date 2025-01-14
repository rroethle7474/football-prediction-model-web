'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getStatsStatus, updateStats, clearCache } from '@/app/services/update-stats'
import { Modal } from '@/components/ui/modal'
import { validateFeaturesCSV } from '@/app/services/validation'
import { uploadFile } from '@/app/services/upload'
import { DEFAULT_NFL_TEAMS } from '@/app/constants/nfl-teams'

interface FileUploadState {
  offensePassingYards: File | null
  offenseRushingYards: File | null
  defensePassingYards: File | null
  defenseRushingYards: File | null
  offensePassingAttempts: File | null
  offenseRushingAttempts: File | null
  timeOfPossession: File | null
}

interface FileValidationState {
  isValid: boolean;
  message?: string;
}

interface FileValidations {
  [key: string]: FileValidationState | null;
}

const fileInputs = [
  { 
    key: 'offensePassingYards', 
    label: 'Upload Offense Passing Yards',
    template: '/feature-templates/PassingOffense-Yards.pdf'
  },
  { 
    key: 'offenseRushingYards', 
    label: 'Upload Offense Rushing Yards',
    template: '/feature-templates/RushingOffense-Yards.pdf'
  },
  { 
    key: 'defensePassingYards', 
    label: 'Upload Defense Passing Yards',
    template: '/feature-templates/PassingDefense.pdf'
  },
  { 
    key: 'defenseRushingYards', 
    label: 'Upload Defense Rushing Yards',
    template: '/feature-templates/RushingDefense.pdf'
  },
  { 
    key: 'offensePassingAttempts', 
    label: 'Upload Offense Passing Attempts',
    template: '/feature-templates/PassingOffense-Attempts.pdf'
  },
  { 
    key: 'offenseRushingAttempts', 
    label: 'Upload Offense Rushing Attempts',
    template: '/feature-templates/RushingOffense-Attempts.pdf'
  },
  { 
    key: 'timeOfPossession', 
    label: 'Upload Time of Possession',
    template: '/feature-templates/TOP.pdf'
  },
]

export default function BuildModel() {
  const [files, setFiles] = useState<FileUploadState>({
    offensePassingYards: null,
    offenseRushingYards: null,
    defensePassingYards: null,
    defenseRushingYards: null,
    offensePassingAttempts: null,
    offenseRushingAttempts: null,
    timeOfPossession: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [statsStatus, setStatsStatus] = useState<{
    status: string;
    message?: string;
    last_update?: string | null;
  } | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [updateStatsError, setUpdateStatsError] = useState<string | null>(null)
  const [clearStatsError, setClearStatsError] = useState<string | null>(null)
  const [isUpdatingStats, setIsUpdatingStats] = useState(false)
  const [isClearingStats, setIsClearingStats] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [fileValidations, setFileValidations] = useState<FileValidations>({
    offensePassingYards: null,
    offenseRushingYards: null,
    defensePassingYards: null,
    defenseRushingYards: null,
    offensePassingAttempts: null,
    offenseRushingAttempts: null,
    timeOfPossession: null
  })
  const [statsPassword, setStatsPassword] = useState('')
  const [uploadPassword, setUploadPassword] = useState('')

  useEffect(() => {
    const fetchStatsStatus = async () => {
      try {
        const response = await getStatsStatus()
        setStatsStatus(response)
        setStatsError(null)
      } catch (error) {
        setStatsError('Stats status cannot be determined')
        setStatsStatus(null)
      }
    }

    fetchStatsStatus()
  }, [])

  const validateFile = async (file: File, key: string) => {
    try {
      const isTimeOfPossession = key === 'timeOfPossession'
      const validation = await validateFeaturesCSV(file, isTimeOfPossession)
      
      setFileValidations(prev => ({
        ...prev,
        [key]: validation
      }))

      return validation.isValid
    } catch (error) {
      setFileValidations(prev => ({
        ...prev,
        [key]: { isValid: false, message: 'Validation failed' }
      }))
      return false
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadState) => {
    if (!event.target.files || !event.target.files[0]) {
      if (files[key]) {
        const dt = new DataTransfer()
        dt.items.add(files[key]!)
        event.target.files = dt.files
      }
      return
    }

    const file = event.target.files[0]
    const isValid = await validateFile(file, key)
    
    if (isValid) {
      setFiles(prev => ({
        ...prev,
        [key]: file
      }))
    } else {
      event.target.value = ''
      setFiles(prev => ({
        ...prev,
        [key]: null
      }))
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatus(null);
    
    const results: { fileType: string; status: 'success' | 'error'; message: string }[] = [];
    let hasAnySuccess = false;

    // Process each file sequentially
    for (const [fileType, file] of Object.entries(files)) {
      if (!file) continue;

      try {
        const result = await uploadFile(file, fileType);
        results.push({
          fileType,
          status: 'success',
          message: result.message
        });
        hasAnySuccess = true;
      } catch (error) {
        results.push({
          fileType,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }

    // If any file was successfully uploaded, update stats
    if (hasAnySuccess) {
      try {
        await updateStats();
        const response = await getStatsStatus();
        setStatsStatus(response);
      } catch (error) {
        results.push({
          fileType: 'stats',
          status: 'error',
          message: 'Failed to update stats after file upload'
        });
      }
    }

    // Clear all file inputs and validations
    setFiles({
      offensePassingYards: null,
      offenseRushingYards: null,
      defensePassingYards: null,
      defenseRushingYards: null,
      offensePassingAttempts: null,
      offenseRushingAttempts: null,
      timeOfPossession: null
    });
    setFileValidations({
      offensePassingYards: null,
      offenseRushingYards: null,
      defensePassingYards: null,
      defenseRushingYards: null,
      offensePassingAttempts: null,
      offenseRushingAttempts: null,
      timeOfPossession: null
    });

    // Reset all file input elements
    document.querySelectorAll('input[type="file"]').forEach((input: HTMLInputElement) => {
      input.value = '';
    });

    // Set final status message
    const errors = results.filter(r => r.status === 'error');
    if (errors.length === 0) {
      setStatus({
        type: 'success',
        message: 'All files uploaded successfully!'
      });
    } else if (errors.length === results.length) {
      setStatus({
        type: 'error',
        message: 'All uploads failed:\n' + errors.map(e => `• ${e.fileType}: ${e.message}`).join('\n')
      });
    } else {
      setStatus({
        type: 'error',
        message: `Some uploads failed:\n` + errors.map(e => `• ${e.fileType}: ${e.message}`).join('\n')
      });
    }

    setIsLoading(false);
  };

  const handleUpdateStats = async () => {
    setUpdateStatsError(null)
    setClearStatsError(null)
    setStatsError(null)
    setStatus(null)
    
    setIsUpdatingStats(true)
    try {
      await updateStats(statsPassword)
      const response = await getStatsStatus()
      setStatsStatus(response)
    } catch (error) {
      setUpdateStatsError(error instanceof Error ? error.message : 'Failed to update stats')
    } finally {
      setIsUpdatingStats(false)
    }
  }

  const handleClearStats = async () => {
    setUpdateStatsError(null)
    setClearStatsError(null)
    setStatsError(null)
    setStatus(null)
    
    setIsClearingStats(true)
    try {
      await clearCache(statsPassword)
      const response = await getStatsStatus()
      setStatsStatus(response)
    } catch (error) {
      setClearStatsError(error instanceof Error ? error.message : 'Failed to clear stats')
    } finally {
      setIsClearingStats(false)
    }
  }

  return (
    <div className="container mx-auto mt-8 p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Build Model</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-md mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Stats Status</h2>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Password</label>
            <input
              type="password"
              value={statsPassword}
              onChange={(e) => setStatsPassword(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background"
              placeholder="Enter password"
            />
          </div>
          <div className="space-x-2">
            <Button
              onClick={handleUpdateStats}
              disabled={isUpdatingStats || !statsPassword}
              size="sm"
              variant="outline"
            >
              {isUpdatingStats ? (
                <span className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                  Updating...
                </span>
              ) : (
                'Update Stats'
              )}
            </Button>
            <Button
              onClick={handleClearStats}
              disabled={isClearingStats || !statsPassword}
              size="sm"
              variant="outline"
            >
              {isClearingStats ? (
                <span className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                  Clearing...
                </span>
              ) : (
                'Clear Stats'
              )}
            </Button>
          </div>
        </div>

        {(updateStatsError || clearStatsError) && (
          <div className="mb-4">
            {updateStatsError && (
              <div className="text-red-600 bg-red-100 p-2 rounded-lg text-sm mb-2">
                ⚠️ Update Error: {updateStatsError}
              </div>
            )}
            {clearStatsError && (
              <div className="text-red-600 bg-red-100 p-2 rounded-lg text-sm">
                ⚠️ Clear Error: {clearStatsError}
              </div>
            )}
          </div>
        )}

        {statsError ? (
          <div className="text-yellow-600 bg-yellow-100 p-4 rounded-lg">
            ⚠️ {statsError}
          </div>
        ) : statsStatus ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Status: </span>
              <span className={`${
                statsStatus.status === 'success' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {statsStatus.status}
              </span>
            </p>
            {statsStatus.message && (
              <p className="text-sm">
                <span className="font-medium">Message: </span>
                {statsStatus.message}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Last Updated: </span>
              {statsStatus.last_update 
                ? new Date(statsStatus.last_update).toLocaleString()
                : 'Not yet updated'}
            </p>
          </div>
        ) : (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-card rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Valid Team Names:</h3>
              <p className="text-sm bg-muted p-3 rounded-lg">
                {DEFAULT_NFL_TEAMS.join(', ')}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">File Format:</h3>
              <p className="text-sm">
                Before uploading, please review the template for each file by clicking the View Template button. 
                This will ensure your CSV files include all required headers and follow the correct format.
              </p>
            </div>
          </div>
        </div>
      <div className="bg-card rounded-lg p-6 shadow-md">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fileInputs.map(({ key, label, template }) => (
            <div 
              key={key} 
              className="bg-muted rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {label}
                </label>
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  View Template
                </button>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, key as keyof FileUploadState)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  cursor-pointer"
              />
              {fileValidations[key] && !fileValidations[key]?.isValid && (
                <div className="text-red-600 text-xs bg-red-100 p-2 rounded">
                  ⚠️ {fileValidations[key]?.message}
                </div>
              )}
              {files[key as keyof FileUploadState] && fileValidations[key]?.isValid && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-xs text-green-700">
                      {files[key as keyof FileUploadState]?.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 mb-4">
          <label className="text-sm font-medium mb-2 block">Password</label>
          <input
            type="password"
            value={uploadPassword}
            onChange={(e) => setUploadPassword(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="Enter password"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || Object.values(files).every(file => file === null) || !uploadPassword}
          className="w-full md:w-auto md:px-8 mx-auto block mt-8"
        >
          {isLoading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {status && (
        <div className={`mt-6 p-4 rounded-lg ${
          status.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {status.message}
        </div>
      )}

      <Modal 
        isOpen={!!selectedTemplate} 
        onClose={() => setSelectedTemplate(null)}
        className="w-full max-w-4xl h-[80vh]"
      >
        <div className="h-full">
          <object
            data={selectedTemplate || ''}
            type="application/pdf"
            className="w-full h-full"
          >
            <p>Unable to display PDF file. <a href={selectedTemplate || ''} target="_blank" rel="noopener noreferrer">Download</a> instead.</p>
          </object>
        </div>
      </Modal>
    </div>
  )
}
