"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Users, 
  Zap, 
  Trophy, 
  Settings, 
  Activity, 
  Terminal, 
  Search, 
  LogOut,
  LayoutDashboard,
  Trash2,
  Plus,
  Minus,
  ArrowUpCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  Cpu,
  Globe,
  RefreshCw,
  ChevronRight,
  UserPlus,
  UserMinus
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { calculateLevel } from "@/lib/xp";
import { User, Achievement, Log, UserAchievement } from "@/types";
import { Session } from "next-auth";

import { socket } from "@/lib/socket";

type Section = "Overview" | "Members" | "XP Control" | "Achievements" | "Admin Management" | "System Logs";

export default function ArchitectConsole() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<Section>("Overview");
  const [users, setUsers] = useState<User[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemLoad, setSystemLoad] = useState(42);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, achRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/achievements")
      ]);
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
      if (achRes.ok) {
        const achData = await achRes.json();
        setAchievements(achData);
      }
    } catch (_err) {
      console.error("Failed to fetch data", _err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
    
    // Socket integration
    socket.connect();
    
    const loadInterval = setInterval(() => {
      setSystemLoad(prev => Math.min(Math.max(prev + (Math.random() * 4 - 2), 30), 80));
    }, 3000);

    return () => {
      socket.disconnect();
      clearInterval(loadInterval);
    };
  }, [fetchData]);

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  };

  if (!session || !["Founder", "Core Architect", "Moderator"].includes(session.user.role)) {
    return (
      <div className="min-h-screen bg-architect-bg flex items-center justify-center p-4">
        <Card accent="lava" className="max-w-md w-full text-center">
          <Shield className="mx-auto text-lava mb-4" size={48} />
          <h2 className="text-xl mb-2">Access Denied</h2>
          <p className="text-text-secondary text-sm mb-6">Insufficient clearance level. This terminal is restricted to authorized Architects only.</p>
          <Button variant="lava" onClick={() => window.location.href = "/dashboard"}>Return to Safety</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-architect-bg text-white font-sans selection:bg-architect-orange selection:text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-50" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-architect-orange/20 animate-pulse" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-architect-orange rounded flex items-center justify-center shadow-[0_0_15px_rgba(255,107,44,0.4)]">
                <Terminal size={18} className="text-black" />
              </div>
              <span className="font-pixel text-[10px] tracking-widest text-architect-orange">ARCHITECT CONSOLE</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-pixel text-text-secondary">
              <div className="w-1.5 h-1.5 bg-architect-green rounded-full animate-pulse" />
              SYSTEM ONLINE // v2.4.0
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem 
              active={activeSection === "Overview"} 
              onClick={() => setActiveSection("Overview")} 
              icon={<Activity size={18} />} 
              label="Overview" 
            />
            <NavItem 
              active={activeSection === "Members"} 
              onClick={() => setActiveSection("Members")} 
              icon={<Users size={18} />} 
              label="Members" 
            />
            <NavItem 
              active={activeSection === "XP Control"} 
              onClick={() => setActiveSection("XP Control")} 
              icon={<Zap size={18} />} 
              label="XP Control" 
            />
            <NavItem 
              active={activeSection === "Achievements"} 
              onClick={() => setActiveSection("Achievements")} 
              icon={<Trophy size={18} />} 
              label="Achievements" 
            />
            {session.user.role === "Founder" && (
              <NavItem 
                active={activeSection === "Admin Management"} 
                onClick={() => setActiveSection("Admin Management")} 
                icon={<Shield size={18} />} 
                label="Admins" 
              />
            )}
            <NavItem 
              active={activeSection === "System Logs"} 
              onClick={() => setActiveSection("System Logs")} 
              icon={<Terminal size={18} />} 
              label="System Logs" 
            />
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all group"
              >
                <LayoutDashboard size={18} className="group-hover:text-architect-blue transition-colors" />
                <span className="text-[10px] font-pixel tracking-tighter uppercase">Content CMS</span>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-md bg-stone flex items-center justify-center overflow-hidden border border-white/20">
                {session.user.image ? (
                  <Image src={session.user.image || ""} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <Shield size={20} className={session.user.role === "Founder" ? "text-architect-gold" : "text-architect-orange"} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{session.user.name}</p>
                <Badge variant={session.user.role === "Founder" ? "sand" : "stone"} className="text-[8px] py-0 px-1 mt-1">
                  {session.user.role}
                </Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-pixel tracking-tighter text-white/80">{activeSection}</h2>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-[10px] font-pixel text-text-secondary">
                <Globe size={12} />
                REG-SECTOR: ALPHA-7
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-pixel text-text-secondary leading-none mb-1">SYSTEM LOAD</p>
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${systemLoad}%` }} 
                      className={`h-full ${systemLoad > 70 ? 'bg-lava' : systemLoad > 50 ? 'bg-architect-orange' : 'bg-architect-green'}`} 
                    />
                  </div>
                </div>
                <Cpu size={20} className={systemLoad > 70 ? 'text-lava' : systemLoad > 50 ? 'text-architect-orange' : 'text-architect-green'} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = "/dashboard"}>
                <LogOut size={14} className="mr-2" />
                Exit Console
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === "Overview" && (
                  <OverviewSection users={users} achievements={achievements} />
                )}
                {activeSection === "Members" && (
                  <MembersSection
                    users={users}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    fetchData={fetchData}
                    showStatus={showStatus}
                    session={session}
                  />
                )}
                {activeSection === "XP Control" && (
                  <XPControlSection
                    users={users}
                    fetchData={fetchData}
                    showStatus={showStatus}
                    session={session}
                  />
                )}
                {activeSection === "Achievements" && (
                  <AchievementsSection
                    users={users}
                    achievements={achievements}
                    fetchData={fetchData}
                    showStatus={showStatus}
                    session={session}
                  />
                )}
                {activeSection === "Admin Management" && session?.user?.role === "Founder" && (
                  <AdminManagementSection
                    users={users}
                    fetchData={fetchData}
                    showStatus={showStatus}
                    session={session}
                  />
                )}
                {activeSection === "System Logs" && (
                  <SystemLogsSection />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-24 right-8 z-[100] p-4 rounded-lg border-2 backdrop-blur-xl flex items-center gap-3 ${
              status.type === "success" 
                ? "bg-architect-green/20 border-architect-green text-architect-green" 
                : "bg-lava/20 border-lava text-lava"
            }`}
          >
            {status.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <div>
              <p className="text-[10px] font-pixel uppercase tracking-widest">{status.type === "success" ? "Operation Successful" : "System Error"}</p>
              <p className="text-xs mt-1 font-sans">{status.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
        active 
          ? "bg-white/10 text-white border-l-4 border-architect-orange" 
          : "text-text-secondary hover:text-white hover:bg-white/5"
      }`}
    >
      <span className={active ? "text-architect-orange" : "group-hover:text-architect-orange transition-colors"}>
        {icon}
      </span>
      <span className="text-xs font-pixel tracking-tighter uppercase">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto text-architect-orange" />}
    </button>
  );
}

function OverviewSection({ users, achievements }: { users: User[], achievements: Achievement[] }) {
  const totalXP = users.reduce((acc, u) => acc + (u.xp || 0), 0);
  const activeAdmins = users.filter(u => ["Founder", "Core Architect", "Moderator"].includes(u.role)).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Citizens" 
          value={users.length} 
          icon={<Users size={24} />} 
          accent="sky" 
          trend="+12% Since Last Cycle"
        />
        <StatCard 
          title="Energy (XP) Output" 
          value={totalXP.toLocaleString()} 
          icon={<Zap size={24} />} 
          accent="orange" 
          trend="+5.4k Today"
        />
        <StatCard 
          title="Architect Authority" 
          value={activeAdmins} 
          icon={<Shield size={24} />} 
          accent="gold" 
          trend="All Nodes Secure"
        />
        <StatCard 
          title="Milestones Logged" 
          value={achievements.length} 
          icon={<Trophy size={24} />} 
          accent="green" 
          trend="8 New Artifacts"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-black/40" hoverEffect={false}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-pixel text-white/80">Population Growth</h3>
            <div className="flex gap-2">
              <Badge variant="stone">7 DAYS</Badge>
              <Badge variant="stone">30 DAYS</Badge>
            </div>
          </div>
          <div className="h-64 flex items-end gap-2 px-4">
            {[40, 60, 45, 80, 55, 90, 100].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="flex-1 bg-architect-blue/20 border-t-2 border-architect-blue rounded-t-sm relative group"
              >
                <div className="absolute inset-0 bg-architect-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[9px] font-pixel text-text-secondary uppercase">
            <span>Cycle-01</span>
            <span>Cycle-02</span>
            <span>Cycle-03</span>
            <span>Cycle-04</span>
            <span>Cycle-05</span>
            <span>Cycle-06</span>
            <span>Cycle-07</span>
          </div>
        </Card>

        <Card className="bg-black/40" hoverEffect={false}>
          <h3 className="text-sm font-pixel text-white/80 mb-8">System Health</h3>
          <div className="space-y-6">
            <HealthItem label="Database Sync" status="Optimized" progress={98} color="green" />
            <HealthItem label="Auth Protocols" status="Secure" progress={100} color="gold" />
            <HealthItem label="Realtime Uplink" status="Active" progress={85} color="blue" />
            <HealthItem label="Archive Access" status="Online" progress={92} color="sky" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, accent, trend }: { title: string, value: string | number, icon: React.ReactNode, accent: string, trend: string }) {
  const accentColors = {
    sky: "text-architect-blue bg-architect-blue/10 border-architect-blue/20",
    orange: "text-architect-orange bg-architect-orange/10 border-architect-orange/20",
    gold: "text-architect-gold bg-architect-gold/10 border-architect-gold/20",
    green: "text-architect-green bg-architect-green/10 border-architect-green/20",
  };

  return (
    <Card className={`relative group overflow-hidden border-2 ${accentColors[accent as keyof typeof accentColors].split(' ')[2]}`} hoverEffect={true}>
      <div className={`absolute top-0 right-0 p-4 ${accentColors[accent as keyof typeof accentColors].split(' ')[0]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-pixel text-text-secondary uppercase tracking-wider mb-2">{title}</p>
      <h4 className="text-3xl font-pixel mb-4">{value}</h4>
      <p className={`text-[9px] font-pixel uppercase ${accentColors[accent as keyof typeof accentColors].split(' ')[0]}`}>
        {trend}
      </p>
      <div className={`absolute bottom-0 left-0 h-1 bg-current transition-all duration-500 w-0 group-hover:w-full ${accentColors[accent as keyof typeof accentColors].split(' ')[0]}`} />
    </Card>
  );
}

function HealthItem({ label, status, progress, color }: { label: string, status: string, progress: number, color: string }) {
  const colors = {
    green: "bg-architect-green",
    gold: "bg-architect-gold",
    blue: "bg-architect-blue",
    sky: "bg-sky",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-pixel text-text-secondary">{label}</span>
        <span className={`text-[9px] font-pixel uppercase ${color === 'green' ? 'text-architect-green' : color === 'gold' ? 'text-architect-gold' : 'text-architect-blue'}`}>{status}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${colors[color as keyof typeof colors]}`} 
        />
      </div>
    </div>
  );
}

function MembersSection({ users, searchTerm, setSearchTerm, fetchData, showStatus, session }: { 
  users: User[], 
  searchTerm: string, 
  setSearchTerm: (val: string) => void, 
  fetchData: () => void, 
  showStatus: (type: "success" | "error", message: string) => void, 
  session: Session | null 
}) {
  const filteredUsers = users.filter((u: User) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (userId: string, status: string, userName: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showStatus("success", `User status updated to ${status}`);
        
        // Emit live log
        socket.emit("admin:action", {
          action: status === "active" ? "MEMBER_REACTIVATION" : "MEMBER_SUSPENSION",
          subject: userId,
          subjectName: userName,
          actor: session?.user?.id,
          actorName: session?.user?.name,
          actorRole: session?.user?.role,
          status: "SUCCESS"
        });

        fetchData();
      } else {
        showStatus("error", "Failed to update user status");
      }
    } catch {
      showStatus("error", "Network error");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm("CRITICAL WARNING: This will permanently purge this citizen's identity and all associated data from the core database. This action is irreversible. Proceed?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      
      const data = await res.json();

      if (res.ok) {
        showStatus("success", "User identity purged successfully");

        // Emit live log
        socket.emit("admin:action", {
          action: "IDENTITY_PURGE",
          subject: userId,
          subjectName: userName,
          actor: session?.user?.id,
          actorName: session?.user?.name,
          actorRole: session?.user?.role,
          status: "PURGED"
        });

        fetchData();
      } else {
        showStatus("error", data.error || `Purge failed with status: ${res.status}`);
      }
    } catch {
      showStatus("error", "Protocol Breach: Network Error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH CITIZEN DATABASE..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border-2 border-white/10 rounded-lg pl-12 pr-4 py-3 text-xs font-pixel tracking-widest focus:border-architect-orange outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <Button variant="stone" size="sm" onClick={fetchData}>
            <RefreshCw size={14} className="mr-2" />
            Sync Database
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user: User) => (
          <UserCard 
            key={user._id} 
            user={user} 
            onStatusChange={handleStatusChange} 
            onDelete={handleDeleteUser}
          />
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, onStatusChange, onDelete }: { user: User, onStatusChange: (id: string, status: string, name: string) => void, onDelete: (id: string, name: string) => void }) {
  const { level, progress } = calculateLevel(user.xp || 0);

  return (
    <Card className="bg-black/40 border-white/10 hover:border-architect-blue transition-colors group" hoverEffect={true}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-stone flex items-center justify-center overflow-hidden border border-white/20">
            {user.image ? (
              <Image src={user.image || ""} alt={user.name || ""} width={40} height={40} className="w-full h-full object-cover" unoptimized />
            ) : (
              <Users size={24} className="text-white/20" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm">{user.name}</h4>
            <p className="text-[10px] text-text-secondary font-mono">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <Badge variant={user.role === "Founder" ? "sand" : user.role === "Core Architect" ? "lava" : "stone"} className="text-[8px] py-0 px-2">
             {user.role}
           </Badge>
           <div className="flex items-center gap-1">
             <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-architect-green' : 'bg-lava'}`} />
             <span className="text-[9px] font-pixel text-text-secondary uppercase">{user.status}</span>
           </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-pixel text-text-secondary">LEVEL {level}</span>
          <span className="text-[9px] font-pixel text-white/60">{user.xp || 0} XP</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-architect-blue shadow-[0_0_10px_rgba(87,199,255,0.5)]" 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="stone" 
          size="sm" 
          className="text-[9px] h-9 px-1"
          onClick={() => onStatusChange(user._id, user.status === 'active' ? 'suspended' : 'active', user.name)}
          disabled={user.role === "Founder"}
        >
          {user.status === 'active' ? <UserMinus size={12} className="mr-1" /> : <UserPlus size={12} className="mr-1" />}
          {user.status === 'active' ? 'Suspend' : 'Active'}
        </Button>
        <Button variant="stone" size="sm" className="text-[9px] h-9 px-1">
          <Settings size={12} className="mr-1" />
          Config
        </Button>
        <Button 
          variant="lava" 
          size="sm" 
          className="text-[9px] h-9 px-1"
          onClick={() => onDelete(user._id, user.name)}
          disabled={user.role === "Founder"}
          title="Purge Identity"
        >
          <Trash2 size={12} className="mr-1" />
          Purge
        </Button>
      </div>
    </Card>
  );
}

function XPControlSection({ users, fetchData, showStatus, session }: { users: User[], fetchData: () => void, showStatus: (type: "success" | "error", message: string) => void, session: Session | null }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [xpAmount, setXpAmount] = useState(100);

  const handleXPUpdate = async (action: "add" | "remove" | "set") => {
    if (!selectedUser) return;
    
    try {
      const res = await fetch("/api/admin/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: selectedUser._id, 
          amount: action === "remove" ? -xpAmount : xpAmount,
          action
        })
      });
      
      if (res.ok) {
        showStatus("success", `XP ${action}ed successfully`);
        
        // Emit live log
        socket.emit("admin:action", {
          action: `XP_${action.toUpperCase()}`,
          subject: selectedUser._id,
          subjectName: selectedUser.name,
          actor: session?.user?.id,
          actorName: session?.user?.name,
          actorRole: session?.user?.role,
          status: "SUCCESS",
          details: { amount: xpAmount }
        });

        fetchData();
        // Update local state to show change
        setSelectedUser({
          ...selectedUser,
          xp: action === "set" ? xpAmount : (selectedUser.xp || 0) + (action === "remove" ? -xpAmount : xpAmount)
        } as User);
      } else {
        showStatus("error", "Failed to update XP");
      }
    } catch {
      showStatus("error", "Network error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-black/40" hoverEffect={false}>
        <h3 className="text-sm font-pixel text-white/80 mb-6 flex items-center gap-2">
          <Users size={18} className="text-architect-blue" />
          Select Target Subject
        </h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {users.map((user: User) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                selectedUser?._id === user._id 
                  ? "bg-architect-blue/10 border-architect-blue" 
                  : "bg-white/5 border-transparent hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-stone border border-white/10 flex items-center justify-center overflow-hidden">
                  {user.image ? <Image src={user.image || ""} alt={user.name || ""} width={40} height={40} className="w-full h-full object-cover" unoptimized /> : <Users size={14} />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">{user.name}</p>
                  <p className="text-[9px] text-text-secondary font-mono">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-pixel text-architect-blue">{user.xp || 0} XP</p>
                <p className="text-[8px] font-pixel text-text-secondary">LVL {calculateLevel(user.xp || 0).level}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40" hoverEffect={false}>
        <h3 className="text-sm font-pixel text-white/80 mb-6 flex items-center gap-2">
          <Zap size={18} className="text-architect-orange" />
          XP Modification Interface
        </h3>

        {selectedUser ? (
          <div className="space-y-8">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-[10px] font-pixel text-text-secondary mb-2">TARGET LOCKED</p>
              <p className="text-sm font-bold text-architect-orange">{selectedUser.name}</p>
              <p className="text-xs text-text-secondary mt-1 uppercase font-pixel tracking-tighter">Current Status: {selectedUser.xp || 0} XP / Level {calculateLevel(selectedUser.xp || 0).level}</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-pixel text-text-secondary uppercase">Energy Quantum (XP Amount)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  value={xpAmount}
                  onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-black/40 border-2 border-white/10 rounded-lg px-4 py-3 text-sm font-pixel text-architect-orange outline-none focus:border-architect-orange transition-all"
                />
                <div className="flex gap-2">
                  {[50, 100, 500].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setXpAmount(amt)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-[9px] font-pixel hover:bg-white/10 transition-colors"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <Button variant="grass" onClick={() => handleXPUpdate("add")}>
                <Plus size={14} className="mr-2" />
                Inject XP
              </Button>
              <Button variant="lava" onClick={() => handleXPUpdate("remove")}>
                <Minus size={14} className="mr-2" />
                Extract XP
              </Button>
              <Button variant="sky" onClick={() => handleXPUpdate("set")}>
                <ArrowUpCircle size={14} className="mr-2" />
                Override
              </Button>
            </div>
            
            <p className="text-[9px] font-pixel text-text-secondary leading-relaxed opacity-50">
              WARNING: XP manipulation directly affects citizen progression and leaderboard positioning. 
              Unauthorized modification is logged and monitored by the Core Architect.
            </p>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-center opacity-40">
            <Lock size={48} className="mb-4 text-text-secondary" />
            <p className="font-pixel text-[10px] uppercase">Select a subject from the datalink to begin</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function AchievementsSection({ users, achievements, fetchData, showStatus, session }: { users: User[], achievements: Achievement[], fetchData: () => void, showStatus: (type: "success" | "error", message: string) => void, session: Session | null }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUnlock = async (achievementId: string, achievementTitle: string) => {
    if (!selectedUser) return;
    
    try {
      const res = await fetch("/api/admin/achievement/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser._id, achievementId })
      });
      
      if (res.ok) {
        showStatus("success", "Achievement unlocked successfully");

        // Emit live log
        socket.emit("admin:action", {
          action: "ACHIEVEMENT_UNLOCKED",
          subject: selectedUser._id,
          subjectName: selectedUser.name,
          actor: session?.user?.id,
          actorName: session?.user?.name,
          actorRole: session?.user?.role,
          status: "SUCCESS",
          details: { achievement: achievementTitle }
        });

        fetchData();
        // Update local user state
        const updatedUser = { 
          ...selectedUser,
          achievements: [...(selectedUser.achievements || []), { achievementId, unlocked: true }]
        } as User;
        setSelectedUser(updatedUser);
      } else {
        const error = await res.json();
        showStatus("error", error.error || "Failed to unlock achievement");
      }
    } catch {
      showStatus("error", "Network error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-black/40" hoverEffect={false}>
        <h3 className="text-sm font-pixel text-white/80 mb-6 flex items-center gap-2">
          <Users size={18} className="text-architect-blue" />
          Target Identity
        </h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {users.map((user: User) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                selectedUser?._id === user._id 
                  ? "bg-architect-blue/10 border-architect-blue" 
                  : "bg-white/5 border-transparent hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-stone border border-white/10 flex items-center justify-center overflow-hidden">
                  {user.image ? <Image src={user.image || ""} alt={user.name || ""} width={40} height={40} className="w-full h-full object-cover" unoptimized /> : <Users size={14} />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">{user.name}</p>
                  <p className="text-[9px] text-text-secondary font-mono">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Trophy size={14} className={(user.achievements?.length || 0) > 0 ? "text-architect-gold" : "text-white/10"} />
                <span className="text-[10px] font-pixel">{user.achievements?.length || 0}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40" hoverEffect={false}>
        <h3 className="text-sm font-pixel text-white/80 mb-6 flex items-center gap-2">
          <Trophy size={18} className="text-architect-gold" />
          Achievement Vault
        </h3>

        {selectedUser ? (
          <div className="space-y-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-stone flex items-center justify-center border border-white/20">
                <Shield className="text-architect-gold" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-pixel text-text-secondary uppercase">MODERATING</p>
                <p className="text-sm font-bold text-white">{selectedUser.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {achievements.map((ach: Achievement) => {
                const userAchievements = selectedUser.achievements || [];
                const isUnlocked = userAchievements.find((a: UserAchievement) => 
                  (typeof a.achievementId === 'string' ? a.achievementId === ach._id : (a.achievementId as unknown as Achievement)?._id === ach._id)
                );
                return (
                  <div 
                    key={ach._id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isUnlocked ? "bg-architect-gold/5 border-architect-gold/30" : "bg-white/5 border-white/10 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-md ${isUnlocked ? 'bg-architect-gold/20' : 'bg-white/5'}`}>
                        <Trophy size={20} className={isUnlocked ? 'text-architect-gold' : 'text-text-secondary'} />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isUnlocked ? 'text-architect-gold' : 'text-white'}`}>{ach.title}</h4>
                        <p className="text-[9px] text-text-secondary mt-1">{ach.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <Badge variant="stone" className="text-[8px] py-0">{ach.rarity}</Badge>
                           <span className="text-[9px] font-pixel text-architect-green">+{ach.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                    
                    {!isUnlocked ? (
                      <Button variant="stone" size="sm" className="text-[9px] h-8 px-3" onClick={() => handleUnlock(ach._id, ach.title)}>
                        Unlock
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 text-architect-green">
                        <CheckCircle2 size={16} />
                        <span className="text-[8px] font-pixel uppercase">Earned</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-40">
            <Trophy size={48} className="mb-4 text-text-secondary" />
            <p className="font-pixel text-[10px] uppercase">Initialize citizen link to access vault</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function AdminManagementSection({ users, fetchData, showStatus, session }: { users: User[], fetchData: () => void, showStatus: (type: "success" | "error", message: string) => void, session: Session | null }) {
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedTier, setSelectedTier] = useState<"Core Architect" | "Moderator">("Moderator");
  const [submitting, setSubmitting] = useState(false);

  const adminUsers = users.filter((u: User) => ["Founder", "Core Architect", "Moderator"].includes(u.role));

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/permissions/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: targetEmail, 
          tier: selectedTier,
          permissions: selectedTier === "Core Architect" ? ["FULL_ACCESS"] : ["MODERATE_COMMUNITY", "MANAGE_EVENTS"]
        })
      });
      
      if (res.ok) {
        showStatus("success", `Admin privileges granted to ${targetEmail}`);
        
        const data = await res.json();
        // Emit live log
        socket.emit("admin:action", {
          action: "AUTH_UPGRADE",
          subject: data.user?._id || targetEmail,
          subjectName: targetEmail,
          actor: session?.user?.id,
          actorName: session?.user?.name,
          actorRole: session?.user?.role,
          status: "SUCCESS",
          details: { tier: selectedTier }
        });

        setTargetEmail("");
        fetchData();
      } else {
        const err = await res.json();
        showStatus("error", err.error || "Failed to grant privileges");
      }
    } catch {
      showStatus("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-black/40" hoverEffect={false}>
        <h3 className="text-sm font-pixel text-white/80 mb-6 flex items-center gap-2">
          <Shield size={18} className="text-architect-gold" />
          Grant Architect Authority
        </h3>
        
        <form onSubmit={handleGrant} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-pixel text-text-secondary uppercase">Citizen Email</label>
            <input 
              type="email" 
              required
              placeholder="ENTER EMAIL ADDRESS..." 
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-4 py-3 text-xs font-pixel text-architect-gold outline-none focus:border-architect-gold transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-pixel text-text-secondary uppercase">Authorization Tier</label>
            <select 
              value={selectedTier}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTier(e.target.value as "Core Architect" | "Moderator")}
              className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-4 py-3 text-xs font-pixel text-white outline-none focus:border-architect-gold appearance-none"
            >
              <option value="Core Architect">Core Architect (Elite Management)</option>
              <option value="Moderator">Moderator (Limited Authority)</option>
            </select>
          </div>

          <div className="p-4 bg-architect-gold/5 border border-architect-gold/20 rounded-lg">
             <p className="text-[9px] font-pixel text-architect-gold leading-relaxed">
               By promoting a citizen to an Architect role, you are delegating system governance privileges. 
               This action is permanent until manually revoked.
             </p>
          </div>

          <Button variant="sand" type="submit" className="w-full" disabled={submitting}>
            {submitting ? "PROVISIONING..." : "INITIALIZE PROMOTION"}
          </Button>
        </form>
      </Card>

      <Card className="bg-black/40" hoverEffect={false}>
        <h3 className="text-sm font-pixel text-white/80 mb-6 flex items-center gap-2">
          <Shield size={18} className="text-architect-blue" />
          Current Architect Hierarchy
        </h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {adminUsers.map((admin: User) => (
            <div 
              key={admin._id}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-stone border border-white/20 flex items-center justify-center overflow-hidden">
                   {admin.image ? <Image src={admin.image || ""} alt={admin.name || ""} width={40} height={40} className="w-full h-full object-cover" unoptimized /> : <Shield size={20} />}
                </div>
                <div>
                  <p className="text-xs font-bold">{admin.name}</p>
                  <p className="text-[9px] text-text-secondary font-mono">{admin.email}</p>
                </div>
              </div>
              <div className="text-right">
                 <Badge variant={admin.role === "Founder" ? "sand" : admin.role === "Core Architect" ? "lava" : "stone"}>
                   {admin.role.toUpperCase()}
                 </Badge>
                 <p className="text-[8px] font-pixel text-text-secondary mt-1">SECURE NODE</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SystemLogsSection() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const logsData = await res.json();
        setLogs(logsData);
      }
    } catch (_err) {
      console.error("Failed to fetch logs", _err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchLogs();
    };
    init();

    // Listen for live updates
    socket.on("admin:log_update", (newLog: Log) => {
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    });

    return () => {
      socket.off("admin:log_update");
    };
  }, [fetchLogs]);

  return (
    <Card className="bg-black/40 font-mono" hoverEffect={false}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-pixel text-white/80 flex items-center gap-2">
          <Terminal size={18} className="text-architect-green" />
          Governance Audit Trail
        </h3>
        <Badge variant="stone" className="font-pixel text-[8px]">REALTIME_STREAM_ON</Badge>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-5 gap-4 py-2 border-b border-white/10 text-[10px] font-pixel text-text-secondary">
          <span>TIMESTAMP</span>
          <span>ACTION_TYPE</span>
          <span>SUBJECT</span>
          <span>ACTOR</span>
          <span className="text-right">RESULT</span>
        </div>
        
        {loading ? (
          <div className="py-8 text-center text-text-secondary font-pixel text-[10px] animate-pulse">
            SYNCING AUDIT TRAIL...
          </div>
        ) : (
          <div className="space-y-0.5 pt-2">
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={log._id || i} 
                  className="grid grid-cols-5 gap-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 items-center group"
                >
                  <span className="text-[10px] text-architect-blue font-pixel">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] text-white font-pixel truncate">{log.action}</span>
                  <span className="text-[10px] text-text-secondary font-mono truncate">
                    {log.subjectName || log.subject}
                  </span>
                  <span className="text-[10px] text-architect-orange font-pixel truncate">{log.actorName}</span>
                  <span className={`text-[10px] font-pixel text-right ${log.status === 'SUCCESS' || log.status === 'PURGED' ? 'text-architect-green' : 'text-lava'}`}>
                    {log.status}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="py-4 flex items-center gap-2 text-[10px] font-pixel text-architect-green/50 animate-pulse">
              <span className="w-1 h-3 bg-current" />
              AWAITING NEXT EVENT_PACKET...
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
