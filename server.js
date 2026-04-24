const express = require('express');
const cors = require('cors');
const ldap = require('ldapjs');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:/Users/qfue1/OneDrive/Desktop/.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Supabase (NuevoSaulo)
const SUPA_URL = 'https://daaiqgwumsswbknxdfeu.supabase.co';
const SUPA_KEY = 'sb_publishable__L83VhIUpHNGakYyPSNWHA_R5nlmBFB';
const supabase = createClient(SUPA_URL, SUPA_KEY);

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/api/status', (req, res) => {
    res.json({ status: 'Saulo-Bot API is running' });
});

// --- CHATBOT ENDPOINT CON GROUNDING ---
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Mensaje requerido' });
    }

    try {
        // 1. Buscar conocimiento relevante en Supabase
        const { data: knowledgeBase, error } = await supabase
            .from('conocimiento')
            .select('transcripcion_ai');
        
        if (error) throw error;
        
        let context = (knowledgeBase || []).map(kb => kb.transcripcion_ai).join('\n\n');
        context = context.substring(0, 30000); // Límite de contexto

        const systemPrompt = `Eres Saulo-Bot, un asistente experto en los videos académicos de la escuela.
        Tu conocimiento se limita ESTRICTAMENTE a la información extraída de los videos.
        
        --- CONOCIMIENTO DISPONIBLE ---
        ${context}
        ------------------------------
        
        REGLAS DE ORO:
        1. Responde siempre basado en el conocimiento anterior.
        2. Si la información NO está en el texto, di: "Lo siento, mi conocimiento se limita a los videos académicos de Saulo. No tengo información sobre ese tema específico."
        3. Mantén un tono académico, inspirador y profesional.
        4. No inventes datos ni hables de temas personales o irrelevantes (como cocina, otros bots, etc.).`;

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Pregunta del usuario: ${message}` }
        ]);

        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.error('Error en Chatbot:', error);
        res.status(500).json({ error: 'Error procesando tu pregunta. Revisa la consola.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Saulo-Bot Backend is running on http://localhost:${PORT}`);
});
