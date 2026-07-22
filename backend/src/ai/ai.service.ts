import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { buildTicketPrompt } from './ai.prompts';
import { ErrorCode } from '../app-error.codes';

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
  private ai?: GoogleGenAI;

  constructor(private config: ConfigService) {}

  private getAi(): GoogleGenAI {
    if (this.ai) {
      return this.ai;
    }

    const apiKey = this.config.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error(ErrorCode.GEMINI_API_KEY_NOT_DEFINED);
    }

    this.ai = new GoogleGenAI({ apiKey });
    return this.ai;
  }

  async generateTicket(
    customerRequest: string,
    language: string,
  ): Promise<GeneratedTicket> {
    const ai = this.getAi();

    const prompt = buildTicketPrompt(customerRequest, language ?? 'en');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(ticketSchema),
      },
    });

    if (!response.text) {
      throw new Error(ErrorCode.GEMINI_EMPTY_RESPONSE);
    }

    return ticketSchema.parse(JSON.parse(response.text));
  }
}
