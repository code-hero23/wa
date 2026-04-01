import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Check, CheckCheck, MoreVertical, Paperclip, Smile, Phone, Video, Filter, ChevronLeft, ChevronDown, ListFilter, Inbox, Tag, MessageSquare } from 'lucide-react';
import { chatService, campaignService } from '../services/api';
import { format, isToday, isYesterday } from 'date-fns';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, campaign
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    fetchCampaigns();
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, [filter, selectedCampaignId]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      handleMarkRead(activeChat.id);
      const interval = setInterval(() => fetchMessages(activeChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignService.getAll();
      setCampaigns(response.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchChats = async () => {
    try {
      const params = {};
      if (filter === 'unread') params.unread = 'true';
      if (filter === 'campaign' && selectedCampaignId) params.campaignId = selectedCampaignId;

      const response = await chatService.getChats(params);
      setChats(response.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const response = await chatService.getMessages(contactId);
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleMarkRead = async (contactId) => {
    try {
      await chatService.markAsRead(contactId);
      setChats(prev => prev.map(c => c.id === contactId ? { ...c, unread_count: 0 } : c));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await chatService.sendMessage(activeChat.id, newMessage);
      setNewMessage('');
      fetchMessages(activeChat.id);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const dateKey = formatDateLabel(msg.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100/50 font-sans">
      {/* Sidebar */}
      <div className="w-[400px] border-r border-[#e9edef] flex flex-col bg-white">
        {/* Sidebar Header */}
        <div className="p-3 bg-[#f0f2f5] flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md border-2 border-white">A</div>
            <span className="font-bold text-[#111b21] tracking-tight">Chats</span>
          </div>
          <div className="flex space-x-2 text-[#54656f]">
            <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors">
              <MoreVertical className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0] group-focus-within:text-[#00a884] transition-colors" />
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              className="w-full pl-10 pr-4 py-2 bg-[#f0f2f5] border-none rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all placeholder:text-[#8696a0] font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-4 py-2 flex items-center space-x-2 border-b border-[#f2f2f2] relative z-20 bg-white">
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => { setFilter('all'); setSelectedCampaignId(''); }}
            label="All"
          />
          <FilterButton 
            active={filter === 'unread'} 
            onClick={() => { setFilter('unread'); setSelectedCampaignId(''); }}
            label="Unread"
          />
          
          {/* Custom Campaign Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1 border
                ${filter === 'campaign' 
                  ? 'bg-[#00a884] text-white border-[#00a884] shadow-sm' 
                  : 'bg-white text-[#54656f] border-gray-200 hover:bg-gray-50'}`}
            >
              <Tag className={`w-3 h-3 ${filter === 'campaign' ? 'text-white' : 'text-[#8696a0]'}`} />
              <span>{filter === 'campaign' ? (campaigns.find(c => c.id == selectedCampaignId)?.name || 'Campaign') : 'Campaigns'}</span>
              <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
            </button>
            {isCampaignDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 transition-all duration-200 origin-top-left transform scale-100">
                <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Select Campaign</div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {campaigns.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setSelectedCampaignId(c.id);
                        setFilter('campaign');
                        setIsCampaignDropdownOpen(false);
                      }}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold transition-colors flex items-center justify-between
                        ${selectedCampaignId == c.id ? 'text-[#00a884] bg-emerald-50/50' : 'text-gray-700'}`}
                    >
                      <span className="truncate pr-2">{c.name}</span>
                      {selectedCampaignId == c.id && <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full"></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Click outside to close */}
            {isCampaignDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsCampaignDropdownOpen(false)}></div>}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {chats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)).map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`flex items-center px-4 py-3.5 cursor-pointer transition-all border-b border-[#f2f2f2]/60 relative group
                ${activeChat?.id === chat.id ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-[#111] font-bold text-xl shadow-inner overflow-hidden uppercase italic">
                   {chat.name[0]}
                </div>
                {chat.unread_count > 0 && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full"></div>}
              </div>
              
              <div className="ml-4 flex-1 min-w-0 py-0.5">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-[16px] truncate pr-2 ${chat.unread_count > 0 ? 'text-[#111b21]' : 'text-[#111b21]/90'}`}>
                    {chat.name}
                  </span>
                  <span className={`text-[11px] font-bold tracking-tight whitespace-nowrap ${chat.unread_count > 0 ? 'text-[#00a884]' : 'text-gray-400'}`}>
                    {chat.last_message_at ? format(new Date(chat.last_message_at), 'HH:mm') : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 overflow-hidden">
                    <p className={`text-sm truncate font-medium ${chat.unread_count > 0 ? 'text-[#111b21] font-bold' : 'text-[#667781]'}`}>
                      {chat.last_message || 'No messages yet'}
                    </p>
                  </div>
                  {chat.unread_count > 0 && (
                    <span className="bg-[#25D366] text-white text-[10px] font-black px-2 py-1 rounded-full min-w-[1.2rem] text-center shadow-lg shadow-emerald-100 leading-none">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12 text-center opacity-40">
              <Inbox className="w-16 h-16 mb-4 stroke-[1.5]" />
              <p className="text-sm font-bold uppercase tracking-widest">No conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-[#efeae2] relative shadow-inner">
          {/* WhatsApp Pattern Background Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ 
              backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
              backgroundSize: '400px'
            }}
          />

          {/* Chat Header */}
          <div className="p-3 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 shadow-inner overflow-hidden uppercase italic">
                {activeChat.name[0]}
              </div>
              <div className="ml-3">
                <p className="font-bold text-[#111b21] leading-tight text-[16px]">{activeChat.name}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full"></div>
                  <p className="text-[11px] text-[#00a884] font-bold uppercase tracking-widest">online</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-6 text-[#54656f]">
              <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"><Search className="w-5 h-5" /></div>
              <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"><MoreVertical className="w-5 h-5" /></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:px-12 space-y-1 relative z-10 scroll-smooth custom-scrollbar">
            {Object.entries(messageGroups).map(([date, groupMsgs]) => (
              <React.Fragment key={date}>
                <div className="flex justify-center my-6 sticky top-2 z-20">
                  <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-xl text-[11px] font-black text-[#54656f] uppercase tracking-[0.15em] shadow-lg shadow-gray-200/50 border border-white">
                    {date}
                  </span>
                </div>
                {groupMsgs.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'} mb-1 animate-in fade-in slide-in-from-bottom-1 duration-300`}
                  >
                    <div 
                      className={`max-w-[80%] px-3.5 py-1.5 shadow-sm relative group
                        ${msg.direction === 'outbound' 
                          ? 'bg-[#dcf8c6] rounded-l-xl rounded-br-2xl text-[#111b21]' 
                          : 'bg-white rounded-r-xl rounded-bl-2xl text-[#111b21]'}
                      `}
                    >
                      {/* Message Tail */}
                      <div className={`absolute top-0 w-2.5 h-2.5 ${msg.direction === 'outbound' ? '-right-1.5 bg-[#dcf8c6]' : '-left-1.5 bg-white'} rotate-45 z-0`} style={{ clipPath: msg.direction === 'outbound' ? 'polygon(0 0, 0% 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }} />

                      <div className="relative z-10 min-w-[60px]">
                        {msg.type === 'image' ? (
                          <div className="mb-1 cursor-pointer hover:opacity-95 transition-opacity">
                            <img 
                              src={msg.content.startsWith('http') ? msg.content : `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${msg.content}`}
                              alt="Message" 
                              className="rounded-lg max-w-full h-auto object-cover max-h-72 shadow-sm border border-black/5"
                              onClick={() => window.open(msg.content.startsWith('http') ? msg.content : `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${msg.content}`, '_blank')}
                            />
                          </div>
                        ) : (
                          <p className="text-[15px] leading-relaxed break-words font-medium">{msg.content || '...'}</p>
                        )}
                        <div className="flex items-center justify-end space-x-1.5 -mt-0.5 ml-10 h-4 opacity-70">
                          <span className="text-[10px] text-[#667781] font-black uppercase tracking-widest font-sans">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                          {msg.direction === 'outbound' && (
                            <span className="pt-0.5">
                              {msg.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1]" />
                              ) : msg.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#f0f2f5] flex items-center space-x-3 z-10 border-t border-[#e9edef]">
            <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"><Smile className="w-6 h-6 text-[#54656f]" /></div>
            <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors -rotate-45" title="Attach"><Paperclip className="w-5 h-5 text-[#54656f]" /></div>
            <form onSubmit={handleSend} className="flex-1">
              <input 
                type="text" 
                placeholder="Type a message" 
                className="w-full px-5 py-3 bg-white border-none rounded-2xl text-[15px] font-medium focus:outline-none placeholder:text-[#8696a0] shadow-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </form>
            <button 
              onClick={handleSend}
              className="bg-[#00a884] p-3 rounded-2xl text-white shadow-xl shadow-emerald-50 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center group"
            >
              <Send className="w-5 h-5 font-bold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
               style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundSize: '400px' }} />
          
          <div className="text-center relative z-10 scale-125">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-blue-50/50 border border-gray-50 group">
              <div className="relative">
                <MessageSquare className="w-12 h-12 text-blue-500 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4 italic uppercase">BlastApp Chat</h2>
            <p className="text-gray-400 max-w-[280px] mx-auto leading-relaxed font-bold text-xs uppercase tracking-[0.2em] opacity-80">
              Select a conversation to begin your outreach
            </p>
          </div>
          <div className="absolute bottom-12 flex items-center space-x-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] opacity-40">
            <div className="w-8 h-[1px] bg-gray-300"></div>
            <span>v2.4.0 High Reliability</span>
            <div className="w-8 h-[1px] bg-gray-300"></div>
          </div>
        </div>
      )}
      
      {/* Global CSS Helpers */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f0f2f5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.3s ease-out; }
      `}} />
    </div>
  );
};

const FilterButton = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border
      ${active 
        ? 'bg-[#00a884] text-white border-[#00a884] shadow-sm' 
        : 'bg-white text-[#54656f] border-gray-200 hover:bg-gray-100'}`}
  >
    {label}
  </button>
);

export default Chat;
