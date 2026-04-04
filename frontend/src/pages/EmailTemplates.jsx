import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Plus, Edit2, Trash2, Layout, Copy, Save, X, Search,
  CheckCircle, FileText, Mail, Info, ArrowLeft
} from 'lucide-react';
import { emailService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({ name: '', subject: '', body: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await emailService.getTemplates();
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentTemplate.id) {
        await emailService.updateTemplate(currentTemplate.id, currentTemplate);
      } else {
        await emailService.createTemplate(currentTemplate);
      }
      setShowEditor(false);
      fetchTemplates();
    } catch (err) {
      alert('Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await emailService.deleteTemplate(id);
      fetchTemplates();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const preBuiltTemplates = [
    { name: 'Follow-up', subject: 'Checking in on our last conversation', body: 'Hi {{name}}, just wanted to follow up on...' },
    { name: 'Payment Reminder', subject: 'Upcoming Payment Due', body: 'Dear {{name}}, this is a friendly reminder that...' },
    { name: 'Special Offer', subject: 'Exclusive 20% Discount Just for You!', body: 'Hello {{name}}, we have a special offer for your project {{project}}...' }
  ];

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Email Templates</h1>
          <p className="text-gray-500 font-medium mt-1">Design once, reuse infinitely across campaigns.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentTemplate({ name: '', subject: '', body: '' });
            setShowEditor(true);
          }}
          className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
        >
          <Plus className="w-5 h-5" />
          <span>Create Template</span>
        </button>
      </div>

      {!showEditor ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Create Card */}
          <motion.button 
            whileHover={{ y: -10 }}
            onClick={() => {
               setCurrentTemplate({ name: '', subject: '', body: '' });
               setShowEditor(true);
            }}
            className="aspect-[4/5] bg-white border-2 border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center justify-center p-8 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
          >
            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
              <Plus className="w-10 h-10" />
            </div>
            <p className="text-lg font-black tracking-tight">New Template</p>
            <p className="text-sm font-medium mt-1 text-center">Start designing from scratch</p>
          </motion.button>

          {/* List Templates */}
          {templates.map((tpl) => (
            <TemplateCard 
              key={tpl.id} 
              template={tpl} 
              onEdit={() => handleEdit(tpl)} 
              onDelete={() => handleDelete(tpl.id)}
            />
          ))}

          {/* Pre-built Placeholders (if empty) */}
          {templates.length === 0 && preBuiltTemplates.map((tpl, i) => (
            <TemplateCard key={`pre-${i}`} template={tpl} isPlaceholder={true} onEdit={() => handleEdit(tpl)} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <button 
              onClick={() => setShowEditor(false)}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 font-bold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Library</span>
            </button>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSave}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                <Save className="w-5 h-5" />
                <span>Save Template</span>
              </button>
            </div>
          </div>
          
          <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Template Name</label>
                <input 
                  type="text" 
                  value={currentTemplate.name}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                  placeholder="e.g., Welcome Email"
                  className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-3xl outline-none focus:border-blue-500 font-bold text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Default Subject</label>
                <input 
                  type="text" 
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                  placeholder="The first thing your recipients see..."
                  className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-3xl outline-none focus:border-blue-500 font-bold text-gray-800"
                />
              </div>
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start space-x-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700 font-medium leading-relaxed">
                  You can use dynamic variables like <strong>{"{{name}}"}</strong> or <strong>{"{{project}}"}</strong>. 
                  These will be automatically replaced with the recipient's details during the campaign launch.
                </p>
              </div>
            </div>

            <div className="flex flex-col min-h-[500px]">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2">Content Designer</label>
              <div className="flex-1 bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden focus-within:border-blue-500 transition-all flex flex-col shadow-inner">
                <ReactQuill 
                  theme="snow" 
                  value={currentTemplate.body}
                  onChange={(content) => setCurrentTemplate({...currentTemplate, body: content})}
                  modules={modules}
                  className="flex-1 h-full quill-editor-template"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <style>{`
        .quill-editor-template .ql-container {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          border: none !important;
          padding: 1rem;
        }
        .quill-editor-template .ql-toolbar {
          border: none !important;
          border-bottom: 2px solid #f1f5f9 !important;
          padding: 1.5rem !important;
          background: #f8faff;
        }
      `}</style>
    </div>
  );
};

const TemplateCard = ({ template, onEdit, onDelete, isPlaceholder }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="aspect-[4/5] bg-white border border-gray-100 rounded-[3.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group overflow-hidden relative"
  >
    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isPlaceholder ? 'from-orange-400 to-red-400' : 'from-blue-500 to-purple-500'}`}></div>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPlaceholder ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
        <Layout className="w-8 h-8" />
      </div>
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-3 bg-white border border-gray-100 text-blue-600 rounded-xl hover:bg-blue-50 shadow-sm">
          <Edit2 className="w-4 h-4" />
        </button>
        {!isPlaceholder && (
          <button onClick={onDelete} className="p-3 bg-white border border-gray-100 text-red-600 rounded-xl hover:bg-red-50 shadow-sm">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    
    <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{template.name}</h3>
    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-6">Template Design</p>
    
    <div className="flex-1 bg-gray-50/50 rounded-3xl p-6 overflow-hidden border border-gray-100/50 relative">
      <div className="prose prose-sm text-gray-400 opacity-50 scale-90 origin-top-left line-clamp-6" dangerouslySetInnerHTML={{ __html: template.body }} />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent"></div>
    </div>

    <div className="mt-8 flex items-center justify-between">
      <span className="flex items-center text-[10px] font-black uppercase text-gray-400 tracking-tighter">
        <Mail className="w-3.5 h-3.5 mr-2 text-blue-500" /> Subject: {template.subject?.substring(0, 20)}...
      </span>
      {isPlaceholder && (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-widest rounded-full">Pro Design</span>
      )}
    </div>
  </motion.div>
);

export default EmailTemplates;
