"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  CheckCircle2,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  MoreHorizontal,
  MessageSquare,
  Send,
  Target,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  X,
  Minimize2,
  Moon,
  Sun,
  LayoutGrid,
  Bell,
  Menu,
  CheckSquare,
  Briefcase
} from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import {
  useProjectStore,
  useEventStore,
  useChatStore,
  useOrganizationStore,
  useModalStore,
  useEventDrawerStore,
  CalendarEvent,
} from "@/hooks/useStoreMocks";
import QuickChatWidget from "./QuickChatWidget";

// Types
interface Message {
  id: string;
  text: string;
  isAI: boolean;
  time: string;
}

const START_HOUR = 8;
const END_HOUR = 20;
const NB_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT = 70;

const WorkspaceDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I can help you with your tasks, schedule meetings, or answer questions about your projects.",
      isAI: true,
      time: "12:00 PM",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stores
  const { getAllProjects } = useProjectStore();
  const { getEventsByDateRange } = useEventStore();
  const { users, messages: chatMessages, currentUserId } = useChatStore();
  const { endSwitchLoading, isLoadingSwitch } = useOrganizationStore();
  const { openModal } = useModalStore();
  const { openDrawer } = useEventDrawerStore();

  const allProjects = getAllProjects();

  useEffect(() => {
    if (isLoadingSwitch) {
      endSwitchLoading();
    }
  }, [isLoadingSwitch, endSwitchLoading]);

  // Toggle Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Search Logic & Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    const matchedProjects = allProjects.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery)
    );

    const matchedUsers = users.filter(u => 
      u.name.toLowerCase().includes(lowerQuery) || 
      (u.role && u.role.toLowerCase().includes(lowerQuery))
    );

    // Simulate tasks based on projects for demo purposes
    const matchedTasks = allProjects
      .flatMap(p => [
        { id: `t1-${p.id}`, title: `Review ${p.name} requirements`, project: p.name, priority: p.priority },
        { id: `t2-${p.id}`, title: `${p.name} Kickoff Meeting`, project: p.name, priority: 'medium' },
        { id: `t3-${p.id}`, title: `Finalize ${p.name} Assets`, project: p.name, priority: 'high' }
      ])
      .filter(t => t.title.toLowerCase().includes(lowerQuery));

    return {
      projects: matchedProjects,
      users: matchedUsers,
      tasks: matchedTasks
    };
  }, [searchQuery, allProjects, users]);

  // Derived Dashboard Data
  const stats = useMemo(() => {
    const activeProjects = allProjects.filter((p) => p.status === "active").length;
    const inProgress = allProjects.filter((p) => p.status === "active" || p.status === "planning").length;
    const completed = allProjects.filter((p) => p.status === "completed").length;
    const totalMembers = new Set(allProjects.flatMap((p) => p.members.map((m) => m.id))).size;
    return { activeProjects, inProgress, completed, totalMembers };
  }, [allProjects]);

  const topProjects = useMemo(() => {
    return allProjects
      .filter((p) => p.status === "active")
      .slice(0, 2)
      .map((project) => {
        const dueDate = new Date(project.dueDate);
        const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...project,
          daysLeft: Math.max(0, daysLeft),
          team: project.members.slice(0, 3).map((m) => m.user.name.substring(0, 2).toUpperCase()),
        };
      });
  }, [allProjects]);

  const topTasks = useMemo(() => {
    return allProjects
      .filter((p) => (p.priority === "high" || p.priority === "urgent") && p.status === "active")
      .slice(0, 3)
      .map((project, index) => ({
        id: `task-${project.id}`,
        title: ["Design System Update", "Client Presentation", "API Integration"][index] || "Review",
        description: project.description,
        priority: project.priority,
        members: project.members.slice(0, 3).map(m => m.user.name.substring(0, 1)),
      }));
  }, [allProjects]);

  const calendarEvents = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return getEventsByDateRange(start, end);
  }, [currentDate, getEventsByDateRange]);

  const chatUsers = useMemo(() => {
    return users.filter((u) => u.status === "online" && u.id !== currentUserId).map((user) => ({
      ...user,
      lastMessage: "Hey, can you check this?",
      time: "2m",
      unread: Math.floor(Math.random() * 2),
      online: true
    }));
  }, [users, currentUserId]);

  const teamActivity = useMemo(() => {
    return chatMessages.filter((msg) => !msg.isOwn).slice(-3).map((msg) => {
      const author = users.find((u) => u.id === msg.authorId);
      return {
        id: msg.id,
        user: author?.name || "Unknown",
        role: author?.role || "Member",
        message: msg.content,
        time: "10m ago",
        avatar: author?.avatar || "U",
        comments: 2,
        likes: 4
      };
    });
  }, [chatMessages, users]);

  // Chart Data
  const [progressData] = useState([
    { name: "Mon", value: 30 },
    { name: "Tue", value: 45 },
    { name: "Wed", value: 35 },
    { name: "Thu", value: 60 },
    { name: "Fri", value: 55 },
    { name: "Sat", value: 75 },
    { name: "Sun", value: 70 },
  ]);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    openDrawer();
  }, [openDrawer]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: chatInput,
      isAI: false,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, newMessage]);
    setChatInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I've noted that. Is there anything else you'd like me to schedule?",
        isAI: true,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1000);
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const startOffset = Math.max(0, start.getHours() - START_HOUR + start.getMinutes() / 60);
    const duration = Math.min((end.getHours() - start.getHours()) + (end.getMinutes() - start.getMinutes()) / 60, NB_HOURS - startOffset);
    return {
      top: startOffset * HOUR_HEIGHT,
      height: Math.max(duration * HOUR_HEIGHT, 40),
    };
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur-xl h-full pt-6 pb-4 px-4 z-20">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutGrid className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden lg:block">Nexus</span>
        </div>

        <nav className="flex-1 space-y-2">
           {[
             { icon: LayoutGrid, label: "Dashboard", active: true },
             { icon: Target, label: "Projects", active: false },
             { icon: CalendarIcon, label: "Calendar", active: false },
             { icon: MessageSquare, label: "Messages", active: false },
             { icon: Users, label: "Team", active: false },
           ].map((item, idx) => (
             <button 
               key={idx}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                 item.active 
                 ? "bg-primary text-primary-foreground shadow-md" 
                 : "hover:bg-secondary text-muted-foreground hover:text-foreground"
               }`}
             >
               <item.icon className={`w-5 h-5 ${item.active ? "" : "group-hover:scale-110 transition-transform"}`} />
               <span className="font-medium hidden lg:block">{item.label}</span>
             </button>
           ))}
        </nav>
        
        <div className="mt-auto">
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium hidden lg:block">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Header */}
        <header className="h-20 px-6 lg:px-10 flex items-center justify-between z-10 sticky top-0 backdrop-blur-sm">
           <div className="flex items-center gap-4 md:hidden">
              <button className="p-2 text-foreground"><Menu className="w-6 h-6" /></button>
              <span className="text-xl font-bold">Nexus</span>
           </div>

           {/* Global Search Container */}
           <div className="hidden md:flex flex-1 max-w-lg relative group" ref={searchContainerRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects, tasks, or team members..." 
                className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-border/50 hover:bg-secondary/80 focus:bg-background rounded-full outline-none transition-all placeholder:text-muted-foreground/70 text-sm font-medium"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                    e.currentTarget.blur();
                  }
                }}
              />
              
              {/* Search Results Dropdown/Modal */}
              <AnimatePresence>
                {isSearchOpen && searchQuery && searchResults && (
                   <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.98 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.98 }}
                     transition={{ duration: 0.2 }}
                     className="absolute top-full left-0 right-0 mt-4 bg-card/90 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto ring-1 ring-black/5"
                   >
                     <div className="p-2 space-y-2">
                        {/* Empty State */}
                        {(!searchResults.projects.length && !searchResults.users.length && !searchResults.tasks.length) && (
                          <div className="p-8 text-center text-muted-foreground">
                             <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                             <p className="text-sm">No results found for "{searchQuery}"</p>
                          </div>
                        )}

                        {/* Projects Section */}
                        {searchResults.projects.length > 0 && (
                          <div className="space-y-1">
                             <h4 className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Projects</h4>
                             {searchResults.projects.map(p => (
                               <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors group">
                                  <div className="w-8 h-8 rounded-lg bg-primary/5 border border-border/50 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                                    {p.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                                     <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                                  </div>
                                  <div className="text-[10px] px-2 py-1 bg-secondary rounded-md text-muted-foreground font-medium uppercase">{p.status}</div>
                               </div>
                             ))}
                          </div>
                        )}

                        {/* Tasks Section */}
                        {searchResults.tasks.length > 0 && (
                          <div className="space-y-1">
                             <h4 className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasks</h4>
                             {searchResults.tasks.map(t => (
                               <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors">
                                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <CheckSquare className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="text-sm font-medium text-foreground truncate">{t.title}</div>
                                     <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> {t.project}
                                     </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}

                        {/* People Section */}
                        {searchResults.users.length > 0 && (
                          <div className="space-y-1">
                             <h4 className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Team</h4>
                             {searchResults.users.map(u => (
                               <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-xs font-bold text-foreground border border-border">
                                    {u.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="text-sm font-medium text-foreground">{u.name}</div>
                                     <div className="text-xs text-muted-foreground">{u.role}</div>
                                  </div>
                                  {u.status === 'online' && (
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                                  )}
                               </div>
                             ))}
                          </div>
                        )}
                     </div>
                     <div className="p-2 bg-secondary/30 border-t border-border/50 text-[10px] text-muted-foreground text-center">
                        Press <kbd className="font-sans px-1 py-0.5 bg-background rounded border border-border/50">Esc</kbd> to close
                     </div>
                   </motion.div>
                )}
              </AnimatePresence>
           </div>

           <div className="flex items-center gap-4 lg:gap-6">
              <button className="relative p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
              </button>
              
              <div className="h-8 w-px bg-border/50 hidden sm:block" />
              
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                   <div className="text-sm font-semibold">Alex Morgan</div>
                   <div className="text-xs text-muted-foreground">Product Lead</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-400 dark:from-neutral-700 dark:to-neutral-900 border-2 border-background shadow-sm flex items-center justify-center text-sm font-bold">
                  AM
                </div>
              </div>
           </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-muted-foreground/20">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="max-w-[1600px] mx-auto space-y-8"
           >
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                 <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">Workspace Overview</h1>
                    <p className="text-muted-foreground">Welcome back! You have {topTasks.length} pending tasks today.</p>
                 </div>
                 <button 
                   onClick={openModal}
                   className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                 >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                 </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                 {[
                   { label: "Active Projects", value: stats.activeProjects, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
                   { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
                   { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                   { label: "Team Members", value: stats.totalMembers, icon: Users, color: "text-teal-500", bg: "bg-teal-500/10" },
                 ].map((stat, i) => (
                   <motion.div 
                     key={i}
                     whileHover={{ y: -4 }}
                     className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 relative overflow-hidden group"
                   >
                      <div className="flex justify-between items-start z-10">
                         <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors`}>
                            <stat.icon className="w-6 h-6" />
                         </div>
                         <span className="text-4xl font-bold tracking-tighter">{stat.value}</span>
                      </div>
                      <div className="z-10">
                         <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</p>
                      </div>
                      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                   </motion.div>
                 ))}
              </div>

              <div className="grid grid-cols-12 gap-6 lg:gap-8">
                 {/* Left Column (Main) */}
                 <div className="col-span-12 xl:col-span-8 space-y-6 lg:space-y-8">
                    
                    {/* Active Projects */}
                    <section>
                       <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                             <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                             Active Projects
                          </h2>
                          <button className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">View All</button>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-4">
                          {topProjects.map((project) => (
                             <div key={project.id} className="group bg-card border border-border/40 hover:border-primary/20 p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                   <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                      {project.icon}
                                   </div>
                                   <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      project.daysLeft < 3 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                                   }`}>
                                      {project.daysLeft} days left
                                   </div>
                                </div>
                                <h3 className="text-lg font-bold mb-1">{project.name}</h3>
                                <div className="text-sm text-muted-foreground mb-6 line-clamp-2">{project.description}</div>
                                
                                <div className="space-y-3">
                                   <div className="flex justify-between text-xs font-medium">
                                      <span>Progress</span>
                                      <span>{project.progress}%</span>
                                   </div>
                                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${project.progress}%` }} 
                                      />
                                   </div>
                                   <div className="flex items-center justify-between pt-2">
                                      <div className="flex -space-x-2">
                                         {project.team.map((initial, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold">
                                               {initial}
                                            </div>
                                         ))}
                                      </div>
                                      <button className="p-2 rounded-full hover:bg-secondary transition-colors">
                                         <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                      </button>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </section>

                    {/* Calendar */}
                    <section className="bg-card border border-border/40 rounded-[1.5rem] p-6 shadow-sm overflow-hidden">
                       <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                             <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                             Schedule
                          </h2>
                          <div className="flex gap-2">
                             <button onClick={() => setCalendarView("week")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${calendarView === "week" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}>Week</button>
                             <button onClick={() => setCalendarView("month")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${calendarView === "month" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}>Month</button>
                          </div>
                       </div>
                       
                       <div className="relative border-t border-border/50 pt-4">
                          <div className="grid grid-cols-[50px_1fr] h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                             <div className="text-xs text-muted-foreground space-y-[52px] pt-2 text-right pr-3 font-medium">
                                {Array.from({ length: NB_HOURS }).map((_, i) => (
                                   <div key={i}>{i + START_HOUR}:00</div>
                                ))}
                             </div>
                             <div className="relative grid grid-cols-7 gap-px bg-border/30 rounded-xl overflow-hidden border border-border/30">
                                {getWeekDays().map((day, i) => {
                                   const isToday = day.toDateString() === new Date().toDateString();
                                   const dayEvents = calendarEvents.filter(e => new Date(e.startDate).toDateString() === day.toDateString());
                                   
                                   return (
                                     <div key={i} className={`relative bg-card min-h-full group ${isToday ? 'bg-secondary/20' : ''}`}>
                                        <div className={`text-center py-2 text-xs font-medium border-b border-border/30 sticky top-0 bg-card z-10 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                                           {day.toLocaleDateString('en-US', { weekday: 'short' })} {day.getDate()}
                                        </div>
                                        {/* Grid Lines */}
                                        {Array.from({ length: NB_HOURS }).map((_, h) => (
                                           <div key={h} className="absolute w-full border-b border-border/10" style={{ top: h * HOUR_HEIGHT }} />
                                        ))}
                                        
                                        {dayEvents.map(event => {
                                           const pos = getEventPosition(event);
                                           return (
                                              <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={() => handleEditEvent(event)}
                                                style={{ top: pos.top, height: pos.height, backgroundColor: event.color }}
                                                className="absolute left-1 right-1 rounded-lg p-2 cursor-pointer shadow-sm hover:brightness-110 transition-all z-10 overflow-hidden"
                                              >
                                                 <div className="text-[10px] font-bold text-white/90 truncate">{event.title}</div>
                                                 {pos.height > 40 && <div className="text-[9px] text-white/70 truncate flex items-center gap-1"><MapPin className="w-2 h-2" />{event.location}</div>}
                                              </motion.div>
                                           );
                                        })}
                                     </div>
                                   );
                                })}
                             </div>
                          </div>
                       </div>
                    </section>
                 </div>

                 {/* Right Column */}
                 <div className="col-span-12 xl:col-span-4 space-y-6 lg:space-y-8">
                    
                    {/* Activity Chart */}
                    <div className="bg-card border border-border/40 rounded-[1.5rem] p-6 shadow-sm">
                       <h3 className="text-lg font-bold mb-4">Productivity</h3>
                       <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={progressData}>
                                <defs>
                                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                                <Tooltip 
                                   contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                   itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Urgent Tasks */}
                    <div className="space-y-4">
                       <h3 className="text-lg font-bold">Urgent Tasks</h3>
                       {topTasks.map(task => (
                          <div key={task.id} className="bg-card border border-border/40 p-4 rounded-2xl flex items-center gap-4 hover:bg-secondary/30 transition-colors cursor-pointer group">
                             <div className={`w-2 h-12 rounded-full ${task.priority === 'urgent' ? 'bg-destructive' : 'bg-amber-500'}`} />
                             <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{task.title}</h4>
                                <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                             </div>
                             <div className="flex -space-x-2">
                                {task.members.map((m, i) => (
                                   <div key={i} className="w-6 h-6 rounded-full bg-secondary border border-card flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                      {m}
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                       <button className="w-full py-3 border border-dashed border-border rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Add Task
                       </button>
                    </div>

                    {/* Quick Chat Widget (Refactored) */}
                    <QuickChatWidget users={chatUsers} />

                    {/* Team Activity / Chat Preview */}
                    <div className="bg-card border border-border/40 rounded-[1.5rem] p-6 shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold">Team Activity</h3>
                          <button className="text-xs font-semibold text-primary">See All</button>
                       </div>
                       <div className="space-y-5">
                          {teamActivity.map((act) => (
                             <div key={act.id} className="flex gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm border-2 border-background shadow-sm">
                                     {act.avatar}
                                  </div>
                                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-background"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-baseline mb-0.5">
                                      <span className="text-sm font-semibold">{act.user}</span>
                                      <span className="text-[10px] text-muted-foreground">{act.time}</span>
                                   </div>
                                   <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{act.message}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                 </div>
              </div>
           </motion.div>
        </main>

        {/* Floating AI Chat Button */}
        <AnimatePresence>
          {!isChatOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-8 right-8 w-14 h-14 bg-foreground text-background rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
            >
              <Sparkles className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* AI Chat Window - Glassmorphism */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              className="fixed bottom-8 right-8 w-[380px] h-[600px] bg-card/90 backdrop-blur-2xl border border-border rounded-[2rem] shadow-2xl z-50 flex flex-col overflow-hidden ring-1 ring-black/5"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/30">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                       <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-sm">Nexus AI</h3>
                       <p className="text-[11px] text-muted-foreground">Always active</p>
                    </div>
                 </div>
                 <div className="flex gap-1">
                    <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
                       <Minimize2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
                       <X className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
                 {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isAI ? "justify-start" : "justify-end"}`}
                    >
                       <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          message.isAI 
                          ? "bg-card border border-border text-foreground rounded-tl-sm" 
                          : "bg-primary text-primary-foreground rounded-br-sm"
                       }`}>
                          {message.text}
                       </div>
                    </motion.div>
                 ))}
                 <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card border-t border-border/50">
                 <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type a message..."
                      className="w-full pl-4 pr-12 py-3.5 bg-secondary/50 border border-transparent focus:border-border rounded-full text-sm outline-none transition-all"
                    />
                    <button 
                      onClick={sendChatMessage}
                      className="absolute right-1.5 top-1.5 p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                    >
                       <Send className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default WorkspaceDashboard;
