import { SessionsClient } from '@google-cloud/dialogflow';

// Initialize the Dialogflow client
let sessionsClient: SessionsClient | null = null;

async function initializeDialogflow() {
  if (!sessionsClient) {
    try {
      const response = await fetch('/api/config/dialogflow');
      if (!response.ok) {
        throw new Error(`Failed to fetch Dialogflow config: ${response.statusText}`);
      }

      const config = await response.json();
      if (!config.projectId) {
        throw new Error('Dialogflow project ID not configured');
      }

      sessionsClient = new SessionsClient({
        credentials: JSON.parse(config.credentials),
        projectId: config.projectId
      });
    } catch (error) {
      console.error('Dialogflow initialization error:', error);
      sessionsClient = null;
      throw error;
    }
  }
  return sessionsClient;
}

export async function detectIntent(
  text: string,
  sessionId: string
): Promise<{
  fulfillmentText: string;
  intent: string | null;
  confidence: number;
}> {
  try {
    const client = await initializeDialogflow();
    const sessionPath = client.projectAgentSessionPath(
      process.env.GOOGLE_CLOUD_PROJECT_ID!,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text,
          languageCode: 'en-US',
        },
      },
    };

    const [response] = await client.detectIntent(request);
    const result = response.queryResult;

    if (!result) {
      throw new Error('No result from Dialogflow');
    }

    return {
      fulfillmentText: result.fulfillmentText || '',
      intent: result.intent?.displayName || null,
      confidence: result.intentDetectionConfidence || 0,
    };
  } catch (error: any) {
    console.error('Error detecting intent:', error);
    throw new Error('Failed to process with Dialogflow: ' + error.message);
  }
}
