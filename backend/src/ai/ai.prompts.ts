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

Reply with a JSON object with this structure:
{
  "title": "short and clear title (max 60 characters)",
  "description": "detailed technical description of what needs to be implemented",
  "priority": "low" | "medium" | "high",
  "estimatedDays": integer number of estimated days,
  "tags": ["tag1", "tag2"]
}
  
Priority criteria:
- high: urgent, blocking the customer or impacting production
- medium: important but not blocking
- low: improvement or nice-to-have`;
}
