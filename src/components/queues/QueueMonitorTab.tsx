// Lazy-loaded Bull Board iframe — src only set on first mount to avoid
// hammering /queues before the tab is opened.

export default function QueueMonitorTab() {
  return (
    <div className="flex-1 h-[calc(100vh-120px)]">
      <iframe
        src="/queues"
        className="w-full h-full border-0"
        title="Bull Board Queue Monitor"
      />
    </div>
  );
}
