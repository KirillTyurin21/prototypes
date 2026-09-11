/** Типы демо-прототипа «Целевое видение Q4» */

export interface Q4Goal {
  id: string;
  title: string;
  priority: 'must' | 'wish' | 'cross' | 'research';
  priorityLabel: string;
  tasks: Q4TaskRef[];
}

export interface Q4TaskRef {
  key: string;
  title: string;
  route: string;
  estimate: string;
  dependsOn?: string[];
}

export interface Q4NavItem {
  key?: string;
  label: string;
  route: string;
}

export interface Q4NavGroup {
  label: string;
  icon?: string;
  route?: string;
  items?: Q4NavItem[];
}

export interface CampaignAssignment {
  id: number;
  product: string; // cs | arrivals | kiosk | menuboard
  productLabel: string;
  terminal: string;
  slot: string;
}

export interface WizardProduct {
  id: string;
  label: string;
  icon: string;
  slots: string[];
}

export interface WizardTerminal {
  id: string;
  label: string;
  product: string;
}

export interface ReadinessRow {
  id: number;
  terminal: string;
  product: string;
  assigned: boolean;
  loaded: boolean;
  lastActivity: string;
}

export interface HintAssignment {
  id: number;
  product: string;
  productLabel: string;
  terminal: string;
  mode: string;
}

export interface Q4Element {
  id: number;
  name: string;
  type: 'image' | 'text';
  color: string;
  tags?: string[];
  selected?: boolean;
}

export interface Q4Page {
  id: string;
  name: string;
  custom: boolean;
  condition?: string;
  elements: Q4Element[];
}

export interface Q4Control {
  id: number;
  name: string;
  source: string;
  preview: string;
}

export interface Q4ColorPattern {
  id: number;
  name: string;
  preset: boolean;
  colors: string[];
}

export interface Q4AnalyticsEvent {
  id: number;
  time: string;
  action: string;
  detail: string;
}

export interface Q4Campaign {
  id: number;
  name: string;
  from: string;
  to: string;
  timeFrom: string;
  timeTo: string;
  resolution: string;
  folder: number | null;
}

export interface Q4CampaignMedia {
  id: number;
  name: string;
  type: 'image' | 'video';
  size: string;
  resolution: string;
  durationMin: number;
  durationSec: number;
  color: string;
}

export interface Q4GalleryFile {
  id: number;
  name: string;
  size: string;
  date: string;
  color: string;
}
