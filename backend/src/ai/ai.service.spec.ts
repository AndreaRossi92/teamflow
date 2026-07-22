import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService, GeneratedTicket } from './ai.service';
import { ErrorCode } from '../app-error.codes';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const CUSTOMER_REQUEST = 'We need a button to export reports to PDF.';

const mockTicket: GeneratedTicket = {
  title: 'Add PDF export button',
  description: 'Add a button to export the current report view as a PDF file.',
  priority: 'low',
};

// ─── Module factory ──────────────────────────────────────────────────────────

async function buildModule(apiKey: string | undefined): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      AiService,
      {
        provide: ConfigService,
        useValue: { get: jest.fn().mockReturnValue(apiKey) },
      },
    ],
  }).compile();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AiService', () => {
  let service: AiService;
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockTicket) });
    module = await buildModule('mock-api-key');
    service = module.get<AiService>(AiService);
  });

  afterEach(async () => {
    await module.close();
  });

  // ── generateTicket ─────────────────────────────────────────────────────────

  describe('generateTicket', () => {
    it('should return a parsed GeneratedTicket from a valid AI response', async () => {
      const result = await service.generateTicket(CUSTOMER_REQUEST, 'en');

      expect(result).toEqual(mockTicket);
    });

    it('should include the customer request inside the prompt sent to Gemini', async () => {
      await service.generateTicket(CUSTOMER_REQUEST, 'en');

      const calls = mockGenerateContent.mock.calls as [{ contents: string }][];
      expect(calls[0][0].contents).toContain(CUSTOMER_REQUEST);
    });

    it('should call generateContent exactly once per invocation', async () => {
      await service.generateTicket(CUSTOMER_REQUEST, 'en');

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should throw if the AI returns malformed JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'not valid json {{' });

      await expect(
        service.generateTicket(CUSTOMER_REQUEST, 'en'),
      ).rejects.toThrow();
    });

    it('should throw the correct error code if the AI returns undefined text', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: undefined });

      await expect(
        service.generateTicket(CUSTOMER_REQUEST, 'en'),
      ).rejects.toThrow(ErrorCode.GEMINI_EMPTY_RESPONSE);
    });

    it('should propagate errors thrown by the Gemini SDK', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.generateTicket(CUSTOMER_REQUEST, 'en'),
      ).rejects.toThrow('Network error');
    });
  });
});
