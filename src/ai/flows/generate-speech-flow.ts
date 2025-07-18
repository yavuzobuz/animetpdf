'use server';
/**
 * @fileOverview Generates speech audio from text using Google Cloud Text-to-Speech.
 *
 * - generateSpeech - A function that converts text to speech audio.
 * - GenerateSpeechInput - The input type for the generateSpeech function.
 * - GenerateSpeechOutput - The return type for the generateSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {TextToSpeechClient, protos} from '@google-cloud/text-to-speech';

const GenerateSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  languageCode: z
    .string()
    .default('tr-TR')
    .describe('The language code for the speech (e.g., "tr-TR", "en-US").'),
  voiceName: z
    .string()
    .optional()
    .describe(
      'Optional. The specific voice name (e.g., "tr-TR-Wavenet-A"). If not provided, a default will be selected.'
    ),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const GenerateSpeechOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated speech audio as a data URI. Expected format: 'data:audio/mp3;base64,<encoded_data>'."
    ),
});
export type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;

let client: TextToSpeechClient | null = null;

function getClient() {
  if (!client) {
    client = new TextToSpeechClient();
  }
  return client;
}

const MAX_TEXT_LENGTH_CHARS = 2000; // Approximate limit to prevent API errors

export async function generateSpeech(
  input: GenerateSpeechInput
): Promise<GenerateSpeechOutput> {
  return generateSpeechFlow(input);
}

const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow',
    inputSchema: GenerateSpeechInputSchema,
    outputSchema: GenerateSpeechOutputSchema,
  },
  async (input: GenerateSpeechInput) => {
    if (input.text.trim() === "") {
      throw new Error(
        "Input text cannot be empty. Please provide text to synthesize."
      );
    }
    if (input.text.length > MAX_TEXT_LENGTH_CHARS) {
      throw new Error(
        `Input text exceeds maximum allowed length of ${MAX_TEXT_LENGTH_CHARS} characters. Please provide shorter text.`
      );
    }
    
    const ttsClient = getClient();
    
    let defaultVoiceName = 'en-US-Wavenet-D'; // Default English voice
    let ssmlGender = 0; // NEUTRAL

    if (input.languageCode === 'tr-TR') {
      defaultVoiceName = 'tr-TR-Wavenet-A'; // Female A for Turkish
      ssmlGender = 2; // FEMALE
    } else if (input.languageCode === 'en-US') {
      // defaultVoiceName is already set for en-US
      // ssmlGender can remain NEUTRAL or be set explicitly if desired
    }
    // Add more language-specific voice/gender defaults here if needed

    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: {text: input.text},
      voice: {
        languageCode: input.languageCode,
        name: input.voiceName || defaultVoiceName,
        ssmlGender: ssmlGender,
      },
      audioConfig: {audioEncoding: 'MP3'},
    };

    try {
      const [response] = await ttsClient.synthesizeSpeech(request);
      if (!response.audioContent) {
        throw new Error('No audio content received from Text-to-Speech API.');
      }
      const audioBase64 = Buffer.from(
        response.audioContent as Uint8Array
      ).toString('base64');
      return {
        audioDataUri: `data:audio/mp3;base64,${audioBase64}`,
      };
    } catch (error) {
      console.error('Error calling Text-to-Speech API:', error);
      console.error('Speech generation failed. Ensure Google Cloud credentials are configured correctly.');
      // Re-throw the error to make it visible to the caller
      throw new Error(
        `Failed to generate speech. Please check server logs for details. Error: ${
          (error as Error).message
        }`
      );
    }
  }
);
