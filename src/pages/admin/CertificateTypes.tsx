import { useState } from 'react';
import { CERTIFICATE_TYPES, CertificateTypeInfo } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminCertificates = () => {
  const [types, setTypes] = useState<CertificateTypeInfo[]>([...CERTIFICATE_TYPES]);
  const [editingType, setEditingType] = useState<CertificateTypeInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const openEdit = (t: CertificateTypeInfo) => {
    setEditingType(t);
    setName(t.name);
    setDescription(t.description);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingType(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingType) {
      setTypes(prev => prev.map(t => t.id === editingType.id ? { ...t, name, description } : t));
      toast({ title: 'Certificate type updated' });
    } else {
      const newType: CertificateTypeInfo = {
        id: name.toLowerCase().replace(/\s+/g, '-') as any,
        name, description, fields: [], requirements: [],
      };
      setTypes(prev => [...prev, newType]);
      toast({ title: 'Certificate type created' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setTypes(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Certificate type deleted' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Certificate Types</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Type</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((t) => (
          <div key={t.id} className="rounded-lg border bg-card p-5 gov-shadow space-y-3">
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
            <div className="text-xs text-muted-foreground">
              {t.fields.length} fields · {t.requirements.length} requirements
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
};

export default AdminCertificates;
