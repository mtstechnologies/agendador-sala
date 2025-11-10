import React from 'react';

export default function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p>Página administrativa em construção.</p>
    </div>
  );
}
