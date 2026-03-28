import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Issuance, RecipientType } from "../backend";
import {
  useActiveIssuances,
  useCreateIssuance,
  useEquipmentItems,
} from "../hooks/useQueries";
import {
  RECIPIENT_TYPE_LABELS,
  SPORT_LABELS,
  formatDate,
  getCategoryLabels,
} from "../utils/helpers";
import { exportToPdf } from "../utils/pdfExport";

export default function IssueEquipment() {
  const { data: equipment = [] } = useEquipmentItems();
  const { data: activeIssuances = [], isLoading } = useActiveIssuances();
  const createMutation = useCreateIssuance();

  const [form, setForm] = useState({
    equipmentItemId: "",
    quantity: "1",
    recipientName: "",
    recipientType: RecipientType.team as RecipientType,
    recipientPhone: "",
    recipientEmail: "",
    issueDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedItem = equipment.find(
    (e) => e.id.toString() === form.equipmentItemId,
  );

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.equipmentItemId) errs.equipmentItemId = "Please select an item";
    if (!form.recipientName.trim())
      errs.recipientName = "Recipient name is required";
    if (!form.recipientPhone.trim()) errs.recipientPhone = "Phone is required";
    if (!form.recipientEmail.trim()) errs.recipientEmail = "Email is required";
    const qty = Number.parseInt(form.quantity);
    if (Number.isNaN(qty) || qty < 1) {
      errs.quantity = "Quantity must be at least 1";
    } else if (selectedItem && qty > Number(selectedItem.availableQuantity)) {
      errs.quantity = `Max available: ${selectedItem.availableQuantity}`;
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const issuance: Issuance = {
      id: 0n,
      equipmentItemId: BigInt(form.equipmentItemId),
      quantityIssued: BigInt(Number.parseInt(form.quantity)),
      recipientName: form.recipientName.trim(),
      recipientType: form.recipientType,
      recipientPhone: form.recipientPhone.trim(),
      recipientEmail: form.recipientEmail.trim(),
      issueDate: BigInt(new Date(form.issueDate).getTime()),
      notes: form.notes,
      isReturned: false,
    };

    try {
      await createMutation.mutateAsync(issuance);
      toast.success("Equipment issued successfully");
      setForm({
        equipmentItemId: "",
        quantity: "1",
        recipientName: "",
        recipientType: RecipientType.team,
        recipientPhone: "",
        recipientEmail: "",
        issueDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
    } catch {
      toast.error("Failed to issue equipment");
    }
  }

  function handleExportPdf() {
    const categoryLabels = getCategoryLabels();
    const columns = [
      "Item Name",
      "Category",
      "Sport",
      "Assigned To",
      "Contact",
      "Issue Date",
    ];
    const rows = activeIssuances.map((iss) => {
      const item = equipment.find((e) => e.id === iss.equipmentItemId);
      return [
        item?.name ?? `Item #${iss.equipmentItemId}`,
        item ? (categoryLabels[item.category] ?? item.category) : "",
        item ? SPORT_LABELS[item.sport] : "",
        iss.recipientName,
        iss.recipientPhone || iss.recipientEmail,
        formatDate(iss.issueDate),
      ];
    });
    exportToPdf(
      "Westlake Little League - Currently Issued Equipment",
      columns,
      rows,
      "issued-equipment.pdf",
    );
  }

  return (
    <div data-ocid="issue.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "oklch(0.16 0.012 255)" }}
          >
            Issue Equipment
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            Assign equipment to a team or coach
          </p>
        </div>
        <Button
          data-ocid="issue.export_button"
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
        >
          <Download size={14} className="mr-1.5" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Form */}
        <Card className="xl:col-span-2 shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Issue Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs">Equipment Item *</Label>
                <Select
                  value={form.equipmentItemId}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      equipmentItemId: v,
                      quantity: "1",
                    }))
                  }
                >
                  <SelectTrigger
                    data-ocid="issue.equipment.select"
                    className="mt-1"
                  >
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment
                      .filter((e) => Number(e.availableQuantity) > 0)
                      .map((item) => (
                        <SelectItem
                          key={item.id.toString()}
                          value={item.id.toString()}
                        >
                          {item.name} —{" "}
                          {getCategoryLabels()[item.category] ?? item.category}{" "}
                          (Avail: {item.availableQuantity.toString()})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.equipmentItemId && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="issue.equipment.error_state"
                  >
                    {errors.equipmentItemId}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Quantity *</Label>
                <Input
                  data-ocid="issue.quantity.input"
                  type="number"
                  min="1"
                  max={
                    selectedItem
                      ? Number(selectedItem.availableQuantity)
                      : undefined
                  }
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  className="mt-1"
                />
                {errors.quantity && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="issue.quantity.error_state"
                  >
                    {errors.quantity}
                  </p>
                )}
                {selectedItem && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {selectedItem.availableQuantity.toString()}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Recipient Name *</Label>
                  <Input
                    data-ocid="issue.recipient_name.input"
                    value={form.recipientName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, recipientName: e.target.value }))
                    }
                    placeholder="Team or Coach name"
                    className="mt-1"
                  />
                  {errors.recipientName && (
                    <p
                      className="text-xs text-destructive mt-1"
                      data-ocid="issue.recipient_name.error_state"
                    >
                      {errors.recipientName}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Recipient Type *</Label>
                  <Select
                    value={form.recipientType}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        recipientType: v as RecipientType,
                      }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="issue.recipient_type.select"
                      className="mt-1"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RecipientType.team}>Team</SelectItem>
                      <SelectItem value={RecipientType.coach}>Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Phone *</Label>
                <Input
                  data-ocid="issue.phone.input"
                  type="tel"
                  value={form.recipientPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, recipientPhone: e.target.value }))
                  }
                  placeholder="555-000-0000"
                  className="mt-1"
                />
                {errors.recipientPhone && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.recipientPhone}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Email *</Label>
                <Input
                  data-ocid="issue.email.input"
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, recipientEmail: e.target.value }))
                  }
                  placeholder="contact@team.org"
                  className="mt-1"
                />
                {errors.recipientEmail && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.recipientEmail}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Issue Date *</Label>
                <Input
                  data-ocid="issue.date.input"
                  type="date"
                  value={form.issueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, issueDate: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea
                  data-ocid="issue.notes.textarea"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 resize-none"
                  placeholder="Optional notes..."
                />
              </div>

              <Button
                data-ocid="issue.submit_button"
                type="submit"
                disabled={createMutation.isPending}
                className="w-full text-white"
                style={{ background: "oklch(0.35 0.07 242)", border: "none" }}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />{" "}
                    Issuing...
                  </>
                ) : (
                  <>
                    <Send size={14} className="mr-1.5" /> Issue Equipment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active issuances */}
        <Card className="xl:col-span-3 shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Active Issuances ({activeIssuances.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ background: "oklch(0.965 0.006 250)" }}>
                    <TableHead className="text-xs pl-4">Item</TableHead>
                    <TableHead className="text-xs">Recipient</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs pr-4">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      {["sk1", "sk2", "sk3"].map((k) => (
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
                        </TableRow>
                      ))}
                    </>
                  ) : activeIssuances.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="issue.active.empty_state"
                      >
                        No active issuances
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeIssuances.map((iss, idx) => (
                      <TableRow
                        key={iss.id.toString()}
                        data-ocid={`issue.active.item.${idx + 1}`}
                      >
                        <TableCell className="pl-4 text-sm font-medium">
                          {equipment.find((e) => e.id === iss.equipmentItemId)
                            ?.name ?? `Item #${iss.equipmentItemId}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {iss.recipientName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {RECIPIENT_TYPE_LABELS[iss.recipientType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {iss.quantityIssued.toString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground pr-4">
                          {formatDate(iss.issueDate)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
