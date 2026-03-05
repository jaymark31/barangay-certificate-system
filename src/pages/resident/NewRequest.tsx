import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { certificateService, requestService } from '@/services/api';

const STEPS = ['Select Type', 'Fill Form', 'Upload Docs', 'Review', 'Submitted'];

interface CertTypeFromApi {
  id: string;
  name: string;
  description: string;
  requiredFields: { name: string; type: string; label: string }[];
}
interface CertInfo {
  id: string;
  name: string;
  description: string;
  fields: { name: string; label: string; type: string; required: boolean }[];
  requirements: string[];
}

const NewRequest = () => {
  const [step, setStep] = useState(0);
  const [certTypes, setCertTypes] = useState<CertInfo[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const certInfo = certTypes.find((c) => c.id === selectedTypeId);

  useEffect(() => {
    certificateService
      .getTypes()
      .then((res) => {
        const list = res.data?.data?.certificateTypes ?? [];
        setCertTypes(
          list.map((t: CertTypeFromApi) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            fields: (t.requiredFields || []).map((f) => ({
              name: f.name,
              label: f.label || f.name,
              type: f.type === 'number' ? 'text' : 'text',
              required: true,
            })),
            requirements: ['Valid ID', 'Cedula'],
          }))
        );
      })
      .catch(() => toast({ title: 'Could not load certificate types', variant: 'destructive' }))
      .finally(() => setLoadingTypes(false));
  }, [toast]);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const canProceed = () => {
    if (step === 0) return !!selectedTypeId;
    if (step === 1 && certInfo) return certInfo.fields.filter((f) => f.required).every((f) => formData[f.name]?.trim());
    if (step === 2) return files.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!certInfo) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('certificateTypeId', certInfo.id);
      fd.append('formData', JSON.stringify(formData));
      files.forEach((file) => fd.append('files', file));
      await requestService.create(fd);
      toast({ title: 'Request Submitted!', description: 'Your certificate request has been submitted successfully.' });
      setStep(4);
    } catch (err: unknown) {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      const message = ax?.data?.message ?? (err instanceof Error ? err.message : 'Failed to submit request.');
      toast({ title: 'Submit failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">New Certificate Request</h1>

      <div className="rounded-xl border bg-card p-6 gov-shadow-md">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="rounded-xl border bg-card p-6 gov-shadow">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-heading">Select Certificate Type</h2>
            {loadingTypes ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {certTypes.map((cert) => (
                  <button
                    key={cert.id}
                    onClick={() => setSelectedTypeId(cert.id)}
                    className={`rounded-lg border p-4 text-left transition-all hover:gov-shadow-md ${
                      selectedTypeId === cert.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className={`h-5 w-5 mt-0.5 ${selectedTypeId === cert.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-semibold text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{cert.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 1 && certInfo && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-heading">{certInfo.name} — Details</h2>
            {certInfo.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {step === 2 && certInfo && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-heading">Upload Documents</h2>
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-2">Required Documents:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {certInfo.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border-2 border-dashed border-primary/30 p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Drag & drop files here, or click to browse (JPEG, PNG, PDF)</p>
              <Input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="max-w-xs mx-auto" />
            </div>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" /> {f.name}
                    <span className="text-xs text-muted-foreground ml-auto">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && certInfo && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-heading">Review Your Request</h2>
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Certificate Type:</span>
                <span className="font-semibold">{certInfo.name}</span>
              </div>
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documents:</span>
                <span className="font-medium">{files.length} file(s)</span>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="rounded-full bg-status-approved-bg p-4 mb-4">
              <CheckCircle className="h-12 w-12 text-status-approved" />
            </div>
            <h2 className="text-xl font-bold font-heading">Request Submitted!</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Your request has been saved and is pending review. You can track its status in your request history.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate('/resident/history')}>
                View History
              </Button>
              <Button
                onClick={() => {
                  setStep(0);
                  setSelectedTypeId(null);
                  setFormData({});
                  setFiles([]);
                }}
              >
                New Request
              </Button>
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRequest;
