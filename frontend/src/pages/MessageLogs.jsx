import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, RefreshCcw, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const MessageLogs = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Polling for status updates every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/campaigns/messages');
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.contact_phone.includes(searchTerm) || 
    (msg.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Logs</h1>
          <p className="text-gray-500">Track delivery status of every message sent.</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search phone or name..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchLogs} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                    Loading logs...
                  </td>
                </tr>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <LogEntry 
                    key={msg.id}
                    phone={msg.contact_phone} 
                    name={msg.contact_name}
                    status={msg.status} 
                    campaign={msg.campaign_name} 
                    time={new Date(msg.updated_at).toLocaleString()}
                    error={msg.error}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LogEntry = ({ phone, name, status, campaign, time, error }) => {
  const statusStyles = {
    sent: 'bg-blue-50 text-blue-600',
    delivered: 'bg-green-50 text-green-600',
    read: 'bg-indigo-50 text-indigo-600',
    failed: 'bg-red-50 text-red-600',
    pending: 'bg-gray-50 text-gray-600',
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
          {(name || phone).slice(-2)}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{name || 'Contact'}</span>
          <span className="text-[10px] text-gray-400">{phone}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center w-fit ${statusStyles[status]}`}>
            {status === 'read' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {error && <span className="text-[10px] text-red-400 mt-0.5">{error}</span>}
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600">{campaign}</td>
      <td className="px-6 py-4 text-gray-400 text-xs">{time}</td>
    </tr>
  );
};

export default MessageLogs;
