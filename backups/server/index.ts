import app from './app.ts';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Annai Backend] Server listening on http://localhost:${PORT}`);
  console.log(`[Annai Backend] API Ready at http://localhost:${PORT}/api/health`);
});
