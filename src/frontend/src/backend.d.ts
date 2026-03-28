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
export interface User {
    id: bigint;
    name: string;
    email: string;
    passwordHash: string;
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
export interface UserProfile {
    name: string;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEquipmentItem(item: EquipmentItem): Promise<EquipmentItem>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createIssuance(issuance: Issuance): Promise<Issuance>;
    deleteEquipmentItem(id: bigint): Promise<void>;
    deleteUser(id: bigint): Promise<void>;
    getActiveIssuances(): Promise<Array<Issuance>>;
    getAllEquipmentItems(sport: Sport | null): Promise<Array<EquipmentItem>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEquipmentItem(id: bigint): Promise<EquipmentItem>;
    getIssuanceHistoryForItem(equipmentItemId: bigint): Promise<Array<Issuance>>;
    getIssuancesByRecipient(recipientName: string): Promise<Array<Issuance>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listUsers(): Promise<Array<User>>;
    loginUser(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markAsReturned(issuanceId: bigint, returnCondition: EquipmentCondition): Promise<Issuance>;
    registerUser(name: string, email: string, password: string): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEquipmentItem(id: bigint, item: EquipmentItem): Promise<EquipmentItem>;
}
