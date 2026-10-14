export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number(err.status) || 500;
  if (status >= 500) console.error(JSON.stringify({ level: 'error', event: 'request_failed', requestId: req.requestId, status, message: process.env.NODE_ENV === 'production' ? 'internal_error' : err.message }));
  res.status(status).json({ error: status >= 500 ? 'An unexpected server error occurred.' : err.message });
}
