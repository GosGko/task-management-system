interface StatusMessageProps {
  message: string | null;
  tone?: 'error' | 'success' | 'info';
  onRetry?: () => void;
  retryDisabled?: boolean;
}

export function StatusMessage({ message, tone = 'info', onRetry, retryDisabled }: StatusMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div className={`status-message status-message-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button button-secondary" onClick={onRetry} disabled={retryDisabled}>
          Try again
        </button>
      )}
    </div>
  );
}
