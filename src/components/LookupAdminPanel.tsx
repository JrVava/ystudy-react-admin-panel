import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lookupApi } from '../utils/lookupApi';
import { Save, ArrowLeft, BookOpen, Award, Layers, Clock, Coins } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface LookupAdminPanelProps {
  type: 'subjects' | 'qualifications' | 'modes' | 'durations' | 'fundings';
}

const configByType = {
  subjects: { label: 'Subject', icon: BookOpen, path: '/courses/subjects' },
  qualifications: { label: 'Qualification', icon: Award, path: '/courses/qualifications' },
  modes: { label: 'Study Mode', icon: Layers, path: '/courses/modes' },
  durations: { label: 'Duration', icon: Clock, path: '/courses/durations' },
  fundings: { label: 'Funding Option', icon: Coins, path: '/courses/fundings' }
};

export const LookupAdminPanel: React.FC<LookupAdminPanelProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const config = configByType[type];
  const Icon = config.icon;
  const api = lookupApi(type);

  const [isLoading, setIsLoading] = useState(!!id);
  const [formData, setFormData] = useState<any>({
    title: '',
    status: true
  });

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const data = await api.getById(id);
          setFormData({
            title: data.title || '',
            status: data.status !== false
          });
        } catch (e) {
          console.error(`Failed to fetch ${type}`, e);
          toast.error(`Failed to load details.`);
          navigate(config.path);
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    } else {
      setFormData({
        title: '',
        status: true
      });
      setIsLoading(false);
    }
  }, [id, type, navigate, config.path]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning("Title is required!");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        title: formData.title.trim(),
        status: formData.status
      };

      let res;
      if (id) {
        res = await api.update(id, payload);
      } else {
        res = await api.create(payload);
      }

      if (res.success || res.data?.success) {
        toast.success(id ? `${config.label} updated successfully!` : `${config.label} created successfully!`);
        navigate(config.path);
      } else {
        toast.error("Failed to save: " + (res.message || "Unknown error"));
        setIsLoading(false);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error saving details: " + (e.response?.data?.message || e.message || "Check logs."));
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-page-loader">
        <div className="loader-content">
          <img src="/ystudy-logo.png" alt="YStudy Logo" className="loader-logo animate-pulse" />
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <form onSubmit={handleSave} id="lookup-form">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon size={28} style={{ color: 'var(--primary)' }} />
              {id ? `Edit ${config.label}` : `Create ${config.label}`}
            </h1>
            <p className="page-subtitle">{id ? `Update detail parameters and status.` : `Add a new option parameter to the filter catalog.`}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => navigate(config.path)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem' }}
            >
              <Save size={16} />
              Save {config.label}
            </button>
          </div>
        </div>

        <div className="panel-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder={`e.g. ${type === 'subjects' ? 'Computing' : type === 'qualifications' ? 'BSc' : 'Details...'}`}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px' }}>
            <label className="form-label" style={{ margin: 0 }}>Visibility Status</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: !formData.status })}
              className={formData.status ? "btn-primary" : "btn-secondary"}
              style={{
                width: '100%',
                height: '42px',
                background: formData.status ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.05)',
                color: formData.status ? '#10b981' : '#f43f5e',
                border: formData.status ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.15)',
                fontWeight: 600
              }}
            >
              {formData.status ? "● Active / Visible" : "○ Inactive / Hidden"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};
export default LookupAdminPanel;
