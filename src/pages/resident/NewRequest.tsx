import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '@/components/Stepper';
import { CERTIFICATE_TYPES, CertificateType } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = ['Select Type', 'Fill Form', 'Upload Docs', 'Review', 'Submitted'];

const NewRequest = () => {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<CertificateType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const certInfo = CERTIFICATE_TYPES.find(c => c.id === selectedType);

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const canProceed = () => {
    if (step === 0) return !!selectedType;
    if (step === 1 && certInfo) return certInfo.fields.filter(f => f.required).every(f => formData[f.name]?.trim());
    if (step === 2) return files.length > 0;
    return true;
  };

  const handleSubmit = () => {
    toast({ title: 'Request Submitted!', description: 'Your certificate request has been submitted successfully.' });
    setStep(4);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">New Certificate Request</h1>

      <div className="rounded-xl border bg-card p-6 gov-shadow-md">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="rounded-xl border bg-card p-6 gov-shadow">
        {/* Step 0: Select Type */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-heading">Select Certificate Type</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CERTIFICATE_TYPES.map((cert) => (
                <button
                  key={cert.id}
                  onClick={() => setSelectedType(cert.id)}
                  className={`rounded-lg border p-4 text-left transition-all hover:gov-shadow-md ${
                    selectedType === cert.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className={`h-5 w-5 mt-0.5 ${selectedType === cert.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-semibold text-sm">{cert.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cert.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Form */}
        {step === 1 && certInfo && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-heading">{certInfo.name} — Details</h2>
            {certInfo.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
                {field.type === 'textarea' ? (
                  <Textarea value={formData[field.name] || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)} />
                ) : field.type === 'select' ? (
                  <Select value={formData[field.name] || ''} onValueChange={(v) => handleFieldChange(field.name, v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input type={field.type} value={formData[field.name] || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Upload */}
        {step === 2 && certInfo && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-heading">Upload Documents</h2>
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-2">Required Documents:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {certInfo.requirements.map(r => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border-2 border-dashed border-primary/30 p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Drag & drop files here, or click to browse</p>
              <Input type="file" multiple onChange={handleFileChange} className="max-w-xs mx-auto" />
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

        {/* Step 3: Review */}
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

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="rounded-full bg-status-approved-bg p-4 mb-4">
              <CheckCircle className="h-12 w-12 text-status-approved" />
            </div>
            <h2 className="text-xl font-bold font-heading">Request Submitted!</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Your request has been submitted and is now pending review. You can track its status in your request history.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate('/resident/history')}>View History</Button>
              <Button onClick={() => { setStep(0); setSelectedType(null); setFormData({}); setFiles([]); }}>New Request</Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>Submit Request</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRequest;
