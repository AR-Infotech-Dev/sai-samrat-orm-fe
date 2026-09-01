import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import ActionButton from "../../../components/ui/ActionButton";
import FlyoutPanel from "../../../components/ui/FlyoutPanel";
import Spinner from "../../../components/ui/Spinner";
import { downloadBlobResponse } from "../../../utils/download.utils";
import { downloadProductImportTemplate, importProductWorkbook } from "../data/products.service";

const workbookSheets = ["Products"];

function ProductImportFlyout({ isOpen, onClose, onImported }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStage, setImportStage] = useState("");
  const [result, setResult] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [templateDownloading, setTemplateDownloading] = useState(false);

  const fileName = useMemo(() => file?.name || "No file selected", [file]);

  const resetState = () => {
    setFile(null);
    setUploadProgress(0);
    setImportStage("");
    setResult(null);
    setPreviewReady(false);
  };

  const handleClose = () => {
    if (importing) return;
    resetState();
    onClose?.();
  };

  const handleTemplateDownload = async () => {
    setTemplateDownloading(true);
    const response = await downloadProductImportTemplate();
    setTemplateDownloading(false);
    if (!response?.success || !downloadBlobResponse(response, "product-import-template.xlsx")) {
      toast.error(response?.message || "Unable to download product import template.");
    }
  };

  const handleImport = async (mode = "preview") => {
    if (!file) {
      toast.error("Please select product Excel file.");
      return;
    }

    setImporting(true);
    setUploadProgress(0);
    setImportStage("Uploading file...");
    const res = await importProductWorkbook({
      file,
      mode,
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const nextProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(Math.min(nextProgress, 100));
        if (nextProgress >= 100) setImportStage("Processing file...");
      },
    });
    setImporting(false);

    if (!res.success) {
      setImportStage("");
      toast.error(res.message || "Unable to import products.");
      return;
    }

    const isPreview = mode === "preview";
    setUploadProgress(100);
    setImportStage(isPreview ? "Preview ready" : "Import complete");
    setResult(res);
    setPreviewReady(isPreview);
    toast.success(res.message || (isPreview ? "Product import preview generated." : "Products imported successfully."));
    if (!isPreview) onImported?.();
  };

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Product Data"
      subtitle="Download the Excel template, fill product data, then upload it here."
      closeButton={
        <button className="flyout-close" onClick={handleClose} aria-label="Close import panel">
          <X size={18} />
        </button>
      }
      footer={
        <>
          <ActionButton disabled={importing} variant="flyoutSecondary" onClick={handleClose}>
            Cancel
          </ActionButton>
          <ActionButton disabled={importing || !file} variant="flyoutPrimary" onClick={() => handleImport(previewReady ? "commit" : "preview")}>
            {importing ? <Spinner /> : <Upload size={16} />}
            {previewReady ? "Apply Changes" : "Preview Import"}
          </ActionButton>
        </>
      }
    >
      <div className="customer-import-shell">
        <section className="customer-import-card customer-import-template-card">
          <span className="customer-import-icon">
            <FileSpreadsheet size={20} />
          </span>
          <div>
            <h3>Product Excel Template</h3>
            <p>Use this exact format for importing products into database.</p>
          </div>
          <ActionButton disabled={templateDownloading} variant="ghostPrimary" onClick={handleTemplateDownload}>
            {templateDownloading ? <Spinner /> : <Download size={15} />}
            {templateDownloading ? "Downloading..." : "Download"}
          </ActionButton>
        </section>

        <section className="customer-import-card">
          <div className="customer-import-upload-head">
            <div>
              <h3>Upload Filled Excel</h3>
              <p>Accepted file types: .xlsx, .xls, .csv</p>
            </div>
          </div>

          <button type="button" className="customer-import-dropzone" onClick={() => fileInputRef.current?.click()}>
            <Upload size={22} />
            <strong>{fileName}</strong>
            <span>Click to choose the product import file</span>
          </button>

          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setUploadProgress(0);
              setImportStage("");
              setResult(null);
              setPreviewReady(false);
            }}
          />
        </section>

        {(importing || uploadProgress > 0) && (
          <section className="customer-import-progress" aria-live="polite">
            <div className="customer-import-progress-head">
              <span>{importStage || "Preparing import..."}</span>
              <strong>{uploadProgress}%</strong>
            </div>
            <div className="customer-import-progress-track">
              <span style={{ width: `${uploadProgress}%` }} />
            </div>
          </section>
        )}

        <section className="customer-import-columns">
          <h3>Workbook Sheets</h3>
          <div>
            {workbookSheets.map((sheet) => (
              <span key={sheet} className="required">
                {sheet}
              </span>
            ))}
          </div>
        </section>

        {result && (
          <section className="customer-import-result">
            <div>
              <span>Inserted</span>
              <strong>{result.inserted || 0}</strong>
            </div>
            <div>
              <span>Updated</span>
              <strong>{result.updated || 0}</strong>
            </div>
            <div>
              <span>Unchanged</span>
              <strong>{result.unchanged || 0}</strong>
            </div>
            <div>
              <span>Skipped</span>
              <strong>{result.skipped || 0}</strong>
            </div>
            {!!result.errors?.length && (
              <ul>
                {result.errors.slice(0, 5).map((error, index) => (
                  <li key={`${error.sheet || "sheet"}-${error.row || index}-${error.message}`}>
                    {error.sheet ? `${error.sheet} - ` : ""}Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </FlyoutPanel>
  );
}

export default ProductImportFlyout;
