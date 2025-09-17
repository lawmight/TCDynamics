#!/usr/bin/env node

/**
 * NIA MCP Server for TCDynamics
 * Model Context Protocol server implementation for NIA AI integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import fs from 'fs/promises'
import path from 'path'

class NIAServer {
  constructor() {
    this.server = new Server(
      {
        name: 'nia-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    )

    this.apiKey =
      process.env.NIA_API_KEY || 'nk_lrzAv0SQJE3FNfS2yV52Y0XlnZ7WeI5p'
    this.setupHandlers()
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'project_overview',
            description:
              'Get an overview of the TCDynamics project structure and features',
            inputSchema: {
              type: 'object',
              properties: {
                detail_level: {
                  type: 'string',
                  enum: ['brief', 'detailed', 'comprehensive'],
                  default: 'detailed',
                },
              },
            },
          },
          {
            name: 'code_analysis',
            description: 'Analyze code files and provide insights',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: 'Path to the file to analyze',
                },
                analysis_type: {
                  type: 'string',
                  enum: ['structure', 'complexity', 'security', 'performance'],
                  default: 'structure',
                },
              },
              required: ['file_path'],
            },
          },
          {
            name: 'learning_recommendations',
            description: 'Get AI-powered learning recommendations for users',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                },
                learning_style: {
                  type: 'string',
                  enum: [
                    'visual',
                    'auditory',
                    'kinesthetic',
                    'reading_writing',
                  ],
                },
                current_skill_level: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                },
              },
            },
          },
          {
            name: 'deployment_info',
            description: 'Get deployment and infrastructure information',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  enum: [
                    'frontend',
                    'backend',
                    'database',
                    'infrastructure',
                    'all',
                  ],
                  default: 'all',
                },
              },
            },
          },
        ],
      }
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'project_overview':
            return await this.getProjectOverview(args)
          case 'code_analysis':
            return await this.analyzeCode(args)
          case 'learning_recommendations':
            return await this.getLearningRecommendations(args)
          case 'deployment_info':
            return await this.getDeploymentInfo(args)
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            )
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        )
      }
    })

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'project://readme',
            name: 'Project README',
            description: 'Main project documentation and setup instructions',
            mimeType: 'text/markdown',
          },
          {
            uri: 'project://architecture',
            name: 'System Architecture',
            description:
              'Detailed system architecture and component descriptions',
            mimeType: 'application/json',
          },
          {
            uri: 'project://apis',
            name: 'API Documentation',
            description: 'Complete API endpoints and usage documentation',
            mimeType: 'application/json',
          },
          {
            uri: 'project://learning_content',
            name: 'Learning Content Database',
            description: 'Structured learning content and curriculum data',
            mimeType: 'application/json',
          },
        ],
      }
    })

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      const { uri } = request.params

      try {
        const content = await this.readResource(uri)
        return {
          contents: [
            {
              uri,
              mimeType: this.getMimeType(uri),
              text: content,
            },
          ],
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to read resource: ${error.message}`
        )
      }
    })
  }

  async getProjectOverview(args = {}) {
    const detailLevel = args.detail_level || 'detailed'

    let overview = {
      name: 'TCDynamics - Python Learning Platform',
      description:
        'A modern learning platform with AI-powered personalization, interactive progress tracking, and comprehensive Python education',
      technologies: [
        'Python 3.8+',
        'Azure Functions',
        'React/TypeScript',
        'Vite',
        'Tailwind CSS',
        'Azure Cosmos DB',
        'OVHcloud Hosting',
        'Zoho Mail',
      ],
    }

    if (detailLevel === 'comprehensive') {
      overview.features = [
        'AI-powered learning recommendations',
        'Interactive progress tracking',
        'Secure code execution environment',
        'Push notifications system',
        'Learning analytics and insights',
        'Gamification elements',
        'Real-time collaboration features',
        'Offline support with service workers',
        'Responsive design for all devices',
        'Multi-language support preparation',
      ]

      overview.architecture = {
        frontend: 'React/TypeScript with Vite build system',
        backend: 'Python Azure Functions with REST APIs',
        database: 'Azure Cosmos DB for NoSQL data',
        hosting: 'OVHcloud for web hosting, Azure for functions',
        email: 'Zoho Mail for communication services',
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(overview, null, 2),
        },
      ],
    }
  }

  async analyzeCode(args) {
    const { file_path, analysis_type = 'structure' } = args

    try {
      // Check if file exists
      const fileExists = await this.fileExists(file_path)
      if (!fileExists) {
        throw new Error(`File not found: ${file_path}`)
      }

      const content = await fs.readFile(file_path, 'utf-8')
      const analysis = {
        file_path,
        analysis_type,
        size: content.length,
        lines: content.split('\n').length,
        extension: path.extname(file_path),
      }

      // Basic analysis based on file type
      if (file_path.endsWith('.py')) {
        analysis.language = 'Python'
        analysis.complexity = this.analyzePythonComplexity(content)
        analysis.imports = this.extractPythonImports(content)
        analysis.functions = this.extractPythonFunctions(content)
      } else if (file_path.endsWith('.tsx') || file_path.endsWith('.ts')) {
        analysis.language = 'TypeScript'
        analysis.components = this.extractReactComponents(content)
        analysis.imports = this.extractTypeScriptImports(content)
      } else if (file_path.endsWith('.js')) {
        analysis.language = 'JavaScript'
        analysis.functions = this.extractJavaScriptFunctions(content)
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`Code analysis failed: ${error.message}`)
    }
  }

  async getLearningRecommendations(args = {}) {
    const { user_id, learning_style, current_skill_level } = args

    // Simulate AI-powered recommendations
    const recommendations = {
      user_id: user_id || 'anonymous',
      recommendations: [],
      personalized_note: `Based on ${learning_style || 'your learning preferences'} and ${current_skill_level || 'your current skill level'}`,
    }

    // Generate recommendations based on skill level
    if (!current_skill_level || current_skill_level === 'beginner') {
      recommendations.recommendations = [
        {
          title: 'Python Variables and Data Types',
          type: 'lesson',
          difficulty: 'beginner',
          estimated_time: 30,
          reason: 'Foundation for all Python programming',
        },
        {
          title: 'Control Flow: If Statements',
          type: 'lesson',
          difficulty: 'beginner',
          estimated_time: 45,
          reason: 'Essential for program logic',
        },
      ]
    } else if (current_skill_level === 'intermediate') {
      recommendations.recommendations = [
        {
          title: 'Functions and Parameters',
          type: 'lesson',
          difficulty: 'intermediate',
          estimated_time: 75,
          reason: 'Build reusable code components',
        },
        {
          title: 'Object-Oriented Programming',
          type: 'lesson',
          difficulty: 'advanced',
          estimated_time: 90,
          reason: 'Learn modern programming paradigms',
        },
      ]
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(recommendations, null, 2),
        },
      ],
    }
  }

  async getDeploymentInfo(args = {}) {
    const { component = 'all' } = args

    const deployment = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }

    if (component === 'all' || component === 'frontend') {
      deployment.frontend = {
        framework: 'React/TypeScript',
        build_tool: 'Vite',
        hosting: 'OVHcloud',
        domain: 'tcdynamics.com',
        ssl: true,
        cdn: 'OVHcloud CDN',
      }
    }

    if (component === 'all' || component === 'backend') {
      deployment.backend = {
        runtime: 'Python 3.8+',
        platform: 'Azure Functions',
        apis: [
          '/api/ContactForm',
          '/api/AIRecommendations',
          '/api/LearningAnalytics',
          '/api/CodeExecution',
        ],
        database: 'Azure Cosmos DB',
        security: 'Enhanced with input validation and rate limiting',
      }
    }

    if (component === 'all' || component === 'infrastructure') {
      deployment.infrastructure = {
        hosting_provider: 'OVHcloud',
        functions_provider: 'Azure',
        email_provider: 'Zoho Mail',
        monitoring: 'Azure Application Insights',
        backup: 'Automated daily backups',
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(deployment, null, 2),
        },
      ],
    }
  }

  async readResource(uri) {
    const resourceMap = {
      'project://readme': './README.md',
      'project://architecture': './.mcp.json',
      'project://apis': './advanced_api_endpoints.py',
      'project://learning_content': './ai_personalization.py',
    }

    const filePath = resourceMap[uri]
    if (!filePath) {
      throw new Error(`Unknown resource: ${uri}`)
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`)
    }
  }

  getMimeType(uri) {
    if (uri.endsWith('.md')) return 'text/markdown'
    if (uri.endsWith('.json')) return 'application/json'
    if (uri.endsWith('.py')) return 'text/x-python'
    if (uri.endsWith('.js') || uri.endsWith('.ts') || uri.endsWith('.tsx'))
      return 'application/javascript'
    return 'text/plain'
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  analyzePythonComplexity(content) {
    const lines = content.split('\n')
    const functions = lines.filter(line =>
      line.trim().startsWith('def ')
    ).length
    const classes = lines.filter(line =>
      line.trim().startsWith('class ')
    ).length
    const imports = lines.filter(
      line =>
        line.trim().startsWith('import ') || line.trim().startsWith('from ')
    ).length

    return {
      functions,
      classes,
      imports,
      complexity_score: Math.min(10, functions + classes + imports * 0.5),
    }
  }

  extractPythonImports(content) {
    const lines = content.split('\n')
    return lines
      .filter(
        line =>
          line.trim().startsWith('import ') || line.trim().startsWith('from ')
      )
      .map(line => line.trim())
  }

  extractPythonFunctions(content) {
    const lines = content.split('\n')
    return lines
      .filter(line => line.trim().startsWith('def '))
      .map(line => line.trim().replace('def ', '').split('(')[0])
  }

  extractReactComponents(content) {
    const componentRegex = /function\s+(\w+)|const\s+(\w+)\s*=\s*\(/g
    const components = []
    let match
    while ((match = componentRegex.exec(content)) !== null) {
      components.push(match[1] || match[2])
    }
    return [...new Set(components)] // Remove duplicates
  }

  extractTypeScriptImports(content) {
    const lines = content.split('\n')
    return lines
      .filter(line => line.trim().startsWith('import '))
      .map(line => line.trim())
  }

  extractJavaScriptFunctions(content) {
    const functionRegex = /function\s+(\w+)\s*\(|const\s+(\w+)\s*=\s*\(/g
    const functions = []
    let match
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1] || match[2])
    }
    return [...new Set(functions)] // Remove duplicates
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('NIA MCP Server started successfully')
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new NIAServer()
  server.start().catch(error => {
    console.error('Failed to start NIA MCP Server:', error)
    process.exit(1)
  })
}

export default NIAServer
