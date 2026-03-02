import React, { useState } from 'react';
import { CertificateRequest, RequestStatus } from '@/services/mockData';
import { StatusBadge } from './StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, User, Calendar, CheckCircle, XCircle, Package } from 'lucide-react';

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

  if (!request) return null;

  const handleReject = () => {
    if (remarks.trim()) {
      onReject?.(request.id, remarks);
      setRemarks('');
      setShowRejectForm(false);
      onClose();
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
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download Certificate
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
