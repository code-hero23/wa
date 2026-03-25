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
    <div className="flex h-[calc(100vh-8rem)] bg-[#fff] rounded-2xl overflow-hidden shadow-xl border border-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-[350px] border-r border-[#f2f2f2] flex flex-col bg-white">
        {/* Sidebar Header */}
        <div className="p-4 bg-[#f0f2f5] flex justify-between items-center border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shadow-inner">A</div>
          <div className="flex space-x-4 text-[#54656f]">
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-3 py-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              className="w-full pl-10 pr-4 py-1.5 bg-[#f0f2f5] rounded-lg text-sm focus:outline-none placeholder:text-[#8696a0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 pb-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filter === 'all' ? 'bg-[#00a884] text-white shadow-md' : 'bg-gray-100 text-[#54656f] hover:bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filter === 'unread' ? 'bg-[#00a884] text-white shadow-md' : 'bg-gray-100 text-[#54656f] hover:bg-gray-200'}`}
            >
              Unread
            </button>
            <div className="relative flex-1 min-w-[120px]">
              <select 
                value={filter === 'campaign' ? selectedCampaignId : ''}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setFilter('all');
                  } else {
                    setSelectedCampaignId(e.target.value);
                    setFilter('campaign');
                  }
                }}
                className={`w-full pl-2 pr-6 py-1 bg-gray-100 border-none rounded-full text-xs font-semibold text-[#54656f] appearance-none focus:outline-none cursor-pointer transition-all ${filter === 'campaign' ? 'bg-[#00a884] text-white shadow-md' : 'hover:bg-gray-200'}`}
              >
                <option value="">Campaigns</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${filter === 'campaign' ? 'text-white' : 'text-[#54656f]'}`} />
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {chats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)).map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all hover:bg-[#f5f6f6] ${activeChat?.id === chat.id ? 'bg-[#f0f2f5]' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 border border-blue-50 flex items-center justify-center text-[#111] font-bold text-lg shadow-sm">
                {chat.name[0]}
              </div>
              <div className="ml-3 flex-1 border-b border-[#f2f2f2] pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#111b21]">{chat.name}</span>
                  <span className={`text-[11px] ${chat.unread_count > 0 ? 'text-[#00a884] font-bold' : 'text-[#667781]'}`}>
                    {chat.last_message_at ? format(new Date(chat.last_message_at), 'HH:mm') : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#667781] truncate w-48 font-medium">
                    {chat.last_message || 'No messages yet'}
                  </p>
                  {chat.unread_count > 0 && (
                    <span className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center shadow-sm">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <Inbox className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No conversations found</p>
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
          <div className="p-3 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shadow-inner">
                {activeChat.name[0]}
              </div>
              <div className="ml-3">
                <p className="font-bold text-[#111b21] leading-tight">{activeChat.name}</p>
                <p className="text-[11px] text-[#667781] font-medium tracking-wide">online</p>
              </div>
            </div>
            <div className="flex space-x-6 text-[#54656f]">
              <Video className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
              <Phone className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors" />
              <Search className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:px-8 space-y-1 relative z-10 scroll-smooth">
            {Object.entries(messageGroups).map(([date, groupMsgs]) => (
              <React.Fragment key={date}>
                <div className="flex justify-center my-4 sticky top-2 z-20">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#54656f] uppercase tracking-widest shadow-sm border border-gray-100">
                    {date}
                  </span>
                </div>
                {groupMsgs.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div 
                      className={`max-w-[85%] px-3 py-1.5 shadow-sm relative group
                        ${msg.direction === 'outbound' 
                          ? 'bg-[#dcf8c6] rounded-l-xl rounded-br-2xl text-[#111b21]' 
                          : 'bg-white rounded-r-xl rounded-bl-2xl text-[#111b21]'}
                      `}
                    >
                      {/* Message Tail */}
                      <div className={`absolute top-0 w-2 h-2 ${msg.direction === 'outbound' ? '-right-1 bg-[#dcf8c6] rounded-tr-sm' : '-left-1 bg-white rounded-tl-sm'} rotate-45 z-0`} />

                      <div className="relative z-10">
                        <p className="text-[14.5px] leading-relaxed break-words">{msg.body}</p>
                        <div className="flex items-center justify-end space-x-1 -mt-0.5 ml-8 h-4">
                          <span className="text-[10px] text-[#667781] font-medium font-sans">
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
          <div className="p-3 bg-[#f0f2f5] flex items-center space-x-3 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
            <Smile className="w-6 h-6 text-[#54656f] cursor-pointer hover:text-blue-600 transition-colors" />
            <Paperclip className="w-5 h-5 text-[#54656f] cursor-pointer hover:text-blue-600 transition-colors rotate-45" />
            <form onSubmit={handleSend} className="flex-1">
              <input 
                type="text" 
                placeholder="Type a message" 
                className="w-full px-4 py-2.5 bg-white rounded-xl text-sm focus:outline-none placeholder:text-[#8696a0] shadow-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </form>
            <button 
              onClick={handleSend}
              className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5 font-bold" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
               style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundSize: '400px' }} />
          
          <div className="text-center relative z-10 scale-110">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-100">
              <MessageSquare className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter mb-4 italic uppercase">BlastApp Chat</h2>
            <p className="text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
              Select a conversation to start messaging. Your chats are secured with end-to-end encryption.
            </p>
          </div>
          <div className="absolute bottom-10 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            Enterprise Edition v2.0
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default Chat;
