export type UserRole = 'super_admin' | 'admin' | 'editor' | 'customer';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  discount?: number;
  categoryId: string;
  sizes?: string[];
  colors?: string[];
  specs?: Record<string, string>;
  brand?: string;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  text: string;
  avatar?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  /** @deprecated use role === 'super_admin' || role === 'admin' */
  isAdmin?: boolean;
}

// Permissions derived from role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'manage_admins', 'manage_users', 'manage_products', 'manage_categories',
    'manage_brands', 'manage_orders', 'manage_reviews', 'view_analytics',
    'manage_settings', 'delete_accounts', 'assign_roles',
  ],
  admin: [
    'manage_products', 'manage_categories', 'manage_brands',
    'manage_orders', 'manage_reviews', 'view_analytics', 'manage_users',
  ],
  editor: [
    'manage_products', 'manage_categories', 'manage_brands', 'manage_reviews',
  ],
  customer: [
    'view_products', 'manage_cart', 'manage_wishlist', 'place_orders',
    'view_orders', 'write_reviews',
  ],
};

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

export function canAccessAdmin(user: User | null): boolean {
  if (!user) return false;
  return ['super_admin', 'admin', 'editor'].includes(user.role);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  customer: 'Customer',
};
