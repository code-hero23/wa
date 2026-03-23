import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, Check, CheckCheck, Phone, Info, MoreVertical, MessageSquare } from 'lucide-react';
import { chatService } from '../services/api';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial load: Fetch chats
  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      const interval = setInterval(() => loadMessages(activeChat.id), 5000); // Polling messages every 5s
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const loadChats = async () => {
    try {
      const response = await chatService.getChats();
      setChats(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading chats:', err);
    }
  };

  const loadMessages = async (contactId) => {
    try {
      const response = await chatService.getMessages(contactId);
      setMessages(response.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const body = newMessage;
    setNewMessage('');

    try {
      await chatService.sendMessage(activeChat.id, body);
      loadMessages(activeChat.id); // Reload messages to see the new one
      loadChats(); // Update last message in sidebar
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredChats = chats.filter(chat => 
    (chat.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    chat.phone.includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mt-4">
      {/* Sidebar: Chat List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-[#F8F9FB]">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase italic">Chats</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`flex items-center space-x-4 p-4 rounded-3xl cursor-pointer transition-all mb-2 ${
                  activeChat?.id === chat.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1' 
                  : 'hover:bg-white hover:shadow-md text-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ${
                   activeChat?.id === chat.id ? 'bg-blue-500/50' : 'bg-gray-200 text-gray-500'
                }`}>
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold truncate text-sm">{chat.name || chat.phone}</p>
                    <p className={`text-[10px] ${activeChat?.id === chat.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                  <p className={`text-xs truncate ${activeChat?.id === chat.id ? 'text-blue-50' : 'text-gray-500'}`}>
                    {chat.last_message || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-sm">
              <p>No chats found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 tracking-tight">{activeChat.name || activeChat.phone}</h2>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{activeChat.phone}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <button className="p-3 rounded-2xl hover:bg-gray-50 hover:text-blue-600 transition-all"><Phone className="w-5 h-5" /></button>
                <button className="p-3 rounded-2xl hover:bg-gray-50 hover:text-blue-600 transition-all"><Info className="w-5 h-5" /></button>
                <button className="p-3 rounded-2xl hover:bg-gray-50 hover:text-blue-600 transition-all"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Pane */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#FBFBFF] custom-scrollbar">
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((msg, index) => {
                  const isOutbound = msg.direction === 'outbound';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                       <div className={`max-w-[70%] group`}>
                          <div className={`
                            px-6 py-4 rounded-3xl shadow-sm text-sm font-medium
                            ${isOutbound 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}
                          `}>
                            {msg.content}
                          </div>
                          <div className={`flex items-center mt-2 space-x-2 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOutbound && (
                              <div className="flex">
                                {msg.status === 'read' ? (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                ) : msg.status === 'delivered' ? (
                                  <CheckCheck className="w-3 h-3 text-gray-400" />
                                ) : (
                                  <Check className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-8 border-t border-gray-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all text-sm shadow-inner"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-5 h-5 font-bold" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#FBFBFF]">
             <div className="w-24 h-24 rounded-[40px] bg-blue-50 flex items-center justify-center text-blue-600 mb-8 shadow-xl">
               <MessageSquare className="w-10 h-10" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Stay Connected</h2>
             <p className="text-gray-500 max-w-md font-medium leading-relaxed">
               Select a conversation from the sidebar to start chatting with your customers in real-time.
             </p>
             <div className="mt-8 flex space-x-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-450 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
