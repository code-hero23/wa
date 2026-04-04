const db = require('../config/db');
const ExcelJS = require('exceljs');
const fs = require('fs');

exports.getContacts = async (req, res) => {
  try {
    const { search, grouping } = req.query;
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR phone ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    if (grouping) {
      params.push(grouping);
      query += ` AND grouping = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json({ success: true, contacts: result.rows });
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

exports.createContact = async (req, res) => {
  const { name, phone, email, project_name, location, grouping, tags } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO contacts (name, phone, email, project_name, location, grouping, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (phone) DO UPDATE SET 
          name = EXCLUDED.name, 
          email = EXCLUDED.email, 
          project_name = EXCLUDED.project_name, 
          location = EXCLUDED.location, 
          grouping = EXCLUDED.grouping,
          tags = EXCLUDED.tags
       RETURNING *`,
      [name, phone, email, project_name, location, grouping || 'Leads', tags || []]
    );
    res.json({ success: true, contact: result.rows[0] });
  } catch (err) {
    console.error('Create contact error:', err);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

exports.updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, project_name, location, grouping, tags } = req.body;
  try {
    const result = await db.query(
      `UPDATE contacts SET 
          name = $1, phone = $2, email = $3, 
          project_name = $4, location = $5, 
          grouping = $6, tags = $7
       WHERE id = $8 RETURNING *`,
      [name, phone, email, project_name, location, grouping, tags, id]
    );
    res.json({ success: true, contact: result.rows[0] });
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

exports.deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM contacts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

exports.importContacts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const workbook = new ExcelJS.Workbook();

  try {
    if (req.file.originalname.endsWith('.csv')) {
      await workbook.csv.readFile(filePath);
    } else {
      await workbook.xlsx.readFile(filePath);
    }

    const worksheet = workbook.getWorksheet(1);
    const contacts = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const name = row.getCell(1).text;
      const email = row.getCell(2).text;
      const phone = row.getCell(3).text;
      const project_name = row.getCell(4).text;
      const location = row.getCell(5).text;
      const grouping = row.getCell(6).text || 'Leads';
      const tags = row.getCell(7).text ? row.getCell(7).text.split(',').map(t => t.trim()) : [];

      if (phone) {
        contacts.push({ name, email, phone, project_name, location, grouping, tags });
      }
    });

    // Bulk Insert (simplified for now with a loop, could be optimized)
    for (const contact of contacts) {
      await db.query(
        `INSERT INTO contacts (name, email, phone, project_name, location, grouping, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (phone) DO UPDATE SET 
            name = EXCLUDED.name, 
            email = EXCLUDED.email, 
            project_name = EXCLUDED.project_name, 
            location = EXCLUDED.location, 
            grouping = EXCLUDED.grouping,
            tags = EXCLUDED.tags`,
        [contact.name, contact.email, contact.phone, contact.project_name, contact.location, contact.grouping, contact.tags]
      );
    }

    fs.unlinkSync(filePath); // Delete temp file
    res.json({ success: true, count: contacts.length });
  } catch (err) {
    console.error('Import error:', err);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Failed to import contacts' });
  }
};
