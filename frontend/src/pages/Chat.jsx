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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      handleMarkRead(activeChat.id);
      const interval = setInterval(() => loadMessages(activeChat.id), 5000);
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

  const handleMarkRead = async (contactId) => {
    try {
      await chatService.markAsRead(contactId);
      setChats(prev => prev.map(c => c.id === contactId ? { ...c, unread_count: 0 } : c));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const body = newMessage;
    setNewMessage('');

    try {
      await chatService.sendMessage(activeChat.id, body);
      loadMessages(activeChat.id);
      loadChats();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredChats = chats.filter(chat => 
    (chat.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    chat.phone.includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#f0f2f5] rounded-lg overflow-hidden shadow-xl mt-4 max-w-[1600px] mx-auto border border-gray-300">
      {/* Sidebar */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-[#f0f2f5] p-3 flex justify-between items-center border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="text-gray-600 w-6 h-6" />
          </div>
          <div className="flex space-x-2 text-gray-600">
            <MessageSquare className="w-5 h-5 cursor-pointer" />
            <MoreVertical className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        {/* Search */}
        <div className="p-2 bg-white border-b border-gray-200">
          <div className="relative bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 shadow-sm border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
            <Search className="w-4 h-4 text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="Search or start a new chat" 
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredChats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat)}
              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] transition-all border-b border-gray-100 ${
                activeChat?.id === chat.id ? 'bg-[#f0f2f5]' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4 flex-shrink-0 border border-gray-200 shadow-sm">
                <User className="text-gray-400 w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="text-[17px] font-medium text-[#111b21] truncate">
                    {chat.name || chat.phone}
                  </h3>
                  <span className={`text-xs ${parseInt(chat.unread_count) > 0 ? 'text-[#00a884] font-bold' : 'text-gray-500'}`}>
                    {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#667781] truncate pr-4">
                    {chat.last_message || 'No messages'}
                  </p>
                  {parseInt(chat.unread_count) > 0 && (
                    <span className="bg-[#25D366] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-[#efeae2]">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="bg-[#f0f2f5] p-3 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center border border-gray-300 shadow-sm">
                  <User className="text-gray-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#111b21] leading-tight">
                    {activeChat.name || activeChat.phone}
                  </h2>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {activeChat.phone} • online
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-[#54656f]">
                <Search className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors" />
                <Phone className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors" />
                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#e5ddd5] bg-opacity-20 relative" 
                 style={{backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px'}}>
              <div className="space-y-2 max-w-2xl mx-auto flex flex-col relative">
                {messages.map((msg, index) => {
                  const isOutbound = msg.direction === 'outbound';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} w-full relative z-10`}
                    >
                      <div className={`
                        max-w-[85%] px-2.5 py-1.5 rounded-lg shadow-md relative
                        ${isOutbound 
                          ? 'bg-[#dcf8c6] text-[#303030] rounded-tr-none ml-12' 
                          : 'bg-white text-[#303030] rounded-tl-none mr-12'}
                      `}>
                        {/* Message Bubble Tail CSS replacement */}
                        <div className={`absolute top-0 w-2 h-2 ${
                          isOutbound 
                          ? 'right-[-8px] bg-[#dcf8c6]' 
                          : 'left-[-8px] bg-white'
                        }`} 
                        style={{clipPath: isOutbound ? 'polygon(0 0, 0% 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)'}}>
                        </div>
                        
                        <div className="text-[14.2px] leading-relaxed break-words whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        
                        <div className="flex justify-end items-center mt-1 space-x-1 pl-4 h-3 overflow-visible">
                          <span className="text-[10px] text-gray-500/80 font-medium">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                          {isOutbound && (
                            <div className="flex scale-90">
                              {msg.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1]" />
                              ) : msg.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            {/* Input Wrapper */}
            <div className="bg-[#f0f2f5] p-2.5 flex items-center space-x-2 z-10">
              <button className="p-2.5 text-gray-500 hover:bg-gray-200/50 rounded-full transition-colors"><Info className="w-6 h-6" /></button>
              <form onSubmit={handleSendMessage} className="flex-1 flex items-center bg-white rounded-lg px-3 py-1 shadow-sm border border-transparent focus-within:border-gray-200">
                <input 
                  type="text" 
                  placeholder="Type a message" 
                  className="flex-1 py-1.5 focus:outline-none text-[15px] placeholder:text-gray-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </form>
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`p-2.5 rounded-full transition-all transform active:scale-95 ${
                  newMessage.trim() 
                  ? 'text-[#00a884] hover:bg-gray-200/50' 
                  : 'text-gray-400'
                }`}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] p-12 relative overflow-hidden">
             {/* WhatsApp Welcome Screen Style */}
             <div className="max-w-[460px] text-center z-10">
                <div className="w-64 h-64 bg-white/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="mb-8 relative">
                  <div className="w-24 h-24 bg-[#25d366]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#25d366]/20">
                    <MessageSquare className="w-10 h-10 text-[#25d366]" />
                  </div>
                </div>
                <h2 className="text-[32px] font-light text-[#41525d] mb-4">WhatsApp Web</h2>
                <p className="text-[#667781] text-sm leading-relaxed mb-10 px-8">
                  Send and receive messages without keeping your phone online.<br/>
                  Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                </p>
                <div className="flex items-center justify-center space-x-1 text-[#8696a0] text-xs mt-20">
                   <Phone className="w-3.5 h-3.5" />
                   <span>End-to-end encrypted</span>
                </div>
             </div>
             <div className="absolute bottom-0 w-full h-1.5 bg-[#25d366] opacity-30"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
