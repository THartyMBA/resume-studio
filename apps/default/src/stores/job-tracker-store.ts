import { create } from 'zustand';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { getCurrentUserId } from '@/stores/auth-user-store';

const PROJECT_ID = 'sPAc6zE9YgJqj93h';
const API_BASE = `/api/taskade/projects/${PROJECT_ID}/nodes`;

export type Stage = 'applied' | 'phone' | 'interview' | 'offer' | 'rejected';
export type Priority = 'high' | 'medium' | 'low';

export const STAGES: { id: Stage; label: string; color: string; bg: string; border: string; stageOptionId: string }[] = [
  { id: 'applied', label: 'Applied', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', stageOptionId: 'stage-applied' },
  { id: 'phone', label: 'Phone Screen', color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30', stageOptionId: 'stage-phone' },
  { id: 'interview', label: 'Interview', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', stageOptionId: 'stage-interview' },
  { id: 'offer', label: 'Offer', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', stageOptionId: 'stage-offer' },
  { id: 'rejected', label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', stageOptionId: 'stage-rejected' },
];

const OPTION_TO_STAGE: Record<string, Stage> = {
  'stage-applied': 'applied', 'stage-phone': 'phone', 'stage-interview': 'interview',
  'stage-offer': 'offer', 'stage-rejected': 'rejected',
};

const STAGE_TO_OPTION: Record<Stage, string> = {
  applied: 'stage-applied', phone: 'stage-phone', interview: 'stage-interview',
  offer: 'stage-offer', rejected: 'stage-rejected',
};

const OPTION_TO_PRIORITY: Record<string, Priority> = { 'pri-high': 'high', 'pri-medium': 'medium', 'pri-low': 'low' };
const PRIORITY_TO_OPTION: Record<Priority, string> = { high: 'pri-high', medium: 'pri-medium', low: 'pri-low' };

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  salary: string;
  url: string;
  notes: string;
  dateApplied: string;
  contactName: string;
  contactEmail: string;
  priority: Priority;
}

interface JobTrackerStore {
  jobs: JobApplication[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  addJob: (job: Omit<JobApplication, 'id'>) => Promise<void>;
  updateJob: (id: string, updates: Partial<Omit<JobApplication, 'id'>>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  moveJob: (id: string, newStage: Stage) => Promise<void>;
}

function getNodeUserId(node: any): string {
  const fv = node.fieldValues || {};
  return fv['/attributes/@usrId'] || '';
}

function parseNode(node: any): JobApplication | null {
  const fv = node.fieldValues || {};
  const stageId = fv['/attributes/@stage'];
  const prioId = fv['/attributes/@prioR'];
  return {
    id: node.id,
    company: fv['/attributes/@cmpNy'] || '',
    role: fv['/attributes/@roleT'] || '',
    stage: OPTION_TO_STAGE[stageId] || 'applied',
    salary: fv['/attributes/@salRn'] || '',
    url: fv['/attributes/@appUr'] || '',
    notes: fv['/attributes/@notes'] || '',
    dateApplied: fv['/attributes/@datAp'] || '',
    contactName: fv['/attributes/@cntNm'] || '',
    contactEmail: fv['/attributes/@cntEm'] || '',
    priority: OPTION_TO_PRIORITY[prioId] || 'medium',
  };
}

function jobToPayload(job: Partial<Omit<JobApplication, 'id'>>) {
  const p: Record<string, any> = {};
  if (job.company !== undefined) p['/attributes/@cmpNy'] = job.company;
  if (job.role !== undefined) p['/attributes/@roleT'] = job.role;
  if (job.stage !== undefined) p['/attributes/@stage'] = STAGE_TO_OPTION[job.stage];
  if (job.salary !== undefined) p['/attributes/@salRn'] = job.salary;
  if (job.url !== undefined) p['/attributes/@appUr'] = job.url;
  if (job.notes !== undefined) p['/attributes/@notes'] = job.notes;
  if (job.dateApplied !== undefined) p['/attributes/@datAp'] = job.dateApplied;
  if (job.contactName !== undefined) p['/attributes/@cntNm'] = job.contactName;
  if (job.contactEmail !== undefined) p['/attributes/@cntEm'] = job.contactEmail;
  if (job.priority !== undefined) p['/attributes/@prioR'] = PRIORITY_TO_OPTION[job.priority];
  return p;
}

export const useJobTrackerStore = create<JobTrackerStore>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const userId = getCurrentUserId();
      const { data } = await axios.get(API_BASE);
      const nodes: any[] = data?.payload?.nodes || [];
      // Filter nodes to only show current user's applications
      const userNodes = userId
        ? nodes.filter((n) => getNodeUserId(n) === userId)
        : nodes;
      const jobs = userNodes.map(parseNode).filter(Boolean) as JobApplication[];
      set({ jobs, loading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to fetch', loading: false });
    }
  },

  addJob: async (job) => {
    const tempId = uuid();
    const newJob: JobApplication = { ...job, id: tempId };
    set((s) => ({ jobs: [...s.jobs, newJob] }));
    try {
      const userId = getCurrentUserId();
      const payload: Record<string, any> = {
        ...jobToPayload(job),
        '/text': `${job.role} at ${job.company}`,
      };
      // Tag with current user's ID for data isolation
      if (userId) payload['/attributes/@usrId'] = userId;
      const { data } = await axios.post(API_BASE, payload);
      const realId = data?.payload?.node?.id || tempId;
      set((s) => ({ jobs: s.jobs.map((j) => j.id === tempId ? { ...j, id: realId } : j) }));
    } catch (e: any) {
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== tempId), error: e?.message || 'Failed to add' }));
    }
  },

  updateJob: async (id, updates) => {
    set((s) => ({ jobs: s.jobs.map((j) => j.id === id ? { ...j, ...updates } : j) }));
    try {
      const payload: Record<string, any> = jobToPayload(updates);
      if (updates.role !== undefined || updates.company !== undefined) {
        const job = get().jobs.find((j) => j.id === id);
        if (job) payload['/text'] = `${updates.role ?? job.role} at ${updates.company ?? job.company}`;
      }
      await axios.patch(`${API_BASE}/${id}`, payload);
    } catch (e: any) {
      set({ error: e?.message || 'Failed to update' });
      get().fetchJobs();
    }
  },

  deleteJob: async (id) => {
    const prev = get().jobs;
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
    try {
      await axios.delete(`${API_BASE}/${id}`);
    } catch (e: any) {
      set({ jobs: prev, error: e?.message || 'Failed to delete' });
    }
  },

  moveJob: async (id, newStage) => {
    const prev = get().jobs;
    set((s) => ({ jobs: s.jobs.map((j) => j.id === id ? { ...j, stage: newStage } : j) }));
    try {
      await axios.patch(`${API_BASE}/${id}`, { '/attributes/@stage': STAGE_TO_OPTION[newStage] });
    } catch (e: any) {
      set({ jobs: prev, error: e?.message || 'Failed to move' });
    }
  },
}));
