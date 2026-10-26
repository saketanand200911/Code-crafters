import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeImage, generateCode, refineComponent } from '../services/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

// POST /api/analyze
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    let base64Data;
    let mimeType = 'image/png';

    if (req.file) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/png';
    } else if (req.body.imageBase64) {
      const parts = req.body.imageBase64.split(';base64,');
      if (parts.length > 1) {
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
      } else {
        base64Data = req.body.imageBase64;
      }
    } else {
      return res.status(400).json({ error: 'No image uploaded or provided in body' });
    }

    console.log(`[Unmake API] Invoking visual reverse-engineering for ${mimeType}...`);
    const blueprint = await analyzeImage(base64Data, mimeType);
    res.json({ success: true, blueprint });
  } catch (err) {
    console.error('[Unmake API] Analysis failed:', err);
    res.status(500).json({ error: err.message || 'Reverse engineering analysis failed' });
  }
});

// POST /api/generate-code
router.post('/generate-code', async (req, res) => {
  try {
    const { blueprint, language } = req.body;
    if (!blueprint) {
      return res.status(400).json({ error: 'Blueprint is required' });
    }

    console.log(`[Unmake API] Synthesizing multi-file codebase from blueprint "${blueprint.name}"...`);
    const files = await generateCode(blueprint, language);
    res.json({ success: true, files });
  } catch (err) {
    console.error('[Unmake API] Code synthesis failed:', err);
    res.status(500).json({ error: err.message || 'Code generation failed' });
  }
});

// POST /api/refine
router.post('/refine', async (req, res) => {
  try {
    const { componentId, instruction, currentCode, blueprint } = req.body;
    if (!instruction) {
      return res.status(400).json({ error: 'Refinement instruction is required' });
    }

    console.log(`[Unmake API] Refining component ${componentId}: "${instruction}"...`);
    const result = await refineComponent(componentId, instruction, currentCode, blueprint);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Unmake API] Refinement failed:', err);
    res.status(500).json({ error: err.message || 'Refinement failed' });
  }
});

export default router;
