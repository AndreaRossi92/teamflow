import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService, GeneratedTicket } from './ai.service';

const mockGenerateContent = jest.fn() as jest.MockedFunction<
  (prompt: string) => Promise<{ response: { text: () => string } }>
>;
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

const CUSTOMER_REQUEST = 'We need a button to export reports to PDF.';

const mockTicket: GeneratedTicket = {
  title: 'Add PDF export button',
  description: 'Add a button to export the current report view as a PDF file.',
  priority: 'low',
  estimatedDays: 3,
  tags: ['export', 'pdf', 'reports'],
};

// Helper for building test modules
async function buildModule(apiKey: string | undefined): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      AiService,
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn().mockReturnValue(apiKey),
        },
      },
    ],
  }).compile();
}

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockTicket) },
    });

    const module = await buildModule('mock-api-key');
    service = module.get<AiService>(AiService);
  });

  describe('initialization', () => {
    it('should be defined with a valid API key', () => {
      expect(service).toBeDefined();
    });

    it('should throw on missing GEMINI_API_KEY', async () => {
      await expect(buildModule(undefined)).rejects.toThrow(
        'GEMINI_API_KEY is not defined in environment variables',
      );
    });
  });

  describe('generateTicket', () => {
    it('should return a parsed Ticket from a valid AI response', async () => {
      const result: GeneratedTicket =
        await service.generateTicket(CUSTOMER_REQUEST);
      expect(result).toEqual(mockTicket);
    });

    it('should include the customer request inside the prompt sent to Gemini', async () => {
      await service.generateTicket(CUSTOMER_REQUEST);
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain(CUSTOMER_REQUEST);
    });

    it('should call generateContent exactly once per invocation', async () => {
      await service.generateTicket(CUSTOMER_REQUEST);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should throw if the AI returns malformed JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'not valid json {{' },
      });
      await expect(service.generateTicket(CUSTOMER_REQUEST)).rejects.toThrow();
    });

    it('should propagate errors thrown by the Gemini SDK', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));
      await expect(service.generateTicket(CUSTOMER_REQUEST)).rejects.toThrow(
        'Network error',
      );
    });
  });
});
