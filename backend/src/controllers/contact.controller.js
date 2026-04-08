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

  console.log(`--- Starting import for file: ${req.file.originalname} ---`);
  console.log(`File path: ${filePath}`);

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

      try {
        const name = row.getCell(1).value?.toString() || '';
        const email = row.getCell(2).value?.toString() || '';
        const phone = row.getCell(3).value?.toString() || '';
        const project_name = row.getCell(4).value?.toString() || '';
        const location = row.getCell(5).value?.toString() || '';
        const grouping = row.getCell(6).value?.toString() || 'Leads';
        
        let tags = [];
        const rawTags = row.getCell(7).value;
        if (rawTags) {
          tags = rawTags.toString().split(',').map(t => t.trim()).filter(t => t);
        }

        if (phone && phone.trim().length > 0) {
          contacts.push({ name, email, phone: phone.trim(), project_name, location, grouping, tags });
        }
      } catch (rowErr) {
        console.warn(`Skipping row ${rowNumber} due to error:`, rowErr.message);
      }
    });

    if (contacts.length === 0) {
      throw new Error('No valid contacts found in file. Ensure the Phone column (Column 3) is populated.');
    }

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
    console.error('Import error details:', {
      message: err.message,
      stack: err.stack,
      file: req.file ? req.file.originalname : 'no file'
    });
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ 
      error: 'Failed to import contacts', 
      details: err.message,
      suggestion: 'Please ensure your CSV follows the required column order: Name, Email, Phone, Project, Location, Group, Tags'
    });
  }
};
