export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar: string;
  alt: string;
  lastActivity: Date;
  status: "active" | "inactive" | "suspended";
  permissions: Permission[];
  filesAccessed: number;
  joinedDate: Date;
  is_banned?: boolean;
  banned: boolean;
}
export type LogItem = {
  id: string;
  user_id?: string;
  tipo: string;
  file_name?: string;
  details?: any;
  created_at: string;
};


export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  description: string;
  color: string;
}

export interface FileOperation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userAlt: string;
  operation: 'upload' | 'view' | 'edit' | 'delete' | 'share';
  fileName: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
  details: string;
}

export interface PermissionRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userAlt: string;
  requestedPermission: Permission;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityFilter {
  dateRange: 'today' | 'week' | 'month' | 'all';
  operationType: 'all' | 'upload' | 'view' | 'edit' | 'delete' | 'share';
  userId: string | 'all';
  status: 'all' | 'success' | 'failed' | 'pending';
}

export type TabType = 'users' | 'permissions' | 'activity';

export type SortField = 'name' | 'email' | 'role' | 'lastActivity' | 'status';
export type SortOrder = 'asc' | 'desc';
export type PermissionAction = 'read' | 'write' | 'delete' | 'admin';
