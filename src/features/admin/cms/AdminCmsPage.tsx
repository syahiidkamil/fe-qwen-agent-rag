import { useRef } from "react";
import { Upload, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { useConfigStore } from "@/stores/useConfigStore";
import { CmsPresetBar } from "@/features/admin/cms/CmsPresetBar";
import { CmsForm } from "@/features/admin/cms/CmsForm";
import { CmsPreview } from "@/features/admin/cms/CmsPreview";

export function AdminCmsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const config = useConfigStore((s) => s.config);
  const resetConfig = useConfigStore((s) => s.resetConfig);
  const exportConfig = useConfigStore((s) => s.exportConfig);
  const importConfig = useConfigStore((s) => s.importConfig);

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await importConfig(f);
      toast(`Imported configuration from ${f.name}`);
    } catch {
      toast.error("Import failed: invalid JSON");
    }
    e.target.value = "";
  };
  const onExport = () => {
    exportConfig();
    toast(`Exported ${config.brand} configuration`);
  };
  const onReset = () => {
    if (!confirm("Reset to Airanext default? Your customizations will be lost."))
      return;
    resetConfig();
    toast("Reset to default");
  };
  const onSave = () => toast("All changes saved");

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Landing CMS</span>
          <h1 className="page-title">Customize the public landing page</h1>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={12} strokeWidth={1.6} />
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onImport}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={onExport}>
            <Download size={12} strokeWidth={1.6} />
            Export
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="btn btn-teal btn-sm" onClick={onSave}>
            Save
            <Check size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <CmsPresetBar />

      <div className="cms-layout">
        <div className="cms-form-card">
          <div className="cms-form-scroll">
            <CmsForm />
          </div>
        </div>
        <CmsPreview />
      </div>
    </>
  );
}
