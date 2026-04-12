// ── User ──────────────────────────────────────────────
export interface User {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photo?: string;
  phone?: string;
  city?: string;
  profession?: string;
  experience?: string;
  level?: ExperienceLevel;
  technologies: string[];
  bio?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  telegram?: string;
  rating: number;
  role: UserRole;
  profileCompleted: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';
export type ExperienceLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD';

// ── Post ──────────────────────────────────────────────
export interface Post {
  id: number;
  type: PostType;
  title: string;
  description?: string;
  company?: string;
  city?: string;
  salary?: string;
  experience?: string;
  workType?: string;
  technologies: string[];
  contactTelegram?: string;
  contactPhone?: string;
  contactEmail?: string;
  link?: string;
  status: PostStatus;
  viewCount: number;
  rejectReason?: string;
  extra?: Record<string, any>;
  authorId: number;
  author?: User;
  categoryId?: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export type PostType = 'VACANCY' | 'RESUME' | 'COURSE' | 'MENTOR' | 'INTERNSHIP';
export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

// ── Category ──────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  order: number;
}

// ── Technology ──────────────────────────────────────────
export interface Technology {
  id: number;
  name: string;
  category: string;
}

// ── Service ──────────────────────────────────────────
export interface Service {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  price?: string;
  icon?: string;
  link?: string;
  isActive: boolean;
  order: number;
}

// ── Stats ──────────────────────────────────────────
export interface PublicStats {
  totalUsers: number;
  totalPosts: number;
  byType: {
    vacancies: number;
    resumes: number;
    courses: number;
    mentors: number;
    internships: number;
  };
}

// ── API Response ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Telegram WebApp ──────────────────────────────────
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    setText: (text: string) => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
