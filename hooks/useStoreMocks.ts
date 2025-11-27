import { useMemo } from 'react';
import { Target, TrendingUp, CheckCircle2, Users, Layout, Smartphone, Globe, PenTool } from 'lucide-react';

// Mock types
export interface Project {
  id: string;
  name: string;
  status: 'active' | 'planning' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  progress: number;
  dueDate: string;
  members: { id: string; user: { name: string; avatar?: string } }[];
  description: string;
  icon: any;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  location?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  reactions: { emoji: string; count: number }[];
}

// Mock Data Generators
export const useProjectStore = () => {
  const getAllProjects = (): Project[] => [
    {
      id: '1',
      name: 'Website Redesign',
      status: 'active',
      priority: 'urgent',
      progress: 75,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      description: 'Revamping the corporate website with new brand identity and improved UX flow.',
      members: [{ id: '1', user: { name: 'Alex' } }, { id: '2', user: { name: 'Sarah' } }, { id: '3', user: { name: 'Mike' } }, { id: '4', user: { name: 'Lisa' } }],
      icon: '🌐'
    },
    {
      id: '2',
      name: 'Mobile App Beta',
      status: 'active',
      priority: 'high',
      progress: 45,
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      description: 'Preparing the iOS beta release for internal testing stakeholders.',
      members: [{ id: '2', user: { name: 'Sarah' } }, { id: '5', user: { name: 'Tom' } }],
      icon: '📱'
    },
    {
      id: '3',
      name: 'Q4 Marketing Plan',
      status: 'planning',
      priority: 'medium',
      progress: 15,
      dueDate: new Date(Date.now() + 86400000 * 20).toISOString(),
      description: 'Strategizing for the upcoming holiday season campaigns.',
      members: [{ id: '1', user: { name: 'Alex' } }],
      icon: '📊'
    },
    {
      id: '4',
      name: 'Legacy Migration',
      status: 'completed',
      priority: 'low',
      progress: 100,
      dueDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      description: 'Moved all legacy databases to the new cloud infrastructure.',
      members: [{ id: '3', user: { name: 'Mike' } }, { id: '5', user: { name: 'Tom' } }],
      icon: '💾'
    }
  ];

  return { getAllProjects };
};

export const useEventStore = () => {
  const getEventsByDateRange = (start: Date, end: Date): CalendarEvent[] => {
    // Generate some fake events relative to "today"
    const today = new Date();
    const e1 = new Date(today); e1.setHours(10, 0, 0);
    const e1End = new Date(e1); e1End.setHours(11, 30, 0);

    const e2 = new Date(today); e2.setHours(14, 0, 0);
    const e2End = new Date(e2); e2End.setHours(15, 0, 0);

    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const e3 = new Date(tomorrow); e3.setHours(9, 0, 0);
    const e3End = new Date(e3); e3End.setHours(10, 0, 0);

    return [
      { id: '1', title: 'Team Sync', startDate: e1, endDate: e1End, color: 'hsl(var(--badge-website))', location: 'Conference Room A' },
      { id: '2', title: 'Design Review', startDate: e2, endDate: e2End, color: 'hsl(var(--badge-design))', location: 'Zoom' },
      { id: '3', title: 'Client Call', startDate: e3, endDate: e3End, color: 'hsl(var(--badge-planning))', location: 'Google Meet' }
    ];
  };

  const getTodayEvents = () => []; // Simplified

  return { getEventsByDateRange, getTodayEvents };
};

export const useChatStore = () => {
  const users: ChatUser[] = [
    { id: 'u1', name: 'Alice Chen', status: 'online', role: 'Product Designer', avatar: 'AC' },
    { id: 'u2', name: 'Bob Smith', status: 'online', role: 'Frontend Dev', avatar: 'BS' },
    { id: 'u3', name: 'Charlie Kim', status: 'offline', role: 'Product Manager', avatar: 'CK' },
    { id: 'u4', name: 'Diana Prince', status: 'online', role: 'DevOps', avatar: 'DP' },
  ];

  const messages: ChatMessage[] = [
    { id: 'm1', authorId: 'u1', content: 'Hey team, are we still on for the design review?', timestamp: new Date(Date.now() - 3600000), isOwn: false, reactions: [{emoji: '👍', count: 2}] },
    { id: 'm2', authorId: 'current', content: 'Yes, 2 PM works for me.', timestamp: new Date(Date.now() - 3500000), isOwn: true, reactions: [] },
    { id: 'm3', authorId: 'u2', content: 'I might be 5 mins late, wrapping up a PR.', timestamp: new Date(Date.now() - 100000), isOwn: false, reactions: [{emoji: '❤️', count: 1}] },
  ];

  return { users, messages, currentUserId: 'current' };
};

export const useOrganizationStore = () => {
  return { endSwitchLoading: () => {}, isLoadingSwitch: false };
};

export const useModalStore = () => ({ openModal: () => console.log('Open modal') });
export const useEventDrawerStore = () => ({ openDrawer: () => console.log('Open drawer') });
