import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EquipmentCondition, type Issuance } from "../backend";
import {
  useActiveIssuances,
  useEquipmentItems,
  useMarkAsReturned,
} from "../hooks/useQueries";
import { RECIPIENT_TYPE_LABELS, formatDate } from "../utils/helpers";
import { exportToPdf } from "../utils/pdfExport";

export default function Returns() {
  const { data: issuances = [], isLoading } = useActiveIssuances();
  const { data: equipment = [] } = useEquipmentItems();
  const markReturnedMutation = useMarkAsReturned();

  const [returnModal, setReturnModal] = useState<Issuance | null>(null);
  const [returnCondition, setReturnCondition] = useState<EquipmentCondition>(
    EquipmentCondition.good,
  );

  function getItemName(id: bigint) {
    return equipment.find((e) => e.id === id)?.name ?? `Item #${id}`;
  }

  async function handleMarkReturned() {
    if (!returnModal) return;
    try {
      await markReturnedMutation.mutateAsync({
        issuanceId: returnModal.id,
        returnCondition,
      });
      toast.success("Equipment marked as returned");
      setReturnModal(null);
    } catch {
      toast.error("Failed to mark as returned");
    }
  }

  function handleExportPdf() {
    const columns = [
      "Item Name",
      "Recipient",
      "Type",
      "Contact",
      "Qty",
      "Issue Date",
      "Notes",
    ];
    const rows = issuances.map((iss) => [
      getItemName(iss.equipmentItemId),
      iss.recipientName,
      RECIPIENT_TYPE_LABELS[iss.recipientType],
      iss.recipientPhone || iss.recipientEmail,
      iss.quantityIssued.toString(),
      formatDate(iss.issueDate),
      iss.notes || "",
    ]);
    exportToPdf(
      "Westlake Little League - Unreturned Equipment",
      columns,
      rows,
      "returns-report.pdf",
    );
  }

  return (
    <div data-ocid="returns.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "oklch(0.16 0.012 255)" }}
          >
            Equipment Returns
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {issuances.length} item{issuances.length !== 1 ? "s" : ""} currently
            checked out
          </p>
        </div>
        <Button
          data-ocid="returns.export_button"
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
        >
          <Download size={14} className="mr-1.5" /> Export PDF
        </Button>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Unreturned Equipment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ background: "oklch(0.965 0.006 250)" }}>
                  <TableHead className="text-xs pl-4">Item Name</TableHead>
                  <TableHead className="text-xs">Recipient</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Contact</TableHead>
                  <TableHead className="text-xs text-center">Qty</TableHead>
                  <TableHead className="text-xs">Issue Date</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                  <TableHead className="text-xs text-right pr-4">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {["sk1", "sk2", "sk3", "sk4"].map((k) => (
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
                ) : issuances.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10"
                      data-ocid="returns.empty_state"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <RotateCcw
                          size={32}
                          className="text-muted-foreground opacity-40"
                        />
                        <p className="text-muted-foreground">
                          All equipment has been returned!
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  issuances.map((iss, idx) => (
                    <TableRow
                      key={iss.id.toString()}
                      data-ocid={`returns.item.${idx + 1}`}
                    >
                      <TableCell className="pl-4 font-medium text-sm">
                        {getItemName(iss.equipmentItemId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {iss.recipientName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {RECIPIENT_TYPE_LABELS[iss.recipientType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{iss.recipientPhone}</div>
                        <div>{iss.recipientEmail}</div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {iss.quantityIssued.toString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(iss.issueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                        {iss.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          data-ocid={`returns.return_button.${idx + 1}`}
                          size="sm"
                          className="text-white h-7 text-xs"
                          style={{
                            background: "oklch(0.52 0.16 145)",
                            border: "none",
                          }}
                          onClick={() => {
                            setReturnModal(iss);
                            setReturnCondition(EquipmentCondition.good);
                          }}
                        >
                          <RotateCcw size={12} className="mr-1" /> Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Return Modal */}
      <Dialog
        open={returnModal !== null}
        onOpenChange={(o) => !o && setReturnModal(null)}
      >
        <DialogContent data-ocid="returns.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark as Returned</DialogTitle>
          </DialogHeader>
          {returnModal && (
            <div className="space-y-3">
              <div
                className="rounded-md p-3 text-sm space-y-1"
                style={{ background: "oklch(0.965 0.006 250)" }}
              >
                <p>
                  <span className="font-medium">Item:</span>{" "}
                  {getItemName(returnModal.equipmentItemId)}
                </p>
                <p>
                  <span className="font-medium">Recipient:</span>{" "}
                  {returnModal.recipientName}
                </p>
                <p>
                  <span className="font-medium">Qty:</span>{" "}
                  {returnModal.quantityIssued.toString()}
                </p>
                <p>
                  <span className="font-medium">Issued:</span>{" "}
                  {formatDate(returnModal.issueDate)}
                </p>
              </div>
              <div>
                <Label className="text-xs">Return Condition *</Label>
                <Select
                  value={returnCondition}
                  onValueChange={(v) =>
                    setReturnCondition(v as EquipmentCondition)
                  }
                >
                  <SelectTrigger
                    data-ocid="returns.condition.select"
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
            </div>
          )}
          <DialogFooter>
            <Button
              data-ocid="returns.cancel_button"
              variant="outline"
              onClick={() => setReturnModal(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="returns.confirm_button"
              disabled={markReturnedMutation.isPending}
              className="text-white"
              style={{ background: "oklch(0.52 0.16 145)", border: "none" }}
              onClick={handleMarkReturned}
            >
              {markReturnedMutation.isPending && (
                <Loader2 size={14} className="mr-1 animate-spin" />
              )}
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
