/** Типы для прототипа web-settings (Права доступа) */

export interface PermissionNode {
  id: string;
  type: 'folder' | 'code';
  label: string;
  /** Код права (только для type='code') */
  code?: string;
  /** Английское название для UI (только для type='code') */
  nameEn?: string;
  /** Описание/тултип */
  description?: string;
  /** Новый код (помечается бейджем) */
  isNew?: boolean;
  /** Дочерние узлы (только для type='folder') */
  children?: PermissionNode[];
  /** Текущее состояние чекбокса */
  checked?: boolean;
}

export interface Role {
  code: string;
  name: string;
}

/** Состояние дерева прав для роли */
export interface RolePermissions {
  roleCode: string;
  checkedIds: Set<string>;
}
