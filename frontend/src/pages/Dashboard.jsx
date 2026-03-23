import React, { useState, useEffect } from 'react';
import { campaignService } from '../services/api';
import { Layout, Send, Users, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await campaignService.getAll();
      setCampaigns(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: (campaigns || []).reduce((acc, c) => acc + (c.total_sent || 0), 0),
    delivered: (campaigns || []).reduce((acc, c) => acc + (c.delivered_count || 0), 0),
    read: (campaigns || []).reduce((acc, c) => acc + (c.read_count || 0), 0),
    pending: (campaigns || []).filter(c => c.status === 'processing').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blast Dashboard</h1>
        <p className="text-gray-500">Monitor your WhatsApp campaigns in real-time.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Send className="w-6 h-6" />} label="Total Sent" value={stats.total} color="bg-blue-500" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Delivered" value={stats.delivered} color="bg-green-500" />
        <StatCard icon={<Users className="w-6 h-6" />} label="Read" value={stats.read} color="bg-purple-500" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="Pending" value={stats.pending} color="bg-yellow-500" />
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Recent Campaigns</h2>
          <button onClick={loadCampaigns} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Template</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No campaigns found. Create one to get started!</td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.template}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        c.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`${color} p-3 rounded-lg text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
