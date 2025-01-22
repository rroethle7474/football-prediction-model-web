'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getModels } from '@/app/services/prediction'
import { deleteModel } from '@/app/services/train-model'
import { validateResultsCSV } from '@/app/services/validation'
import { Modal } from '@/components/ui/modal'
import { trainModel } from '@/app/services/train-model'
import { uploadFile } from '@/app/services/upload'

type StatusType = {
  type: 'success' | 'error';
  message: string;
} | null;

interface ModelInfo {
  name: string;
  description: string[];
  tags: string[];
  lastModified: string;
  readme: string | null;
}

export default function TrainModel() {  
  const [file, setFile] = useState<File | null>(null)
  const [splitRatio, setSplitRatio] = useState(80)
  const [selectedModel, setSelectedModel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<StatusType>(null)
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const [selectedDeleteModel, setSelectedDeleteModel] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [fileValidation, setFileValidation] = useState<{ isValid: boolean; message?: string } | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await getModels();
      if (response.status === 'success') {
        setAvailableModels(response.models);
      } else {
        setStatus({ type: 'error', message: 'Failed to fetch models' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to fetch models' });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) {
      if (file) {
        const dt = new DataTransfer()
        dt.items.add(file)
        event.target.files = dt.files
      }
      return
    }

    const selectedFile = event.target.files[0]
    
    if (!selectedFile.name.endsWith('.csv')) {
      setFile(null)
      setFileValidation({
        isValid: false,
        message: 'Please upload a CSV file'
      })
      return
    }

    try {
      const validation = await validateResultsCSV(selectedFile)
      setFileValidation(validation)
      
      if (validation.isValid) {
        setFile(selectedFile)
        setStatus(null)
      } else {
        setFile(null)
        event.target.value = '' // Reset file input
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setFile(null)
      setFileValidation({
        isValid: false,
        message: 'Failed to validate file'
      })
      event.target.value = '' // Reset file input
    }
  }

  const handleSubmit = async () => {
    if (!file || !selectedModel || !password) {
      setStatus({ type: 'error', message: 'Please select a file, model name, and enter the password' })
      return
    }

    setIsLoading(true)
    setStatus(null)

    try {
      const uploadResult = await uploadFile(file, 'actualResults', password)
      
      if (uploadResult.status === 'error') {
        setStatus({ 
          type: 'error',
          message: uploadResult.message 
        })
        return
      }

      const result = await trainModel(selectedModel, splitRatio)
      
      if (result.status === 'success') {
        // Clear form on success
        setFile(null)
        setSelectedModel('')
        setSplitRatio(80)
        setFileValidation(null)
        setPassword('')
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // Refresh the models list
        await fetchModels()
      }
      
      setStatus({ 
        type: result.status === 'success' ? 'success' : 'error',
        message: result.message 
      })
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to train model. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteModel = async () => {
    if (!selectedDeleteModel || !deletePassword) {
      setStatus({ type: 'error', message: 'Please select a model to delete and enter the password' });
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this model?');
    if (!confirmed) return;

    try {
      const result = await deleteModel(selectedDeleteModel, deletePassword);
      setStatus({ 
        type: result.status === 'success' ? 'success' : 'error',
        message: result.message 
      });
      if (result.status === 'success') {
        // Refresh models list
        const response = await getModels();
        setAvailableModels(response.models);
        setSelectedDeleteModel('');
        setDeletePassword('');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Failed to delete model' 
      });
    }
  };

  return (
    <div className="container mx-auto mt-8 p-4 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Train Model</CardTitle>
          <CardDescription>
            Upload your training data and configure training parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model Name</label>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              required
              placeholder="Enter model name"
              className="w-full p-2 rounded-md border border-input bg-background"
              aria-label="Enter model name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              className="w-full p-2 rounded-md border border-input bg-background"
              aria-label="Enter password"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Training Data</label>
              <button
                onClick={() => setSelectedTemplate('/results/ActualResults.pdf')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View Template
              </button>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              aria-label="Upload training data CSV"
              aria-describedby="file-upload-help"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer"
            />
            {fileValidation && !fileValidation.isValid && (
              <div className="text-red-600 text-xs bg-red-100 p-2 rounded">
                ⚠️ {fileValidation.message}
              </div>
            )}
            {file && fileValidation?.isValid && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-xs text-green-700">
                    {file.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Training Split: {splitRatio}% training, {100 - splitRatio}% test
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={splitRatio}
              onChange={(e) => setSplitRatio(Number(e.target.value))}
              aria-label="Training split ratio"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={splitRatio}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !file || !selectedModel}
            className="w-full"
          >
            {isLoading ? 'Training...' : 'Train'}
          </Button>

          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {status && (
            <div className={`w-full p-3 rounded ${
              status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className={`text-sm ${
                status.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {status.message}
              </p>
            </div>
          )}
        </CardFooter>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Delete Model</CardTitle>
          <CardDescription>
            Select a model to delete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Model</label>
            <select
        value={selectedDeleteModel}
        onChange={(e) => setSelectedDeleteModel(e.target.value)}
        className="w-full p-2 rounded-md border border-input bg-background"
        aria-label="Select model to delete"
      >
        <option value="">Select a model</option>
        {availableModels.map((model) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
              placeholder="Enter password to delete model"
              className="w-full p-2 rounded-md border border-input bg-background"
              aria-label="Enter password to delete model"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleDeleteModel}
            disabled={!selectedDeleteModel}
            variant="destructive"
            className="w-full"
          >
            Delete Model
          </Button>
        </CardFooter>
      </Card>

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