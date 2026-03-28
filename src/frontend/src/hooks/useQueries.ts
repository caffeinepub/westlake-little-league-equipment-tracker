import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EquipmentCondition, EquipmentItem, Issuance } from "../backend";
import type { Sport } from "../backend";
import { SEED_EQUIPMENT, SEED_ISSUANCES } from "../utils/helpers";
import { useActor } from "./useActor";

export function useEquipmentItems(sport: Sport | null = null) {
  const { actor, isFetching } = useActor();
  return useQuery<EquipmentItem[]>({
    queryKey: ["equipmentItems", sport],
    queryFn: async () => {
      if (!actor) return SEED_EQUIPMENT;
      const items = await actor.getAllEquipmentItems(sport);
      return items.length > 0 ? items : SEED_EQUIPMENT;
    },
    enabled: !isFetching,
    placeholderData: SEED_EQUIPMENT,
  });
}

export function useActiveIssuances() {
  const { actor, isFetching } = useActor();
  return useQuery<Issuance[]>({
    queryKey: ["activeIssuances"],
    queryFn: async () => {
      if (!actor) return SEED_ISSUANCES.filter((i) => !i.isReturned);
      const items = await actor.getActiveIssuances();
      return items.length > 0
        ? items
        : SEED_ISSUANCES.filter((i) => !i.isReturned);
    },
    enabled: !isFetching,
    placeholderData: SEED_ISSUANCES.filter((i) => !i.isReturned),
  });
}

export function useIssuanceHistory(equipmentItemId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Issuance[]>({
    queryKey: ["issuanceHistory", equipmentItemId?.toString()],
    queryFn: async () => {
      if (!actor || equipmentItemId === null) return [];
      return actor.getIssuanceHistoryForItem(equipmentItemId);
    },
    enabled: !isFetching && equipmentItemId !== null,
  });
}

export function useIssuancesByRecipient(recipientName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Issuance[]>({
    queryKey: ["issuancesByRecipient", recipientName],
    queryFn: async () => {
      if (!actor || !recipientName.trim()) return [];
      return actor.getIssuancesByRecipient(recipientName);
    },
    enabled: !isFetching && recipientName.trim().length > 0,
  });
}

export function useAddEquipmentItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: EquipmentItem) => {
      if (!actor) throw new Error("No actor");
      return actor.addEquipmentItem(item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipmentItems"] }),
  });
}

export function useUpdateEquipmentItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item }: { id: bigint; item: EquipmentItem }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateEquipmentItem(id, item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipmentItems"] }),
  });
}

export function useDeleteEquipmentItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteEquipmentItem(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipmentItems"] }),
  });
}

export function useCreateIssuance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (issuance: Issuance) => {
      if (!actor) throw new Error("No actor");
      return actor.createIssuance(issuance);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeIssuances"] });
      qc.invalidateQueries({ queryKey: ["equipmentItems"] });
    },
  });
}

export function useMarkAsReturned() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      issuanceId,
      returnCondition,
    }: { issuanceId: bigint; returnCondition: EquipmentCondition }) => {
      if (!actor) throw new Error("No actor");
      return actor.markAsReturned(issuanceId, returnCondition);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeIssuances"] });
      qc.invalidateQueries({ queryKey: ["equipmentItems"] });
    },
  });
}
