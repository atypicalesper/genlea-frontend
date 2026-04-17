interface ApiOfflineProps {
  error: string;
  onRetry: () => void;
}

function isConnectionError(msg: string) {
  return /50[234]|ECONNREFUSED|Failed to fetch|NetworkError|net::ERR/i.test(msg);
}

export default function ApiOffline({ error, onRetry }: ApiOfflineProps) {
  const offline = isConnectionError(error);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 px-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl select-none">
        {offline ? '🔌' : '⚠'}
      </div>

      <div className="text-center max-w-sm">
        <p className="text-sm font-semibold text-gray-700 mb-1">
          {offline ? 'Backend not running' : 'API error'}
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          {offline
            ? 'Start the API service, then retry.'
            : error}
        </p>
        {offline && (
          <code className="block mt-2 text-[11px] bg-gray-100 text-gray-500 rounded px-3 py-1.5 font-mono">
            npm run dev -w services/svc-api
          </code>
        )}
      </div>

      <button
        onClick={onRetry}
        className="mt-1 px-4 py-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600 transition-colors"
      >
        ↻ Retry
      </button>

      {!offline && (
        <p className="text-[10px] text-gray-300 font-mono">{error}</p>
      )}
    </div>
  );
}
