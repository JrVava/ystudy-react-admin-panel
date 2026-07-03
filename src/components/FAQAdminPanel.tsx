import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { faqApi } from '../utils/faqApi';
import { Save, ArrowLeft, Plus, Trash2, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface FAQItem {
  _id?: string;
  question: string;
  answer: string;
}

export const FAQAdminPanel: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(!!slug);
  const [formSlug, setFormSlug] = useState("");
  const [status, setStatus] = useState(true);
  const [faqs, setFaqs] = useState<FAQItem[]>([{ question: "", answer: "" }]);

  useEffect(() => {
    if (slug) {
      const fetchFAQ = async () => {
        try {
          const res = await faqApi.getBySlug(slug);
          if (res.success && res.data) {
            setFormSlug(res.data.slug || "");
            
            // Map FAQs and determine status from the first item
            const fetchedFaqs = res.data.faqs || [];
            if (fetchedFaqs.length > 0) {
              setStatus(fetchedFaqs[0].status !== false);
            }
            
            setFaqs(fetchedFaqs.map((f: any) => ({
              _id: f._id,
              question: f.question || "",
              answer: f.answer || ""
            })));
          }
        } catch (e) {
          console.error("Failed to fetch FAQ", e);
          alert("Failed to load FAQ details.");
          navigate('/faqs');
        } finally {
          setLoading(false);
        }
      };
      fetchFAQ();
    }
  }, [slug, navigate]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only slugify input characters to valid slug format
    const val = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
    setFormSlug(val);
  };

  const handleFAQChange = (index: number, field: keyof FAQItem, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const addFAQRow = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFAQRow = (index: number) => {
    if (faqs.length === 1) {
      alert("At least one FAQ item is required.");
      return;
    }
    const updated = faqs.filter((_, i) => i !== index);
    setFaqs(updated);
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === faqs.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFaqs(updated);
  };

  const handleSave = async () => {
    const cleanSlug = formSlug.trim();
    if (!cleanSlug) {
      alert("Slug is required!");
      return;
    }

    // Filter out empty items
    const validFaqs = faqs.filter(f => f.question.trim() || f.answer.trim());
    if (validFaqs.length === 0) {
      alert("Please add at least one FAQ with question and answer content.");
      return;
    }

    // Ensure all remaining rows are filled
    const hasEmptyField = validFaqs.some(f => !f.question.trim() || !f.answer.trim());
    if (hasEmptyField) {
      alert("Please fill in both question and answer for all FAQ rows.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        slug: cleanSlug,
        status,
        faqs: validFaqs.map(f => ({
          question: f.question.trim(),
          answer: f.answer.trim()
        }))
      };

      let res;
      if (slug) {
        // Update API
        res = await faqApi.update(slug, payload);
      } else {
        // Create API
        res = await faqApi.create(payload);
      }

      if (res.success || res.message) {
        alert(slug ? "FAQ group updated successfully!" : "FAQ group created successfully!");
        navigate('/faqs');
      } else {
        alert("Failed to save FAQs: " + (res.message || "Unknown error"));
        setLoading(false);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error saving FAQs: " + (e.response?.data?.message || e.message || "Check logs."));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <span>Loading FAQ Details...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={28} style={{ color: 'var(--primary)' }} />
            {slug ? 'Edit FAQ Group' : 'Create FAQ Group'}
          </h1>
          <p className="page-subtitle">
            {slug ? `Update dynamic question cards under slug: "${slug}"` : 'Create a new group of questions & answers linked to a slug.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('/faqs')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem' }}
          >
            <Save size={16} />
            Save FAQ Group
          </button>
        </div>
      </div>

      <div className="panel-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Slug and Status config */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.01)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">FAQ Group Slug *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. degrees-faq, funding-guide-faq"
              value={formSlug}
              onChange={handleSlugChange}
              disabled={!!slug} // Disabled during edit mode
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Group Status</label>
            <button
              type="button"
              onClick={() => setStatus(!status)}
              className={status ? "btn-primary" : "btn-secondary"}
              style={{
                width: '100%',
                height: '42px',
                background: status ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.05)',
                color: status ? '#10b981' : '#f43f5e',
                border: status ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.15)',
                fontWeight: 600
              }}
            >
              {status ? "● Active / Visible" : "○ Inactive / Hidden"}
            </button>
          </div>
        </div>

        {/* FAQs Dynamic List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>
              Questions & Answers ({faqs.length})
            </h3>
            <button
              type="button"
              onClick={addFAQRow}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              <Plus size={14} />
              Add FAQ Card
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  position: 'relative'
                }}
              >
                {/* FAQ Header & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    FAQ Item #{index + 1}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => moveRow(index, 'up')}
                      disabled={index === 0}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', opacity: index === 0 ? 0.3 : 1 }}
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(index, 'down')}
                      disabled={index === faqs.length - 1}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', opacity: index === faqs.length - 1 ? 0.3 : 1 }}
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFAQRow(index)}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.15)', background: 'rgba(244, 63, 94, 0.02)' }}
                      title="Delete FAQ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Question *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. How does Student Finance repayment work?"
                      value={faq.question}
                      onChange={e => handleFAQChange(index, 'question', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Answer *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Type the response details here..."
                      value={faq.answer}
                      onChange={e => handleFAQChange(index, 'answer', e.target.value)}
                      style={{ minHeight: '100px', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addFAQRow}
            className="btn-secondary"
            style={{ width: '100%', marginTop: '1.25rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px dashed var(--panel-border)', background: 'rgba(255,255,255,0.01)' }}
          >
            <Plus size={16} />
            Add Another FAQ Card
          </button>
        </div>

      </div>
    </div>
  );
};

export default FAQAdminPanel;
