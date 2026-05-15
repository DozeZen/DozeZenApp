import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Settings, 
  Image as ImageIcon, 
  Download, 
  CheckCircle, 
  Loader2, 
  Clapperboard, 
  ArrowLeft,
  Trash2,
  AlertCircle,
  Copy
} from 'lucide-react';

// --- API Configuration ---
const apiKey = "AIzaSyBsG8HDaXR1OFCW1UrPio8jts7op3WhtrU"; // Environment handles this
const TEXT_MODEL = "gemini-2.5-flash-preview-09-2025";
const IMAGE_MODEL = "gemini-2.5-flash-image-preview"; // Fallback for Nano Banana Pro

const App = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [sourceVideoTitle, setSourceVideoTitle] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [transcript, setTranscript] = useState(`Part one, the kitchen table. You grow up in a house where money is not discussed because there is nothing to discuss. This is Gary, Indiana, 2001. Your father drives a forklift at a steel distribution center, days only because the night shift pays more and he bid for it three times and lost three times to men with more seniority and less reason to care. Your mother works the front desk at a dental office she will never be able to afford as a patient. She brings home the sample toothbrushes.

That is the extent of the dental benefit. You share a bedroom with your younger sister until you are 13. The wall between your room and the kitchen is thin enough that you hear the bills being sorted on Friday nights. The specific sound of envelopes being stac ked by urgency, which is a skill your parents developed without anyone teaching them. You are not poor enough for anyone to notice. That's the particular cruelty of your kind of broke. Not homeless. Not hungry. Not

technically. You're the kid whose shoes are almost right, whose jacket is close enough, who has learned to laugh at exactly the right moments so nobody looks too carefully. At school, you are sharp, dangerously sharp. Your economics teacher, Mr. Beaumont, Vietnam vet, reads three newspapers before class, keeps a coffee mug that says world's okayest teacher without irony, tells you in eighth grade that you ask questions nobody your age asks. He means it as a compliment. You hear it as a distance

measurement. How far you already are from where you started, how much further you could go. You start reading about business the way other kids read about athletes. Not theory, mechanics. How companies actually work. Where the margins go. Why the same product costs three times as much depending on who's selling it and how they're selling it. By 16, you understand distribution economics better than most MBAs ever will. That knowledge sits in your chest like something that doesn't belong there

yet. You watch your father get passed over for a supervisor role he'd been doing informally for two years. The company hires someone from outside. Your father says nothing about it at dinner. Your mother asks if anyone wants more rice. You watch him reach for the rice and understand with a clarity that is much too heavy for a 16-year-old, that the system was not designed with your father in mind. You decide, sitting at that table, that you will learn the system well enough to

build one of your own. Part two, the mentor. His name is Calvin Marsh. He is 31 and already worth $22 million and he speaks at your high school's entrepreneurship day because his nephew goes there and he owed his sister a favor. He is the only person in the room who does not seem impressed by being in the room. Everyone else is half asleep. You are taking notes. After the assembly, you follow him to the parking lot. You don't plan it. Your feet just go. He's loading into a car that costs more than

everything in your house combined and you say, "What part of the speech was true?" He stops. He looks at you the way people look at something that moved when it wasn't supposed to. "Which part did you think wasn't?" "The part about passion. Nobody builds something real on passion. Passion is what you say when you don't want to explain the actual reason." He is quiet for a moment. Then he says, "You got a phone?" He sends you a Dropbox link, a folder of

market analysis documents, raw data, no narrative. The kind of thing someone dumps before a pitch meeting to see if the other person does their homework. "If you can tell me what's missing from these by Sunday, [music] text me." You find four gaps by Saturday morning. You text him all four. He calls you back in 11 minutes. For 18 months, you are his unpaid research assistant, which is probably exploitation and almost certainly the best education available to someone who

can't afford the alternative. You work weekends. You build models nobody asked for. You learn that the people who do work nobody asked for are the ones who eventually get asked for everything. Calvin's office is a converted floor of a building in Indianapolis that smells like old carpet and ambition in proportions that keep changing. Six people, mismatched chairs, a whiteboard that has never once been fully erased. You take a bus two hours each way. You bring food from home because you've

done the math on what three years of small expenses costs at 8% compounded and the number changed how you look at vending machines permanently. His head of operations is a woman named Teresa. Logistics background, speaks in constraints, runs on bad coffee, has an answer for every problem before you finish describing it. Teresa teaches you something Calvin never could. How to see a business as a system of dependencies. Which parts break first, which parts look broken but aren't, where the actual leverage lives

versus where people think it does. You learn more in that office than four years of college would have taught you. You know this because you also do four years of college. Partial scholarship, business and computer science, working the Indianapolis job in parallel, sleeping five hours a night, living entirely in the distance between what you are and what you are trying to become. There is a version of your early 20s that other people have. Weekends that belong to themselves. Relationships without expiration dates. The specific

freedom of not calculating the opportunity cost of every hour. You watch it happen around you and feel not envy, something more specific. The recognition that you are choosing and that the thing you are choosing over is a kind of ordinary you will spend the rest of your life trying to remember clearly. You don't regret it. Not yet. At 20, sacrifice still feels like strategy. Part three, the execution. You are 21. You have an idea. Not a startup idea. Everyone has those.

A specific, operational, unglamorous idea about how mid-market logistics companies hemorrhage 15 to 20% of their margin on fragmented last-mile contracting and how a software layer that standardizes those contracts and automates the renegotiation cycles could capture half that margin for whoever builds it first. You have mapped it. You have a working prototype built over eight months in a two-bedroom apartment you share with a classmate who asks almost no questions.

You show Calvin. He offers to fund it. $150,000 for 35%. You say no. You have never said no to Calvin Marsh. The word arrives before the decision does. 35% is too much. You've run the dilution math across four funding scenarios and 35% at seed means you own nothing meaningful by series B. It costs everything at scale. Calvin looks at you for a moment, then he smiles. Not warmly, but with the specific professional respect of someone who has just been beaten at something. "You're going to need more than $150,000 anyway." "I know." You finish your degree because you are three months from the end and your mother would not forgive an incomplete. You graduate on a Saturday. You incorporate on Monday. You call your father from the parking lot after the ceremony. He is quiet for a long time. Then he says, "Okay." One word. The weight of every skipped promotion and every sorted envelope. You name the company something plain.

Names don't matter. Execution matters. Margins matter. The line gets crossed in a parking lot, in a phone call, in a single word from a man who counted every quarter. It always does. You raise $1.8 million from four angels. You give up 14%. You spend seven months making the product work before you charge a single dollar for it, which means by the time you price it, you already know it works. And pricing it correctly is the first thing you do right that nobody taught you. You

price high. High signals certainty. You close more contracts in the following quarter than you did in the preceding year. The product works. That sounds obvious. It is not obvious. Most products don't work. Series A, series B. Each round a negotiation and each negotiation is a test of how badly you need the money. The best time to raise is when you don't need it, which means the system rewards people who already have enough. You file that away. You don't examine it too closely.

You can't afford to examine it too closely yet. By 24, you have 180 employees. By 25, you have 480. You stop knowing everyone's name somewhere around 250 and this bothers you more than you say out loud to anyone. The acquisition offer arrives on a Tuesday. $2.9 billion. You take it. You are 26 years old and the wire clears on a Thursday afternoon. And you look at at the number on your phone for about 40 seconds. And then you set the phone face down on the kitchen counter. And you stand at the window of your

apartment in a city that does not know or care what just happened. Part four, the hum. It doesn't feel like anything. You expected something. Arrival, completion, the exhale of a man who has been holding his breath since a kitchen table in Gary, Indiana. Instead, there is a low, directionless hum, like a television left on in another room. You wait for something else to arrive. Some second wave, some delayed feeling proportionate to the number. You give it an hour. You call Teresa. She says

congratulations and you both laugh awkwardly for 30 seconds and hang up. The hum doesn't change. You had thought this was the end of something. You were wrong about what it was the end of. You buy your parents a house. Your father walks through every room twice, touching the walls, not saying much. Your mother stands in the kitchen and cries without trying to stop. This is the only moment in the entire year that feels proportionate to what happened. Everything else is lawyers,

board seats, security protocols, a communications manager who reviews everything you say publicly, an assistant who manages everything privately. You check the exits in every room automatically now, without deciding to. Part five, the sister. You fly home for Thanksgiving. Your sister picks you up in her 2011 Hyundai. She teaches middle school. She seems fine, genuinely, uncomplicatedly fine. On the drive, she plays a song from when you were both kids. She sings along badly,

unselfconsciously, the way you sing when there's no audience. You realize sitting there that you cannot remember the last time you did anything without an audience, without calculating the signal of it,  the cost of it, the way it would read to someone watching. Every conversation is a positioning exercise. Every dinner is a relationship maintenance decision. Every minute is a resource allocation. Your sister is singing badly to a song from 2007. You look out the window at the flat

Indiana landscape, gray November sky, strip malls, the specific Midwestern emptiness that used to feel like a ceiling and now feels like something you cannot name. Something in your chest moves, not breaks. Moves, like furniture shifted an inch. You don't sing along. You've forgotten the words. That's the part that stays with you. They install a professional CEO 14 months after the acquisition. Technically, you agreed to it. You signed the paperwork. But the acquiring company made clear, in

the polite way that power makes things clear, that a founder running a nearly $3 billion integration is a risk profile they weren't underwriting.  You become chief strategy officer. The title means, we will put you in front of investors and you will make  the business sound inevitable. You watch the product get remade. Features deprecated for portfolio alignment, pricing restructured in ways that punish the mid-market customers you built the thing for. The culture

rebranded into the language of culture without any of the content. What you lose is not the control. You expected to lose the control. What you lose is the specific feeling of watching something become what it was supposed to be. The iteration. The problem that finally gives, the late-night moment when a thing that didn't work yesterday works today, and the only people who know are the four of you in the room. That process, that was the only part that ever felt real. Now it belongs to someone else.

And you have to sit in glass-walled offices and say nothing because you signed the paperwork. You were never the company. You were the origin story. Origin stories are useful for press releases. They don't run the quarterly business review. You resign on a Wednesday, mutual language, stock fully vested, number unchanged. This is the collapse, not poverty, not failure, just irrelevance. The specific modern violence of becoming optional inside

something you built. Part six, the engine. You try stopping. Three months. House in Nashville, money you will never need to touch, mornings with no meetings. You take walks. You read books you've been meaning to read for five years. You have dinner with people who have nothing to do with anything you've built. It is the most uncomfortable you have ever been because the hunger doesn't know what to do with comfort. It was built on the kitchen table in Gary, on the sorted envelopes, on your

father's face when the supervisor job went to someone else. It was built to solve a problem. And the problem is solved now. The house exists, the retirement exists, the forklift shift is done. But the hunger doesn't know that. The hunger is still running. It doesn't check the account balance. It just runs. Six months after you resign, you incorporate again. New city, new problem. Smarter this time, leaner, built on everything the first one cost you.

The seed round closes in nine days. At the first all-hands, 43 people are looking at you and you feel the hum again, low, directionless, the television in the other room. You are 28 years old. You have done this twice. You will do it again. You already know. You are in a board meeting. New table, new city, someone presenting numbers you've already reviewed. You're supposed to be listening. Instead, you are thinking about your father at the kitchen sink, icing his back after a double shift he didn't

choose to work. You have given him everything he didn't have. The house, the retirement, the ability to say no to a shift. You solved the problem you decided to solve at 16, sitting at that table, watching him reach for the rice. He is proud of you, genuinely, without complication, in the way that only someone who never wanted this for himself can be proud of someone who did. But you cannot remember the last time you felt what he feels. That

sufficiency. The ability to sit at a table and feel like the table is enough. The thing that made you valuable, the relentlessness, the refusal to be satisfied, the hunger that outlasted the poverty that built it, is the same thing that makes every arrival feel like nothing. The wound doesn't close when the money comes. The wound is the engine. Close it and you stop. You are 28 and you already know you will not stop it. You just wanted it to know, once, that you knew. Somewhere in Gary right now, a 16-year-old is sitting in a school assembly. Most of the room is asleep. Someone in an expensive car is explaining success in the version that makes the room feel safe. The kid is taking notes. He doesn't know yet what he's really writing down. He thinks he's learning how to get out. He doesn't know yet that getting out and getting free are different destinations and that the distance between them is the part nobody puts in the speech. After the assembly, his legs will carry him somewhere before he decides to go.

The door is about to open. It always does.`);
  const [generatedScript, setGeneratedScript] = useState("");
  const [characterRef, setCharacterRef] = useState("Young adult male, wearing outfit that is appropriate for the setting and time period, no hair, neutral expression, slightly slimmer build, calm personality, recognizable protagonist design.");
  const [characterImageBase64, setCharacterImageBase64] = useState(null);
  const [imagePrompts, setImagePrompts] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [genProgress, setGenProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // --- API Utilities ---
  const callGemini = async (prompt, systemInstruction = "", useSearch = false, imageData = null) => {
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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
          throw new Error("No text returned in the API response.");
        }
        return generatedText;
      } catch (error) {
        console.error(`Gemini API attempt ${retries + 1} failed:`, error);
        // Fail instantly for authentication or bad request errors instead of retrying
        if (error.message.includes("API Error (400)") || error.message.includes("API Error (401)") || error.message.includes("API Error (403)") || error.message.includes("API Error (404)")) {
            throw error;
        }
        if (retries === maxRetries) throw error;
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(res => setTimeout(res, delay));
        retries++;
      }
    }
  };

  const generateImage = async (promptText) => {
    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image API Error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (!base64) throw new Error("No image data returned from model.");
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error("Image generation error:", error);
      return null;
    }
  };

  // --- Workflow Logic ---

  const analyzeAndGenerate = async () => {
    setLoading(true);
    try {
      const systemPrompt = `You are a professional scriptwriter. Analyze the provided transcript and its original title for tone, style, and pacing. Then write a new script for a video titled "${videoTitle}" that matches that style and tone perfectly. Ensure the script is structured for an 8-minute video.`;
      
      let userPrompt = `Original Source Video Title: ${sourceVideoTitle}\nSource Transcript: ${transcript}\n\nTarget Title: ${videoTitle}`;
      if (additionalDetails && additionalDetails.trim() !== "") {
        userPrompt += `\n\nAdditional Content/Instructions to Include:\n${additionalDetails}`;
      }
      
      const script = await callGemini(userPrompt, systemPrompt);
      setGeneratedScript(script);
      setStep(3);
    } catch (e) {
      console.error("analyzeAndGenerate error:", e);
      alert(`Generation failed:\n\n${e.message}\n\n(Did you forget to add your API key in the code?)`);
    } finally {
      setLoading(false);
    }
  };

  const engineerPrompts = async () => {
    setLoading(true);
    try {
      const systemPrompt = `Based on the video script, generate 35 detailed visual scene descriptions for image generation. Each scene should represent a specific moment in the video.
      
      CRITICAL INSTRUCTION: You MUST output the exact boilerplate text below for EVERY SINGLE PROMPT. Do not summarize or omit the style descriptions. Replace the bracketed tags (like [Camera Composition] or [Actions]) with the specific details for that scene. Number each prompt (e.g., "1.", "2.").

      REQUIRED EXACT TEMPLATE FOR EVERY PROMPT:
      [Camera Composition], [Location], [Time Period], [Time of Day (Optional)], [Architectural/Environmental Details (Optional)]. 
      Clean cinematic minimalist prehistoric illustration style, simplified digital cartoon aesthetic, soft cel shading, muted earthy palette, atmospheric firelight, uncluttered composition, sharp polished vector-like rendering, modern explainer-animation look, simple geometric environments.

      All characters should have a minimalist cinematic cartoon character design with oversized smooth circular heads, tiny oval black eyes, simple mouth lines, clean back outlines, soft cel shading, simplified anatomy, rounded limbs, modern explainer-animation aesthetic, subtle fabric folds, muted/desaturated color palette, polished digital illustration, clean vector-like appearance, atmospheric lighting, uncluttered design.

      Main Character: ${characterRef} ${characterImageBase64 ? '(Note: Align descriptions with the provided character reference image if applicable)' : ''}

      [Main Character Outfit Consistency]
      [Actions of main Character]

      [Include the following block ONLY IF the scene has background characters]:
      [Appropriate # of Background Characters] Background Characters. Background Characters should follow the exact same character design language and anatomy proportions as the Main Character, but vary in clothing, hairstyle, body shapes, age, accessories, and facial expressions. Include men, women, elderly people, children, workers, soldiers, merchants, peasants, nobles, etc depending on the setting and time period. Maintain the same minimalist rounded-head aesthetic and clean cinematic illustration style. 

      [Actions of Background Characters]`;

      const result = await callGemini(`Generate 35 visual prompts for this script: ${generatedScript}`, systemPrompt, false, characterImageBase64);
      
      // Parse prompts - assuming AI returns a list or numbered segments
      const parsedPrompts = result.split(/\d+\./).filter(p => p.trim().length > 50).map(p => p.trim());
      setImagePrompts(parsedPrompts.slice(0, 35));
      setStep(4);
    } catch (e) {
      console.error("engineerPrompts error:", e);
      alert(`Prompt engineering failed:\n\n${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startBatchGeneration = async () => {
    setLoading(true);
    try {
      const images = [];
      for (let i = 0; i < imagePrompts.length; i++) {
        const img = await generateImage(imagePrompts[i]);
        if (img) images.push(img);
        setGenProgress(Math.round(((i + 1) / imagePrompts.length) * 100));
        setGeneratedImages([...images]);
      }
      setStep(5);
    } catch (e) {
      console.error("Batch generation error:", e);
      alert(`Image batch generation failed:\n\n${e.message}`);
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
    try {
      document.execCommand('copy');
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  // --- UI Components ---

  const BackButton = ({ onClick }) => (
    <button 
      onClick={onClick}
      disabled={loading}
      className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider"
    >
      <ArrowLeft size={16} /> Back
    </button>
  );

  const StepIndicator = () => (
    <div className="flex justify-between mb-8 max-w-4xl mx-auto px-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col items-center relative z-10 w-full">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            step >= i ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
          } ${step === i ? 'ring-4 ring-indigo-100' : ''}`}>
            {step > i ? <CheckCircle size={20} /> : i}
          </div>
          <span className="text-[9px] uppercase tracking-wider mt-2 font-bold text-slate-500 text-center">
            {['Source', 'Settings', 'Script', 'Prompts', 'Visuals'][i-1]}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Clapperboard size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic">DozeZen<span className="text-indigo-600">Workflow</span></h1>
        </div>
        <div className="text-xs text-slate-400 font-medium">WORKFLOW ENHANCEMENT SUITE</div>
      </header>

      <StepIndicator />

      <main className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px]">
        
        {/* Step 1: Source Content */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Source Transcript & Target Title</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Your New Video Title</h3>
                  <p className="text-slate-500 text-sm mb-4">What will your newly generated video be called? The script will be tailored to match this topic.</p>
                  <input 
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter your new video title..."
                    className="w-full bg-white p-4 rounded-xl border border-slate-200 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Additional Details <span className="text-slate-400 text-sm font-normal">(Optional)</span></h3>
                  <p className="text-slate-500 text-sm mb-4">Any specific facts, talking points, or structural changes to include in the script?</p>
                  <textarea 
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="e.g., Make sure to mention that ancient humans slept in segments, not 8 hours straight..."
                    className="w-full bg-white p-4 rounded-xl border border-slate-200 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[120px]"
                  />
                </div>
              </div>
              <div className="space-y-4 flex flex-col">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">Source Video Title</h3>
                  <input 
                    type="text"
                    value={sourceVideoTitle}
                    onChange={(e) => setSourceVideoTitle(e.target.value)}
                    placeholder="Enter the title of the original source video..."
                    className="w-full bg-white p-3 rounded-xl border border-slate-200 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <textarea 
                    className="w-full flex-1 p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 outline-none focus:border-indigo-400 min-h-[220px] text-sm resize-none"
                    placeholder="Paste or review the transcript of the video you want to emulate here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                  />
                </div>
                <button 
                  disabled={!transcript || !videoTitle || loading}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                >
                  Continue to Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Analysis & References */}
        {step === 2 && (
          <div className="p-8 max-w-3xl mx-auto">
            <BackButton onClick={() => setStep(1)} />
            <h2 className="text-2xl font-bold mb-2">Character Consistency</h2>
            <p className="text-slate-500 mb-8 text-sm">Define your main character once. We'll inject this into every image prompt to ensure consistency across the video.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Main Character Reference</label>
                <textarea 
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 h-32 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={characterRef}
                  onChange={(e) => setCharacterRef(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Character Image Reference (Optional)</label>
                <div className="flex items-center gap-4">
                   <label className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all bg-slate-50">
                      <ImageIcon size={24} className="text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-slate-600">Click to upload reference sheet</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                   </label>
                   {characterImageBase64 && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                         <img src={characterImageBase64.previewUrl} alt="Reference" className="w-full h-full object-cover" />
                         <button 
                            onClick={() => setCharacterImageBase64(null)} 
                            className="absolute top-1 right-1 bg-white/90 rounded-full p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                         >
                            <Trash2 size={14}/>
                         </button>
                      </div>
                   )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-4 items-start">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">The AI will now analyze your source transcript and rewrite it for "{videoTitle}" while preparing visual prompts in your prehistoric minimalist style.</p>
              </div>

              <button 
                onClick={analyzeAndGenerate}
                disabled={loading}
                className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Settings size={24} />}
                Start Full AI Workflow
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review Script */}
        {step === 3 && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <BackButton onClick={() => setStep(2)} />
                <h2 className="text-2xl font-bold mt-2">Generated Script</h2>
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[400px] overflow-y-auto text-lg leading-relaxed font-serif">
              {generatedScript}
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={engineerPrompts}
                disabled={loading}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                Engineer 35 Visual Prompts
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Visual Prompts & Gen Setup */}
        {step === 4 && (
          <div className="p-8">
             <div className="flex items-center justify-between mb-8">
              <div>
                <BackButton onClick={() => setStep(3)} />
                <h2 className="text-2xl font-bold mt-2">Visual Production Queue</h2>
                <p className="text-slate-500 text-sm">We've generated {imagePrompts.length} scene prompts. Review them before batch processing.</p>
              </div>
              <button 
                onClick={startBatchGeneration}
                disabled={loading}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                Generate {imagePrompts.length} Images
              </button>
            </div>

            {loading && (
              <div className="mb-8 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex justify-between text-xs font-black text-indigo-600 mb-2">
                  <span>BATCH PRODUCTION IN PROGRESS</span>
                  <span>{genProgress}%</span>
                </div>
                <div className="h-3 bg-indigo-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500" 
                    style={{width: `${genProgress}%`}}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto pr-4">
              {imagePrompts.map((prompt, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm leading-relaxed relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black">{idx+1}</div>
                    <button 
                      onClick={() => copyPrompt(prompt, idx)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      {copiedIndex === idx ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copiedIndex === idx ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-700">{prompt}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Final Results */}
        {step === 5 && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <BackButton onClick={() => setStep(4)} />
                <h2 className="text-2xl font-bold mt-2">Production Assets</h2>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200"
                >
                  <Download size={18} /> Export Project
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700"
                >
                  New Project
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedImages.map((img, idx) => (
                <div key={idx} className="group relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                  <img src={img} alt={`Scene ${idx+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">Scene {idx+1}</span>
                  </div>
                </div>
              ))}
              {loading && Array(4).fill(0).map((_, i) => (
                 <div key={`load-${i}`} className="aspect-video bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 border-dashed animate-pulse">
                    <ImageIcon size={24} className="text-slate-300" />
                 </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-center text-slate-400 text-xs font-medium">
        Designed for High-Volume Content Production • Character Consistency Engine v1.0
      </footer>
    </div>
  );
};

export default App;