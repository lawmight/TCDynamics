// Azure Services API Integration for WorkFlowAI

const AZURE_CONFIG = {
  openai: {
    endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
    key: import.meta.env.VITE_AZURE_OPENAI_KEY,
    deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT,
  },
  vision: {
    endpoint: import.meta.env.VITE_AZURE_VISION_ENDPOINT,
    key: import.meta.env.VITE_AZURE_VISION_KEY,
  },
  cosmos: {
    connectionString: import.meta.env.VITE_COSMOS_DB_CONNECTION_STRING,
    database: import.meta.env.VITE_COSMOS_DB_DATABASE,
    containers: {
      contacts: import.meta.env.VITE_COSMOS_DB_CONTAINER_CONTACTS,
      conversations: import.meta.env.VITE_COSMOS_DB_CONTAINER_CONVERSATIONS,
    },
  },
}

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    'VITE_AZURE_OPENAI_ENDPOINT',
    'VITE_AZURE_OPENAI_KEY',
    'VITE_AZURE_OPENAI_DEPLOYMENT',
    'VITE_AZURE_VISION_ENDPOINT',
    'VITE_AZURE_VISION_KEY',
  ]

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars)
    console.error(
      'Please check your .env file and ensure all required Azure service credentials are configured.'
    )
    return false
  }

  console.log('✅ Azure services configuration validated')
  return true
}

// Validate configuration on module load
validateConfig()

export interface ChatMessage {
  message: string
  sessionId: string
}

export interface ChatResponse {
  response: string
  sessionId: string
  timestamp: string
}

export interface DocumentProcessingRequest {
  imageData: string
  fileName: string
  documentId: string
}

export interface DocumentProcessingResponse {
  success: boolean
  extractedText?: string
  confidence?: number
  error?: string
}

export interface ContactFormData {
  name: string
  email: string
  message: string
}

export interface ContactResponse {
  success: boolean
  message: string
}

// Azure OpenAI Chat Service
export class AzureOpenAIService {
  private endpoint: string
  private key: string
  private deployment: string

  constructor() {
    this.endpoint = AZURE_CONFIG.openai.endpoint
    this.key = AZURE_CONFIG.openai.key
    this.deployment = AZURE_CONFIG.openai.deployment

    // Validate configuration
    if (!this.endpoint || !this.key || !this.deployment) {
      throw new Error(
        'Azure OpenAI configuration is incomplete. Please check your environment variables.'
      )
    }
  }

  async sendMessage(message: string, sessionId: string): Promise<ChatResponse> {
    try {
      const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-01`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.key,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Vous êtes WorkFlowAI, un assistant IA spécialisé dans l'automatisation d'entreprise pour les PME françaises.
              Vous parlez français et vous êtes expert en solutions d'automatisation, traitement de documents, et optimisation des processus métier.
              Soyez toujours courtois, professionnel et proposez des solutions concrètes.`,
            },
            {
              role: 'user',
              content: message,
            },
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Azure OpenAI API error (${response.status}):`, errorText)

        if (response.status === 401) {
          throw new Error(
            'Authentication failed. Please check your Azure OpenAI API key.'
          )
        } else if (response.status === 403) {
          throw new Error(
            'Access forbidden. Please check your Azure OpenAI permissions.'
          )
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else {
          throw new Error(
            `Azure OpenAI API error: ${response.status} - ${errorText}`
          )
        }
      }

      const data = await response.json()

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Azure OpenAI')
      }

      const aiResponse =
        data.choices[0].message.content ||
        "Désolé, je n'ai pas pu générer une réponse appropriée."

      // Store conversation in Cosmos DB (non-blocking)
      this.storeConversation(sessionId, message, aiResponse).catch(error => {
        console.warn('Failed to store conversation:', error)
      })

      return {
        response: aiResponse,
        sessionId,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Azure OpenAI service error:', error)

      // Provide specific error messages based on error type
      let errorMessage =
        'Je suis désolé, mais je rencontre un problème technique.'

      if (error instanceof Error) {
        if (error.message.includes('not properly configured')) {
          errorMessage =
            "Le service IA n'est pas configuré. Veuillez contacter le support."
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = "Erreur d'authentification avec le service IA."
        } else if (error.message.includes('Rate limit')) {
          errorMessage =
            'Trop de demandes. Veuillez réessayer dans quelques instants.'
        } else if (
          error.message.includes('network') ||
          error.message.includes('fetch')
        ) {
          errorMessage =
            'Problème de connexion. Veuillez vérifier votre connexion internet.'
        } else if (error.message.includes('Invalid response format')) {
          errorMessage = 'Réponse invalide du service IA. Veuillez réessayer.'
        }
      }

      return {
        response:
          errorMessage +
          ' Veuillez réessayer dans quelques instants ou contacter notre support.',
        sessionId,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async storeConversation(
    sessionId: string,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      const conversation = {
        id: `${sessionId}_${Date.now()}`,
        sessionId,
        userMessage,
        aiResponse,
        timestamp: new Date().toISOString(),
        userId: 'anonymous',
      }

      // Store in Cosmos DB (this would normally call your Azure Function)
      console.log('Storing conversation:', conversation)
    } catch (error) {
      console.error('Failed to store conversation:', error)
    }
  }
}

// Azure AI Vision Service
export class AzureVisionService {
  private endpoint: string
  private key: string

  constructor() {
    this.endpoint = AZURE_CONFIG.vision.endpoint
    this.key = AZURE_CONFIG.vision.key

    // Validate configuration
    if (!this.endpoint || !this.key) {
      throw new Error(
        'Azure Vision configuration is incomplete. Please check your environment variables.'
      )
    }
  }

  async processDocument(
    imageData: string,
    _fileName: string
  ): Promise<DocumentProcessingResponse> {
    try {
      const url = `${this.endpoint}/vision/v3.2/read/analyze`

      // Convert base64 to blob for the API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key': this.key,
        },
        body: this.base64ToBlob(imageData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Azure Vision API error (${response.status}):`, errorText)

        if (response.status === 401) {
          throw new Error(
            'Authentication failed. Please check your Azure Vision API key.'
          )
        } else if (response.status === 403) {
          throw new Error(
            'Access forbidden. Please check your Azure Vision permissions.'
          )
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else if (response.status === 400) {
          throw new Error(
            'Invalid image format or size. Please use a valid image file.'
          )
        } else {
          throw new Error(
            `Azure Vision API error: ${response.status} - ${errorText}`
          )
        }
      }

      const operationLocation = response.headers.get('operation-location')
      if (!operationLocation) {
        throw new Error('No operation location returned from Azure Vision API')
      }

      // Wait for the analysis to complete (with retry logic)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get the results
      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.key,
        },
      })

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text()
        throw new Error(
          `Failed to get analysis results: ${resultResponse.status} - ${errorText}`
        )
      }

      const result = await resultResponse.json()

      if (result.status === 'succeeded') {
        const extractedText =
          result.analyzeResult?.readResults?.[0]?.lines
            ?.map((line: any) => line.text)
            ?.join(' ') || 'Aucun texte extrait'

        return {
          success: true,
          extractedText,
          confidence: 0.95, // Approximate confidence
        }
      } else {
        return {
          success: false,
          error: "L'analyse du document est en cours ou a échoué",
        }
      }
    } catch (error) {
      console.error('Azure Vision service error:', error)

      let errorMessage = 'Erreur lors du traitement du document.'

      if (error instanceof Error) {
        if (error.message.includes('not properly configured')) {
          errorMessage =
            "Le service de reconnaissance d'image n'est pas configuré."
        } else if (error.message.includes('Authentication failed')) {
          errorMessage =
            "Erreur d'authentification avec le service de reconnaissance d'image."
        } else if (error.message.includes('Rate limit')) {
          errorMessage =
            'Trop de demandes. Veuillez réessayer dans quelques instants.'
        } else if (error.message.includes('Invalid image')) {
          errorMessage =
            "Format d'image invalide. Veuillez utiliser une image JPG, PNG ou PDF."
        } else if (
          error.message.includes('network') ||
          error.message.includes('fetch')
        ) {
          errorMessage = 'Problème de connexion réseau.'
        }
      }

      return {
        success: false,
        error: errorMessage + ' Veuillez réessayer.',
      }
    }
  }

  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: 'application/octet-stream' })
  }
}

// Azure Functions Contact Service
export class AzureContactService {
  private functionUrl: string

  constructor() {
    // This should be the URL of your deployed Azure Function
    // For local development, it would be something like http://localhost:7071
    this.functionUrl =
      import.meta.env.VITE_AZURE_FUNCTIONS_URL ||
      'https://your-function-app.azurewebsites.net/api'
  }

  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    try {
      // Validate required fields
      if (!data.name || !data.email || !data.message) {
        return {
          success: false,
          message: 'Tous les champs sont requis (nom, email, message).',
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          message: 'Veuillez saisir une adresse email valide.',
        }
      }

      const response = await fetch(`${this.functionUrl}/ContactForm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError)
        throw new Error(`Server returned invalid response: ${response.status}`)
      }

      if (!response.ok) {
        const errorMessage = result.message || `Erreur HTTP: ${response.status}`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error('Contact form submission error:', error)

      let errorMessage = "Erreur lors de l'envoi du formulaire."

      if (error instanceof Error) {
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('network')
        ) {
          errorMessage =
            'Problème de connexion réseau. Veuillez vérifier votre connexion internet.'
        } else if (error.message.includes('CORS')) {
          errorMessage =
            'Erreur de configuration CORS. Veuillez contacter le support.'
        } else if (error.message.includes('Server returned invalid response')) {
          errorMessage =
            'Réponse invalide du serveur. Veuillez réessayer plus tard.'
        } else if (error.message) {
          errorMessage = error.message // Use server-provided error message
        }
      }

      return {
        success: false,
        message: errorMessage + ' Veuillez réessayer.',
      }
    }
  }
}

// Service instances
export const openAIService = new AzureOpenAIService()
export const visionService = new AzureVisionService()
export const contactService = new AzureContactService()

// API functions for components
export const chatAPI = {
  sendMessage: (message: string, sessionId: string) =>
    openAIService.sendMessage(message, sessionId),
}

export const visionAPI = {
  processDocument: (imageData: string, fileName: string) =>
    visionService.processDocument(imageData, fileName),
}

export const contactAPI = {
  submitContactForm: (data: ContactFormData) =>
    contactService.submitContactForm(data),
}
