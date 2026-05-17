'use client';

export function TaktBoardEmbed() {
  return (
    <div className="w-full" style={{ height: 'calc(100vh - 180px)', minHeight: 600 }}>
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Takt Board</h2>
          <p className="text-xs text-gray-500">SHB Group field board · self-contained static app</p>
        </div>
        <a
          href="/taktboard.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Open full screen ↗
        </a>
      </div>
      <iframe
        src="/taktboard.html"
        title="Takt Board"
        className="w-full h-full border-0 bg-white"
      />
    </div>
  );
}
