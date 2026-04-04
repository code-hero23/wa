import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Download, Upload, Trash2, Edit2, 
  MoreVertical, Check, X, FileText, Mail, Phone, MapPin, Tag
} from 'lucide-react';
import { contactService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [grouping, setGrouping] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '', email: '', phone: '', project_name: '', location: '', grouping: 'Leads', tags: []
  });

  useEffect(() => {
    fetchContacts();
  }, [search, grouping]);

  const fetchContacts = async () => {
    try {
      const response = await contactService.getAll({ search, grouping });
      setContacts(response.data.contacts || []);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await contactService.create(newContact);
      setShowAddModal(false);
      fetchContacts();
      setNewContact({ name: '', email: '', phone: '', project_name: '', location: '', grouping: 'Leads', tags: [] });
    } catch (err) {
      alert('Failed to create contact');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await contactService.delete(id);
      fetchContacts();
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      await contactService.import(formData);
      setShowImportModal(false);
      fetchContacts();
    } catch (err) {
      alert('Failed to import contacts');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedContacts(prev => 
      prev.length === contacts.length ? [] : contacts.map(c => c.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Contact Management</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Manage your leads and customer email list.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all border border-gray-100"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Import CSV</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <select 
            className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-gray-700"
            value={grouping}
            onChange={(e) => setGrouping(e.target.value)}
          >
            <option value="">All Groups</option>
            <option value="Leads">Leads</option>
            <option value="Customers">Customers</option>
            <option value="Follow-up">Follow-up</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5">
                  <button 
                    onClick={toggleSelectAll}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selectedContacts.length === contacts.length && contacts.length > 0
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-200'
                    }`}
                  >
                    {selectedContacts.length === contacts.length && contacts.length > 0 && <Check className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Project & Location</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Group</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Tags</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {contacts.map((contact) => (
                  <motion.tr 
                    key={contact.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`hover:bg-gray-50/80 transition-colors ${selectedContacts.includes(contact.id) ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleSelect(contact.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedContacts.includes(contact.id) 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-gray-200'
                        }`}
                      >
                        {selectedContacts.includes(contact.id) && <Check className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                          {contact.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{contact.name}</p>
                          <div className="flex items-center space-x-3 mt-0.5">
                            <span className="flex items-center text-[11px] text-gray-500 font-medium">
                              <Mail className="w-3 h-3 mr-1" /> {contact.email || 'No email'}
                            </span>
                            <span className="flex items-center text-[11px] text-gray-500 font-medium">
                              <Phone className="w-3 h-3 mr-1" /> {contact.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-700">{contact.project_name || '-'}</p>
                      <p className="text-[11px] text-gray-400 flex items-center mt-0.5 font-medium">
                        <MapPin className="w-3 h-3 mr-1" /> {contact.location || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        contact.grouping === 'Customers' ? 'bg-green-100 text-green-700' :
                        contact.grouping === 'Leads' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {contact.grouping}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Add New Contact</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Name</label>
                      <input 
                        required
                        type="text" 
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                      <input 
                        required
                        type="email" 
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Phone</label>
                      <input 
                        required
                        type="tel" 
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Group</label>
                      <select 
                        value={newContact.grouping}
                        onChange={(e) => setNewContact({...newContact, grouping: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium"
                      >
                        <option value="Leads">Leads</option>
                        <option value="Customers">Customers</option>
                        <option value="Follow-up">Follow-up</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100"
                    >
                      Save Contact
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contacts;
