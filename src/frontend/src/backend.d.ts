import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EquipmentItem {
    id: bigint;
    availableQuantity: bigint;
    name: string;
    sport: Sport;
    notes: string;
    category: EquipmentCategory;
    totalQuantity: bigint;
    condition: EquipmentCondition;
}
export interface Issuance {
    id: bigint;
    issueDate: bigint;
    quantityIssued: bigint;
    recipientPhone: string;
    isReturned: boolean;
    returnCondition?: EquipmentCondition;
    notes: string;
    equipmentItemId: bigint;
    recipientName: string;
    recipientType: RecipientType;
    returnDate?: bigint;
    recipientEmail: string;
}
export enum EquipmentCategory {
    bat = "bat",
    tee = "tee",
    helmet = "helmet",
    chestPlate = "chestPlate",
    baseball = "baseball",
    catchersHelmet = "catchersHelmet",
    other = "other",
    shinGuards = "shinGuards",
    softball = "softball",
    catchersGlove = "catchersGlove",
    glove = "glove",
    equipmentBag = "equipmentBag"
}
export enum EquipmentCondition {
    damaged = "damaged",
    fair = "fair",
    good = "good"
}
export enum RecipientType {
    coach = "coach",
    team = "team"
}
export enum Sport {
    baseball = "baseball",
    softball = "softball"
}
export interface backendInterface {
    addEquipmentItem(item: EquipmentItem): Promise<EquipmentItem>;
    createIssuance(issuance: Issuance): Promise<Issuance>;
    deleteEquipmentItem(id: bigint): Promise<void>;
    getActiveIssuances(): Promise<Array<Issuance>>;
    getAllEquipmentItems(sport: Sport | null): Promise<Array<EquipmentItem>>;
    getEquipmentItem(id: bigint): Promise<EquipmentItem>;
    getIssuanceHistoryForItem(equipmentItemId: bigint): Promise<Array<Issuance>>;
    getIssuancesByRecipient(recipientName: string): Promise<Array<Issuance>>;
    markAsReturned(issuanceId: bigint, returnCondition: EquipmentCondition): Promise<Issuance>;
    updateEquipmentItem(id: bigint, item: EquipmentItem): Promise<EquipmentItem>;
}
