export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar: string;
  department: string;
  status: 'active' | 'inactive';
  lastActive: Date;
  permissionLevel: 'full' | 'limited' | 'restricted';
}

export interface FileCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  fileCount: number;
}

export interface AccessLevel {
  view: boolean;
  edit: boolean;
  upload: boolean;
  delete: boolean;
}

export interface Permission {
  userId: string;
  categoryId: string;
  access: AccessLevel;
  inherited: boolean;
  customized: boolean;
  lastModified: Date;
  modifiedBy: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  role: 'admin' | 'user' | 'guest';
  permissions: Omit<Permission, 'userId' | 'lastModified' | 'modifiedBy'>[];
}

export interface PermissionHistory {
  id: string;
  userId: string;
  userName: string;        
  action: 'granted' | 'revoked' | 'modified';
  categoryName: string;    
  accessLevel: string;     
  timestamp: Date;
  modifiedBy: string;
  modifiedByName: string;  
}


export interface BulkPermissionUpdate {
  userIds: string[];
  categoryId: string;
  access: AccessLevel;
  applyToAll: boolean;
}

export interface PermissionConflict {
  userId: string;
  categoryId: string;
  rolePermission: AccessLevel;
  customPermission: AccessLevel;
  resolution: 'use-role' | 'use-custom' | 'merge';
}