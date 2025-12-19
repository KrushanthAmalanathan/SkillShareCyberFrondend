import React from 'react';

export default function ArrayField({ field, value = [], onChange }) {
  // Ensure it's an array
  const items = Array.isArray(value) ? value : [];

  // Add a blank entry
  const addItem = () => onChange([...items, '']);

  // Remove one entry
  const removeItem = idx =>
    onChange(items.filter((_, i) => i !== idx));

  // Update a single entry
  const updateItem = (idx, v) =>
    onChange(items.map((it, i) => (i === idx ? v : it)));

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={it}
            onChange={e => updateItem(i, e.target.value)}
            className="flex-1 p-1 border rounded text-sm"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="text-red-600 hover:underline text-sm"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        + Add {field.name}
      </button>
    </div>
  );
}
