import type { Project } from "../../features/project/types/project";
import {
  mockManagerUser1,
  mockManagerUser2,
  mockDevUser1,
  mockDevUser2,
  mockDevUser3,
  mockDevUser4,
  mockDevUser5,
} from "./user.data";

export const mockProject1: Project = {
  id: "project-1",
  name: "Redesign E-commerce",
  description:
    "Rifacimento completo del sito e-commerce con nuovo design system e checkout ottimizzato.",
  isActive: true,
  createdBy: mockManagerUser1,
  members: [mockManagerUser1, mockDevUser1, mockDevUser2],
  createdAt: "2024-02-01T10:00:00.000Z",
  updatedAt: "2024-05-10T10:00:00.000Z",
};

export const mockProject2: Project = {
  id: "project-2",
  name: "Migrazione Cloud",
  description:
    "Migrazione dell'infrastruttura on-premise verso AWS, con revisione della sicurezza.",
  isActive: true,
  createdBy: mockManagerUser2,
  members: [mockManagerUser2, mockDevUser3, mockDevUser4],
  createdAt: "2024-02-15T10:00:00.000Z",
  updatedAt: "2024-05-12T10:00:00.000Z",
};

export const mockProject3: Project = {
  id: "project-3",
  name: "App Mobile Clienti",
  description:
    "Sviluppo dell'app mobile per la gestione ordini e il supporto clienti.",
  isActive: true,
  createdBy: mockManagerUser1,
  members: [mockManagerUser1, mockDevUser2, mockDevUser5, mockDevUser3],
  createdAt: "2024-03-01T10:00:00.000Z",
  updatedAt: "2024-05-20T10:00:00.000Z",
};

export const mockProject4: Project = {
  id: "project-4",
  name: "Reporting Interno",
  description:
    "Nuovo sistema di reportistica per il monitoraggio dei KPI interni all'azienda.",
  isActive: true,
  createdBy: mockManagerUser2,
  members: [mockManagerUser2, mockDevUser1, mockDevUser4],
  createdAt: "2024-03-10T10:00:00.000Z",
  updatedAt: "2024-05-22T10:00:00.000Z",
};

export const mockProject5: Project = {
  id: "project-5",
  name: "CRM Legacy",
  description:
    "Vecchio CRM interno, dismesso in favore della nuova piattaforma di reporting.",
  isActive: false,
  createdBy: mockManagerUser1,
  members: [mockManagerUser1, mockDevUser5],
  createdAt: "2023-06-01T10:00:00.000Z",
  updatedAt: "2024-01-05T10:00:00.000Z",
};

export const mockProjects: Project[] = [
  mockProject1,
  mockProject2,
  mockProject3,
  mockProject4,
  mockProject5,
];

function getMaxProjectNumber(): number {
  return mockProjects.reduce((max, p) => {
    const n = Number(p.id.replace("project-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
}

let projectIdCounter = getMaxProjectNumber();
export function generateProjectId(): string {
  projectIdCounter += 1;
  return `project-${projectIdCounter}`;
}
