import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpFromLine,
  CheckCircle2,
  Download,
  Package,
} from "lucide-react";
import { EquipmentCondition } from "../backend";
import { useActiveIssuances, useEquipmentItems } from "../hooks/useQueries";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  SPORT_LABELS,
  formatDateShort,
} from "../utils/helpers";
import { exportToPdf } from "../utils/pdfExport";

export default function Dashboard() {
  const { data: items = [], isLoading: loadingItems } = useEquipmentItems();
  const { data: issuances = [], isLoading: loadingIssuances } =
    useActiveIssuances();

  const totalEquipment = items.reduce((s, i) => s + Number(i.totalQuantity), 0);
  const totalAvailable = items.reduce(
    (s, i) => s + Number(i.availableQuantity),
    0,
  );
  const totalIssued = totalEquipment - totalAvailable;
  const damagedCount = items.filter(
    (i) => i.condition === EquipmentCondition.damaged,
  ).length;

  const kpis = [
    {
      label: "Total Equipment",
      value: totalEquipment,
      icon: Package,
      gradient:
        "linear-gradient(135deg, oklch(0.35 0.07 242) 0%, oklch(0.28 0.065 245) 100%)",
    },
    {
      label: "Available",
      value: totalAvailable,
      icon: CheckCircle2,
      gradient:
        "linear-gradient(135deg, oklch(0.45 0.14 145) 0%, oklch(0.38 0.12 145) 100%)",
    },
    {
      label: "Currently Issued",
      value: totalIssued,
      icon: ArrowUpFromLine,
      gradient:
        "linear-gradient(135deg, oklch(0.50 0.10 200) 0%, oklch(0.42 0.09 200) 100%)",
    },
    {
      label: "Damaged Items",
      value: damagedCount,
      icon: AlertTriangle,
      gradient:
        "linear-gradient(135deg, oklch(0.55 0.17 25) 0%, oklch(0.47 0.15 25) 100%)",
    },
  ];

  function getItemName(id: bigint) {
    return items.find((i) => i.id === id)?.name ?? `Item #${id}`;
  }

  function handleExportPdf() {
    const columns = [
      "Item Name",
      "Category",
      "Sport",
      "Assigned To",
      "Issue Date",
    ];
    const rows = issuances.map((iss) => {
      const item = items.find((i) => i.id === iss.equipmentItemId);
      return [
        getItemName(iss.equipmentItemId),
        item ? CATEGORY_LABELS[item.category] : "",
        item ? SPORT_LABELS[item.sport] : "",
        iss.recipientName,
        formatDateShort(iss.issueDate),
      ];
    });
    exportToPdf(
      "Westlake Little League - Dashboard",
      columns,
      rows,
      "dashboard-summary.pdf",
    );
  }

  const recentActivity = [...issuances]
    .sort((a, b) => Number(b.issueDate) - Number(a.issueDate))
    .slice(0, 5);

  return (
    <div data-ocid="dashboard.page" className="space-y-5">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "oklch(0.16 0.012 255)" }}
          >
            Dashboard Overview
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.53 0.008 255)" }}
          >
            Westlake Little League — Equipment Tracker
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="dashboard.export_button"
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
          >
            <Download size={14} className="mr-1.5" /> Export PDF
          </Button>
          <Link to="/issue">
            <Button
              data-ocid="dashboard.issue_button"
              size="sm"
              className="text-white"
              style={{ background: "oklch(0.55 0.17 25)", border: "none" }}
            >
              + Issue Equipment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              data-ocid={`dashboard.kpi.${i + 1}`}
              className="rounded-lg p-3 sm:p-4 text-white relative overflow-hidden"
              style={{
                background: kpi.gradient,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium opacity-80">{kpi.label}</p>
                  {loadingItems ? (
                    <Skeleton className="h-8 w-16 mt-1 bg-white/20" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {kpi.value}
                    </p>
                  )}
                </div>
                <Icon size={20} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Equipment table */}
        <div className="xl:col-span-2">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Equipment Inventory
              </CardTitle>
              <Link to="/inventory">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: "oklch(0.965 0.006 250)" }}>
                      <TableHead className="text-xs pl-4">Name</TableHead>
                      <TableHead className="text-xs">Sport</TableHead>
                      <TableHead className="text-xs">Condition</TableHead>
                      <TableHead className="text-xs text-right pr-4">
                        Avail / Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingItems ? (
                      <>
                        {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
                          <TableRow key={k}>
                            <TableCell className="pl-4">
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-12 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : (
                      items.slice(0, 8).map((item, idx) => (
                        <TableRow
                          key={item.id.toString()}
                          data-ocid={`dashboard.equipment.item.${idx + 1}`}
                        >
                          <TableCell className="pl-4 font-medium text-sm">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {SPORT_LABELS[item.sport]}
                          </TableCell>
                          <TableCell>
                            <ConditionBadge condition={item.condition} />
                          </TableCell>
                          <TableCell className="text-right pr-4 text-sm">
                            <span
                              style={{
                                color: "oklch(0.52 0.16 145)",
                                fontWeight: 600,
                              }}
                            >
                              {item.availableQuantity.toString()}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              / {item.totalQuantity.toString()}
                            </span>
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

        {/* Recent activity */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Recent Activity
            </CardTitle>
            <Link to="/returns">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loadingIssuances ? (
              <div className="p-4 space-y-3">
                {["sk1", "sk2", "sk3", "sk4"].map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                No activity yet
              </p>
            ) : (
              recentActivity.map((iss, idx) => (
                <div
                  key={iss.id.toString()}
                  data-ocid={`dashboard.activity.item.${idx + 1}`}
                  className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: "oklch(0.92 0.012 250)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{
                      background: iss.isReturned
                        ? "oklch(0.52 0.16 145)"
                        : "oklch(0.35 0.07 242)",
                    }}
                  >
                    {iss.isReturned ? "R" : "I"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {iss.recipientName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getItemName(iss.equipmentItemId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateShort(iss.issueDate)}
                    </p>
                  </div>
                  <Badge
                    className="text-xs shrink-0"
                    style={
                      iss.isReturned
                        ? {
                            background: "oklch(0.92 0.06 145)",
                            color: "oklch(0.35 0.14 145)",
                            border: "none",
                          }
                        : {
                            background: "oklch(0.92 0.04 242)",
                            color: "oklch(0.32 0.07 242)",
                            border: "none",
                          }
                    }
                  >
                    {iss.isReturned ? "Returned" : "Issued"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
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
      style={{ ...styles[condition], border: "none" }}
    >
      {CONDITION_LABELS[condition]}
    </span>
  );
}
