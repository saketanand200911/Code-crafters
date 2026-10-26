import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required to start the AI backend');
}
const genAI = new GoogleGenerativeAI(apiKey);

// Prioritize Gemma 4 or Gemini 2.5 Flash
const MODEL_NAME = 'gemini-2.5-flash';

function cleanJSONString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function analyzeImage(base64Data, mimeType = 'image/png') {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are Unmake AI, a world-class visual reverse engineering engine for UI/UX, software engineering, and layout decomposition.
Analyze this image with microscopic precision. Dissect its structure, typography, palette, elements, responsive container hierarchy, and interactive intent.

Return a STRICT JSON object (no markdown, no backticks, only valid JSON) matching this exact specification:
{
  "name": "Concise title representing the interface",
  "overallLayout": "Detailed architectural layout description (e.g. Fixed navigation with a two-column responsive split hero, grid dashboard, etc.)",
  "colors": [
    { "name": "Primary Accent", "value": "#hex" },
    { "name": "Background", "value": "#hex" },
    { "name": "Surface Container", "value": "#hex" },
    { "name": "Primary Text", "value": "#hex" },
    { "name": "Muted Text", "value": "#hex" },
    { "name": "Border", "value": "#hex" }
  ],
  "typography": {
    "heading": "Font family, weight, estimated px/rem",
    "subheading": "Font family, weight, estimated px/rem",
    "body": "Font family, weight, estimated px/rem",
    "code": "Font family if any, or general styling"
  },
  "sections": [
    {
      "id": "kebab-case-id",
      "type": "SectionType (e.g. Navigation, Hero, BentoGrid, FeatureList, Form, DashboardMetrics, DataChart, Footer)",
      "label": "Human Readable Label",
      "icon": "icon name (e.g. layout, grid, zap, shield, bar-chart, type, link, mouse-pointer)",
      "children": [
        { "id": "child-id", "type": "Button | Heading | Input | Card | Badge | ImagePlaceholder | Avatar | NavLink", "label": "Text or description inside element" }
      ],
      "props": {
        "layout": "e.g. Flex row space-between / CSS Grid 3-col / Stack column",
        "background": "#hex or gradient or transparent",
        "padding": "e.g. 24px 32px",
        "gap": "e.g. 16px",
        "border": "e.g. 1px solid #hex",
        "borderRadius": "e.g. 12px"
      },
      "notes": [
        "Explain key reverse-engineering architectural insight here",
        "Explain spacing, contrast, typography rhythm, or responsiveness rule"
      ]
    }
  ]
}

Identify every discernible section and component. Ensure valid, pure JSON output.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const cleaned = cleanJSONString(responseText);
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Error in analyzeImage:', err);
    throw err;
  }
}

export async function generateCode(blueprint, targetLang = 'react') {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are Unmake AI Code Synthesis Engine. Given the structured design blueprint below, generate production-grade, highly aesthetic code that faithfully recreates the visual interface.

Target stack: React (JSX), Modern CSS, TypeScript types, and also include a Java backend model/controller representation if applicable.

Blueprint:
${JSON.stringify(blueprint, null, 2)}

Return a STRICT JSON array of files (no markdown, no backticks, only valid JSON):
[
  {
    "name": "App.jsx",
    "language": "jsx",
    "category": "frontend-react",
    "content": "Full complete React App component importing all sections and styles.css"
  },
  {
    "name": "components/[SectionName].jsx",
    "language": "jsx",
    "category": "frontend-react",
    "content": "Self-contained component with crisp JSX and semantics"
  },
  {
    "name": "styles.css",
    "language": "css",
    "category": "styling",
    "content": "Complete modern CSS stylesheet with responsive media queries, CSS variables based on detected colors, typography, hover states, and smooth transitions."
  },
  {
    "name": "types.ts",
    "language": "typescript",
    "category": "types",
    "content": "TypeScript interface definitions for the components and data props"
  },
  {
    "name": "controller/ApiController.java",
    "language": "java",
    "category": "backend-java",
    "content": "Spring Boot REST controller providing API endpoints to hydrate this UI"
  },
  {
    "name": "model/DataModel.java",
    "language": "java",
    "category": "backend-java",
    "content": "Java JPA Entity / DTO representations reflecting the schema and entities observed in this design"
  }
]

Create multiple component files representing each section in the blueprint. Code must be realistic, completely styled, and runnable. Return ONLY JSON.`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    const cleaned = cleanJSONString(responseText);
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Error in generateCode:', err);
    throw err;
  }
}

export async function refineComponent(componentId, instruction, currentCode, blueprint) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are Unmake AI Refinement Engine.
A developer requested an iteration on a specific component in their reverse-engineered UI.

Target Component ID: ${componentId}
User Refinement Instruction: "${instruction}"

Current Code File / Snippet:
${currentCode}

Global Design Blueprint Context:
${JSON.stringify(blueprint || {}, null, 2)}

Modify and enhance the code according to the instruction. Preserve style tokens, class names, and maintain high visual fidelity.
Return a STRICT JSON object:
{
  "updatedCode": "The full rewritten file or component content",
  "summary": "Brief note on what improvements or modifications were implemented"
}
Return ONLY valid JSON.`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    const cleaned = cleanJSONString(responseText);
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Error in refineComponent:', err);
    throw err;
  }
}
