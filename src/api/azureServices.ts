// src/api/azureServices.ts
// All AI calls are executed by server-side Azure Functions.
// The frontend only needs the Functions base URL.

const FUNCTION_BASE =
  import.meta.env.VITE_AZURE_FUNCTIONS_URL ||
  'https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api';

/* ----------  DATA-TYPES ---------- */

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  messageId?: string;
  errors?: string[];
}

export interface DemoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  employees?: string;
  needs?: string;
}

export interface DemoResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

/* ----------  API WRAPPERS ---------- */

export const contactAPI = {
  submitContactForm: async (data: ContactFormData): Promise<ContactResponse> => {
    const res = await fetch(`${FUNCTION_BASE}/ContactForm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  },
};

export const demoAPI = {
  submitDemoForm: async (data: DemoFormData): Promise<DemoResponse> => {
    const res = await fetch(`${FUNCTION_BASE}/DemoForm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  },
};

export const chatAPI = {
  sendMessage: async (prompt: string, sessionId: string) => {
    const res = await fetch(`${FUNCTION_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              "Vous êtes WorkFlowAI, un assistant IA spécialisé en automatisation d'entreprise pour les PME françaises. Répondez en français avec des conseils pratiques."
          },
          { role: 'user', content: prompt }
        ],
        sessionId,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  },
};

export const visionAPI = {
  processDocument: async (imageData: string) => {
    const res = await fetch(`${FUNCTION_BASE}/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData, analyzeText: true }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  },
};
