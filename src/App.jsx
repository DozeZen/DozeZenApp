import React, { useState } from 'react';
import { 
  FileText, 
  Settings, 
  Image as ImageIcon, 
  CheckCircle, 
  Loader2, 
  Clapperboard, 
  ArrowLeft, 
  Trash2, 
  Copy,
  Lock,
  Key,
  Info,
  Youtube
} from 'lucide-react';

// --- API Configuration ---
const TEXT_MODEL = "gemini-3-flash-preview"; 
const IMAGE_MODEL = "gemini-3.1-flash-image-preview"; 

function App() {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  
  // Input States
  const [videoTitle, setVideoTitle] = useState("");
  const [sourceVideoTitle, setSourceVideoTitle] = useState("");
  const [sourceDescription, setSourceDescription] = useState(""); 
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [transcript, setTranscript] = useState("");
  
  // Generated Content States
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedVideoDescription, setGeneratedVideoDescription] = useState("");
  const [characterRef, setCharacterRef] = useState("Young adult male, wearing outfit that is appropriate for the setting and time period, no hair, neutral expression, slightly slimmer build, calm personality, recognizable protagonist design.");
  const [characterImageBase64, setCharacterImageBase64] = useState(null);
  const [imagePrompts, setImagePrompts] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // --- API Utilities ---
  const callGemini = async (prompt, systemInstruction = "", useSearch = false, imageData = null) => {
    if (!apiKey) throw new Error("API Key is missing.");

    let retries = 0;
    const maxRetries = 5;
    
    while (retries <= maxRetries) {
      try {
        const parts = [{ text: prompt }];
        if (imageData) {
          parts.push({
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.data
            }
          });
        }

        const payload = {
          contents: [{ role: "user", parts }],
          ...(useSearch && { tools: [{ "google_search": {} }] })
        };

        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${apiKey.trim()}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          const errorMsg = errorJson.error?.message || response.statusText;
          throw new Error(`[${response.status}] ${errorMsg}`);
        }
        
        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) throw new Error("The API returned an empty result.");
        return generatedText;
      } catch (error) {
        if (error.message.includes("400") || error.message.includes("401") || error.message.includes("403") || error.message.includes("404")) {
            throw error;
        }
        if (retries === maxRetries) throw error;
        await new Promise(res => setTimeout(res, Math.pow(2, retries) * 1000));
        retries++;
      }
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim().startsWith("AIza")) {
      setHasKey(true);
      setStep(1);
    } else {
      alert("Please enter a valid Gemini API Key (starts with AIza)");
    }
  };

  const analyzeAndGenerate = async () => {
    setLoading(true);
    try {
      const systemPrompt = `You are a content strategist and scriptwriter. 
      TASK 1: Analyze transcript/source. Write a script for "${videoTitle}" matching source tone. Target 8-min.
      TASK 2: Write a YouTube description based on "Source Description". 
      STRUCTURE:
      1. Hook & Summary
      2. Key Points
      3. [SOURCES] section (Citations)
      4. [KEYWORDS] section (Hashtags)
      
      CRITICAL: Citations MUST come before Hashtags.
      Format with: ---SCRIPT START--- and ---DESCRIPTION START---`;

      const userPrompt = `Target Title: ${videoTitle}\nSource Title: ${sourceVideoTitle}\nSource Description: ${sourceDescription}\nSource Transcript: ${transcript}\nAdditional Details: ${additionalDetails}`;
      
      const response = await callGemini(userPrompt, systemPrompt);
      const scriptMatch = response.match(/---SCRIPT START---([\s\S]*?)---DESCRIPTION START---/);
      const descMatch = response.match(/---DESCRIPTION START---([\s\S]*)/);
      
      if (scriptMatch && descMatch) {
        setGeneratedScript(scriptMatch[1].trim());
        setGeneratedVideoDescription(descMatch[1].trim());
      } else {
        setGeneratedScript(response); 
      }
      setStep(3);
    } catch (e) {
      alert(`Workflow Failed:\n${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const engineerPrompts = async () => {
    setLoading(true);
    try {
      const systemPrompt = `You are a visual director. Generate EXACTLY 35 visual prompts. 
      OUTPUT ONLY THE PROMPTS. Start directly with "1.".
      
      EVERY PROMPT MUST FOLLOW THIS EXACT TEMPLATE:
      [Camera Composition], [Location], [Time Period], [Time of Day (Optional)], [Architectural/Environmental Details (Optional)]. 
      Clean cinematic minimalist prehistoric illustration style, simplified digital cartoon aesthetic, soft cel shading, muted earthy palette, atmospheric firelight, uncluttered composition, sharp polished vector-like rendering, modern explainer-animation look, simple geometric environments.
      
      All characters should have a minimalist cinematic cartoon character design with oversized smooth circular heads, tiny oval black eyes, simple mouth lines, clean back outlines, soft cel shading, simplified anatomy, rounded limbs, modern explainer-animation aesthetic, subtle fabric folds, muted/desaturated color palette, polished digital illustration, clean vector-like appearance, atmospheric lighting, uncluttered design.
      
      Main Character: ${characterRef}
      
      [Main Character Outfit Consistency]
      [Actions of main Character]

      IF background characters are in the scene, add:
      "[Appropriate #] Background Characters. Background Characters should follow the exact same character design language and anatomy proportions as the Main Character, but vary in clothing, hairstyle, body shapes, age, accessories, and facial expressions. Include men, women, elderly people, children, workers, soldiers, merchants, peasants, nobles, etc depending on the setting and time period. Maintain the same minimalist rounded-head aesthetic and clean cinematic illustration style. 
      [Actions of Background Characters]"`;

      const result = await callGemini(`Script: ${generatedScript}`, systemPrompt);
      const lines = result.split(/\n\d+\.|\d+\./);
      const parsedPrompts = lines.map(p => p.trim()).filter(p => p.length > 50);
      setImagePrompts(parsedPrompts.slice(0, 35));
      setStep(4);
    } catch (e) {
      alert(`Prompt Engineering Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setCharacterImageBase64({
          mimeType: file.type,
          data: base64String,
          previewUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const copyPrompt = (text, index) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    document.body.removeChild(textArea);
  };

  const BackButton = ({ onClick }) => (
    <button onClick={onClick} disabled={loading} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider">
      <ArrowLeft size={16} /> Back
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white"><Clapperboard size={28} /></div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic">DozeZen<span className="text-indigo-600">Workflow</span></h1>
        </div>
        {hasKey && (
          <button onClick={() => { setApiKey(""); setHasKey(false); setStep(0); }} className="text-[10px] bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-full font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
            <Lock size={10} /> Reset Key
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px]">
        {step === 0 && (
          <div className="p-12 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Key size={32} /></div>
            <h2 className="text-2xl font-bold mb-2">Secure Setup</h2>
            <p className="text-slate-500 text-sm mb-8">Enter your Gemini API key. It is stored locally in your browser session.</p>
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <input type="password" placeholder="Enter API Key (AIza...)" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center font-mono" />
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Access Workflow</button>
            </form>
          </div>
        )}

        {step === 1 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-8">1. Intelligence Ingestion</h2>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-4 text-indigo-600"><FileText size={18} /><h3 className="font-bold uppercase tracking-widest text-xs">New Project</h3></div>
                  <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="Your Video Title" className="w-full bg-white p-3 rounded-xl border border-slate-200 mb-4" />
                  <textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} placeholder="Additional Nuances..." className="w-full bg-white p-3 rounded-xl border border-slate-200 h-24 resize-none text-sm" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4 text-indigo-600"><Youtube size={18} /><h3 className="font-bold uppercase tracking-widest text-xs">Source Reference</h3></div>
                  <input type="text" placeholder="Source Title" value={sourceVideoTitle} onChange={(e) => setSourceVideoTitle(e.target.value)} className="w-full bg-white p-3 rounded-xl border border-slate-200 mb-4 text-sm" />
                  <textarea value={sourceDescription} onChange={(e) => setSourceDescription(e.target.value)} placeholder="Paste Source YouTube Description..." className="w-full bg-white p-3 rounded-xl border border-slate-200 h-44 resize-none text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste Transcript here..." className="flex-1 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none resize-none min-h-[300px] text-sm font-mono" />
                <button onClick={() => setStep(2)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2">Configure Assets <ArrowLeft className="rotate-180" size={18} /></button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 max-w-3xl mx-auto">
            <BackButton onClick={() => setStep(1)} />
            <h2 className="text-2xl font-bold mb-8">2. Visual Consistency</h2>
            <div className="space-y-6">
              <textarea value={characterRef} onChange={(e) => setCharacterRef(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 h-32 text-sm outline-none" />
              <div className="flex flex-col items-center gap-4">
                <label className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <ImageIcon className="mx-auto mb-2 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Upload Character Sheet</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                {characterImageBase64 && (
                  <div className="relative group w-40 h-40 rounded-xl overflow-hidden border border-slate-200 shadow-xl ring-4 ring-indigo-50">
                    <img src={characterImageBase64.previewUrl} alt="Reference" className="w-full h-full object-cover" />
                    <button onClick={() => setCharacterImageBase64(null)} className="absolute top-2 right-2 bg-white/90 rounded-full p-2 text-red-500 transition-all"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>
              <button onClick={analyzeAndGenerate} disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <Settings size={28} />} Run Full AI Workflow
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold">3. Generated Content</h2>
               <button onClick={engineerPrompts} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                 {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />} Generate Visual Prompts
               </button>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-400 uppercase font-black text-[10px] tracking-widest"><FileText size={14} /> Production Script</div>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 whitespace-pre-wrap h-[500px] overflow-y-auto font-serif text-lg">{generatedScript}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-400 uppercase font-black text-[10px] tracking-widest"><Youtube size={14} /> Video Description</div>
                <div className="bg-indigo-50/30 p-8 rounded-3xl border border-indigo-100 whitespace-pre-wrap h-[500px] overflow-y-auto text-sm text-slate-700 shadow-inner">{generatedVideoDescription}</div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-8">4. Visual Prompt Queue (35 Scenes)</h2>
            <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-4">
              {imagePrompts.map((p, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                  <button onClick={() => copyPrompt(p, i)} className="absolute top-4 right-4 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-indigo-50 transition-all">
                    {copiedIndex === i ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                  <p className="text-xs font-bold text-indigo-600 mb-2 uppercase">Scene {i+1}</p>
                  <div className="text-sm text-slate-700 leading-relaxed pr-12 whitespace-pre-wrap font-mono bg-white/50 p-4 rounded-lg border border-slate-100 italic">{p}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;