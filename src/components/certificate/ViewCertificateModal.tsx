import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CertificateTemplate, replacePlaceholders } from '@/components/CertificateTemplate';
import { certificateDocService, certificateService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Pencil, Save, X } from 'lucide-react';
import type { CertificateRequest } from '@/services/mockData';
import { Textarea } from '@/components/ui/textarea';
import '@/components/certificate/certificate-print.css';

interface ViewCertificateModalProps {
  request: CertificateRequest | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  autoPrint?: boolean;
}

export function ViewCertificateModal({
  request,
  open,
  onClose,
  onSaved,
  autoPrint = false,
}: ViewCertificateModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !request?.id) return;
    setLoading(true);
    setEditMode(false);

    Promise.all([
      certificateDocService.getByRequestId(request.id).catch(() => null),
      certificateService.getTypes().catch(() => null)
    ]).then(([docRes, typesRes]) => {
      const certificateData = docRes?.data?.data;
      const savedContent = certificateData?.certificate?.content;
      const isSaved = certificateData?.source === 'saved';

      if (isSaved && savedContent && savedContent.trim() !== '') {
        setHtmlContent(savedContent);
      } else {
        // Fallback to type template injected with data
        let template = `<div class="certificate">
  <div class="header">
    <img src="/barangay-logo.jpg" alt="Barangay Logo" class="logo" />
    <div class="header-text">
        <p>Republic of the Philippines</p>
        <p>Province of {{province}}</p>
        <p>Municipality of {{municipality}}</p>
        <h2>{{barangay_name}}</h2>
        <p>Office of the Barangay Captain</p>
    </div>
  </div>

  <h1 class="title">{{certificate_title}}</h1>

  <div class="body">
    <p>
      TO WHOM IT MAY CONCERN:
    </p>

    <p>
      This is to certify that <strong>{{full_name}}</strong>,
      of legal age, and a resident of Palaquio Bucay Abra,
      is known to be a bona fide resident of this Barangay.
    </p>

    <p>
      This certification is issued upon request of the above-named person
      for the purpose of {{purpose}}.
    </p>

    <p>
      Issued this {{date_issued}} at Palaquio Bucay Abra.
    </p>
  </div>

  <div class="footer">
    <br/><br/>
    <div style="text-align:right;">
      <strong>Joel Alcalde</strong><br/>
      Barangay Captain
    </div>
  </div>
</div>`;
        const types = typesRes?.data?.data?.certificateTypes || [];
        const match = types.find((t: any) => t.name === request.certificateTypeName);
        if (match && match.templateContent) {
          template = match.templateContent;
        }

        // Replace basic placeholders automatically
        const dataMap: Record<string, string> = {
          full_name: request.residentName,
          address: (request.formData?.address as string) || '',
          purpose: (request.formData?.purpose as string) || '',
          date_issued: request.dateProcessed || new Date().toISOString().split('T')[0],
          certificate_title: request.certificateTypeName,
          captain_name: 'Hon. Captain',
          province: 'Abra',
          municipality: 'Bucay',
          barangay_name: 'Barangay Palaquio'
        };

        // Also add any other dynamic formData keys
        Object.entries(request.formData || {}).forEach(([k, v]) => {
          if (typeof v === 'string') dataMap[k] = v;
        });

        const newContent = replacePlaceholders(template, dataMap);
        setHtmlContent(newContent);
      }
    }).finally(() => setLoading(false));
  }, [request, open]);

  useEffect(() => {
    if (autoPrint && open && !loading && request) {
      const t = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [autoPrint, open, loading, request]);

  const handleSave = async () => {
    if (!request) return;
    setSaving(true);
    try {
      await certificateDocService.updateByRequestId(request.id, htmlContent);
      toast({ title: 'Certificate saved', description: 'Changes have been saved to the database.' });
      setEditMode(false);
      onSaved?.();
    } catch (err: unknown) {
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full no-print">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <span>Certificate — {request.certificateTypeName}</span>
            <div className="flex items-center gap-2 no-print">
              <Button
                variant={editMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode((e) => !e)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                {editMode ? 'Preview Mode' : 'Edit Mode'}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              {editMode && (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Save Changes
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" /> Loading certificate...
            </div>
          ) : editMode ? (
            <div className="space-y-4">
              {/* Make them edit the final HTML rendered or modify to suit */}
              <Textarea
                className="font-mono h-[60vh] text-sm break-all"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
              />
            </div>
          ) : (
            <div ref={certificateRef} className="border p-4 bg-muted/20 min-h-[60vh] flex flex-col justify-center overflow-x-auto">
              <CertificateTemplate
                templateContent={htmlContent}
                data={{}}
              />
            </div>
          )}
        </div>
      </DialogContent>

      {!editMode && !loading && (
        <div className="hidden print:block print:w-full print:absolute print:left-0 print:top-0 print:z-[9999] bg-white">
          <CertificateTemplate templateContent={htmlContent} data={{}} />
        </div>
      )}
    </Dialog>
  );
}
