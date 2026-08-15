import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  HeartHandshake, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  Mail, 
  CheckCircle2, 
  Menu, 
  X, 
  FileText, 
  Send, 
  Lock, 
  ArrowRight, 
  Heart, 
  Award, 
  BarChart3, 
  Loader2, 
  Database, 
  Quote, 
  Compass, 
  UserCheck 
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "kemp-foundation.firebaseapp.com",
  projectId: "kemp-foundation",
  storageBucket: "kemp-foundation.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

let db = null;
let auth = null;
try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.log("Firebase initialized in preview mode");
}

function KempFoundationLogo({ size = "md" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg className={size === "lg" ? "w-12 h-12" : "w-10 h-10"} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 18,38 C 18,65 35,83 50,90 C 65,83 82,65 82,38 C 82,26 75,16 68,8 C 58,28 38,28 18,38 Z" fill="#1e293b" />
          <path d="M 50,8 C 66,24 76,40 70,64 C 64,78 50,83 50,83 C 50,83 36,78 30,64 C 24,40 34,24 50,8 Z" fill="#4d8254" />
          <rect x="46" y="26" width="8" height="38" rx="1" fill="#0f172a" />
          <rect x="35" y="35" width="30" height="7.5" rx="1" fill="#0f172a" />
          <path d="M 48,82 C 55,72 65,60 80,50 C 75,58 72,68 62,76 C 56,80 51,82 48,82 Z" fill="#6ba072" />
          <path d="M 62,62 C 70,55 82,50 86,40 C 82,49 75,58 62,62 Z" fill="#8bc292" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-serif font-bold text-slate-700 uppercase tracking-widest">THE</span>
          <span className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-tight leading-none">KEMP FOUNDATION</span>
        </div>
        <div className="text-[11px] sm:text-xs font-semibold tracking-widest text-emerald-700 uppercase mt-0.5">
          MINISTERIAL WELLNESS
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [founderLetterModalOpen, setFounderLetterModalOpen] = useState(false);
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [founderImgError, setFounderImgError] = useState(false);
  
  const [savedResponses, setSavedResponses] = useState([]);
  const [showAdminView, setShowAdminView] = useState(false);

  useEffect(() => {
    if (!auth) return;
    signInAnonymously(auth).catch((err) => console.log("Demo auth mode", err));
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    try {
      const surveyColRef = collection(db, 'surveys');
      const unsubscribe = onSnapshot(
        surveyColRef,
        (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSavedResponses(docs);
        },
        (error) => console.log("Demo database mode")
      );
      return () => unsubscribe();
    } catch (e) {
      console.log("Database listener skipped");
    }
  }, [user]);

  const surveyQuestions = [
    {
      id: "role",
      question: "What is your primary role in gospel ministry?",
      options: ["Pulpit/Lead Minister", "Youth/Family Minister", "Associate/Staff Minister", "Retired/Seasoned Preacher", "Church Elder / Ministry Leader"]
    },
    {
      id: "burnout_frequency",
      question: "In the past 12 months, how often have you felt emotionally overwhelmed or burned out by ministry demands?",
      options: ["Rarely or Never", "Occasionally (a few times a year)", "Frequently (monthly)", "Constantly (weekly or daily)"]
    },
    {
      id: "biggest_barrier",
      question: "What is the biggest barrier preventing ministers in Churches of Christ from seeking professional mental health care?",
      options: ["Cost / Financial Limitations", "Fear of Eldership / Congregational Stigma", "Difficulty Finding Therapists who Understand Church Culture", "Lack of Confidentiality Guarantees"]
    },
    {
      id: "voucher_interest",
      question: "If completely confidential, free or subsidized therapy vouchers were provided by an independent charity, would you use them?",
      options: ["Yes, absolutely", "Likely yes", "Unsure", "No"]
    }
  ];

  const handleSurveyOption = (questionId, option) => {
    setSurveyAnswers({ ...surveyAnswers, [questionId]: option });
  };

  const handleSurveySubmit = async () => {
    setSurveySubmitting(true);
    try {
      if (db) {
        const surveyColRef = collection(db, 'surveys');
        await addDoc(surveyColRef, {
          answers: surveyAnswers,
          submittedAt: serverTimestamp(),
          anonymousUserUid: user?.uid || 'anon'
        });
      }
    } catch (err) {
      console.log("Stored response locally");
    }
    
    setSavedResponses(prev => [...prev, { answers: surveyAnswers, id: Date.now().toString() }]);
    setSurveySubmitting(false);
    setSurveySubmitted(true);
    setTimeout(() => {
      setSurveySubmitted(false);
      setSurveyModalOpen(false);
      setSurveyStep(1);
      setSurveyAnswers({});
    }, 2500);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactModalOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-stone-200 text-xs sm:text-sm py-2 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-medium text-emerald-300">Years 1–2 Incubation Phase:</span> 
        <span>Building Church of Christ Clergy Wellness Initiatives.</span>
        <button 
          onClick={() => setSurveyModalOpen(true)}
          className="underline hover:text-white ml-2 text-xs font-semibold cursor-pointer"
        >
          Take Minister Survey →
        </button>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <KempFoundationLogo size="md" />
            </div>

            <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
              <a href="#about" className="hover:text-slate-900 transition-colors">Our Mission</a>
              <a href="#founder" className="hover:text-slate-900 transition-colors text-emerald-800 font-semibold flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Meet the Founder
              </a>
              <a href="#pillars" className="hover:text-slate-900 transition-colors">Core Pillars</a>
              <a href="#roadmap" className="hover:text-slate-900 transition-colors">10-Year Plan</a>
              <button onClick={() => setPitchModalOpen(true)} className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer">
                <FileText className="w-4 h-4 text-emerald-600" /> Pitch Brief
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setSurveyModalOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Minister Survey ({savedResponses.length})
              </button>
              <button 
                onClick={() => setContactModalOpen(true)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                Get Involved
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-stone-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100"
            >
              Our Mission
            </a>
            <a 
              href="#founder" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 font-semibold hover:bg-emerald-50"
            >
              Meet Founder: Zaquan Kemp
            </a>
            <a 
              href="#pillars" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100"
            >
              Core Pillars
            </a>
            <a 
              href="#roadmap" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100"
            >
              10-Year Plan
            </a>
            <button 
              onClick={() => { setMobileMenuOpen(false); setPitchModalOpen(true); }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100 flex items-center gap-2"
            >
              <FileText className="w-5 h-5 text-emerald-600" /> View Eldership Pitch
            </button>
            <div className="pt-2 space-y-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); setSurveyModalOpen(true); }}
                className="w-full py-2.5 rounded-lg text-center text-emerald-900 bg-emerald-50 border border-emerald-200 font-semibold"
              >
                Take Minister Survey ({savedResponses.length})
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setContactModalOpen(true); }}
                className="w-full py-2.5 rounded-lg text-center text-white bg-slate-900 font-semibold"
              >
                Get Involved / Partner
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-stone-50 to-white pt-12 sm:pt-20 pb-16 sm:pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-emerald-100/40 via-teal-100/30 to-blue-100/40 blur-3xl -z-10 rounded-full opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Dedicated to Church of Christ Ministers & Elderships</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.15]">
              Restoring the Souls of <span className="text-emerald-800 underline decoration-emerald-300 decoration-wavy underline-offset-8">Those Who Serve</span>.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Sustaining young and seasoned gospel preachers with confidential therapy vouchers, cross-generational peer cohorts, and eldership health education.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setSurveyModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-lg shadow-emerald-700/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Take Anonymous Minister Survey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a 
                href="#founder"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-slate-800 font-semibold border border-stone-300 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <span>Meet Founder Zaquan Kemp</span>
              </a>
            </div>

            <div className="pt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-white/80 border border-stone-200 shadow-sm backdrop-blur-sm">
                <div className="text-2xl font-bold text-slate-900 font-serif">100%</div>
                <div className="text-xs text-slate-500 font-medium">Confidential & External Support</div>
              </div>
              <div className="p-4 rounded-xl bg-white/80 border border-stone-200 shadow-sm backdrop-blur-sm">
                <div className="text-2xl font-bold text-emerald-700 font-serif">2 Generations</div>
                <div className="text-xs text-slate-500 font-medium">Young & Seasoned Minister Bridge</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-white/80 border border-stone-200 shadow-sm backdrop-blur-sm">
                <div className="text-2xl font-bold text-slate-900 font-serif">501(c)(3)</div>
                <div className="text-xs text-slate-500 font-medium">10-Year Growth Roadmap</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Founder Bio Section */}
      <section id="founder" className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-800/80">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Leadership & Visionary</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              Meet the Founder
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
              Behind the mission to protect, restore, and sustain gospel workers across Churches of Christ.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center bg-slate-950/60 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl backdrop-blur-sm">
            
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group w-full max-w-sm">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 opacity-40 group-hover:opacity-70 transition duration-500 blur-sm"></div>
                
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-2xl min-h-[380px] flex flex-col items-center justify-center">
                  {!founderImgError ? (
                    <img 
                      src="/image.png" 
                      alt="Zaquan Kemp - Founder of The Kemp Foundation for Ministerial Wellness" 
                      className="w-full h-auto object-cover object-top hover:scale-102 transition-transform duration-500"
                      onError={() => setFounderImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full min-h-[380px] p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-28 h-28 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-serif font-bold text-4xl shadow-xl">
                        ZK
                      </div>
                      <div>
                        <div className="text-2xl font-serif font-bold text-white">Zaquan Kemp</div>
                        <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-1">
                          Founder & Executive Director
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 italic max-w-xs">
                        "Restoring the Souls of Those Who Serve."
                      </p>
                    </div>
                  )}

                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 text-center">
                    <div className="text-xl font-serif font-bold text-white">Zaquan Kemp</div>
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-0.5">Founder & Executive Director</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                  Church of Christ Fellowship
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-medium">
                  Clergy Health Advocate
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  A Calling to Care for the Caregivers
                </div>
                <div className="text-emerald-400 text-sm font-semibold">
                  Founder's Vision Statement
                </div>
              </div>

              <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                <p>
                  As a committed leader within the Church of Christ fellowship, <strong>Zaquan Kemp</strong> observed a quiet, persistent crisis unfolding across local pulpits: dedicated ministers—both young evangelists starting out and seasoned preachers with decades of service—were quietly fighting exhaustion, isolation, and burnout.
                </p>
                <p>
                  Recognizing that autonomous congregations often lack built-in administrative mechanisms for confidential mental health support, Zaquan established <strong>The Kemp Foundation for Ministerial Wellness</strong>.
                </p>
                <p>
                  His conviction is straightforward: <em>Preachers are human first.</em> When we protect the psychological, emotional, and spiritual health of the minister, we fortify the eldership, stabilize the local congregation, and empower the gospel message for generations to come.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 relative">
                <Quote className="w-8 h-8 text-emerald-500/30 absolute top-3 right-3" />
                <p className="text-xs sm:text-sm italic text-emerald-100 leading-relaxed font-serif">
                  "Our goal over the next 10 years is not merely to offer a crisis hotline, but to build a lasting sanctuary of support—where a young Timothy can learn resilience from a seasoned Paul, and where every preacher can access confidential therapy without fear or stigma."
                </p>
                <div className="text-xs font-bold text-emerald-400 mt-2">— Zaquan Kemp</div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-white">Confidentiality</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">100% External Privacy</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-white">2 Generations</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Young & Veteran Unity</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <Compass className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-white">Eldership Synergy</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Healthy Church Culture</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setFounderLetterModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Read Founder's Full Letter</span>
                </button>
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Connect with Zaquan</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                Founding Vision
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                Addressing the Hidden Burden Behind the Pulpit
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Ministers in autonomous congregations often serve without an external safety net. They bear the heavy emotional weight of grief counseling, conflict resolution, and spiritual leadership—frequently at the expense of their own psychological health.
              </p>
              <p className="text-slate-600 leading-relaxed">
                <strong>The Kemp Foundation for Ministerial Wellness</strong> bridges the gap between spiritual dedication and clinical mental healthcare, creating a sustainable environment where preachers can thrive for decades.
              </p>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center flex-shrink-0 font-serif font-bold text-lg">
                  ZK
                </div>
                <div>
                  <blockquote className="text-sm italic text-slate-700">
                    "A healthier minister creates a healthier eldership, a healthier congregation, and a more vibrant gospel outreach."
                  </blockquote>
                  <div className="text-xs font-bold text-slate-900 mt-2">— Zaquan Kemp, Founder</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Uncompromised Privacy</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Counseling subsidies are processed independently so ministers can seek therapy without asking elderships for budget approvals.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Generational Wisdom</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pairing young preachers with veteran ministers prevents early-career burnout and gives retired ministers renewed purpose.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Eldership Synergy</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Providing elderships with practical tools, sabbatical blueprints, and emotional intelligence guidelines for supporting gospel workers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Clinical Integrity</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Vetting licensed Christian counselors who respect scripture while utilizing evidence-based psychological practices.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section id="pillars" className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-100/70 px-3 py-1 rounded-md">
              Programmatic Framework
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
              The Three Pillars of KFMW
            </h2>
            <p className="text-slate-600 text-lg">
              A balanced approach addressing immediate personal crisis, ongoing peer support, and long-term organizational health.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="p-6 bg-slate-900 text-white space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Pillar I • Direct Care</div>
                <h3 className="text-2xl font-serif font-bold">The Renewal Fund</h3>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Confidential therapy vouchers and financial subsidies connecting ministers and their spouses with vetted, licensed Christian counselors.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>6 to 12 free confidential counseling sessions annually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Direct therapist payment with zero church oversight</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Includes marital and family counseling coverage</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-stone-100 text-xs font-semibold text-emerald-800">
                  Status: Network Vetting Phase
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="p-6 bg-slate-900 text-white space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Pillar II • Mentorship</div>
                <h3 className="text-2xl font-serif font-bold">Timothy & Paul Cohorts</h3>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Structured, confidential peer groups pairing seasoned preachers with younger ministers for mutual encouragement and practical problem solving.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Monthly closed-door video cohort gatherings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Safe space to process conflict, doubt, & stress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Annual physical retreat for cohort participants</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-stone-100 text-xs font-semibold text-emerald-800">
                  Status: Launching Pilot Cohort in Year 3
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="p-6 bg-slate-900 text-white space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Pillar III • Prevention</div>
                <h3 className="text-2xl font-serif font-bold">Healthy Pulpit Initiative</h3>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Workshops and guides for church elderships on workload expectations, sabbatical policies, emotional health, and conflict prevention.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Eldership training workshops & sabbatical templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Fair compensation & benefits benchmarks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Pulpit supply stipend fund during minister leave</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-stone-100 text-xs font-semibold text-emerald-800">
                  Status: Resource Guide Drafting
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-to-10 Year Roadmap Section */}
      <section id="roadmap" className="py-16 sm:py-24 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
              Strategic Timeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
              5-to-10 Year Organizational Roadmap
            </h2>
            <p className="text-slate-600">
              Building a lasting institutional foundation step-by-step to serve generations of workers.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-stone-50 border-2 border-emerald-500/40 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center">1</div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Years 1–2 • Incubation</div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Discovery & Setup</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Minister Listening Tour & Surveys</li>
                <li>• Form Steering Committee</li>
                <li>• Domain & Brand Registration</li>
                <li>• Draft 501(c)(3) Articles</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">2</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Years 3–4 • Pilot</div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Formal Launch</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• File 501(c)(3) Tax Exemption</li>
                <li>• Appoint Founding Board</li>
                <li>• Pilot First Timothy & Paul Cohort</li>
                <li>• Recruit 15 Licensed Therapists</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">3</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Years 5–7 • Expansion</div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Service Rollout</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Full Renewal Fund Subsidies</li>
                <li>• Regional Eldership Seminars</li>
                <li>• Annual Couples Wellness Retreat</li>
                <li>• Church Partnership Network</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">4</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Years 8–10 • Endowment</div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Sustaining Longevity</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Establish Perpetual Endowment</li>
                <li>• Publish CoC Clergy Health Report</li>
                <li>• Nationwide Regional Cohorts</li>
                <li>• Sabbatical Stipend Grants</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-slate-800">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-white">
                <KempFoundationLogo size="lg" />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-slate-400">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#founder" className="hover:text-white transition-colors">Founder Bio</a>
              <a href="#pillars" className="hover:text-white transition-colors">3 Pillars</a>
              <a href="#roadmap" className="hover:text-white transition-colors">10-Year Plan</a>
              <button onClick={() => setPitchModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Eldership Pitch</button>
              <button onClick={() => setContactModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Contact Founder</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} The Kemp Foundation for Ministerial Wellness. All rights reserved.
            </div>
            <div className="text-center md:text-right">
              Restoring the Souls of Those Who Serve.
            </div>
          </div>
        </div>
      </footer>

      {/* Founder's Letter Modal */}
      {founderLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-8">
            <button 
              onClick={() => setFounderLetterModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-emerald-600 flex items-center justify-center text-emerald-400 font-serif font-bold text-xl flex-shrink-0">
                  ZK
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">A Personal Note</div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    A Message from Zaquan Kemp
                  </h3>
                  <p className="text-xs text-slate-500">Founder, The Kemp Foundation for Ministerial Wellness</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
                <p className="text-sm font-semibold text-slate-900">
                  Dear Brothers, Elders, and Supporters of Gospel Ministry,
                </p>
                <p>
                  To preach the unsearchable riches of Christ is a high and sacred privilege. Yet, behind the pulpit smiles, Sunday sermons, and tirelessly organized youth trips, many of our ministers carry emotional and psychological burdens they feel they cannot share with anyone.
                </p>
                <p>
                  Because Churches of Christ honor the biblical autonomy of local congregations, there is no denominational headquarters or centralized health authority. If a preacher struggles with depression, anxiety, marital stress, or deep grief, he often suffers in total silence—fearing that seeking counseling might endanger his employment, reputation, or standing with the eldership.
                </p>
                <p>
                  The Kemp Foundation was birthed to change this reality. Over the next 5 to 10 years, we are establishing a non-profit foundation that acts as an independent shield for ministers. Through fully subsidized therapy vouchers, cross-generational mentorship cohorts, and practical eldership workshops, we are ensuring that no gospel worker ever has to stand alone in the dark.
                </p>
                <p className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 italic text-emerald-950 font-sans text-xs">
                  "When we protect the mental and spiritual health of the preacher, we strengthen the pulpit, comfort the congregation, and safeguard the work of the Church for generations."
                </p>
                <p>
                  Thank you for standing with us as we embark on this 10-year journey of restoration and service.
                </p>
                <div className="pt-2 font-sans font-bold text-slate-900 text-sm">
                  In His Kingdom Service,<br />
                  <span className="text-emerald-800 text-base font-serif">Zaquan Kemp</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => { setFounderLetterModalOpen(false); setContactModalOpen(true); }}
                  className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Send Zaquan a Message →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      {surveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdminView(false)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${!showAdminView ? 'bg-slate-900 text-white' : 'bg-stone-100 text-slate-600'}`}
                >
                  Take Survey
                </button>
                <button
                  onClick={() => setShowAdminView(true)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer ${showAdminView ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-slate-600'}`}
                >
                  <Database className="w-3.5 h-3.5" />
                  Live Responses ({savedResponses.length})
                </button>
              </div>

              <button 
                onClick={() => setSurveyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showAdminView ? (
              surveySubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Survey Saved Securely</h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto">
                    Your answers have been stored anonymously in The Kemp Foundation database. Thank you for helping us design better programs for gospel preachers!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5" /> 100% Anonymous & Saved to Cloud Database
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    Minister Wellness Discovery Survey
                  </h3>
                  
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300" 
                      style={{ width: `${(surveyStep / surveyQuestions.length) * 100}%` }}
                    ></div>
                  </div>

                  <div className="text-xs text-slate-500 font-semibold">
                    Question {surveyStep} of {surveyQuestions.length}
                  </div>

                  <div className="py-2 space-y-3">
                    <p className="font-semibold text-slate-800 text-base sm:text-lg">
                      {surveyQuestions[surveyStep - 1].question}
                    </p>

                    <div className="space-y-2 pt-2">
                      {surveyQuestions[surveyStep - 1].options.map((option, idx) => {
                        const questionKey = surveyQuestions[surveyStep - 1].id;
                        const isSelected = surveyAnswers[questionKey] === option;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSurveyOption(questionKey, option)}
                            className={`w-full text-left p-3.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected 
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold' 
                                : 'border-stone-200 hover:border-slate-300 text-slate-700 hover:bg-stone-50'
                            }`}
                          >
                            <span>{option}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                    <button
                      disabled={surveyStep === 1}
                      onClick={() => setSurveyStep(surveyStep - 1)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-30 hover:text-slate-900 cursor-pointer"
                    >
                      ← Back
                    </button>

                    {surveyStep < surveyQuestions.length ? (
                      <button
                        disabled={!surveyAnswers[surveyQuestions[surveyStep - 1].id]}
                        onClick={() => setSurveyStep(surveyStep + 1)}
                        className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs sm:text-sm disabled:opacity-40 hover:bg-slate-800 cursor-pointer"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        disabled={!surveyAnswers[surveyQuestions[surveyStep - 1].id] || surveySubmitting}
                        onClick={handleSurveySubmit}
                        className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {surveySubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Submit to Database ✓</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="border-b border-stone-200 pb-2">
                  <div className="text-xs font-bold text-emerald-700 uppercase">Founder Live Analytics</div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    Live Responses ({savedResponses.length})
                  </h3>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {savedResponses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm italic">
                      No survey responses submitted yet.
                    </div>
                  ) : (
                    savedResponses.map((res, index) => (
                      <div key={res.id || index} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                        <div className="font-bold text-slate-900 border-b border-stone-200 pb-1 flex justify-between">
                          <span>Response #{index + 1}</span>
                          <span className="text-slate-400 font-normal">UID: {res.anonymousUserUid?.slice(0, 8)}...</span>
                        </div>
                        <div><strong>Role:</strong> {res.answers?.role || "N/A"}</div>
                        <div><strong>Burnout Frequency:</strong> {res.answers?.burnout_frequency || "N/A"}</div>
                        <div><strong>Biggest Barrier:</strong> {res.answers?.biggest_barrier || "N/A"}</div>
                        <div><strong>Voucher Interest:</strong> {res.answers?.voucher_interest || "N/A"}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Eldership Pitch Modal */}
      {pitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-8">
            <button 
              onClick={() => setPitchModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Official Briefing Document</div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">
                  The Kemp Foundation Overview
                </h3>
                <p className="text-xs italic text-slate-500 mt-1">
                  For Elders, Ministry Leaders, and Prospective Supporters
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 font-medium">
                  <strong>Core Purpose:</strong> To protect, restore, and sustain gospel preachers in Churches of Christ through independent mental health resources, mentorship, and leadership education.
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">The Critical Need</h4>
                  <p>
                    Studies show over 50% of active ministers experience severe emotional fatigue, with high rates of early departure from gospel work. Autonomous congregations often lack built-in mechanisms for confidential pastoral care.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">How We Partner with Elderships</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>We do not replace or override congregational authority.</li>
                    <li>We absorb the financial burden of therapy vouchers so church budgets aren't strained.</li>
                    <li>We offer practical sabbatical frameworks and emotional wellness guidelines for church boards.</li>
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="font-bold">Founder's Message — Zaquan Kemp</div>
                  <p className="text-xs italic">
                    "When we care for the shepherd, we protect the flock. The Kemp Foundation is committed to standing beside ministers for a lifetime of faithful, healthy service."
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => alert("1-Page Overview PDF download initiated.")}
                  className="px-4 py-2.5 rounded-lg border border-stone-300 text-slate-800 font-semibold text-xs hover:bg-stone-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  Download PDF Brief
                </button>
                <button
                  onClick={() => { setPitchModalOpen(false); setContactModalOpen(true); }}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Schedule an Eldership Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200">
            <button 
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Message Received</h3>
                <p className="text-sm text-slate-600">
                  Thank you for reaching out to The Kemp Foundation. Zaquan Kemp or an advisory team member will connect with you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Connect With Us</div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    Get Involved or Contact Zaquan
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Whether you are a minister, elder, counselor, or prospective donor—we welcome your partnership.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input 
                      required 
                      name="name"
                      type="text" 
                      placeholder="e.g. Bro. John Smith" 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input 
                      required 
                      name="email"
                      type="email" 
                      placeholder="john@example.com" 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Capacity</label>
                    <select name="capacity" className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Active Preacher / Minister</option>
                      <option>Church Elder / Board Member</option>
                      <option>Licensed Professional Counselor</option>
                      <option>Prospective Donor / Seed Supporter</option>
                      <option>Other / General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                    <textarea 
                      required 
                      name="message"
                      rows={3} 
                      placeholder="Share how you'd like to connect or ask Zaquan a question..." 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    ></textarea>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
