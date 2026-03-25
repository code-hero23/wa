import React, { useState } from 'react';
import Papa from 'papaparse';
import { campaignService } from '../services/api';
import { Upload, X, ChevronRight, Zap } from 'lucide-react';

const CampaignCreator = () => {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [isFetchingTemplates, setIsFetchingTemplates] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsFetchingTemplates(true);
    try {
      const res = await campaignService.getTemplates();
      // Meta API returns unique names in data array
      const templates = res.data.data.filter(t => t.status === 'APPROVED');
      setAvailableTemplates(templates);
      if (templates.length > 0) setTemplate(templates[0].name);
    } catch (err) {
      console.error("Error fetching templates:", err);
      // If we have detailed error from backend, use it
      const detail = err.response?.data?.details?.error?.message || "Check your .env credentials (Token, Phone ID, WABA ID).";
      setMessage({ type: 'error', text: `Template Sync Failed: ${detail}` });
    } finally {
      setIsFetchingTemplates(false);
    }
  };

  const getSelectedTemplate = () => {
    return availableTemplates.find(t => t.name === template);
  };

  const getRequiredParams = () => {
    const t = getSelectedTemplate();
    if (!t) return [];
    
    // Find body component
    const bodyComponent = t.components.find(c => c.type === 'BODY');
    if (!bodyComponent || !bodyComponent.text) return [];
    
    const matches = bodyComponent.text.match(/\{\{\d+\}\}/g);
    if (!matches) return [];

    // Get example values if available
    const examples = bodyComponent.example?.body_text?.[0] || [];
    
    return matches.map((_, i) => ({
      key: `param${i + 1}`,
      example: examples[i] || null
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const requiredParams = getRequiredParams();
    setMessage(null);
    
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim(),
        complete: (results) => {
          const parsed = results.data.map(row => {
            // Find phone using common synonyms
            const phone = row.phone || row.mobile || row.number || row.contact || row.whatsapp || '';
            const nameValue = row.name || row.customer || row.user || row.first_name || 'User';
            
            // Map params: 1. Try matching header name (param1, param2...) 2. Fallback to column index
            const rowValues = Object.values(row);
            const params = requiredParams.map((p, index) => {
              const explicitValue = row[p.key.toLowerCase()];
              if (explicitValue !== undefined && explicitValue !== null && explicitValue !== '') {
                return String(explicitValue);
              }
              // Fallback to column index (skipping name/phone if they are likely at the start)
              // But a better way: skip name/phone columns
              return String(rowValues[index + 2] || ''); // Assuming name/phone are first two
            });

            console.log('Parsed Row:', { name: nameValue, phone, params });
            
            return {
              name: String(nameValue),
              phone: String(phone).replace(/\D/g, ''),
              params: params
            };
          }).filter(row => row.phone.length >= 10);
          
          if (parsed.length === 0) {
            setMessage({ type: 'error', text: 'No valid contacts found. Please ensure your CSV has a "phone" or "mobile" column.' });
            setContacts([]);
          } else {
            setContacts(parsed);
            setMessage({ type: 'success', text: `Successfully loaded ${parsed.length} contacts.` });
          }
        }
      });
    }
  };

  const handleSend = async () => {
    let error = null;
    if (!name) error = "Campaign name is required.";
    else if (!template) error = "Please select a template.";
    else if (contacts.length === 0) error = "Please upload a valid CSV file.";

    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await campaignService.create({ name, template, contacts });
      setMessage({ type: 'success', text: 'Campaign blast started successfully!' });
      // Reset form
      setName('');
      setContacts([]);
      // Keep template selected for convenience
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to start campaign. Check backend logs.';
      setMessage({ type: 'error', text: errorMsg });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
        <p className="text-gray-500">Launch a new WhatsApp blast in seconds.</p>
      </header>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name</label>
          <input 
            type="text" 
            placeholder="e.g. Summer Sale 2024"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
            <span>WhatsApp Template</span>
            <button 
              onClick={fetchTemplates}
              className="text-xs text-blue-600 hover:underline flex items-center"
              disabled={isFetchingTemplates}
            >
              {isFetchingTemplates ? 'Syncing...' : 'Refresh Templates'}
            </button>
          </label>
          {isFetchingTemplates ? (
            <div className="w-full h-10 bg-gray-50 animate-pulse rounded-lg border border-gray-100"></div>
          ) : (
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white appearance-none cursor-pointer"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            >
              {availableTemplates.length > 0 ? (
                availableTemplates.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                ))
              ) : (
                <option disabled>No approved templates found</option>
              )}
            </select>
          )}
          
          {template && getSelectedTemplate() && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Template Preview</div>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {getSelectedTemplate().components.find(c => c.type === 'BODY')?.text.split(/(\{\{\d+\}\})/).map((part, i) => 
                  part.match(/\{\{\d+\}\}/) 
                  ? <span key={i} className="bg-blue-100 text-blue-700 px-1 rounded font-bold">{part}</span>
                  : part
                )}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">Select a pre-approved template from your WhatsApp Business Account.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Contacts (CSV)</label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors group cursor-pointer">
            <input 
              type="file" 
              accept=".csv"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
              <p className="text-gray-600 font-medium">Click or drag CSV file here</p>
              <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Required Headers:
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  { key: 'name', label: 'NAME' },
                  { key: 'phone', label: 'PHONE' },
                  ...getRequiredParams()
                ].map((h) => {
                  const labelStr = String(h.label || h.key || 'unknown');
                  const keyStr = String(h.key || h.label || Math.random());
                  return (
                    <span key={keyStr} className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-[10px] border border-gray-200 uppercase font-bold flex flex-col items-center">
                      <span className="truncate max-w-[100px]">{labelStr}</span>
                      {h.example && typeof h.example === 'string' && (
                        <span className="text-[8px] text-blue-500 lowercase font-normal italic truncate max-w-[100px]">
                          e.g. {h.example}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          {contacts.length > 0 && (
            <div className="mt-3 flex items-center justify-between text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
              <span>{contacts.length} contacts found.</span>
              <button onClick={() => setContacts([])} className="hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button 
          onClick={handleSend}
          disabled={loading}
          className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 
              (!name || !template || contacts.length === 0) 
              ? 'bg-blue-400 opacity-80 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
        >
          {loading ? 'Processing...' : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>{(!name || !template || contacts.length === 0) ? 'Complete Form to Launch' : 'Launch Blast'}</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CampaignCreator;
