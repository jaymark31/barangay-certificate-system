import React, { useState } from 'react';
import { CertificateRequest, RequestStatus } from '@/services/mockData';
import { StatusBadge } from './StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, User, Calendar, CheckCircle, XCircle, Package, Pencil, Loader2 } from 'lucide-react';
import { certificateDocService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface RequestDetailsModalProps {
  request: CertificateRequest | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, remarks: string) => void;
  onRelease?: (id: string) => void;
  isAdmin?: boolean;
}

export const RequestDetailsModal = ({
  request, open, onClose, onApprove, onReject, onRelease, isAdmin = false,
}: RequestDetailsModalProps) => {
  const [remarks, setRemarks] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCertEditor, setShowCertEditor] = useState(false);
  const [certContent, setCertContent] = useState('');
  const [certLoading, setCertLoading] = useState(false);
  const [certSaving, setCertSaving] = useState(false);
  const [certDownloading, setCertDownloading] = useState(false);
  const { toast } = useToast();

  if (!request) return null;

  const handleReject = () => {
    if (remarks.trim()) {
      onReject?.(request.id, remarks);
      setRemarks('');
      setShowRejectForm(false);
      onClose();
    }
  };

  const loadCertificate = async () => {
    setCertLoading(true);
    try {
      const res = await certificateDocService.getByRequestId(request.id);
      const content = res.data?.data?.certificate?.content ?? '';
      setCertContent(content);
      setShowCertEditor(true);
    } catch (err: unknown) {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      toast({ title: 'Failed to load certificate', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setCertLoading(false);
    }
  };

  const saveCertificate = async () => {
    setCertSaving(true);
    try {
      await certificateDocService.updateByRequestId(request.id, certContent);
      toast({ title: 'Certificate saved' });
      setShowCertEditor(false);
    } catch (err: unknown) {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      toast({ title: 'Save failed', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setCertSaving(false);
    }
  };

  const downloadCertificatePdf = async () => {
    setCertDownloading(true);
    try {
      const res = await certificateDocService.downloadPdfByRequestId(request.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${request.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      toast({ title: 'Download failed', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setCertDownloading(false);
    }
  };

  const downloadCertificateDocx = async () => {
    setCertDownloading(true);
    try {
      const res = await certificateDocService.downloadDocxByRequestId(request.id);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${request.id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Opened in Word', description: 'The DOCX was downloaded. Open it in Microsoft Word to edit.' });
    } catch (err: unknown) {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      toast({ title: 'DOCX download failed', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setCertDownloading(false);
    }
  };

  const uploadEditedDocx = async (file: File) => {
    setCertSaving(true);
    try {
      await certificateDocService.uploadDocxByRequestId(request.id, file);
      toast({ title: 'Certificate updated', description: 'Your Word edits were saved to the database.' });
      await loadCertificate();
      setShowCertEditor(false);
    } catch (err: unknown) {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      toast({ title: 'Upload failed', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setCertSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <FileText className="h-5 w-5 text-primary" />
            Request Details — {request.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Certificate Type</p>
              <p className="font-semibold">{request.certificateTypeName}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          {/* Resident Info */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="h-4 w-4" /> Resident Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{request.residentName}</span></div>
              <div><span className="text-muted-foreground">ID:</span> <span className="font-medium">{request.residentId}</span></div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="h-4 w-4" /> Timeline
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Requested:</span> <span className="font-medium">{request.dateRequested}</span></div>
              {request.dateProcessed && <div><span className="text-muted-foreground">Processed:</span> <span className="font-medium">{request.dateProcessed}</span></div>}
            </div>
          </div>

          {/* Form Data */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Submitted Information</h3>
            <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
              {Object.entries(request.formData).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Uploaded Documents</h3>
            <div className="space-y-2">
              {request.documents.map((doc) => (
                <div key={doc} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{doc}</span>
                  </div>
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          {request.remarks && (
            <div className="rounded-lg border border-destructive/30 bg-status-rejected-bg p-4">
              <p className="text-sm font-semibold text-destructive">Rejection Remarks</p>
              <p className="mt-1 text-sm">{request.remarks}</p>
            </div>
          )}

          {/* Certificate (Admin) */}
          {isAdmin && (request.status === 'approved' || request.status === 'released') && (
            <div className="rounded-lg border bg-muted/10 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Certificate</p>
                  <p className="text-xs text-muted-foreground">Edit in Word (DOCX) or edit here, then download as PDF.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadCertificateDocx} disabled={certDownloading}>
                    {certDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Edit in Word
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadCertificate} disabled={certLoading}>
                    {certLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
                    Edit here
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCertificatePdf} disabled={certDownloading}>
                    {certDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PDF
                  </Button>
                </div>
              </div>

              {showCertEditor && (
                <div className="space-y-2">
                  <Textarea value={certContent} onChange={(e) => setCertContent(e.target.value)} className="min-h-[220px]" />
                  <div className="flex gap-2 justify-end">
                    <label className="mr-auto">
                      <input
                        type="file"
                        accept=".docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadEditedDocx(f);
                          e.currentTarget.value = '';
                        }}
                      />
                      <Button type="button" variant="outline" disabled={certSaving}>
                        {certSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload edited DOCX
                      </Button>
                    </label>
                    <Button variant="outline" onClick={() => setShowCertEditor(false)} disabled={certSaving}>Cancel</Button>
                    <Button onClick={saveCertificate} disabled={certSaving || !certContent.trim()}>
                      {certSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <div className="flex flex-col gap-3 border-t pt-4">
              {showRejectForm ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Enter reason for rejection..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleReject} disabled={!remarks.trim()}>
                      <XCircle className="mr-2 h-4 w-4" /> Confirm Reject
                    </Button>
                    <Button variant="outline" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <>
                      <Button onClick={() => { onApprove?.(request.id); onClose(); }} className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button variant="destructive" onClick={() => setShowRejectForm(true)} className="flex-1">
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <Button onClick={() => { onRelease?.(request.id); onClose(); }} className="flex-1">
                      <Package className="mr-2 h-4 w-4" /> Mark as Released
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resident Download */}
          {!isAdmin && request.status === 'released' && (
            <Button className="w-full" onClick={downloadCertificatePdf} disabled={certDownloading}>
              {certDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" /> Download Certificate
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
