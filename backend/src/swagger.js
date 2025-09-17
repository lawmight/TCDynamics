const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

// Configuration Swagger/OpenAPI
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TCDynamics WorkFlowAI API',
    version: '1.0.0',
    description: "API pour la plateforme d'automatisation WorkFlowAI",
    contact: {
      name: 'TCDynamics Support',
      email: 'contact@tcdynamics.fr',
      url: 'https://tcdynamics.fr',
    },
    license: {
      name: 'Propriétaire',
      url: 'https://tcdynamics.fr',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Serveur de développement',
    },
    {
      url: 'https://api.tcdynamics.fr',
      description: 'Serveur de production',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
    schemas: {
      ContactRequest: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: 'Nom complet du contact',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email valide',
          },
          phone: {
            type: 'string',
            pattern: '^[0-9+\\-\\s()]{10,20}$',
            description: 'Numéro de téléphone (optionnel)',
          },
          company: {
            type: 'string',
            maxLength: 100,
            description: "Nom de l'entreprise (optionnel)",
          },
          message: {
            type: 'string',
            minLength: 10,
            maxLength: 1000,
            description: 'Message du contact',
          },
        },
      },
      DemoRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'company'],
        properties: {
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Prénom',
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Nom de famille',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email valide',
          },
          phone: {
            type: 'string',
            pattern: '^[0-9+\\-\\s()]{10,20}$',
            description: 'Numéro de téléphone',
          },
          company: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: "Nom de l'entreprise",
          },
          employees: {
            type: 'string',
            enum: ['1-10', '11-50', '51-200', '200+'],
            description: "Nombre d'employés",
          },
          needs: {
            type: 'string',
            minLength: 10,
            maxLength: 500,
            description: 'Besoins spécifiques',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Opération réussie',
          },
          messageId: {
            type: 'string',
            description: 'ID du message envoyé (pour les emails)',
            example: '1234567890@example.com',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Une erreur est survenue',
          },
          error: {
            type: 'string',
            description:
              "Détails de l'erreur (environnement développement seulement)",
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T12:00:00.000Z',
          },
          uptime: {
            type: 'number',
            description: "Temps d'activité en secondes",
            example: 3600.5,
          },
          environment: {
            type: 'string',
            example: 'development',
          },
        },
      },
    },
  },
}

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/server.js'],
}

// Générer la spécification Swagger
const swaggerSpec = swaggerJSDoc(options)

// Configuration UI Swagger
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: 'arta',
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #002395 }
  `,
  customSiteTitle: 'TCDynamics API Documentation',
  customfavIcon: '/favicon.ico',
}

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions,
}
