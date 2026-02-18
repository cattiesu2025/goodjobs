export interface Status {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
}

export interface Job {
  id: number;
  company: string;
  jobTitle: string;
  website: string | null;
  jobDescription: string | null;
  contactPerson: string | null;
  contactLink: string | null;
  currentStatus: string;
  deadline: string | null;
  notes: string | null;
  createdAt: string;
}

export interface JobStatusEntry {
  id: number;
  jobId: number;
  status: string;
  changedAt: string;
  contactPerson: string | null;
  contactLink: string | null;
  note: string | null;
}

export interface JobPrepTodo {
  id: number;
  jobId: number;
  content: string;
  completed: boolean;
  createdAt: string;
}

export interface JobDetail extends Job {
  history: JobStatusEntry[];
  todos: JobPrepTodo[];
}

export interface DashboardTodo {
  id: number;
  content: string;
  completed: boolean;
  createdAt: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  answer: string | null;
  label: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: number | string;
  jobId: number;
  company: string;
  jobTitle: string;
  status: string;
  date: string;
  contactPerson: string | null;
  note: string | null;
}
