import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  EquipmentCategory,
  EquipmentCondition,
  type EquipmentItem,
  Sport,
} from "../backend";
import {
  useAddEquipmentItem,
  useDeleteEquipmentItem,
  useEquipmentItems,
  useUpdateEquipmentItem,
} from "../hooks/useQueries";
import {
  CONDITION_LABELS,
  SPORT_LABELS,
  getCategoryLabels,
  getVisibleCategoryKeys,
} from "../utils/helpers";
import { exportToPdf } from "../utils/pdfExport";

type SportFilter = "all" | Sport;

const EMPTY_FORM = {
  name: "",
  category: EquipmentCategory.helmet as EquipmentCategory,
  sport: Sport.baseball as Sport,
  condition: EquipmentCondition.good as EquipmentCondition,
  totalQuantity: "1",
  notes: "",
};

export default function Inventory() {
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EquipmentItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: items = [], isLoading } = useEquipmentItems(
    sportFilter === "all" ? null : sportFilter,
  );
  const addMutation = useAddEquipmentItem();
  const updateMutation = useUpdateEquipmentItem();
  const deleteMutation = useDeleteEquipmentItem();

  const filtered = items.filter((item) => {
    const matchSport = sportFilter === "all" || item.sport === sportFilter;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchSport && matchSearch;
  });

  function openAdd() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEdit(item: EquipmentItem) {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      sport: item.sport,
      condition: item.condition,
      totalQuantity: item.totalQuantity.toString(),
      notes: item.notes,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const qty = Number.parseInt(form.totalQuantity);
    if (Number.isNaN(qty) || qty < 1) {
      toast.error("Total quantity must be at least 1");
      return;
    }
    const payload: EquipmentItem = {
      id: editItem ? editItem.id : 0n,
      name: form.name.trim(),
      category: form.category,
      sport: form.sport,
      condition: form.condition,
      totalQuantity: BigInt(qty),
      availableQuantity: editItem ? editItem.availableQuantity : BigInt(qty),
      notes: form.notes,
    };
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, item: payload });
        toast.success("Equipment updated");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Equipment added");
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save equipment");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Equipment deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete equipment");
    }
  }

  function handleExportPdf() {
    const categoryLabels = getCategoryLabels();
    const columns = [
      "Name",
      "Category",
      "Sport",
      "Condition",
      "Available",
      "Total",
      "Notes",
    ];
    const rows = filtered.map((item) => [
      item.name,
      categoryLabels[item.category] ?? item.category,
      SPORT_LABELS[item.sport],
      CONDITION_LABELS[item.condition],
      item.availableQuantity.toString(),
      item.totalQuantity.toString(),
      item.notes || "",
    ]);
    exportToPdf(
      "Westlake Little League - Inventory",
      columns,
      rows,
      "inventory.pdf",
    );
  }

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <div data-ocid="inventory.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "oklch(0.16 0.012 255)" }}
          >
            Equipment Inventory
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {filtered.length} items total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="inventory.export_button"
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
          >
            <Download size={14} className="mr-1.5" /> Export PDF
          </Button>
          <Button
            data-ocid="inventory.add_button"
            onClick={openAdd}
            className="text-white"
            style={{ background: "oklch(0.55 0.17 25)", border: "none" }}
          >
            <Plus size={16} className="mr-1" /> Add Equipment
          </Button>
        </div>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs
              value={sportFilter}
              onValueChange={(v) => setSportFilter(v as SportFilter)}
            >
              <TabsList className="h-8">
                <TabsTrigger
                  value="all"
                  data-ocid="inventory.all.tab"
                  className="text-xs h-7"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value={Sport.baseball}
                  data-ocid="inventory.baseball.tab"
                  className="text-xs h-7"
                >
                  Baseball
                </TabsTrigger>
                <TabsTrigger
                  value={Sport.softball}
                  data-ocid="inventory.softball.tab"
                  className="text-xs h-7"
                >
                  Softball
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              data-ocid="inventory.search_input"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ background: "oklch(0.965 0.006 250)" }}>
                  <TableHead className="text-xs pl-4">Name</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Sport</TableHead>
                  <TableHead className="text-xs">Condition</TableHead>
                  <TableHead className="text-xs text-center">
                    Available
                  </TableHead>
                  <TableHead className="text-xs text-center">Total</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                  <TableHead className="text-xs text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
                      <TableRow key={k}>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-muted-foreground"
                      data-ocid="inventory.empty_state"
                    >
                      No equipment found. Add some to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item, idx) => (
                    <TableRow
                      key={item.id.toString()}
                      data-ocid={`inventory.item.${idx + 1}`}
                    >
                      <TableCell className="pl-4 font-medium text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getCategoryLabels()[item.category] ?? item.category}
                      </TableCell>
                      <TableCell className="text-sm">
                        {SPORT_LABELS[item.sport]}
                      </TableCell>
                      <TableCell>
                        <ConditionBadge condition={item.condition} />
                      </TableCell>
                      <TableCell
                        className="text-center font-semibold text-sm"
                        style={{ color: "oklch(0.52 0.16 145)" }}
                      >
                        {item.availableQuantity.toString()}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {item.totalQuantity.toString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {item.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            data-ocid={`inventory.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            data-ocid={`inventory.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="inventory.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Equipment" : "Add Equipment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="eq-name" className="text-xs">
                Name *
              </Label>
              <Input
                id="eq-name"
                data-ocid="inventory.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Batting Helmets"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, category: v as EquipmentCategory }))
                  }
                >
                  <SelectTrigger
                    data-ocid="inventory.category.select"
                    className="mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(getCategoryLabels())
                      .filter(([k]) => getVisibleCategoryKeys().includes(k))
                      .map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Sport *</Label>
                <Select
                  value={form.sport}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, sport: v as Sport }))
                  }
                >
                  <SelectTrigger
                    data-ocid="inventory.sport.select"
                    className="mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Sport.baseball}>Baseball</SelectItem>
                    <SelectItem value={Sport.softball}>Softball</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Condition *</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      condition: v as EquipmentCondition,
                    }))
                  }
                >
                  <SelectTrigger
                    data-ocid="inventory.condition.select"
                    className="mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EquipmentCondition.good}>
                      Good
                    </SelectItem>
                    <SelectItem value={EquipmentCondition.fair}>
                      Fair
                    </SelectItem>
                    <SelectItem value={EquipmentCondition.damaged}>
                      Damaged
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eq-qty" className="text-xs">
                  Total Quantity *
                </Label>
                <Input
                  id="eq-qty"
                  data-ocid="inventory.quantity.input"
                  type="number"
                  min="1"
                  value={form.totalQuantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, totalQuantity: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="eq-notes" className="text-xs">
                Notes
              </Label>
              <Textarea
                id="eq-notes"
                data-ocid="inventory.notes.textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
                className="mt-1 resize-none"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="inventory.cancel_button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="inventory.save_button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="text-white"
              style={{ background: "oklch(0.35 0.07 242)", border: "none" }}
            >
              {isSaving && <Loader2 size={14} className="mr-1 animate-spin" />}
              {editItem ? "Update" : "Add Equipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <DialogContent
          data-ocid="inventory.delete.dialog"
          className="sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this equipment item? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              data-ocid="inventory.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="inventory.delete.confirm_button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              {deleteMutation.isPending && (
                <Loader2 size={14} className="mr-1 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConditionBadge({ condition }: { condition: EquipmentCondition }) {
  const styles = {
    [EquipmentCondition.good]: {
      background: "oklch(0.92 0.06 145)",
      color: "oklch(0.35 0.14 145)",
    },
    [EquipmentCondition.fair]: {
      background: "oklch(0.94 0.08 80)",
      color: "oklch(0.5 0.14 80)",
    },
    [EquipmentCondition.damaged]: {
      background: "oklch(0.94 0.05 25)",
      color: "oklch(0.5 0.15 25)",
    },
  };
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={styles[condition]}
    >
      {CONDITION_LABELS[condition]}
    </span>
  );
}
