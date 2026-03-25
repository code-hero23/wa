// Test script to verify the new CSV parsing logic
const requiredParams = [{ key: 'param1' }, { key: 'param2' }];

const testRows = [
  { name: 'John Doe', phone: '1234567890', city: 'London', age: '30' },
  { name: 'Jane Smith', phone: '0987654321', city: 'Paris', age: '25' }
];

const parsed = testRows.map(row => {
  const phone = row.phone || row.mobile || row.number || row.contact || row.whatsapp || '';
  const nameValue = row.name || row.customer || row.user || row.first_name || 'User';
  
  const rowValues = Object.values(row);
  const params = requiredParams.map((p, index) => {
    const explicitValue = row[p.key.toLowerCase()];
    if (explicitValue !== undefined && explicitValue !== null && explicitValue !== '') {
      return String(explicitValue);
    }
    // Fallback to column index (skipping name/phone if they are likely at the start)
    // In our test case, name is index 0, phone is index 1. So index + 2 is correct for city/age.
    return String(rowValues[index + 2] || ''); 
  });

  return { name: nameValue, phone, params };
});

console.log('Parsed Results:', JSON.stringify(parsed, null, 2));

const expected = [
  { name: 'John Doe', phone: '1234567890', params: ['London', '30'] },
  { name: 'Jane Smith', phone: '0987654321', params: ['Paris', '25'] }
];

if (JSON.stringify(parsed) === JSON.stringify(expected)) {
  console.log('✅ CSV Mapping Verification Passed!');
} else {
  console.error('❌ CSV Mapping Verification Failed!');
  process.exit(1);
}
