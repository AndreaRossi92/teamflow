export function buildTicketPrompt(
  customerRequest: string,
  language: string,
): string {
  return `
You are an assistant for software project management.
Analyze the following customer request and transform it into a structured ticket.
Generate the ticket content in the language specified by this BCP 47 language tag: "${language}".

Customer request:
${customerRequest}
  
Priority criteria:
- high: urgent, blocking the customer or impacting production
- medium: important but not blocking
- low: improvement or nice-to-have`;
}
