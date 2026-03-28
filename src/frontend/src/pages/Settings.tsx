import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CATEGORY_LABELS,
  getCategorySettings,
  saveCategorySettings,
} from "../utils/helpers";

interface CategoryRow {
  key: string;
  label: string;
  isCustom: boolean;
  isHidden: boolean;
  isDirty: boolean;
}

function buildRows(): CategoryRow[] {
  const settings = getCategorySettings();
  const hidden = new Set(settings.hidden || []);
  const renames = settings.labels || {};

  const defaults = Object.entries(CATEGORY_LABELS).map(
    ([key, defaultLabel]) => ({
      key,
      label: renames[key] ?? defaultLabel,
      isCustom: false,
      isHidden: hidden.has(key),
      isDirty: false,
    }),
  );

  const custom = (settings.custom || []).map(
    (c: { key: string; label: string }) => ({
      key: c.key,
      label: c.label,
      isCustom: true,
      isHidden: hidden.has(c.key),
      isDirty: false,
    }),
  );

  return [...defaults, ...custom];
}

export default function Settings() {
  const [rows, setRows] = useState<CategoryRow[]>(buildRows);

  function updateLabel(key: string, label: string) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, label, isDirty: true } : r)),
    );
  }

  function toggleVisibility(key: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.key === key ? { ...r, isHidden: !r.isHidden, isDirty: true } : r,
      ),
    );
  }

  function saveRow(key: string) {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    if (!row.label.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const settings = getCategorySettings();

    // Update renames for default categories
    if (!row.isCustom) {
      const defaultLabel = CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS];
      if (row.label.trim() === defaultLabel) {
        // Remove rename if back to default
        delete settings.labels[key];
      } else {
        settings.labels[key] = row.label.trim();
      }
    } else {
      // Update custom label
      settings.custom = (settings.custom || []).map(
        (c: { key: string; label: string }) =>
          c.key === key ? { ...c, label: row.label.trim() } : c,
      );
    }

    // Update hidden
    const hiddenSet = new Set(settings.hidden || []);
    if (row.isHidden) {
      hiddenSet.add(key);
    } else {
      hiddenSet.delete(key);
    }
    settings.hidden = Array.from(hiddenSet);

    saveCategorySettings(settings);
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, isDirty: false } : r)),
    );
    toast.success("Category saved");
  }

  function removeCustom(key: string) {
    const settings = getCategorySettings();
    settings.custom = (settings.custom || []).filter(
      (c: { key: string; label: string }) => c.key !== key,
    );
    // Also remove from hidden if present
    settings.hidden = (settings.hidden || []).filter((h: string) => h !== key);
    saveCategorySettings(settings);
    setRows((prev) => prev.filter((r) => r.key !== key));
    toast.success("Custom category removed");
  }

  function addCustom() {
    const settings = getCategorySettings();
    const existing = settings.custom || [];
    const nextNum = existing.length + 1;
    const newKey = `custom_${nextNum}_${Date.now()}`;
    const newCategory = { key: newKey, label: "New Category" };
    settings.custom = [...existing, newCategory];
    saveCategorySettings(settings);
    setRows((prev) => [
      ...prev,
      {
        key: newKey,
        label: "New Category",
        isCustom: true,
        isHidden: false,
        isDirty: true,
      },
    ]);
  }

  function resetToDefaults() {
    localStorage.removeItem("wll_category_settings");
    setRows(buildRows());
    toast.success("Categories reset to defaults");
  }

  return (
    <div data-ocid="settings.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "oklch(0.16 0.012 255)" }}
          >
            Settings
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            Manage equipment categories and app preferences
          </p>
        </div>
        <Button
          data-ocid="settings.reset_button"
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="gap-1.5"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </Button>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Equipment Categories
            </CardTitle>
            <Button
              data-ocid="settings.add_category_button"
              size="sm"
              onClick={addCustom}
              className="text-white gap-1.5 h-8 text-xs"
              style={{ background: "oklch(0.55 0.17 25)", border: "none" }}
            >
              <Plus size={14} /> Add Custom Category
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rename categories, hide unused ones, or add custom types. Changes
            take effect immediately in dropdowns.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Default categories */}
          <div
            className="text-xs font-semibold uppercase tracking-wider px-1 pb-1"
            style={{ color: "oklch(0.45 0.04 250)" }}
          >
            Default Categories
          </div>
          {rows
            .filter((r) => !r.isCustom)
            .map((row, idx) => (
              <CategoryRowItem
                key={row.key}
                row={row}
                idx={idx + 1}
                onLabelChange={(v) => updateLabel(row.key, v)}
                onToggleVisibility={() => toggleVisibility(row.key)}
                onSave={() => saveRow(row.key)}
              />
            ))}

          {/* Custom categories */}
          {rows.some((r) => r.isCustom) && (
            <>
              <div
                className="text-xs font-semibold uppercase tracking-wider px-1 pt-3 pb-1"
                style={{ color: "oklch(0.45 0.04 250)" }}
              >
                Custom Categories
              </div>
              {rows
                .filter((r) => r.isCustom)
                .map((row, idx) => (
                  <CategoryRowItem
                    key={row.key}
                    row={row}
                    idx={idx + 1}
                    onLabelChange={(v) => updateLabel(row.key, v)}
                    onToggleVisibility={() => toggleVisibility(row.key)}
                    onSave={() => saveRow(row.key)}
                    onRemove={() => removeCustom(row.key)}
                  />
                ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryRowItem({
  row,
  idx,
  onLabelChange,
  onToggleVisibility,
  onSave,
  onRemove,
}: {
  row: CategoryRow;
  idx: number;
  onLabelChange: (v: string) => void;
  onToggleVisibility: () => void;
  onSave: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      data-ocid={`settings.category.item.${idx}`}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5"
      style={{
        background: row.isHidden
          ? "oklch(0.96 0.004 250)"
          : "oklch(0.975 0.006 250)",
        border: "1px solid oklch(0.91 0.01 250)",
        opacity: row.isHidden ? 0.65 : 1,
      }}
    >
      <Input
        data-ocid={`settings.category.input.${idx}`}
        value={row.label}
        onChange={(e) => onLabelChange(e.target.value)}
        onBlur={onSave}
        className="flex-1 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{ fontWeight: 500 }}
      />
      <div className="flex items-center gap-1 shrink-0">
        {row.isDirty && (
          <Button
            data-ocid={`settings.category.save_button.${idx}`}
            size="sm"
            onClick={onSave}
            className="h-7 px-2.5 text-xs text-white"
            style={{ background: "oklch(0.35 0.07 242)", border: "none" }}
          >
            Save
          </Button>
        )}
        <button
          type="button"
          data-ocid={`settings.category.toggle.${idx}`}
          onClick={onToggleVisibility}
          className="p-1.5 rounded transition-colors hover:bg-black/5"
          style={{
            color: row.isHidden
              ? "oklch(0.55 0.02 250)"
              : "oklch(0.42 0.08 145)",
          }}
          aria-label={row.isHidden ? "Show category" : "Hide category"}
          title={row.isHidden ? "Show in dropdowns" : "Hide from dropdowns"}
        >
          {row.isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        {onRemove && (
          <button
            type="button"
            data-ocid={`settings.category.delete_button.${idx}`}
            onClick={onRemove}
            className="p-1.5 rounded transition-colors hover:bg-red-50"
            style={{ color: "oklch(0.5 0.15 25)" }}
            aria-label="Remove custom category"
            title="Remove this custom category"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
