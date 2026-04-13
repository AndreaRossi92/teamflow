import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { buildTicketPrompt } from './ai.prompts';

export type GeneratedTicket = {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDays: number;
  tags: string[];
};

@Injectable()
export class AiService {
  private model: GenerativeModel;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  }

  async generateTicket(
    customerRequest: string,
    language: string,
  ): Promise<GeneratedTicket> {
    const prompt = buildTicketPrompt(customerRequest, language ?? 'en');
    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as GeneratedTicket;
  }
}
