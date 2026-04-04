import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Plus, Send, Eye, Clock, CheckCircle, AlertCircle, 
  Users, Layout, Type, ArrowRight, ArrowLeft, X, 
  Search, Mail, Target, BarChart2
} from 'lucide-react';
import { emailService, contactService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [step, setStep] = useState(1);
  
  // Wizard State
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    templateId: null,
    contactIds: [],
    grouping: '',
    scheduledAt: null
  });

  const [availableContacts, setAvailableContacts] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await emailService.getCampaigns();
      setCampaigns(response.data.campaigns || []);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const startWizard = async () => {
    setShowCreateWizard(true);
    setStep(1);
    try {
      const [cRes, tRes] = await Promise.all([
        contactService.getAll(),
        emailService.getTemplates()
      ]);
      setAvailableContacts(cRes.data.contacts || []);
      setTemplates(tRes.data.templates || []);
    } catch (err) {
      console.error('Data pre-fetch failed', err);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const contactIds = formData.grouping 
        ? availableContacts.filter(c => c.grouping === formData.grouping).map(c => c.id)
        : formData.contactIds;

      await emailService.createCampaign({
        ...formData,
        contactIds
      });
      setShowCreateWizard(false);
      fetchCampaigns();
    } catch (err) {
      alert('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-8">
      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-gray-500 font-medium mt-1">Design and dispatch bulk email marketing efforts.</p>
        </div>
        <button 
          onClick={startWizard}
          className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
        >
          <Plus className="w-5 h-5" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 gap-6">
        {campaigns.map((camp) => (
          <motion.div 
            key={camp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{camp.name}</h3>
                <StatusBadge status={camp.status} />
              </div>
              <p className="text-sm text-gray-500 font-medium mb-4">{camp.subject}</p>
              <div className="flex items-center space-x-6 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> {new Date(camp.created_at).toLocaleString()}</span>
                <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1.5" /> {camp.total_recipients} Recipients</span>
              </div>
            </div>

            <div className="flex items-center space-x-8 px-8 border-l border-gray-50">
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">{camp.sent_count}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-blue-600">{camp.open_count}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Opens</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-orange-600">{camp.click_count}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Clicks</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <BarChart2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Creation Wizard Modal */}
      <AnimatePresence>
        {showCreateWizard && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#FBFBFF] rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Wizard Header */}
              <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                    <RocketIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Create Email Campaign</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Step {step} of 3</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateWizard(false)}
                  className="p-3 hover:bg-gray-50 rounded-full text-gray-400 transition-all"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Wizard Body */}
              <div className="flex-1 overflow-y-auto p-12">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="max-w-2xl mx-auto space-y-8"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Campaign Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Summer Furniture Offer 2026"
                          className="w-full px-6 py-5 bg-white border-2 border-transparent border-gray-100 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-gray-700 font-bold text-lg"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Subject Line</label>
                        <input 
                          type="text" 
                          placeholder="Don't miss out on our limited time offer! 🎉"
                          className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-3xl focus:border-blue-500 transition-all text-gray-700 font-bold"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Recipients</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setFormData({...formData, grouping: 'Leads'})}
                            className={`p-6 rounded-3xl border-2 transition-all flex items-center space-x-4 ${
                              formData.grouping === 'Leads' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'
                            }`}
                          >
                            <Mail className={`w-8 h-8 ${formData.grouping === 'Leads' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div className="text-left">
                              <p className="font-black text-gray-900">Send to Leads</p>
                              <p className="text-xs text-gray-500">Target all current potential leads.</p>
                            </div>
                          </button>
                          <button 
                             onClick={() => setFormData({...formData, grouping: 'Customers'})}
                             className={`p-6 rounded-3xl border-2 transition-all flex items-center space-x-4 ${
                              formData.grouping === 'Customers' ? 'border-green-600 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'
                            }`}
                          >
                            <Target className={`w-8 h-8 ${formData.grouping === 'Customers' ? 'text-green-600' : 'text-gray-400'}`} />
                            <div className="text-left">
                              <p className="font-black text-gray-900">Send to Customers</p>
                              <p className="text-xs text-gray-500">Engage your existing client base.</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col space-y-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
                          <VariableChip label="Name" value="{{name}}" />
                          <VariableChip label="Project" value="{{project}}" />
                          <VariableChip label="Location" value="{{location}}" />
                        </div>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Tip: Click to insert variable</p>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-inner min-h-[400px]">
                        <ReactQuill 
                          theme="snow" 
                          value={formData.body}
                          onChange={(content) => setFormData({...formData, body: content})}
                          modules={modules}
                          className="h-full quill-editor"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-3xl mx-auto"
                    >
                      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="bg-gray-900 p-6 text-white text-center">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Previewing Campaign</p>
                          <h3 className="text-xl font-bold">{formData.subject || 'No Subject'}</h3>
                        </div>
                        <div className="p-12 prose max-w-none min-h-[300px]" dangerouslySetInnerHTML={{ __html: formData.body }} />
                        <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-center space-x-8">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-bold text-gray-600">Spam Check Passed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-bold text-gray-600">Tracking Pixel Enabled</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wizard Footer */}
              <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center">
                <button 
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold transition-all ${
                    step === 1 ? 'opacity-0 cursor-default' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <div className="flex space-x-3">
                  {step < 3 ? (
                    <button 
                      onClick={() => setStep(step + 1)}
                      className="flex items-center space-x-3 px-10 py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleCreate}
                      className="flex items-center space-x-3 px-10 py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all animate-pulse-slow"
                    >
                      <Send className="w-5 h-5" />
                      <span>Launch Campaign</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .quill-editor .ql-container {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          border: none !important;
        }
        .quill-editor .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 1rem !important;
        }
        .prose img { width: 100%; border-radius: 1rem; margin: 1rem 0; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

const VariableChip = ({ label, value }) => (
  <button 
    onClick={() => {
      const editor = document.querySelector('.ql-editor');
      if (editor) editor.innerHTML += ` <span style="color: #3b82f6; font-weight: bold;">${value}</span> `;
    }}
    className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl border border-blue-100 hover:bg-blue-100 transition-all flex items-center space-x-2"
  >
    <Plus className="w-3 h-3" />
    <span>{label}</span>
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-orange-50 text-orange-600 border-orange-100',
    sending: 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse',
    completed: 'bg-green-50 text-green-600 border-green-100',
    failed: 'bg-red-50 text-red-600 border-red-100'
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const RocketIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/>
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/>
  </svg>
);

export default EmailCampaigns;
