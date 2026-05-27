export interface SidebarMenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

export interface SidebarSection {
  title: string;
  icon?: string;
  route?: string;
  items: SidebarMenuItem[];
}

export interface CustomerScreenDisplay {
  id: number;
  name: string;
  description: string;
  resolution: string;
  orientation: 'landscape' | 'portrait';
  status: 'active' | 'inactive';
  theme: string;
  terminal: string;
}

export interface ScreenTheme {
  id: number;
  name: string;
  type: 'customer-screen' | 'arrivals';
  previewUrl?: string;
  isDefault: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface ScreenControl {
  id: number;
  name: string;
  type: string;
  description: string;
}

export interface ArrivalTerminal {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline';
  ip: string;
  lastSync: string;
}

/* ── Arrivals Theme Editor ── */

export interface ArrivalsThemeListItem {
  id: number;
  name: string;
  itemType: 'folder' | 'theme';
  resolution?: string;
  createdBy?: string;
}

export type ArrivalsElementType =
  | 'text'
  | 'image'
  | 'order-number'
  | 'table-number'
  | 'order-status'
  | 'cooking-start-time'
  | 'cooking-end-time'
  | 'system-cooking-time'
  | 'cooking-wait-time'
  | 'expired-wait-flag'
  | 'client-name'
  | 'client-phone'
  | 'courier-name'
  | 'expected-delivery-time'
  | 'expected-delivery-duration'
  | 'dispatch-time'
  | 'travel-time'
  | 'delivery-time'
  | 'delivery-status'
  | 'client-comment'
  | 'client-delivery-time'
  | 'cancel-reason'
  | 'cancel-comment'
  | 'cancel-time'
  | 'external-data'
  | 'order-items'
  | 'order-items-zones'
  | 'order-items-progress'
  | 'order-items-checklist'
  | 'order-items-cards'
  | 'area'
  | 'price'
  | 'counter';

export interface ArrivalsThemeElement {
  id: string;
  type: ArrivalsElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  // Text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  // Counter (REST data source)
  dataSourceUrl?: string;
  httpMethod?: string;
  headers?: string;
  timeout?: number;
  authType?: string;
  pollInterval?: number;
  // Image
  imageUrl?: string;
  // Price (product binding)
  productId?: string;
  productName?: string;
  sizeId?: string | null;
  sizeName?: string;
  modifierId?: string;
  modifierName?: string;
  bindingType?: 'product' | 'size' | 'modifier';
  showCurrency?: boolean;
  currencySymbol?: string;
  currencyPosition?: 'after' | 'before';
  previewPrice?: number;
  // Counter (Количество блюд в заказе)
  counterStatuses?: string[];
  counterDisplayMode?: 'text' | 'fraction' | 'circle';
  counterCircleColor?: string;
  counterCircleTrackColor?: string;
  counterCircleSize?: number;
  counterShowPercent?: boolean;
  // Order items (Состав заказа)
  orderDynamicHeight?: boolean;
  orderDisplayMode?: 'ready-only' | 'all';
  orderTriggerStatus?: string;
  orderHideOnComplete?: boolean;
  orderHidePendingStatusText?: boolean;
  orderHideDeliveredItems?: boolean;
  orderGroupReadyFirst?: boolean;
  orderShowName?: boolean;
  orderShowQty?: boolean;
  orderShowStatus?: boolean;
  orderNameColWidth?: number;
  orderQtyColWidth?: number;
  orderStatusColWidth?: number;
  orderShowHeader?: boolean;
  orderHeaderBg?: string;
  orderHeaderHeight?: number;
  orderShowNameLabel?: boolean;
  orderShowQtyLabel?: boolean;
  orderShowStatusLabel?: boolean;
  orderNameLabel?: string;
  orderQtyLabel?: string;
  orderStatusLabel?: string;
  orderRowHeight?: number;
  orderReadyColor?: string;
  orderNotReadyColor?: string;
  orderHeaderFontSize?: number;
  orderHeaderFontFamily?: string;
  orderHeaderFontColor?: string;
  orderNameFontSize?: number;
  orderNameFontFamily?: string;
  orderNameFontColor?: string;
  orderQtyFontSize?: number;
  orderQtyFontFamily?: string;
  orderQtyFontColor?: string;
  orderStatusFontSize?: number;
  orderStatusFontFamily?: string;
  orderStatusFontColor?: string;
  orderReadyStatusFontColor?: string;
  orderPendingStatusFontColor?: string;
  // B: Two Zones
  zonesReadyBg?: string;
  zonesPendingBg?: string;
  zonesReadyHeaderText?: string;
  zonesPendingHeaderText?: string;
  zonesShowAllReadyMsg?: boolean;
  zonesItemFontSize?: number;
  zonesHeaderFontSize?: number;
  // C: Progress
  progressCircleColor?: string;
  progressTrackColor?: string;
  progressShowPercent?: boolean;
  progressShowCount?: boolean;
  progressCircleSize?: number;
  progressItemFontSize?: number;
  // D: Checklist
  checklistStrikethrough?: boolean;
  checklistShowCounter?: boolean;
  checklistReadyBg?: string;
  checklistDoneText?: string;
  checklistItemFontSize?: number;
  // E: Cards
  cardsPerRow?: number;
  cardsReadyBorderColor?: string;
  cardsReadyBg?: string;
  cardsPendingBg?: string;
  cardsGap?: number;
  cardsItemFontSize?: number;
  // ── Area (область для контролов в теме) ──
  areaMode?: 'list' | 'dynamic';
  areaControlId?: number;
  areaListDirection?: 'top' | 'bottom';
  areaMaxColumns?: number;
  areaStatusType?: 'kitchen' | 'delivery' | 'balancer';
  areaStatuses?: string[];
  areaOrderTypes?: ('ordinary' | 'courier' | 'pickup')[];
  areaOrderSources?: string[];
  areaSortOrder?: 'newest-first' | 'oldest-first';
  areaInterlineSpacing?: number;
  areaBgColor?: string;
}

/* ── Product Catalog (for Price element navigator) ── */

export interface ProductSize {
  id: string;
  name: string;
  price?: number;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  isGroup: boolean;
  hasChildren?: boolean;
  sizes?: ProductSize[];
  // Tree rework
  itemType?: 'dish' | 'goods' | 'modifier' | 'service';
  price?: number;
  children?: ProductCatalogItem[];
}

export interface ArrivalsTheme {
  id: number;
  name: string;
  resolution: string;
  screenMode: string;
  elements: ArrivalsThemeElement[];
}

/* ── Arrivals Order Mock (для эмуляции в теме) ── */

export interface ArrivalsOrderMockItem {
  name: string;
  qty: number;
  status: string;
}

export interface ArrivalsOrderMock {
  id: number;
  orderNumber: string;
  clientName: string;
  tableNumber?: string;
  status: string;
  orderType: 'ordinary' | 'courier' | 'pickup';
  source: string;
  cookingStartTime?: string;
  expectedDeliveryTime?: string;
  items: ArrivalsOrderMockItem[];
  courierName?: string;
  clientPhone?: string;
}

/* ── Arrivals Controls Editor ── */

export type ArrivalsControlStatusType = 'kitchen' | 'delivery' | 'balancer';

export interface ArrivalsControlListItem {
  id: number;
  name: string;
  itemType: 'folder' | 'control';
  resolution?: string;
  createdBy?: string;
}

export interface ArrivalsControl {
  id: number;
  name: string;
  statusType: ArrivalsControlStatusType;
  elements: ArrivalsThemeElement[];
}

/* ── Sounds (Digital Voice) ── */

export interface SoundEventHandler {
  id: number;
  name: string;
  collectionId: number | null;
  voiceType: 'file' | 'generation';
  events: string[];
  fileName?: string;
  // Generation-specific fields
  voiceName?: string;          // 'Ксения' | 'Ирина' | 'Василий'
  phraseText?: string;         // e.g. "Заказ номер {номер} готов"
  generationStatus?: 'pending' | 'generating' | 'done';
  fileSize?: number;            // size in KB
}

export interface SoundCollection {
  id: number;
  name: string;
  expanded?: boolean;
}

export interface SoundTerminalGroup {
  id: number;
  name: string;
  terminalCount: number;
  expanded?: boolean;
  terminals: SoundTerminal[];
}

export interface SoundTerminal {
  id: number;
  name: string;
  lastActivity: string;
  handlerIds: number[];
  audioDevice: string;
}

/* ── Generation Queue ── */

export interface GenerationQueueItem {
  id: number;
  handlerId: number;
  handlerName: string;
  phraseText: string;
  voiceName: string;
  status: 'waiting' | 'generating' | 'done';
  createdAt: number;      // timestamp
  progress?: number;      // 0-100
}

/* ── Sound Catalog ── */

export interface SoundFile {
  id: number;
  name: string;
  duration: string;       // e.g. "0:02"
  createdAt: string;
}

export interface SoundFolder {
  id: number;
  voiceName: string;      // 'Ксения' | 'Ирина' | 'Василий'
  category: 'numbers' | 'phrases';
  label: string;          // display label
  files: SoundFile[];
  totalCount: number;     // for numbers: 10000
  generatedCount: number; // how many generated so far
}
