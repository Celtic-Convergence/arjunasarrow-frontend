/**
 * User interface matching the database schema
 */
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string | null;
  school_name: string | null;
  city: string | null;
  current_class: string | null;
  board: string | null;
  created_at: string;
  subscription_start_date: string;
  subscription_end_date: string;
  is_active: boolean;
}

/**
 * User Course junction table interface
 */
export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  last_accessed: string | null;
  progress: number;
}

/**
 * Course interface
 */
export interface Course {
  id: string;
  name: string;
  description: string;
  board: string;
  class: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Book interface
 */
export interface Book {
  id: string
  bookId?: string // Backend uses bookId in public API
  course_id: string
  title: string
  description?: string // Book description (shown on public books page)
  order: number
  chapters?: Chapter[] // May be empty array in public API
  created_at: string
  updated_at: string
  status?: 'draft' | 'published'
  accessType?: 'COURSE_DEFAULT' | 'PAID_ONLY'
  price?: number // Price in paise
  currency?: string // e.g., 'INR'
  eligibleCourses?: string[]
  hasAccess?: boolean
}

/**
 * Chapter interface
 */
export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
  updated_at: string;
  status?: 'draft' | 'published';
}

/**
 * Content interface
 */
export interface Content {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  content_type: 'pdf' | 'video';
  file_url: string;
  duration: number | null;
  page_count: number | null;
  order_number: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User content access tracking
 */
export interface UserContentAccess {
  id: string;
  user_id: string;
  content_id: string;
  first_accessed: string;
  last_accessed: string;
  access_count: number;
}

/**
 * Database schema type definitions
 * This helps with type checking when using Supabase client
 */
export type DatabaseSchema = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'subscription_start_date' | 'subscription_end_date'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      // Add other tables here as your schema grows
    };
  };
};

// Note: We don't need to import Database from supabase-js
// Supabase client will still work with our types
export type SupabaseDatabase = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'subscription_start_date' | 'subscription_end_date'>;
        Update: Partial<Omit<User, 'id'>>;
      };
    };
  };
}; 