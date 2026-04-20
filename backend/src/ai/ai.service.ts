import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { buildTicketPrompt } from './ai.prompts';

const ticketSchema = z.object({
  title: z.string().describe('Short title of the support ticket.'),
  description: z.string().describe('Detailed description of the issue.'),
  priority: z
    .enum(['low', 'medium', 'high'])
    .describe('Priority level of the ticket.'),
});

export type GeneratedTicket = z.infer<typeof ticketSchema>;

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateTicket(
    customerRequest: string,
    language: string,
  ): Promise<GeneratedTicket> {
    const prompt = buildTicketPrompt(customerRequest, language ?? 'en');

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(ticketSchema),
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini API');
    }

    return ticketSchema.parse(JSON.parse(response.text));
  }
}
