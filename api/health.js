export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'online',
    system: 'Unmake AI Reverse Engineering Backend',
    model: 'Gemini 2.5 Flash'
  });
}
