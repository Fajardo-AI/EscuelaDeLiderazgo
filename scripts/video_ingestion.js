const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { AssemblyAI } = require('assemblyai');
require('dotenv').config({ path: 'c:/Users/qfue1/OneDrive/Desktop/.env' });

// Configuración
const SUPA_URL = 'https://daaiqgwumsswbknxdfeu.supabase.co';
const SUPA_KEY = 'sb_publishable__L83VhIUpHNGakYyPSNWHA_R5nlmBFB'; 
const ASSEMBILY_API_KEY = '1b827b53676d4d3697a60fa230ea0ac8'; // Tu llave de AssemblyAI
const VIDEO_DIR = path.join(__dirname, '../docs/videos');

const supabase = createClient(SUPA_URL, SUPA_KEY);
const aaiClient = new AssemblyAI({ apiKey: ASSEMBILY_API_KEY });

async function processVideos() {
    console.log('📡 Conectado a Supabase y AssemblyAI.');

    if (!fs.existsSync(VIDEO_DIR)) {
        console.error(`❌ ERROR: No se encuentra la carpeta de videos en: ${VIDEO_DIR}`);
        return;
    }

    const files = fs.readdirSync(VIDEO_DIR).filter(file => file.endsWith('.mp4'));
    console.log(`🎬 Encontrados ${files.length} videos para procesar.`);

    for (const file of files) {
        const filePath = path.join(VIDEO_DIR, file);
        
        try {
            // Verificar si ya existe en Supabase
            const { data: exists, error: checkError } = await supabase
                .from('conocimiento')
                .select('id')
                .eq('nombre_video', file)
                .maybeSingle();

            if (checkError) throw checkError;
            
            if (exists) {
                console.log(`⏭️ Saltando ${file} (ya existe en la DB)`);
                continue;
            }

            console.log(`📤 Subiendo y transcribiendo: ${file}... (puede tardar unos minutos)`);

            // Transcribir con AssemblyAI
            const transcript = await aaiClient.transcripts.transcribe({
                audio: filePath,
                language_detection: true,
                speech_models: ['universal-3-pro']
            });

            if (transcript.status === 'error') {
                throw new Error(`Error en transcripción: ${transcript.error}`);
            }

            console.log(`✅ Transcripción completada para: ${file}`);

            // Guardar en Supabase
            const { error: insertError } = await supabase
                .from('conocimiento')
                .insert([
                    { 
                        nombre_video: file, 
                        transcripcion_ai: transcript.text, 
                        resumen_clave: transcript.text.substring(0, 500) + "..."
                    }
                ]);

            if (insertError) throw insertError;
            console.log(`💾 Guardado en Supabase: ${file}`);

        } catch (err) {
            console.error(`❌ Error procesando ${file}:`, err.message);
        }
    }
    console.log('🏁 Proceso finalizado.');
}

processVideos().catch(console.error);
