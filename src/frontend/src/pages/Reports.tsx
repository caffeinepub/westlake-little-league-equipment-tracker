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
import { Download, Search } from "lucide-react";
import { useState } from "react";
import { EquipmentCondition } from "../backend";
import {
  useActiveIssuances,
  useEquipmentItems,
  useIssuanceHistory,
  useIssuancesByRecipient,
} from "../hooks/useQueries";
import {
  CONDITION_LABELS,
  RECIPIENT_TYPE_LABELS,
  formatDate,
} from "../utils/helpers";
import { exportToPdf } from "../utils/pdfExport";

export default function Reports() {
  const { data: equipment = [] } = useEquipmentItems();
  const { data: activeIssuances = [], isLoading: loadingActive } =
    useActiveIssuances();
  const [recipientSearch, setRecipientSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const { data: recipientIssuances = [], isLoading: loadingRecipient } =
    useIssuancesByRecipient(searchQuery);
  const { data: itemHistory = [], isLoading: loadingHistory } =
    useIssuanceHistory(selectedItemId ? BigInt(selectedItemId) : null);

  function getItemName(id: bigint) {
    return equipment.find((e) => e.id === id)?.name ?? `Item #${id}`;
  }

  function conditionStyle(cond?: EquipmentCondition) {
    if (!cond) return {};
    const map = {
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
    return map[cond];
  }

  function handleExportIssuedPdf() {
    const columns = [
      "Item",
      "Recipient",
      "Type",
      "Phone",
      "Email",
      "Qty",
      "Issue Date",
      "Notes",
    ];
    const rows = activeIssuances.map((iss) => [
      getItemName(iss.equipmentItemId),
      iss.recipientName,
      RECIPIENT_TYPE_LABELS[iss.recipientType],
      iss.recipientPhone,
      iss.recipientEmail,
      iss.quantityIssued.toString(),
      formatDate(iss.issueDate),
      iss.notes || "",
    ]);
    exportToPdf(
      "Westlake Little League - Currently Issued Equipment",
      columns,
      rows,
      "report-issued.pdf",
    );
  }

  function handleExportRecipientPdf() {
    const columns = [
      "Item",
      "Recipient",
      "Status",
      "Qty",
      "Issue Date",
      "Return Date",
      "Return Condition",
    ];
    const rows = recipientIssuances.map((iss) => [
      getItemName(iss.equipmentItemId),
      iss.recipientName,
      iss.isReturned ? "Returned" : "Issued",
      iss.quantityIssued.toString(),
      formatDate(iss.issueDate),
      iss.returnDate ? formatDate(iss.returnDate) : "",
      iss.returnCondition ? CONDITION_LABELS[iss.returnCondition] : "",
    ]);
    exportToPdf(
      `Westlake Little League - Recipient Report: ${searchQuery}`,
      columns,
      rows,
      "report-recipient.pdf",
    );
  }

  function handleExportHistoryPdf() {
    const itemName =
      equipment.find((e) => e.id.toString() === selectedItemId)?.name ??
      selectedItemId;
    const columns = [
      "Recipient",
      "Type",
      "Status",
      "Qty",
      "Issue Date",
      "Return Date",
      "Return Condition",
    ];
    const rows = itemHistory.map((iss) => [
      iss.recipientName,
      RECIPIENT_TYPE_LABELS[iss.recipientType],
      iss.isReturned ? "Returned" : "Active",
      iss.quantityIssued.toString(),
      formatDate(iss.issueDate),
      iss.returnDate ? formatDate(iss.returnDate) : "",
      iss.returnCondition ? CONDITION_LABELS[iss.returnCondition] : "",
    ]);
    exportToPdf(
      `Westlake Little League - Item History: ${itemName}`,
      columns,
      rows,
      "report-item-history.pdf",
    );
  }

  return (
    <div data-ocid="reports.page" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "oklch(0.16 0.012 255)" }}
          >
            Reports
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            Equipment tracking reports and history
          </p>
        </div>
      </div>

      {/* Section 1: Currently Issued */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">
                Currently Issued Equipment
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeIssuances.length} item(s) currently checked out
              </p>
            </div>
            <Button
              data-ocid="reports.issued.export_button"
              variant="outline"
              size="sm"
              onClick={handleExportIssuedPdf}
            >
              <Download size={14} className="mr-1.5" /> Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ background: "oklch(0.965 0.006 250)" }}>
                  <TableHead className="text-xs pl-4">Item</TableHead>
                  <TableHead className="text-xs">Recipient</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs text-center">Qty</TableHead>
                  <TableHead className="text-xs">Issue Date</TableHead>
                  <TableHead className="text-xs pr-4">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingActive ? (
                  <>
                    {["sk1", "sk2", "sk3"].map((k) => (
                      <TableRow key={k}>
                        <TableCell colSpan={8}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : activeIssuances.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="reports.active.empty_state"
                    >
                      No equipment currently issued
                    </TableCell>
                  </TableRow>
                ) : (
                  activeIssuances.map((iss, idx) => (
                    <TableRow
                      key={iss.id.toString()}
                      data-ocid={`reports.active.item.${idx + 1}`}
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
                      <TableCell className="text-sm">
                        {iss.recipientPhone}
                      </TableCell>
                      <TableCell className="text-sm">
                        {iss.recipientEmail}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">
                        {iss.quantityIssued.toString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(iss.issueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground pr-4 max-w-[120px] truncate">
                        {iss.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Search by Recipient */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">
                Search by Recipient
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Find all issuances (active and returned) for a specific person
                or team
              </p>
            </div>
            {searchQuery && recipientIssuances.length > 0 && (
              <Button
                data-ocid="reports.recipient.export_button"
                variant="outline"
                size="sm"
                onClick={handleExportRecipientPdf}
              >
                <Download size={14} className="mr-1.5" /> Export PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              data-ocid="reports.recipient_search.search_input"
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              placeholder="Enter team or coach name..."
              className="flex-1 sm:max-w-sm"
              onKeyDown={(e) =>
                e.key === "Enter" && setSearchQuery(recipientSearch)
              }
            />
            <Button
              data-ocid="reports.recipient_search.button"
              onClick={() => setSearchQuery(recipientSearch)}
              style={{ background: "oklch(0.35 0.07 242)", border: "none" }}
              className="text-white"
            >
              <Search size={14} className="mr-1.5" /> Search
            </Button>
          </div>

          {searchQuery && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ background: "oklch(0.965 0.006 250)" }}>
                    <TableHead className="text-xs pl-4">Item</TableHead>
                    <TableHead className="text-xs">Recipient</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Issue Date</TableHead>
                    <TableHead className="text-xs">Return Date</TableHead>
                    <TableHead className="text-xs pr-4">
                      Return Condition
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRecipient ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center"
                        data-ocid="reports.recipient.loading_state"
                      >
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : recipientIssuances.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground"
                        data-ocid="reports.recipient.empty_state"
                      >
                        No issuances found for "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipientIssuances.map((iss, idx) => (
                      <TableRow
                        key={iss.id.toString()}
                        data-ocid={`reports.recipient.item.${idx + 1}`}
                      >
                        <TableCell className="pl-4 font-medium text-sm">
                          {getItemName(iss.equipmentItemId)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {iss.recipientName}
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={
                              iss.isReturned
                                ? {
                                    background: "oklch(0.92 0.06 145)",
                                    color: "oklch(0.35 0.14 145)",
                                  }
                                : {
                                    background: "oklch(0.92 0.04 242)",
                                    color: "oklch(0.32 0.07 242)",
                                  }
                            }
                          >
                            {iss.isReturned ? "Returned" : "Issued"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {iss.quantityIssued.toString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(iss.issueDate)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {iss.returnDate ? formatDate(iss.returnDate) : "—"}
                        </TableCell>
                        <TableCell className="pr-4">
                          {iss.returnCondition ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={conditionStyle(iss.returnCondition)}
                            >
                              {CONDITION_LABELS[iss.returnCondition]}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Item History */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">
                Item Issuance History
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full issuance history for a specific equipment item
              </p>
            </div>
            {selectedItemId && itemHistory.length > 0 && (
              <Button
                data-ocid="reports.history.export_button"
                variant="outline"
                size="sm"
                onClick={handleExportHistoryPdf}
              >
                <Download size={14} className="mr-1.5" /> Export PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-sm">
            <Label className="text-xs">Select Equipment Item</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger
                data-ocid="reports.item_history.select"
                className="mt-1"
              >
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((item) => (
                  <SelectItem
                    key={item.id.toString()}
                    value={item.id.toString()}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedItemId && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ background: "oklch(0.965 0.006 250)" }}>
                    <TableHead className="text-xs pl-4">Recipient</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Issue Date</TableHead>
                    <TableHead className="text-xs">Return Date</TableHead>
                    <TableHead className="text-xs pr-4">
                      Return Condition
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingHistory ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        data-ocid="reports.history.loading_state"
                      >
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : itemHistory.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground"
                        data-ocid="reports.history.empty_state"
                      >
                        No issuance history for this item
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemHistory.map((iss, idx) => (
                      <TableRow
                        key={iss.id.toString()}
                        data-ocid={`reports.history.item.${idx + 1}`}
                      >
                        <TableCell className="pl-4 font-medium text-sm">
                          {iss.recipientName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {RECIPIENT_TYPE_LABELS[iss.recipientType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={
                              iss.isReturned
                                ? {
                                    background: "oklch(0.92 0.06 145)",
                                    color: "oklch(0.35 0.14 145)",
                                  }
                                : {
                                    background: "oklch(0.92 0.04 242)",
                                    color: "oklch(0.32 0.07 242)",
                                  }
                            }
                          >
                            {iss.isReturned ? "Returned" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {iss.quantityIssued.toString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(iss.issueDate)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {iss.returnDate ? formatDate(iss.returnDate) : "—"}
                        </TableCell>
                        <TableCell className="pr-4">
                          {iss.returnCondition ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={conditionStyle(iss.returnCondition)}
                            >
                              {CONDITION_LABELS[iss.returnCondition]}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
