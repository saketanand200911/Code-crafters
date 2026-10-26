export default function handler(req, res) {
  res.status(200).json({
    status: 'online',
    system: 'Unmake AI Reverse Engineering Backend',
    model: 'Gemini 2.5 Flash'
  });
}
