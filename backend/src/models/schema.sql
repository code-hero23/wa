-- Database Schema for WhatsApp Blast

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE NOT NULL,
  tags TEXT[],
  last_message TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, processing, completed, paused
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, read, failed
  message_id TEXT, -- WhatsApp Message ID from Meta
  error_message TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bidirectional Chat History
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  direction TEXT NOT NULL, -- 'inbound' or 'outbound'
  type TEXT DEFAULT 'text', -- 'text', 'image', etc.
  content TEXT,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read'
  message_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster status updates and chat retrieval
CREATE INDEX idx_messages_message_id ON messages(message_id);
CREATE INDEX idx_chat_messages_contact_id ON chat_messages(contact_id);
CREATE INDEX idx_chat_messages_message_id ON chat_messages(message_id);
