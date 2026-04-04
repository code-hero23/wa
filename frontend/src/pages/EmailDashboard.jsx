import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  Mail, Send, CheckCircle, AlertCircle, Eye, MousePointer2, 
  Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { emailService } from '../services/api';
import { motion } from 'framer-motion';

const EmailDashboard = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    deliveryRate: 0,
    recentCampaigns: [],
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await emailService.getCampaigns();
      const campaigns = response.data.campaigns || [];
      
      let totalS = 0;
      let totalO = 0;
      let totalC = 0;
      let totalF = 0;

      campaigns.forEach(c => {
        totalS += c.sent_count || 0;
        totalO += c.open_count || 0;
        totalC += c.click_count || 0;
        totalF += c.failed_count || 0;
      });

      const totalAttempted = totalS + totalF;
      
      setStats({
        totalSent: totalS,
        openRate: totalS > 0 ? ((totalO / totalS) * 100).toFixed(1) : 0,
        clickRate: totalS > 0 ? ((totalC / totalS) * 100).toFixed(1) : 0,
        deliveryRate: totalAttempted > 0 ? ((totalS / totalAttempted) * 100).toFixed(1) : 0,
        recentCampaigns: campaigns.slice(0, 5),
        chartData: campaigns.map(c => ({
          name: c.name.substring(0, 10),
          sent: c.sent_count,
          opens: c.open_count,
          clicks: c.click_count
        })).reverse()
      });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading Dashboard...</div>;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Email Analytics</h1>
          <p className="text-gray-500 mt-1">Real-time performance of your mail campaigns.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Last 30 Days</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Send className="w-5 h-5 text-blue-600" />} 
          label="Total Sent" 
          value={stats.totalSent.toLocaleString()} 
          color="bg-blue-50"
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          icon={<Eye className="w-5 h-5 text-purple-600" />} 
          label="Open Rate" 
          value={`${stats.openRate}%`} 
          color="bg-purple-50"
          trend="+2.4%"
          trendUp={true}
        />
        <StatCard 
          icon={<MousePointer2 className="w-5 h-5 text-orange-600" />} 
          label="Click Rate" 
          value={`${stats.clickRate}%`} 
          color="bg-orange-50"
          trend="-0.5%"
          trendUp={false}
        />
        <StatCard 
          icon={<CheckCircle className="w-5 h-5 text-green-600" />} 
          label="Delivery" 
          value={`${stats.deliveryRate}%`} 
          color="bg-green-50"
          trend="+0.1%"
          trendUp={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">Campaign Performance</h3>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opens</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSent)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="opens" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOpens)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Campaigns</h3>
          <div className="flex-1 space-y-6">
            {stats.recentCampaigns.map((camp, idx) => (
              <div key={camp.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    idx % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{camp.name}</h4>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      {new Date(camp.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{camp.sent_count}</p>
                  <p className="text-[10px] font-bold text-green-500 uppercase">Sent</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 rounded-2xl bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-all">
            View All Campaigns
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color, trend, trendUp }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 }
    }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`${color} p-3 rounded-2xl`}>
        {icon}
      </div>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
        trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
      }`}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        <span>{trend}</span>
      </div>
    </div>
    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-gray-900">{value}</h3>
  </motion.div>
);

export default EmailDashboard;
