import type { Ticket } from "../../features/ticket/types/ticket";
import {
  mockProject1,
  mockProject2,
  mockProject3,
  mockProject4,
  mockProject5,
} from "./project.data";
import {
  mockManagerUser1,
  mockManagerUser2,
  mockDevUser1,
  mockDevUser2,
  mockDevUser3,
  mockDevUser4,
  mockDevUser5,
} from "./user.data";

// Project 1 - Redesign E-commerce (5 ticket)
export const mockTicket1: Ticket = {
  id: "ticket-1",
  title: "Implementare nuovo header responsive",
  description:
    "Il nuovo header deve adattarsi correttamente a mobile e tablet.",
  status: "open",
  priority: "medium",
  project: mockProject1,
  createdBy: mockManagerUser1,
  assignees: [mockDevUser1, mockDevUser2],
  createdAt: "2024-04-01T09:00:00.000Z",
  updatedAt: "2024-04-01T09:00:00.000Z",
};

export const mockTicket2: Ticket = {
  id: "ticket-2",
  title: "Ottimizzare checkout multi-step",
  description:
    "Ridurre l'abbandono carrello semplificando il flusso di checkout.",
  status: "inProgress",
  priority: "high",
  project: mockProject1,
  createdBy: mockManagerUser1,
  assignees: [mockManagerUser1, mockDevUser2],
  createdAt: "2024-04-03T09:00:00.000Z",
  updatedAt: "2024-04-20T09:00:00.000Z",
};

export const mockTicket3: Ticket = {
  id: "ticket-3",
  title: "Fix bug carrello su Safari",
  description: "Il carrello non si aggiorna correttamente su Safari desktop.",
  status: "resolved",
  priority: "high",
  project: mockProject1,
  createdBy: mockManagerUser1,
  assignees: [mockDevUser1],
  createdAt: "2024-04-05T09:00:00.000Z",
  updatedAt: "2024-04-18T09:00:00.000Z",
};

export const mockTicket4: Ticket = {
  id: "ticket-4",
  title: "Aggiungere filtro prezzo ai risultati di ricerca",
  description:
    "Permettere agli utenti di filtrare i prodotti per fascia di prezzo.",
  status: "open",
  priority: "low",
  project: mockProject1,
  createdBy: mockManagerUser1,
  assignees: [mockDevUser2],
  createdAt: "2024-04-10T09:00:00.000Z",
  updatedAt: "2024-04-10T09:00:00.000Z",
};

export const mockTicket5: Ticket = {
  id: "ticket-5",
  title: "Migrare componenti a nuovo design system",
  description:
    "Sostituire i vecchi componenti UI con quelli del nuovo design system.",
  status: "closed",
  priority: "medium",
  project: mockProject1,
  createdBy: mockManagerUser1,
  assignees: [mockManagerUser1, mockDevUser1, mockDevUser2],
  createdAt: "2024-03-15T09:00:00.000Z",
  updatedAt: "2024-05-01T09:00:00.000Z",
};

// Project 2 - Migrazione Cloud (5 ticket)
export const mockTicket6: Ticket = {
  id: "ticket-6",
  title: "Configurare VPC su AWS",
  description:
    "Impostare rete privata virtuale con subnet pubbliche e private.",
  status: "inProgress",
  priority: "high",
  project: mockProject2,
  createdBy: mockManagerUser2,
  assignees: [mockManagerUser2, mockDevUser3],
  createdAt: "2024-04-02T09:00:00.000Z",
  updatedAt: "2024-04-22T09:00:00.000Z",
};

export const mockTicket7: Ticket = {
  id: "ticket-7",
  title: "Migrare database RDS",
  description:
    "Migrare il database di produzione su Amazon RDS senza downtime.",
  status: "open",
  priority: "high",
  project: mockProject2,
  createdBy: mockManagerUser2,
  assignees: [mockDevUser4],
  createdAt: "2024-04-06T09:00:00.000Z",
  updatedAt: "2024-04-06T09:00:00.000Z",
};

export const mockTicket8: Ticket = {
  id: "ticket-8",
  title: "Impostare pipeline CI/CD",
  description: "Automatizzare build, test e deploy tramite GitHub Actions.",
  status: "resolved",
  priority: "medium",
  project: mockProject2,
  createdBy: mockManagerUser2,
  assignees: [mockDevUser3, mockDevUser4],
  createdAt: "2024-03-20T09:00:00.000Z",
  updatedAt: "2024-04-15T09:00:00.000Z",
};

export const mockTicket9: Ticket = {
  id: "ticket-9",
  title: "Configurare monitoraggio CloudWatch",
  description: "Impostare allarmi e dashboard per il monitoraggio dei servizi.",
  status: "open",
  priority: "medium",
  project: mockProject2,
  createdBy: mockManagerUser2,
  assignees: [mockManagerUser2],
  createdAt: "2024-04-18T09:00:00.000Z",
  updatedAt: "2024-04-18T09:00:00.000Z",
};

export const mockTicket10: Ticket = {
  id: "ticket-10",
  title: "Ottimizzare costi istanze EC2",
  description:
    "Analizzare l'utilizzo e passare a istanze reserved dove conviene.",
  status: "closed",
  priority: "low",
  project: mockProject2,
  createdBy: mockManagerUser2,
  assignees: [mockDevUser4, mockDevUser3],
  createdAt: "2024-03-10T09:00:00.000Z",
  updatedAt: "2024-04-01T09:00:00.000Z",
};

// Project 3 - App Mobile Clienti (4 ticket)
export const mockTicket11: Ticket = {
  id: "ticket-11",
  title: "Sviluppare schermata login app",
  description: "Login con email/password e opzione social login.",
  status: "resolved",
  priority: "medium",
  project: mockProject3,
  createdBy: mockManagerUser1,
  assignees: [mockDevUser2, mockDevUser5],
  createdAt: "2024-04-01T09:00:00.000Z",
  updatedAt: "2024-04-25T09:00:00.000Z",
};

export const mockTicket12: Ticket = {
  id: "ticket-12",
  title: "Integrare notifiche push",
  description: "Integrare Firebase Cloud Messaging per le notifiche ordini.",
  status: "inProgress",
  priority: "high",
  project: mockProject3,
  createdBy: mockManagerUser1,
  assignees: [mockDevUser3],
  createdAt: "2024-04-12T09:00:00.000Z",
  updatedAt: "2024-04-28T09:00:00.000Z",
};

export const mockTicket13: Ticket = {
  id: "ticket-13",
  title: "Fix crash su Android 14",
  description:
    "L'app va in crash all'apertura su alcuni dispositivi Android 14.",
  status: "open",
  priority: "high",
  project: mockProject3,
  createdBy: mockManagerUser1,
  assignees: [mockDevUser5],
  createdAt: "2024-05-02T09:00:00.000Z",
  updatedAt: "2024-05-02T09:00:00.000Z",
};

export const mockTicket14: Ticket = {
  id: "ticket-14",
  title: "Implementare tracking ordini in tempo reale",
  description: "Mostrare lo stato della spedizione in tempo reale nell'app.",
  status: "open",
  priority: "medium",
  project: mockProject3,
  createdBy: mockManagerUser1,
  assignees: [mockManagerUser1, mockDevUser2],
  createdAt: "2024-05-05T09:00:00.000Z",
  updatedAt: "2024-05-05T09:00:00.000Z",
};

// Project 4 - Reporting Interno (4 ticket)
export const mockTicket15: Ticket = {
  id: "ticket-15",
  title: "Creare dashboard KPI vendite",
  description: "Dashboard con grafici sull'andamento delle vendite mensili.",
  status: "inProgress",
  priority: "medium",
  project: mockProject4,
  createdBy: mockManagerUser2,
  assignees: [mockManagerUser2, mockDevUser1],
  createdAt: "2024-04-08T09:00:00.000Z",
  updatedAt: "2024-04-30T09:00:00.000Z",
};

export const mockTicket16: Ticket = {
  id: "ticket-16",
  title: "Esportazione report in Excel",
  description:
    "Aggiungere pulsante per esportare i report correnti in formato xlsx.",
  status: "open",
  priority: "low",
  project: mockProject4,
  createdBy: mockManagerUser2,
  assignees: [mockDevUser4],
  createdAt: "2024-04-14T09:00:00.000Z",
  updatedAt: "2024-04-14T09:00:00.000Z",
};

export const mockTicket17: Ticket = {
  id: "ticket-17",
  title: "Fix calcolo percentuali errate",
  description:
    "Le percentuali di crescita mensile sono calcolate in modo errato.",
  status: "resolved",
  priority: "high",
  project: mockProject4,
  createdBy: mockManagerUser2,
  assignees: [mockDevUser1],
  createdAt: "2024-03-25T09:00:00.000Z",
  updatedAt: "2024-04-10T09:00:00.000Z",
};

export const mockTicket18: Ticket = {
  id: "ticket-18",
  title: "Aggiungere filtro per intervallo di date",
  description:
    "Permettere di filtrare i report per un intervallo di date personalizzato.",
  status: "closed",
  priority: "low",
  project: mockProject4,
  createdBy: mockManagerUser2,
  assignees: [mockManagerUser2, mockDevUser4],
  createdAt: "2024-03-05T09:00:00.000Z",
  updatedAt: "2024-03-28T09:00:00.000Z",
};

// Project 5 - CRM Legacy, inattivo (2 ticket)
export const mockTicket19: Ticket = {
  id: "ticket-19",
  title: "Bug su vecchio modulo contatti CRM",
  description: "Il modulo contatti del vecchio CRM restituisce un errore 500.",
  status: "closed",
  priority: "low",
  project: mockProject5,
  createdBy: mockManagerUser1,
  assignees: [mockDevUser5],
  createdAt: "2023-11-01T09:00:00.000Z",
  updatedAt: "2023-12-01T09:00:00.000Z",
};

export const mockTicket20: Ticket = {
  id: "ticket-20",
  title: "Richiesta dati storici per migrazione",
  description:
    "Estrarre i dati storici del vecchio CRM per la migrazione sul nuovo sistema.",
  status: "resolved",
  priority: "medium",
  project: mockProject5,
  createdBy: mockManagerUser1,
  assignees: [mockManagerUser1, mockDevUser5],
  createdAt: "2024-01-02T09:00:00.000Z",
  updatedAt: "2024-01-20T09:00:00.000Z",
};

export const mockTickets: Ticket[] = [
  mockTicket1,
  mockTicket2,
  mockTicket3,
  mockTicket4,
  mockTicket5,
  mockTicket6,
  mockTicket7,
  mockTicket8,
  mockTicket9,
  mockTicket10,
  mockTicket11,
  mockTicket12,
  mockTicket13,
  mockTicket14,
  mockTicket15,
  mockTicket16,
  mockTicket17,
  mockTicket18,
  mockTicket19,
  mockTicket20,
];

function getMaxTicketNumber(): number {
  return mockTickets.reduce((max, t) => {
    const n = Number(t.id.replace("ticket-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
}

let ticketIdCounter = getMaxTicketNumber();
export function generateTicketId(): string {
  ticketIdCounter += 1;
  return `ticket-${ticketIdCounter}`;
}
