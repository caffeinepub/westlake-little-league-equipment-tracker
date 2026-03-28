import {
  EquipmentCategory,
  EquipmentCondition,
  type EquipmentItem,
  type Issuance,
  RecipientType,
  Sport,
} from "../backend";

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  [EquipmentCategory.helmet]: "Helmet",
  [EquipmentCategory.catchersHelmet]: "Catcher's Helmet",
  [EquipmentCategory.catchersGlove]: "Catcher's Glove",
  [EquipmentCategory.shinGuards]: "Shin Guards",
  [EquipmentCategory.chestPlate]: "Chest Plate",
  [EquipmentCategory.bat]: "Bat",
  [EquipmentCategory.baseball]: "Baseball",
  [EquipmentCategory.softball]: "Softball",
  [EquipmentCategory.glove]: "Glove",
  [EquipmentCategory.equipmentBag]: "Equipment Bag",
  [EquipmentCategory.tee]: "Tee",
  [EquipmentCategory.other]: "Other",
};

export const CONDITION_LABELS: Record<EquipmentCondition, string> = {
  [EquipmentCondition.good]: "Good",
  [EquipmentCondition.fair]: "Fair",
  [EquipmentCondition.damaged]: "Damaged",
};

export const SPORT_LABELS: Record<Sport, string> = {
  [Sport.baseball]: "Baseball",
  [Sport.softball]: "Softball",
};

export const RECIPIENT_TYPE_LABELS: Record<RecipientType, string> = {
  [RecipientType.team]: "Team",
  [RecipientType.coach]: "Coach",
};

export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function todayTimestamp(): bigint {
  return BigInt(Date.now());
}

interface CategorySettings {
  labels: Record<string, string>;
  hidden: string[];
  custom: { key: string; label: string }[];
}

function loadCategorySettings(): CategorySettings {
  try {
    const raw = localStorage.getItem("wll_category_settings");
    if (!raw) return { labels: {}, hidden: [], custom: [] };
    return JSON.parse(raw) as CategorySettings;
  } catch {
    return { labels: {}, hidden: [], custom: [] };
  }
}

export function saveCategorySettings(settings: CategorySettings): void {
  localStorage.setItem("wll_category_settings", JSON.stringify(settings));
}

export function getCategorySettings(): CategorySettings {
  return loadCategorySettings();
}

export function getCategoryLabels(): Record<string, string> {
  const settings = loadCategorySettings();
  const base: Record<string, string> = { ...CATEGORY_LABELS };
  for (const [k, v] of Object.entries(settings.labels || {})) {
    base[k] = v;
  }
  for (const c of settings.custom || []) {
    base[c.key] = c.label;
  }
  return base;
}

export function getVisibleCategoryKeys(): string[] {
  const settings = loadCategorySettings();
  const hidden: string[] = settings.hidden || [];
  const allKeys = [
    ...Object.keys(CATEGORY_LABELS),
    ...(settings.custom || []).map(
      (c: { key: string; label: string }) => c.key,
    ),
  ];
  return allKeys.filter((k) => !hidden.includes(k));
}

export const SEED_EQUIPMENT: EquipmentItem[] = [
  {
    id: 1n,
    name: "Batting Helmets",
    sport: Sport.baseball,
    category: EquipmentCategory.helmet,
    condition: EquipmentCondition.good,
    totalQuantity: 12n,
    availableQuantity: 8n,
    notes: "Mixed sizes, all with face guards",
  },
  {
    id: 2n,
    name: 'Aluminum Bats 30"',
    sport: Sport.baseball,
    category: EquipmentCategory.bat,
    condition: EquipmentCondition.good,
    totalQuantity: 8n,
    availableQuantity: 6n,
    notes: "Youth 30 inch, 20 oz",
  },
  {
    id: 3n,
    name: "Catcher's Gear Set",
    sport: Sport.baseball,
    category: EquipmentCategory.chestPlate,
    condition: EquipmentCondition.fair,
    totalQuantity: 4n,
    availableQuantity: 2n,
    notes: "Full set including helmet, chest, shins",
  },
  {
    id: 4n,
    name: "Softball Helmets",
    sport: Sport.softball,
    category: EquipmentCategory.helmet,
    condition: EquipmentCondition.good,
    totalQuantity: 10n,
    availableQuantity: 10n,
    notes: "Pink accents, girls league",
  },
  {
    id: 5n,
    name: 'Fastpitch Bats 28"',
    sport: Sport.softball,
    category: EquipmentCategory.bat,
    condition: EquipmentCondition.good,
    totalQuantity: 6n,
    availableQuantity: 4n,
    notes: "Composite, 28 inch",
  },
  {
    id: 6n,
    name: "Baseball Gloves",
    sport: Sport.baseball,
    category: EquipmentCategory.glove,
    condition: EquipmentCondition.good,
    totalQuantity: 15n,
    availableQuantity: 12n,
    notes: "Youth sizes 9-11 inch",
  },
  {
    id: 7n,
    name: "Equipment Bags",
    sport: Sport.baseball,
    category: EquipmentCategory.equipmentBag,
    condition: EquipmentCondition.good,
    totalQuantity: 6n,
    availableQuantity: 4n,
    notes: "Team duffle bags with team logo",
  },
  {
    id: 8n,
    name: "Batting Tees",
    sport: Sport.softball,
    category: EquipmentCategory.tee,
    condition: EquipmentCondition.damaged,
    totalQuantity: 4n,
    availableQuantity: 2n,
    notes: "2 need rubber top replacement",
  },
];

export const SEED_ISSUANCES: Issuance[] = [
  {
    id: 1n,
    equipmentItemId: 1n,
    recipientName: "Team Blue Jays",
    recipientType: RecipientType.team,
    recipientPhone: "555-100-1001",
    recipientEmail: "bluejays@westlakell.org",
    quantityIssued: 4n,
    issueDate: BigInt(Date.now() - 7 * 86400000),
    isReturned: false,
    notes: "Season start issue",
    returnDate: undefined,
    returnCondition: undefined,
  },
  {
    id: 2n,
    equipmentItemId: 2n,
    recipientName: "Coach Mike Torres",
    recipientType: RecipientType.coach,
    recipientPhone: "555-200-2002",
    recipientEmail: "mtorres@westlakell.org",
    quantityIssued: 2n,
    issueDate: BigInt(Date.now() - 5 * 86400000),
    isReturned: false,
    notes: "Practice bats",
    returnDate: undefined,
    returnCondition: undefined,
  },
  {
    id: 3n,
    equipmentItemId: 5n,
    recipientName: "Team Cardinals",
    recipientType: RecipientType.team,
    recipientPhone: "555-300-3003",
    recipientEmail: "cardinals@westlakell.org",
    quantityIssued: 2n,
    issueDate: BigInt(Date.now() - 3 * 86400000),
    isReturned: false,
    notes: "",
    returnDate: undefined,
    returnCondition: undefined,
  },
  {
    id: 4n,
    equipmentItemId: 6n,
    recipientName: "Coach Sarah Kim",
    recipientType: RecipientType.coach,
    recipientPhone: "555-400-4004",
    recipientEmail: "skim@westlakell.org",
    quantityIssued: 3n,
    issueDate: BigInt(Date.now() - 14 * 86400000),
    isReturned: true,
    notes: "Pre-season training",
    returnDate: BigInt(Date.now() - 2 * 86400000),
    returnCondition: EquipmentCondition.good,
  },
];
