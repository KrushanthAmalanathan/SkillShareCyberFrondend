import React from 'react';

export default function TableField({ field, value = [], onChange }) {
  // Ensure value is array
  const rows = Array.isArray(value) ? value : [];

  // Add a blank row
  const addRow = () => {
    const newRow = {};
    field.columns.forEach(col => newRow[col.name] = '');
    onChange([...rows, newRow]);
  };

  // Update a single cell
  const updateCell = (rowIdx, colName, cellValue) => {
    const newRows = rows.map((r, i) =>
      i === rowIdx ? { ...r, [colName]: cellValue } : r
    );
    onChange(newRows);
  };

  // Remove a row
  const removeRow = idx => {
    const newRows = rows.filter((_, i) => i !== idx);
    onChange(newRows);
  };

  return (
    <div className="overflow-auto border rounded p-2">
      <table className="w-full table-auto mb-2">
        <thead>
          <tr>
            {field.columns.map(col => (
              <th key={col.name} className="px-2 py-1 text-left">{col.name}</th>
            ))}
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {field.columns.map(col => {
                const colType = col.type === 'Number' ? 'number' : 'text';
                return (
                  <td key={col.name} className="p-1">
                    <input
                      type={colType}
                      value={row[col.name] || ''}
                      onChange={e => updateCell(i, col.name, e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                    />
                  </td>
                );
              })}
              <td className="p-1 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={addRow}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        + Add Row
      </button>
    </div>
  );
}
