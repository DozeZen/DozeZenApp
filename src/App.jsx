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
  Copy,
  Video,
  Info,
  Sparkles,
  RefreshCw,
  Tag,
  Play,
  Star,
  Save,
  FolderOpen,
  Key,
  X
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore';

// --- API Configuration ---
const apiKey = ""; // Leave empty for Canvas environment proxy to work!
const TEXT_MODEL = "gemini-3.1-pro-preview"; 
const IMAGE_GEN_MODEL = "imagen-4.0-generate-001"; 
const IMAGE_REF_MODEL = "gemini-2.5-flash-image";

// --- Firebase Initialization ---
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'dozezen-app';

try {
  let configObj = null;
  // 1. Try Canvas injected config (Works here in this environment)
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    configObj = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
  } 
  // 2. Hardcoded Config
  else {
    configObj = {
      apiKey: ["AIzaSy", "Bd3RJNXltu_CxRt", "jiU25pk_S0oItzUbBU"].join(""),
      authDomain: "dozezen-3faf3.firebaseapp.com",
      projectId: "dozezen-3faf3",
      storageBucket: "dozezen-3faf3.firebasestorage.app",
      messagingSenderId: "307885983458",
      appId: "1:307885983458:web:7d8b994d122b9622d540bb"
    };
  }

  // Only initialize if the config is actually filled out (prevents errors if left as default placeholder)
  if (configObj && configObj.apiKey && configObj.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(configObj);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase init failed. Please check your config.", e);
}

// --- SEO Helper Component ---
const SeoIndicator = ({ type, text }) => {
  const len = (text || "").length;
  let color = "text-slate-400";
  let bgClass = "bg-slate-400";
  let message = "";
  let score = 0; // 0 to 100

  if (type === "title") {
     if (len === 0) { 
       color = "text-slate-400"; bgClass = "bg-slate-400"; message = "0/70"; score = 0; 
     } else if (len < 40) { 
       color = "text-amber-500"; bgClass = "bg-amber-500"; message = `${len}/70 - Too short for SEO`; score = 50; 
     } else if (len <= 70) { 
       color = "text-green-500"; bgClass = "bg-green-500"; message = `${len}/70 - Optimal length`; score = 100; 
     } else { 
       color = "text-red-500"; bgClass = "bg-red-500"; message = `${len}/70 - Too long, will truncate`; score = 30;
     }
  } else if (type === "description") {
     if (len === 0) { 
       color = "text-slate-400"; bgClass = "bg-slate-400"; message = "0/5000"; score = 0; 
     } else if (len < 200) { 
       color = "text-amber-500"; bgClass = "bg-amber-500"; message = `${len} chars - Needs more detail`; score = 40;
     } else {
        const hasHashtags = (text || "").includes('#');
        if (hasHashtags) { 
          color = "text-green-500"; bgClass = "bg-green-500"; message = `${len} chars - Excellent SEO & Hashtags`; score = 100;
        } else { 
          color = "text-blue-500"; bgClass = "bg-blue-500"; message = `${len} chars - Good length (Add #tags)`; score = 80;
        }
     }
  }

  return (
    <div className="flex items-center gap-3 mt-1.5 mb-3 w-full">
       <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-[150px] sm:max-w-[200px]">
          <div className={`h-full ${bgClass} transition-all duration-300 ease-out`} style={{ width: `${Math.max(5, score)}%`}}></div>
       </div>
       <span className={`text-[10px] sm:text-xs font-bold ${color}`}>{message}</span>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Auth & Cloud State
  const [user, setUser] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("dozezen_api_key") || "");
  
  // Persist API Key to Browser Local Storage
  useEffect(() => {
    if (customApiKey) {
      localStorage.setItem("dozezen_api_key", customApiKey);
    } else {
      localStorage.removeItem("dozezen_api_key");
    }
  }, [customApiKey]);

  // Input States
  const fallbackTitles = [
    "What did Ancient Humans Do At Night?",
    "Why Do Modern Humans Fear the Dark?",
    "Who was the First Human That Discovered Fire?",
    "Humans Used To Walk on All Fours: The True Story",
    "The Terrifying Reason We Are The Last Human Species Alive"
  ];
  const [videoTitle, setVideoTitle] = useState(() => fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)]);
  const [topicLoading, setTopicLoading] = useState(false);
  
  const [sourceVideoTitle, setSourceVideoTitle] = useState("POV: You Are a Billionaire at 25 | What It ACTUALLY Feels Like?");
  const [sourceDescription, setSourceDescription] = useState(`You thought becoming rich would change everything.
It didn’t.
This POV story from Finance Expl. follows what happens when you escape the system… but never escape yourself.

You grow up with nothing.
Not poor enough to be noticed.
Not comfortable enough to relax.
Just enough pressure to build something.

You learn the system.
You build faster than anyone expects.
You scale.
You win.
By 25, you’re a billionaire.

And then something strange happens.
Nothing.
No arrival.
No relief.
No moment where it all finally makes sense.

On Finance Expl., we break down the psychology behind money, power, and financial systems — not just how people get rich, but what it actually does to them.

Because this isn’t a story about wealth.
It’s about what happens when the thing that made you successful… never turns off.

You solved the problem. But the engine is still running.

So the real question is:
If the hunger never leaves…
Were you ever trying to get rich?
Or just trying to fix something that money can’t touch?

________________________________________#POV #Wealth #Billionaire #MoneyPsychology #FinanceExpl #Success`);
  const [additionalDetails, setAdditionalDetails] = useState("Include elements that are educational or informative. The script should be between 700-900 words long.");
  const [transcript, setTranscript] = useState(`Part one, the kitchen table. You grow up in a house where money is not discussed because there is nothing to discuss. This is Gary, Indiana, 2001. Your father drives a forklift at a steel distribution center, days only because the night shift pays more and he bid for it three times and lost three times to men with more seniority and less reason to care. Your mother works the front desk at a dental office she will never be able to afford as a patient. She brings home the sample toothbrushes.

That is the extent of the dental benefit. You share a bedroom with your younger sister until you are 13. The wall between your room and the kitchen is thin enough that you hear the bills being sorted on Friday nights. The specific sound of envelopes being stac ked by urgency, which is a skill your parents developed without anyone teaching them. You are not poor enough for anyone to notice. That's the particular cruelty of your kind of broke. Not homeless. Not hungry. Not

technically. You're the kid whose shoes are almost right, whose jacket is close enough, who has learned to laugh at exactly the right moments so nobody looks too carefully. At school, you are sharp, dangerously sharp. Your economics teacher, Mr. Beaumont, Vietnam vet, reads three newspapers before class, keeps a coffee mug that says world's okayest teacher without irony, tells you in eighth grade that you ask questions nobody your age asks. He means it as a compliment. You hear it as a distance

measurement. How far you already are from where you started, how much further you could go. You start reading about business the way other kids read about athletes. Not theory, mechanics. How companies actually work. Where the margins go. Why the same product costs three times as much depending on who's selling it and how they're selling it. By 16, you understand distribution economics better than most MBAs ever will. That knowledge sits in your chest like something that doesn't belong there

yet. You watch your father get passed over for a supervisor role he'd been doing informally for two years. The company hires someone from outside. Your father says nothing about it at dinner. Your mother asks if anyone wants more rice. You watch him reach for the rice and understand with a clarity that is much too heavy for a 16-year-old, that the system was not designed with your father in mind. You decide, sitting at that table, that you will learn the system well enough to

build one of your own. Part two, the mentor. His name is Calvin Marsh. His age is 31 and already worth $22 million and he speaks at your high school's entrepreneurship day because his nephew goes there and he owed his sister a favor. He is the only person in the room who does not seem impressed by being in the room. Everyone else is half asleep. You are taking notes. After the assembly, you follow him to the parking lot. You don't plan it. Your feet just go. He's loading into a car that costs more than

everything in your house combined and you say, "What part of the speech was true?" He stops. He looks at you the way people look at something that moved when it wasn't supposed to. "Which part did you think wasn't?" "The part about passion. Nobody builds something real on passion. Passion is what you say when you don't want to explain the actual reason." He is quiet for a moment. Then he says, "You got a phone?" He sends you a Dropbox link, a folder of

market analysis documents, raw data, no narrative. The kind of thing someone dumps before a pitch meeting to see if the other person does their homework. "If you can tell me what's missing from these by Sunday, text me." You find four gaps by Saturday morning. You text him all four. He calls you back in 11 minutes. For 18 months, you are his unpaid research assistant, which is probably exploitation and almost certainly the best education available to someone who

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

Indiana landscape, gray November sky, strip malls, the specific Midwestern emptiness that used to feel like a ceiling and now feels like something you cannot name. Something in your chest moves, not breaks. Moves, like furniture shifted an inch. You don't splits along. You've forgotten the words. That's the part that stays with you. They install a professional CEO 14 months after the acquisition. Technically, you agreed to it. You signed the paperwork. But the acquiring company made clear, in

the polite way that power makes things clear, that a founder running a nearly $3 billion integration is a risk profile they weren't underwriting.  You become chief strategy officer. The title means, we will put you in front of investors and you will make  the business sound inevitable. You watch the product get remade. Features deprecated for portfolio alignment, pricing restructured in ways that punish the mid-market customers you built the thing for. The culture

rebranded into the language of culture without any of the content. What you lose is not the control. You expected to lose the control. What you lose is the specific feeling of watching something become what it was supposed to be. The iteration. The problem that finally gives, the late-night moment when a thing that didn't work yesterday works today, and the only people who know are the four of you in the room. That process, that was the only part that ever felt real. Now it belongs to someone else.

And you have to sit in glass-walled offices and say nothing because you signed the paperwork. You were never the company. You were the origin story. origin stories are useful for press releases. They don't run the quarterly business review. You resign on a Wednesday, mutual language, stock fully vested, number unchanged. This is the collapse, not poverty, not failure, just irrelevance. The specific modern violence of becoming optional inside

something you built. Part six, the engine. You try stopping. Three months. House in Nashville, money you will never need to touch, mornings with no meetings. You take walks. You read books you've been meaning to read for five years. You have dinner with people who have nothing to do with anything you've built. It is the most unprofessional you have ever been because the hunger doesn't know what to do with comfort. It was built on the kitchen table in Gary, on the sorted envelopes, on your

father's face when the supervisor job went to someone else. It was built to solve a problem. And the problem is solved now. The house exists, the retirement exists, the forklift shift is done. But the hunger doesn't know that. The hunger is still running. It doesn't check the account balance. It just runs. Six months after you resign, you incorporate again. New city, new problem. Smarter this time, leaner, built on everything the first one cost you.

The seed round closes in nine days. At the first all-hands, 43 people are looking at you and you feel the hum again, low, directionless, the television in the other room. You are 28 years old. You have done this twice. You will do it again. You already know. You are in a board meeting. New table, new city, someone presenting numbers you've already reviewed. You're supposed to be listening. Instead, you are thinking about your father at the kitchen sink, icing his back after a double shift he didn't

choose to work. You have given him everything he didn't have. The house, the retirement, the ability to say no to a shift. You solved the problem you decided to solve at 16, sitting at that table, watching him reach for the rice. He is proud of you, genuinely, without complication, in the way that only someone who never wanted this for himself can be proud of someone who did. But you cannot remember the last time you felt what he feels. That

sufficiency. The ability to sit at a table and feel like the table is enough. The thing that made you valuable, the relentlessness, the refusal to be satisfied, the hunger that outlasted the poverty that built it, is the same thing that makes every arrival feel like nothing. The wound doesn't close when the money comes. The wound is the engine. Close it and you stop. You are 28 and you already know you will not stop it. You just wanted it to know, once, that you knew. Somewhere in Gary right now, a 16-year-old is sitting in a school assembly. Most of the room is asleep. Someone in an expensive car is explaining success in the version that makes the room feel safe. The kid is taking notes. He doesn't know yet what he's really writing down. He thinks he's learning how to get out. He doesn't know yet that getting out and getting free are different destinations and that the distance between them is the part nobody puts in the speech. After the assembly, his legs will carry him somewhere before he decides to go.

The door is about to open. It always does.`);
  
  // Generated Content States
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedVideoDescription, setGeneratedVideoDescription] = useState("");
  const [generatedTags, setGeneratedTags] = useState("");
  const [characterRef, setCharacterRef] = useState("Young adult male, wearing outfit that is appropriate for the setting and time period, no hair, neutral expression, slightly slimmer build, calm personality, recognizable protagonist design.");
  const [characterImageBase64, setCharacterImageBase64] = useState(null);
  const [imagePrompts, setImagePrompts] = useState([]);
  const [copiedType, setCopiedType] = useState(null);
  const [genProgress, setGenProgress] = useState(0); 
  const progressInterval = useRef(null);

  // Image Generation States
  const [generatedImages, setGeneratedImages] = useState({});
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [batchGenLoading, setBatchGenLoading] = useState(false);

  // --- Auto-Load Reference Image from public folder ---
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetRatio = 16 / 9;
      const imgRatio = img.width / img.height;

      let canvasWidth = img.width;
      let canvasHeight = img.height;

      if (imgRatio < targetRatio) {
        canvasWidth = img.height * targetRatio;
      } else {
        canvasHeight = img.width / targetRatio;
      }

      // Cap the resolution to keep Base64 small enough for Firestore saving
      const MAX_WIDTH = 800;
      if (canvasWidth > MAX_WIDTH) {
         canvasHeight = Math.round(MAX_WIDTH / targetRatio);
         canvasWidth = MAX_WIDTH;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw image centered and scaled down if needed
      let drawWidth = img.width;
      let drawHeight = img.height;
      if (imgRatio < targetRatio && drawHeight > canvasHeight) {
          drawHeight = canvasHeight;
          drawWidth = drawHeight * imgRatio;
      } else if (imgRatio >= targetRatio && drawWidth > canvasWidth) {
          drawWidth = canvasWidth;
          drawHeight = drawWidth / imgRatio;
      }

      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;
      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64String = dataUrl.split(',')[1];
      
      setCharacterImageBase64({
        mimeType: 'image/jpeg',
        data: base64String,
        previewUrl: dataUrl
      });
    };
    img.onerror = () => {
      console.warn("Could not auto-load /reference.png. Please ensure the file is in your public directory or upload manually.");
    };
    img.src = './reference.png';
  }, []);

  // --- Firebase Auth & Projects Fetching ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth Error:", e);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const projectsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'projects');
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const projects = [];
      snapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
      // Sort in memory as per rules
      projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setSavedProjects(projects);
    }, (error) => {
      console.error("Projects sync error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const saveProjectToCloud = async () => {
    if (!user || !db) return alert("Cloud save unavailable. Please make sure you have added your hardcoded Firebase Config keys in App.jsx.");
    setLoading(true);
    try {
      const projectId = videoTitle.trim() ? videoTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase() : `project-${Date.now()}`;
      const projectRef = doc(db, 'artifacts', appId, 'users', user.uid, 'projects', projectId);
      
      const payload = {
        videoTitle,
        sourceVideoTitle,
        sourceDescription,
        additionalDetails,
        transcript: transcript.substring(0, 5000), // Cap size to ensure it fits in Firestore
        generatedScript,
        generatedVideoDescription,
        generatedTags,
        characterRef,
        characterImageBase64, // Reduced size via canvas
        imagePrompts,
        updatedAt: Date.now()
      };
      
      await setDoc(projectRef, payload);
      alert("Project saved successfully!");
    } catch (e) {
      alert("Error saving project: " + e.message);
    }
    setLoading(false);
  };

  const loadProject = (project) => {
    setVideoTitle(project.videoTitle || "");
    setSourceVideoTitle(project.sourceVideoTitle || "");
    setSourceDescription(project.sourceDescription || "");
    setAdditionalDetails(project.additionalDetails || "");
    setTranscript(project.transcript || "");
    setGeneratedScript(project.generatedScript || "");
    setGeneratedVideoDescription(project.generatedVideoDescription || "");
    setGeneratedTags(project.generatedTags || "");
    setCharacterRef(project.characterRef || "");
    setCharacterImageBase64(project.characterImageBase64 || null);
    setImagePrompts(project.imagePrompts || []);
    setShowProjectsModal(false);
    
    if (project.imagePrompts && project.imagePrompts.length > 0) {
      setStep(4);
    } else if (project.generatedScript) {
      setStep(3);
    } else {
      setStep(1);
    }
  };

  const deleteProject = async (projectId) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'projects', projectId));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  // --- Utility Functions ---
  const startProgress = () => {
    setGenProgress(0);
    progressInterval.current = setInterval(() => {
      setGenProgress(prev => prev + (95 - prev) * 0.05);
    }, 300);
  };

  const completeProgress = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setGenProgress(100);
  };

  const copyToClipboard = (text, type) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const getActiveApiKey = () => {
    return customApiKey || apiKey;
  };

  // --- API Utilities ---
  const callGemini = async (prompt, systemInstruction = "", useSearch = false, imageData = null) => {
    let retries = 0;
    const maxRetries = 5;
    const activeKey = getActiveApiKey();
    
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

        // Use public text model (gemini-3.1-pro-preview) instead of image model when an active key is provided
        const modelToUse = activeKey ? "gemini-3.1-pro-preview" : TEXT_MODEL;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${activeKey}`;

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
        
        if (!generatedText) {
          throw new Error("The API returned an empty result.");
        }
        return generatedText;
      } catch (error) {
        console.error("API Attempt Failed:", error);
        if (error.message.includes("400") || error.message.includes("401") || error.message.includes("403") || error.message.includes("404")) {
            throw error;
        }
        if (retries === maxRetries) throw new Error("API failed after maximum retries. " + error.message);
        await new Promise(res => setTimeout(res, Math.pow(2, retries) * 1000));
        retries++;
      }
    }
  };

  const callImageModel = async (promptText) => {
    let retries = 0;
    const maxRetries = 5;
    const activeKey = getActiveApiKey();
    
    const isImageToImage = characterImageBase64 && characterImageBase64.data;
    let modelToUse = isImageToImage ? IMAGE_REF_MODEL : IMAGE_GEN_MODEL;
    
    // Use public models if a custom API key is provided, otherwise use Canvas preview models
    if (activeKey) {
        modelToUse = isImageToImage ? "gemini-2.5-flash-image" : "imagen-4.0-generate-001";
    }
    
    while (retries <= maxRetries) {
      try {
        let response;
        if (isImageToImage) {
          const payload = {
            contents: [{ 
              role: "user",
              parts: [
                { text: `TASK: Generate a high-quality cinematic illustration. 
                CRITICAL INSTRUCTION FOR ASPECT RATIO: The final image MUST be horizontally wide, strictly in a 16:9 WIDESCREEN landscape format. Do NOT generate a vertical or square image.
                CRITICAL INSTRUCTION FOR CHARACTER OUTFIT: You MUST completely IGNORE the clothing, outfit, and background shown in the attached reference image. Use the reference image STRICTLY for the character's facial features, identity, and physical build. The character MUST be wearing the exact outfit and performing the exact action described in the SCENE DESCRIPTION below.
                SCENE DESCRIPTION: ${promptText}` },
                { inlineData: { mimeType: characterImageBase64.mimeType, data: characterImageBase64.data } }
              ] 
            }],
            generationConfig: { 
              responseModalities: ['TEXT', 'IMAGE']
            }
          };
          
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${activeKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`[${response.status}] ${err.error?.message || 'Consistency Gen Failed'}`);
          }
          
          const result = await response.json();
          const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
          if (!base64) throw new Error("Model failed to output an image part.");
          return `data:image/png;base64,${base64}`;
          
        } else {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:predict?key=${activeKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              instances: { prompt: promptText }, 
              parameters: { 
                sampleCount: 1,
                aspectRatio: "16:9"
              } 
            })
          });
          
          if (!response.ok) {
            const errorJson = await response.json().catch(() => ({}));
            throw new Error(errorJson.error?.message || `[${response.status}] Image Gen Failed`);
          }
          
          const result = await response.json();
          return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        }
      } catch (e) {
        if (e.message.includes("API Key") || e.message.includes("401") || e.message.includes("404")) throw e;
        if (retries === maxRetries) throw e;
        await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
        retries++;
      }
    }
  };

  // --- Workflow Logic ---

  const generateTrendingTopic = async () => {
    setTopicLoading(true);
    try {
      // Improved variety for topic generation
      const niches = [
        'History', 'Anthropology', 'Human Evolution',
        'Psychology of Wealth', 'Tech History',
        'Forgotten Mysteries', 'True Crime Economics',
        'Ancient Civilizations', 'Future Predictions',
        'Bizarre Science', 'Lost Empires'
      ];
      const randomNiche = niches[Math.floor(Math.random() * niches.length)];
      
      const prompt = `Act as an expert YouTube strategist. Research current viral trends in the '${randomNiche}' niche. Generate exactly ONE highly engaging, click-optimized YouTube video title that has high viral potential right now. To ensure variety, explore a unique, unexpected, or counter-intuitive angle (Random Seed: ${Math.random()}). Return ONLY the title text, nothing else. Do not use quotes.`;
      
      let freshTitle;
      try {
        freshTitle = await callGemini(prompt, "", true); 
      } catch (searchError) {
        console.warn("Search tool unavailable, using internal model knowledge instead.");
        freshTitle = await callGemini(prompt, "", false); 
      }

      setVideoTitle(freshTitle.replace(/^["']|["']$/g, "").trim());
    } catch (e) {
      alert("Could not research topic: " + e.message);
    }
    setTopicLoading(false);
  };

  const analyzeAndGenerate = async () => {
    setLoading(true);
    startProgress();
    try {
      const systemPrompt = `You are a professional, highly-paid YouTube strategist and human scriptwriter. 
      TASK 1: Write a highly engaging, original production script for a video titled "${videoTitle}". 
      
      CRITICAL SCRIPT INSTRUCTIONS:
      - Use the provided transcript STRICTLY as a loose thematic inspiration for the core message only. 
      - DO NOT copy its format, pacing, sentence structure, or wording. 
      - Create a completely fresh, unique narrative structure from scratch.
      - Write in a conversational, raw, human tone. 
      - AVOID all standard AI-sounding cliches (e.g., "in a world where", "delve into", "a testament to", "let's explore", etc.).
      - The script must be PLAIN SPOKEN TEXT ONLY. Do not include any production cues, stage directions, speaker names, or bracketed instructions.
      
      TASK 2: Write a compelling YouTube Video Description for this video by analyzing the "Source Description" provided. 
      DESCRIPTION REQUIREMENTS:
      - Match the tone and formatting style of the Source Description.
      - Include an engaging hook and concise summary.
      - List key talking points or timestamps.
      - ESSENTIAL: Include a [SOURCES] section with relevant citations BEFORE the hashtag keyword section.
      
      TASK 3: Generate a list of highly optimized, SEO-friendly YouTube tags based on the new script. Output them strictly as a comma-separated list.

      MANDATORY OUTPUT FORMAT:
      You MUST wrap your three distinct sections in the following exact XML tags. Do not output anything outside of these tags.
      
      <SCRIPT>
      [Your full script here]
      </SCRIPT>
      <DESCRIPTION>
      [Your full video description here]
      </DESCRIPTION>
      <TAGS>
      [Your comma-separated tags here]
      </TAGS>`;
      
      let userPrompt = `Target Title: ${videoTitle}\nSource Title: ${sourceVideoTitle}\nSource Description: ${sourceDescription}\nSource Transcript: ${transcript}\nAdditional Details: ${additionalDetails}`;
      
      const response = await callGemini(userPrompt, systemPrompt);
      
      // Highly robust XML Parsing Logic
      const scriptMatch = response.match(/<SCRIPT>([\s\S]*?)<\/SCRIPT>/i);
      const descMatch = response.match(/<DESCRIPTION>([\s\S]*?)<\/DESCRIPTION>/i);
      const tagsMatch = response.match(/<TAGS>([\s\S]*?)<\/TAGS>/i);
      
      let scriptText = scriptMatch ? scriptMatch[1].trim() : "";
      let descText = descMatch ? descMatch[1].trim() : "";
      let tagsText = tagsMatch ? tagsMatch[1].trim() : "";

      // Ultimate Fallback: Just in case the AI ignores XML and tries old format or markdown
      if (!scriptText && !descText && !tagsText) {
        const altScriptMatch = response.match(/---SCRIPT---([\s\S]*?)(?=---DESCRIPTION---|$)/i) || response.match(/SCRIPT:?\s*\n([\s\S]*?)(?=DESCRIPTION:?\s*\n|$)/i);
        const altDescMatch = response.match(/---DESCRIPTION---([\s\S]*?)(?=---TAGS---|$)/i) || response.match(/DESCRIPTION:?\s*\n([\s\S]*?)(?=TAGS:?\s*\n|$)/i);
        const altTagsMatch = response.match(/---TAGS---([\s\S]*)/i) || response.match(/TAGS:?\s*\n([\s\S]*)/i);

        scriptText = altScriptMatch ? altScriptMatch[1].trim() : "";
        descText = altDescMatch ? altDescMatch[1].trim() : "";
        tagsText = altTagsMatch ? altTagsMatch[1].trim() : "";

        if (!scriptText && !descText && !tagsText) {
             scriptText = response; // Dump entire raw response if total formatting failure
        }
      }
      
      setGeneratedScript(scriptText);
      setGeneratedVideoDescription(descText);
      setGeneratedTags(tagsText);
      
      completeProgress();
      setTimeout(() => {
        setStep(3);
        setLoading(false);
        setGenProgress(0);
      }, 500);
    } catch (e) {
      alert(`Workflow Failed:\n${e.message}`);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setLoading(false);
      setGenProgress(0);
    }
  };

  const engineerPrompts = async () => {
    if (!generatedScript) return;
    
    setLoading(true);
    startProgress();
    
    // Dynamic Scene Calculation: 10 images per 100 words, minimum 80.
    const wordCount = generatedScript.trim().split(/\s+/).length;
    const targetSceneCount = Math.max(80, Math.ceil((wordCount / 100) * 10));
    const totalPrompts = targetSceneCount + 1; // +1 for the Thumbnail
    
    try {
      const systemPrompt = `You are a visual director. Generate visual prompts based on the script pacing, PLUS ONE highly clickable YouTube Thumbnail prompt. 
      You must generate EXACTLY ${targetSceneCount} distinct scenes to match the length of the script, AND 1 final visual prompt designed specifically for the YouTube Thumbnail.
      Total prompts required: ${totalPrompts}.
      
      CRITICAL PACING & DISTRIBUTION INSTRUCTION: 
      - You MUST spread the first ${targetSceneCount} scenes evenly throughout the ENTIRE script, from the very first paragraph to the very last sentence. 
      - DO NOT cluster the visual prompts at the beginning. 
      - Calculate the pacing so that every part of the narrative (beginning, middle, and end) receives a proportionate number of visual scenes.
      - Follow the script chronologically.
      
      CRITICAL FORMATTING INSTRUCTION: You MUST output exactly ${totalPrompts} numbered items. Do not include any conversational text. Start directly with "1.".
      DO NOT be lazy. You MUST output the full text, including all boilerplate paragraphs, for ALL ${totalPrompts} prompts.
      
      Every single scene MUST follow this exact multi-paragraph template:

      SCRIPT: [Write the exact sentence or phrase from the generated script that this scene corresponds to]
      
      PROMPT: 
      [Camera Composition - NOTE: POV / first-person view from the character's perspective is acceptable and encouraged when appropriate], [Location], [Time Period], [Time of Day (Optional)], [Architectural/Environmental Details (Optional)]. 
      Clean cinematic minimalist prehistoric illustration style, simplified digital cartoon aesthetic, soft cel shading, muted earthy palette, atmospheric firelight, uncluttered composition, sharp polished vector-like rendering, modern explainer-animation look, simple geometric environments. HORIZONTAL 16:9 ASPECT RATIO.

      [MANDATORY INCLUSION - YOU MUST COPY AND PASTE THIS EXACT PARAGRAPH INTO EVERY SINGLE PROMPT REGARDLESS OF SCENE CONTENT:]
      All characters should have a minimalist cinematic cartoon character design with oversized smooth circular heads, tiny oval black eyes, simple mouth lines, clean back outlines, soft cel shading, simplified anatomy, rounded limbs, modern explainer-animation aesthetic, subtle fabric folds, muted/desaturated color palette, polished digital illustration, clean vector-like appearance, atmospheric lighting, uncluttered design.

      [MANDATORY INCLUSION - YOU MUST INCLUDE THESE EXACT SECTIONS IN EVERY SINGLE PROMPT REGARDLESS OF CHARACTER PRESENCE:]
      Main Character: ${characterRef}
      Main Character Consistency: Pure [Color] skin tone and [Body Size] body size. (NOTE: Replace [Color] with ONE specific descriptive color and [Body Size] with ONE specific body size, and use these exact words for all prompts).
      Main Character Outfit Consistency: [Describe the character's outfit consistency for this scene].
      Main Character Action: [Explicitly describe the specific actions the Main Character is performing in this scene].

      [IF BACKGROUND CHARACTERS ARE NEEDED FOR THE SCENE, YOU MUST EXPLICITLY INCLUDE THIS EXACT TEXT IN THE PROMPT:]
      Background Characters should follow the exact same character design language and anatomy proportions as the Main Character, but vary in clothing, hairstyle, body shapes, age, accessories, and facial expressions. Include men, women, elderly people, children, workers, soldiers, merchants, peasants, nobles, etc depending on the setting and time period. Maintain the same minimalist rounded-head aesthetic and clean cinematic illustration style. 
      [Appropriate # of Background Characters]
      Background Character Actions: [Explicitly describe the actions of the Background Characters]
      
      ---
      
      CRITICAL THUMBNAIL INSTRUCTION: 
      For the final prompt (Item ${totalPrompts}, the YouTube Thumbnail), use this EXACT format:
      SCRIPT: [YOUTUBE THUMBNAIL]
      PROMPT: [Design a highly engaging, expressive, and click-optimized thumbnail prompt. It MUST follow the EXACT SAME character consistency, stylistic rules, and mandatory text inclusions as the regular scenes, but the composition should be extremely eye-catching, high contrast, and typical of high-performing YouTube thumbnails with the subject large in the foreground.]`;

      const result = await callGemini(`Script: ${generatedScript}`, systemPrompt, false, characterImageBase64);
      
      const lines = result.split(/(?:\n|^)\d+\.\s*/);
      const parsedPrompts = lines
        .map(p => p.trim())
        .filter(p => p.length > 50)
        .map((block, index, arr) => {
          const scriptMatch = block.match(/SCRIPT:\s*([\s\S]*?)\nPROMPT:/i);
          const promptMatch = block.match(/PROMPT:\s*([\s\S]*)/i);
          
          const scriptText = scriptMatch ? scriptMatch[1].trim() : "Audio sync reference not found.";
          const promptText = promptMatch ? promptMatch[1].trim() : block.replace(/SCRIPT:[\s\S]*?PROMPT:/i, '').trim();
          
          // Check if this is the thumbnail scene
          const isThumbnail = scriptText.includes('[YOUTUBE THUMBNAIL]') || scriptText.toUpperCase().includes('THUMBNAIL');

          return { 
            script: scriptText, 
            prompt: promptText,
            isThumbnail: isThumbnail
          };
        });

      // Slice at totalPrompts to prevent overflow. 
      const finalPrompts = parsedPrompts.slice(0, totalPrompts);
      
      // Fallback: If AI forgot the exact [YOUTUBE THUMBNAIL] tag, forcefully designate the last one as thumbnail.
      if (finalPrompts.length > 0 && !finalPrompts.some(p => p.isThumbnail)) {
         finalPrompts[finalPrompts.length - 1].isThumbnail = true;
         finalPrompts[finalPrompts.length - 1].script = "[YOUTUBE THUMBNAIL]";
      }

      setImagePrompts(finalPrompts);
      
      completeProgress();
      setTimeout(() => {
        setStep(4);
        setLoading(false);
        setGenProgress(0);
      }, 500);
    } catch (e) {
      alert(`Prompt Engineering Failed: ${e.message}`);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setLoading(false);
      setGenProgress(0);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const targetRatio = 16 / 9;
          const imgRatio = img.width / img.height;

          let canvasWidth = img.width;
          let canvasHeight = img.height;

          if (imgRatio < targetRatio) {
            canvasWidth = img.height * targetRatio;
          } else {
            canvasHeight = img.width / targetRatio;
          }

          // Cap the resolution to keep Base64 small enough for Firestore saving
          const MAX_WIDTH = 800;
          if (canvasWidth > MAX_WIDTH) {
             canvasHeight = Math.round(MAX_WIDTH / targetRatio);
             canvasWidth = MAX_WIDTH;
          }

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext('2d');
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          
          // Draw image centered and scaled down if needed
          let drawWidth = img.width;
          let drawHeight = img.height;
          if (imgRatio < targetRatio && drawHeight > canvasHeight) {
              drawHeight = canvasHeight;
              drawWidth = drawHeight * imgRatio;
          } else if (imgRatio >= targetRatio && drawWidth > canvasWidth) {
              drawWidth = canvasWidth;
              drawHeight = drawWidth / imgRatio;
          }

          const x = (canvasWidth - drawWidth) / 2;
          const y = (canvasHeight - drawHeight) / 2;
          ctx.drawImage(img, x, y, drawWidth, drawHeight);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64String = dataUrl.split(',')[1];
          
          setCharacterImageBase64({
            mimeType: 'image/jpeg',
            data: base64String,
            previewUrl: dataUrl
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Image Gen Workflow ---

  const generateSingleImage = async (index) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: true }));
    try {
      const url = await callImageModel(imagePrompts[index].prompt);
      setGeneratedImages(prev => ({ ...prev, [index]: url }));
    } catch (e) {
      alert(`${imagePrompts[index].isThumbnail ? 'Thumbnail' : 'Scene ' + (index + 1)} Failed: ${e.message}`);
    } finally {
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const generateAllImages = async () => {
    setBatchGenLoading(true);
    for (let i = 0; i < imagePrompts.length; i++) {
      if (generatedImages[i]) continue; // Skip existing
      await generateSingleImage(i);
    }
    setBatchGenLoading(false);
  };

  const downloadImage = (url, index) => {
    const isThumb = imagePrompts[index].isThumbnail;
    const link = document.createElement('a');
    link.href = url;
    link.download = isThumb ? `youtube-thumbnail.png` : `scene-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    const readyIndexes = imagePrompts.map((_, i) => i).filter(i => generatedImages[i]);
    if (readyIndexes.length === 0) return alert("No images generated yet!");
    
    // Stagger downloads to prevent browser from blocking them as popup spam
    readyIndexes.forEach((index, queueOrder) => {
      setTimeout(() => {
        downloadImage(generatedImages[index], index);
      }, queueOrder * 350); 
    });
  };

  // --- UI Components ---
  const BackButton = ({ onClick, className = "" }) => (
    <button onClick={onClick} disabled={loading || batchGenLoading} className={`flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider shrink-0 disabled:opacity-50 ${className}`}>
      <ArrowLeft size={16} /> Back
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col relative">
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between mb-6 sm:mb-8 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-xl text-white"><Clapperboard className="w-5 h-5 sm:w-7 sm:h-7" /></div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight uppercase italic hidden sm:block">DozeZen<span className="text-indigo-600">Workflow</span></h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={saveProjectToCloud}
            disabled={loading}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-green-700 bg-green-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-green-200 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <Save size={16} className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="hidden sm:inline">Save Project</span><span className="sm:hidden">Save</span>
          </button>
          <button 
            onClick={() => setShowProjectsModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-600 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <FolderOpen size={16} className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">My Projects</span><span className="sm:hidden">Projects</span>
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-600 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Settings size={16} className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        {step === 1 && (
          <div className="p-4 sm:p-8 overflow-y-auto h-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Source Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4">
                <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2 uppercase text-[10px] sm:text-xs tracking-widest text-indigo-600">New Video Target</h3>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Video Title</label>
                    <button 
                      onClick={generateTrendingTopic} 
                      disabled={topicLoading}
                      className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 w-full sm:w-auto justify-start sm:justify-end"
                    >
                      {topicLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} 
                      {topicLoading ? 'Researching...' : 'AI Research Topic'}
                    </button>
                  </div>
                  <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="w-full bg-white p-3 rounded-xl border border-slate-200 shadow-sm outline-none mb-1 text-xs sm:text-sm font-semibold text-slate-800" />
                  <SeoIndicator type="title" text={videoTitle} />
                  
                  <label className="block text-[10px] font-black text-slate-400 mb-1 mt-3 uppercase">Additional Instructions</label>
                  <textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} className="w-full bg-white p-3 rounded-xl border border-slate-200 shadow-sm outline-none h-32 resize-none text-xs sm:text-sm" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 sm:p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3 text-indigo-600">
                    <Video size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                    <h3 className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">Competitive Reference</h3>
                  </div>
                  <label className="block text-[10px] font-black text-indigo-400 mb-1 uppercase">Source Video Title</label>
                  <input type="text" value={sourceVideoTitle} onChange={(e) => setSourceVideoTitle(e.target.value)} className="w-full bg-white p-3 rounded-xl border border-slate-200 outline-none mb-4 text-xs sm:text-sm font-medium" />
                  
                  <label className="block text-[10px] font-black text-indigo-400 mb-1 uppercase">Source Video Description</label>
                  <textarea 
                    value={sourceDescription} 
                    onChange={(e) => setSourceDescription(e.target.value)} 
                    placeholder="Paste the YouTube video description here to mimic style, sources, and keywords..." 
                    className="w-full bg-white p-3 rounded-xl border border-slate-200 outline-none h-40 resize-none text-xs sm:text-sm leading-relaxed" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-1 gap-2 px-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Transcript / Primary Research</label>
                  <a href="https://notegpt.io/youtube-transcript-generator" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                    Need Transcript? Get it here.
                  </a>
                </div>
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 outline-none resize-none min-h-[300px] font-mono text-[10px] sm:text-xs leading-relaxed" />
                <button onClick={() => setStep(2)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
                  Configure Visuals <ArrowLeft className="rotate-180" size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-4 sm:p-8 max-w-3xl mx-auto overflow-y-auto text-center flex flex-col justify-center min-h-full">
            <BackButton onClick={() => setStep(1)} className="mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Character Engine</h2>
            <div className="space-y-6">
              <textarea value={characterRef} onChange={(e) => setCharacterRef(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 h-32 text-xs sm:text-sm outline-none leading-relaxed" />
              
              <div className="flex flex-col items-center gap-4">
                <label className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <ImageIcon className="mx-auto mb-2 text-slate-400" />
                  <span className="text-xs sm:text-sm font-medium text-slate-600">Upload Character Reference Sheet</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>

                {characterImageBase64 && (
                  <div className="relative group w-48 h-27 rounded-xl overflow-hidden border border-slate-100 shadow-lg aspect-video bg-white flex items-center justify-center">
                    <img src={characterImageBase64.previewUrl} alt="Reference" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={() => setCharacterImageBase64(null)} 
                      className="absolute top-1 right-1 bg-white/90 rounded-full p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={analyzeAndGenerate} disabled={loading} className="w-full py-4 sm:py-6 bg-indigo-600 text-white rounded-2xl font-black text-base sm:text-lg hover:bg-indigo-700 flex items-center justify-center gap-3 transition-all active:scale-[0.98] relative overflow-hidden">
                  {loading && <div className="absolute left-0 top-0 bottom-0 bg-indigo-800 transition-all duration-300 z-0" style={{ width: `${genProgress}%` }} />}
                  <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                    {loading ? <Loader2 className="animate-spin w-5 h-5 sm:w-7 sm:h-7" /> : <Settings className="w-5 h-5 sm:w-7 sm:h-7" />} 
                    {loading ? `Processing... ${Math.round(genProgress)}%` : 'Run Full AI Workflow'}
                  </span>
                </button>

                {generatedScript && !loading && (
                  <button 
                    onClick={() => setStep(3)} 
                    className="w-full py-3 sm:py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm sm:text-base hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Generated Content <ArrowLeft className="rotate-180" size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 sm:p-8 flex flex-col h-full lg:overflow-hidden overflow-y-auto">
            <BackButton onClick={() => setStep(2)} className="mb-4 sm:mb-6" />
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8 w-full">
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                 <h2 className="text-xl sm:text-2xl font-bold">3. Generated Content & Metadata</h2>
               </div>
               <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                 <button 
                  onClick={engineerPrompts} 
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 relative overflow-hidden w-full sm:w-auto"
                 >
                   {loading && <div className="absolute left-0 top-0 bottom-0 bg-indigo-800 transition-all duration-300 z-0" style={{ width: `${genProgress}%` }} />}
                   <span className="relative z-10 flex items-center justify-center gap-2">
                     {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                     {loading ? `Generating ${Math.round(genProgress)}%` : 'Generate Visual Prompts'}
                   </span>
                 </button>

                 {imagePrompts.length > 0 && !loading && (
                   <button 
                    onClick={() => setStep(4)}
                    className="bg-slate-900 text-white px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] w-full sm:w-auto"
                   >
                     Next: Visual Queue <ArrowLeft size={16} className="rotate-180" />
                   </button>
                 )}
               </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 lg:flex-1 lg:min-h-0">
              <div className="flex flex-col min-h-[400px] lg:min-h-0 lg:h-full relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 text-slate-400 uppercase font-black text-[10px] tracking-widest">
                  <span className="flex items-center gap-2"><FileText size={14} /> Production Script</span>
                  <div className="flex gap-4">
                    <a href="https://elevenlabs.io/app/home" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 normal-case tracking-normal">Generate TTS on ElevenLabs</a>
                    <button onClick={() => copyToClipboard(generatedScript, 'script')} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
                      {copiedType === 'script' ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>} Copy Script
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 whitespace-pre-wrap flex-1 overflow-y-auto leading-relaxed font-serif text-base sm:text-lg custom-scrollbar">
                  {generatedScript}
                </div>
              </div>
              
              <div className="flex flex-col min-h-[500px] lg:min-h-0 lg:h-full gap-4 relative">
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex justify-between items-center gap-2 mb-1 text-slate-400 uppercase font-black text-[10px] tracking-widest shrink-0">
                    <span className="flex items-center gap-2"><Video size={14} /> Optimized Video Description</span>
                    <button onClick={() => copyToClipboard(generatedVideoDescription, 'desc')} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
                      {copiedType === 'desc' ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>} Copy Desc
                    </button>
                  </div>
                  <SeoIndicator type="description" text={generatedVideoDescription} />
                  <div className="bg-indigo-50/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100 whitespace-pre-wrap flex-1 overflow-y-auto leading-relaxed font-sans text-xs sm:text-sm text-slate-700 shadow-inner custom-scrollbar">
                    {generatedVideoDescription || "Analysis complete. Script generated above. Description metadata processing failed, please check source input."}
                  </div>
                </div>
                
                <div className="flex flex-col h-40 shrink-0">
                  <div className="flex justify-between items-center mb-2 shrink-0">
                    <span className="flex items-center gap-2 text-slate-400 uppercase font-black text-[10px] tracking-widest">
                      <Tag size={14} /> SEO Tags
                    </span>
                    <button 
                      onClick={() => copyToClipboard(generatedTags, 'tags')}
                      className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedType === 'tags' ? <CheckCircle size={12} className="text-green-500"/> : <Copy size={12}/>} Copy Tags
                    </button>
                  </div>
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 overflow-y-auto font-mono text-[10px] sm:text-xs text-slate-600 custom-scrollbar flex-1 leading-relaxed">
                    {generatedTags || "Tags will appear here..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-4 sm:p-8 flex flex-col h-full lg:overflow-hidden overflow-y-auto">
            <BackButton onClick={() => setStep(3)} className="mb-4 sm:mb-6" />
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8 shrink-0 w-full">
              <h2 className="text-xl sm:text-2xl font-bold">4. Visual Prompt Queue ({imagePrompts.length} Prompts)</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button 
                  onClick={engineerPrompts} 
                  disabled={loading}
                  className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Regenerate Prompts
                </button>
                <button onClick={() => setStep(5)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto">
                  Open Image Studio <Sparkles size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:flex-1 lg:min-h-0">
              <div className="lg:col-span-4 flex flex-col min-h-[300px] lg:min-h-0 lg:h-full bg-slate-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 relative">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} /> Full Production Script
                  </h3>
                  <button onClick={() => copyToClipboard(generatedScript, 'script4')} className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors">
                     {copiedType === 'script4' ? <CheckCircle size={12} className="text-green-500"/> : <Copy size={12}/>} Copy
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 font-serif text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap pb-8 custom-scrollbar">
                  {generatedScript}
                </div>
              </div>

              <div className="lg:col-span-8 overflow-y-auto pr-2 lg:pr-4 space-y-4 sm:space-y-6 pb-10 sm:pb-20 custom-scrollbar min-h-[500px] lg:min-h-0 lg:h-full">
                {imagePrompts.map((scene, i) => (
                  <div key={i} className={`p-4 sm:p-6 rounded-2xl border relative group transition-colors ${scene.isThumbnail ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}`}>
                    <button onClick={() => copyToClipboard(scene.prompt, `prompt-${i}`)} className="absolute top-4 right-4 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors z-20">
                      {copiedType === `prompt-${i}` ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                    
                    <p className={`text-[10px] sm:text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2 ${scene.isThumbnail ? 'text-amber-600' : 'text-indigo-600'}`}>
                      {scene.isThumbnail ? <><Play size={16}/> YouTube Thumbnail Design</> : `Scene ${i+1}`}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {scene.script && !scene.isThumbnail && (
                        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                           <span className="text-[10px] font-black uppercase text-slate-400 block mb-2 border-b border-slate-50 pb-1">Audio Script Match</span>
                           <span className="text-sm sm:text-base text-slate-800 font-serif leading-relaxed line-clamp-none whitespace-pre-wrap italic">"{scene.script}"</span>
                        </div>
                      )}
                      
                      <div className={`text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono p-3 sm:p-4 rounded-xl border ${scene.isThumbnail ? 'bg-amber-100/30 border-amber-200/50' : 'bg-indigo-50/50 border-indigo-100/50'}`}>
                        {scene.prompt}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="p-4 sm:p-8 flex flex-col h-full lg:overflow-hidden overflow-y-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8 shrink-0 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <BackButton onClick={() => setStep(4)} />
                <h2 className="text-xl sm:text-2xl font-bold">5. Image Production Studio</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button 
                  onClick={downloadAllImages}
                  className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  <Download size={16} />
                  Download All Ready
                </button>
                <button 
                  onClick={generateAllImages} 
                  disabled={batchGenLoading}
                  className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 w-full sm:w-auto"
                >
                  {batchGenLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {batchGenLoading ? 'Generating Batch...' : 'Generate All Images'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-1 lg:min-h-0 lg:overflow-y-auto pr-1 sm:pr-4 pb-12 custom-scrollbar">
              {imagePrompts.map((scene, i) => (
                <div key={i} className={`rounded-2xl border overflow-hidden flex flex-col shadow-sm h-fit ${scene.isThumbnail ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="aspect-video bg-slate-200 relative flex items-center justify-center border-b border-slate-200 overflow-hidden">
                    {generatedImages[i] ? (
                      <img src={generatedImages[i]} alt={`Scene ${i+1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        {imageLoadingStates[i] ? (
                          <Loader2 size={24} className={`animate-spin ${scene.isThumbnail ? 'text-amber-500' : 'text-indigo-500'}`} />
                        ) : (
                          scene.isThumbnail ? <Play size={24} /> : <ImageIcon size={24} />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {imageLoadingStates[i] ? 'Drawing Scene...' : 'Ready to Render'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${scene.isThumbnail ? 'text-amber-600' : 'text-indigo-600'}`}>
                        {scene.isThumbnail ? <Star size={12}/> : ''} 
                        {scene.isThumbnail ? 'Thumbnail' : `Scene ${i+1}`}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => generateSingleImage(i)}
                          disabled={imageLoadingStates[i]}
                          className={`p-1.5 bg-white border border-slate-200 rounded-lg transition-colors shadow-sm disabled:opacity-50 ${scene.isThumbnail ? 'hover:bg-amber-100 hover:text-amber-600' : 'hover:bg-indigo-50 hover:text-indigo-600'}`}
                          title={generatedImages[i] ? "Regenerate Image" : "Generate Image"}
                        >
                          <RefreshCw size={14} className={imageLoadingStates[i] ? 'animate-spin' : ''} />
                        </button>
                        
                        {generatedImages[i] && (
                          <button 
                            onClick={() => downloadImage(generatedImages[i], i)}
                            className={`p-1.5 bg-white border border-slate-200 rounded-lg transition-colors shadow-sm ${scene.isThumbnail ? 'hover:bg-amber-100 hover:text-amber-600' : 'hover:bg-indigo-50 hover:text-indigo-600'}`}
                            title="Download PNG"
                          >
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    {scene.isThumbnail ? (
                      <p className="text-[10px] text-amber-700 italic font-serif leading-relaxed border-t border-amber-200/50 pt-2">
                        Click-optimized YouTube Thumbnail adhering to visual consistency.
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 line-clamp-3 italic font-serif leading-relaxed border-t border-slate-100 pt-2">
                        "{scene.script}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- Projects Modal --- */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2"><FolderOpen size={20}/> My Cloud Projects</h2>
              <button onClick={() => setShowProjectsModal(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {savedProjects.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  <FolderOpen size={48} className="mx-auto mb-4 opacity-20"/>
                  <p>No saved projects found in the cloud.</p>
                </div>
              ) : (
                savedProjects.map(proj => (
                  <div key={proj.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-300 transition-colors">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base sm:text-lg">{proj.videoTitle || 'Untitled Project'}</h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-1">Saved: {new Date(proj.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => loadProject(proj)} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors">Load</button>
                      <button onClick={() => deleteProject(proj.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Settings Modal --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-slate-800"><Settings size={20}/> App Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
            </div>
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
                  <Key size={14}/> Google Gemini API Key
                </label>
                <input 
                  type="password" 
                  value={customApiKey} 
                  onChange={(e) => setCustomApiKey(e.target.value)} 
                  placeholder="Paste your AI Studio API key here..." 
                  className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 shadow-inner outline-none focus:border-indigo-400 font-mono text-xs sm:text-sm"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <strong>Deploying to GitHub Pages?</strong> Leave the API key blank in your source code! Provide your API key here at runtime. It is safely used locally in your browser to process requests without exposing it to public repositories.
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setShowSettingsModal(false)} className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Save & Close</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default App;