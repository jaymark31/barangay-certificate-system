import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Eye, Printer, Loader2, Save, Undo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { certificateService } from '@/services/api';
import { CertificateTemplate, replacePlaceholders } from '@/components/CertificateTemplate';
import '@/components/certificate/certificate-print.css';

interface CertificateType {
  id: string;
  name: string;
  description: string;
  requiredFields?: any[];
  isActive: boolean;
  templateContent?: string;
  templateFields?: any[];
}

const defaultHtml = `<div class="certificate">
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
      of legal age, and a resident of {{address}},
      is known to be a bona fide resident of this Barangay.
    </p>

    <p>
      This certification is issued upon request of the above-named person
      for the purpose of {{purpose}}.
    </p>

    <p>
      Issued this {{date_issued}} at {{barangay_name}}.
    </p>
  </div>

  <div class="footer">
    <br/><br/>
    <div style="text-align:right;">
      <strong>{{captain_name}}</strong><br/>
      Barangay Captain
    </div>
  </div>
</div>`;

const AdminCertificates = () => {
  const [types, setTypes] = useState<CertificateType[]>([]);
  const [loading, setLoading] = useState(true);

  // Generic Modal states
  const [editingType, setEditingType] = useState<CertificateType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Template Modal states
  const [templateType, setTemplateType] = useState<CertificateType | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [templateContent, setTemplateContent] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getTypes();
      setTypes(res.data.data.certificateTypes);
    } catch (error) {
      toast({ title: 'Failed to fetch certificate types', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openEdit = (t: CertificateType) => {
    setEditingType(t);
    setName(t.name);
    setDescription(t.description);
    setIsActive(t.isActive);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingType(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingType) {
        await certificateService.update(editingType.id, { name, description, isActive });
        toast({ title: 'Certificate type updated' });
      } else {
        await certificateService.create({ name, description, requiredFields: [] });
        toast({ title: 'Certificate type created' });
      }
      setIsModalOpen(false);
      fetchTypes();
    } catch (err) {
      toast({ title: 'Failed to save certificate type', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await certificateService.delete(id);
      toast({ title: 'Certificate type deleted' });
      fetchTypes();
    } catch (err) {
      toast({ title: 'Failed to delete certificate type', variant: 'destructive' });
    }
  };

  const openTemplateModal = (t: CertificateType) => {
    setTemplateType(t);
    setTemplateContent(t.templateContent || defaultHtml);
    setEditMode(false);
    setIsTemplateModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveTemplate = async () => {
    if (!templateType) return;
    setSavingTemplate(true);
    try {
      await certificateService.update(templateType.id, {
        ...templateType,
        templateContent
      });
      toast({ title: 'Template saved successfully' });
      setEditMode(false);
      fetchTypes(); // Update the local types with the new template content
      // Update templateType reference to avoid stale data
      setTemplateType((prev) => prev ? { ...prev, templateContent } : null);
    } catch (err) {
      toast({ title: 'Failed to save template', variant: 'destructive' });
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Certificate Types</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Type</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <div key={t.id} className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{t.description}</p>

              <div className="pt-2 border-t flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openTemplateModal(t)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setTemplateType(t);
                  setTemplateContent(t.templateContent || defaultHtml);
                  setEditMode(true);
                  setIsTemplateModalOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setTemplateType(t);
                  setTemplateContent(t.templateContent || defaultHtml);
                  setEditMode(false);
                  setTimeout(() => window.print(), 100);
                }}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Type details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit' : 'New'} Certificate Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={!name.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal for Template Viewing/Editing */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full no-print">
          <DialogHeader className="mb-4">
            <div className="flex justify-between items-center">
              <DialogTitle>Template: {templateType?.name}</DialogTitle>
              <div className="flex gap-2 no-print">
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? <Undo className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
                  {editMode ? 'Preview Mode' : 'Edit Mode'}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} disabled={editMode}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                {editMode && (
                  <Button variant="default" size="sm" onClick={handleSaveTemplate} disabled={savingTemplate}>
                    {savingTemplate ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Template
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            {editMode ? (
              <div className="space-y-2">
                <Label>Raw HTML Content</Label>
                <Textarea
                  className="font-mono h-[60vh] text-sm break-all"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                />
              </div>
            ) : (
              <div ref={certificateRef} className="border p-4 bg-muted/20 min-h-[60vh] flex flex-col justify-center overflow-x-auto">
                <CertificateTemplate
                  templateContent={templateContent}
                  data={{
                    certificate_title: templateType?.name || 'CERTIFICATE'
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden print area that only shows when printing */}
      {templateType && !editMode && (
        <div className="hidden print:block print:w-full print:absolute print:left-0 print:top-0 print:z-[9999] bg-white">
          <CertificateTemplate
            templateContent={templateContent}
            data={{
              certificate_title: templateType?.name || 'CERTIFICATE'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
