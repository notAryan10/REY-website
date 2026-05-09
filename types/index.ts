export interface Achievement {
  _id: string;
  title: string;
  description: string;
  xpReward: number;
  category: "Events" | "Learning" | "Projects" | "Resources" | "Community" | "Elite" | "Hidden" | "Game Jams";
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  requirementType?: string;
  requirementValue: number;
  hidden: boolean;
  icon: string;
  unlocked?: boolean;
  progress?: number;
  unlockedAt?: Date | string | null;
}

export interface UserAchievement {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt: Date | string;
}

export interface Quest {
  _id?: string;
  title: string;
  reward: string;
  status: "In Progress" | "Reviewing" | "Completed";
}

export interface IQuest {
  _id: string;
  title: string;
  description: string;
  category: "login" | "events" | "resources" | "projects" | "community" | "elite" | "hidden";
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  requirement: number;
  hidden: boolean;
  isActive: boolean;
}

export interface IUserQuest {
  _id: string;
  userId: string;
  questId: IQuest;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: string | Date;
}

export interface IStreak {
  _id: string;
  userId: string;
  currentStreak: number;
  highestStreak: number;
  lastLoginDate: string | Date;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: string | Date;
  type: "event" | "gamejam" | "workshop";
  isPublic: boolean;
  createdBy: string;
  accent?: "lava" | "grass" | "sky" | "sand";
  location?: string;
  players?: string;
  submissionDate?: string | Date;
  leaderboard?: {
    playerName: string;
    score: number;
    rank: number;
    projectLink?: string;
  }[];
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  itchIoUrl: string;
  itchId?: string;
  engine?: string;
  tags?: string[];
  coverImage?: string;
  verified?: boolean;
  downloads?: number;
  views?: number;
  syncStatus?: "synced" | "outdated" | "manual";
  source?: "manual" | "itch" | "github" | "gamejolt";
  devStatus?: "prototype" | "in-development" | "released" | "archived";
  featured?: boolean;
  accent: "lava" | "sky" | "grass" | "sand";
  tag: string;
  uploadedBy: {
    name: string;
    role: string;
  };
  likes: string[];
  commentCount?: number;
  createdAt: string | Date;
}

export interface IResource {
  _id: string;
  title: string;
  type: string;
  size: string;
  accessLevel: "public" | "members";
  accent: "lava" | "sky" | "grass" | "sand";
  downloadUrl?: string;
  createdAt: string | Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Founder" | "Core Architect" | "Moderator" | "architect" | "respawner" | "spectator";
  status: "active" | "suspended" | "maintenance";
  image?: string;
  xp: number;
  itchConnected?: boolean;
  itchUsername?: string;
  itchVerified?: boolean;
  itchVerificationToken?: string;
  eventWins: number;
  projectsLed: number;
  achievements: UserAchievement[];
  quests: Quest[];
}

export interface Log {
  _id?: string;
  createdAt: string | Date;
  action: string;
  subject: string;
  subjectName?: string;
  actor: string;
  actorName: string;
  actorRole: string;
  status: string;
  details?: Record<string, unknown>;
}
