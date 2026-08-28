import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';


//live render backend url
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lite-college-website.onrender.com';

export API = axios.create({
  baseURL: API_BASE_URL,
});


// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

export default function App() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', course: '', message: '', agreeToTerms: false });
  const [statusMsg, setStatusMsg] = useState('');

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Admin View & Authentication States
  const [view, setView] = useState('student');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Course Detail Modal State
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 45 });

  // Fetch Courses & Faculty
  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));

    fetch('http://localhost:5000/api/faculty')
      .then(res => res.json())
      .then(data => setFaculty(data))
      .catch(err => console.error(err));
  }, []);

  // Live Countdown Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Submit Student Application
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = promoCode ? { ...formData, message: `[PROMO: ${promoCode}] ${formData.message}` } : formData;

    const res = await fetch('http://localhost:5000/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setStatusMsg('Enquiry Sent Successfully!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', course: '', message: '', agreeToTerms: false });
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setStatusMsg('');
      }, 2000);
    }
  };

  // Admin Login Submission Handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Invalid Username or Password! Access Denied.');
    }
  };

  // Logout Handler
  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setView('student');
  };

  // Claim Discount Handler
  const handleClaimDiscount = () => {
    setPromoCode('LITE50');
    setIsApplyModalOpen(true);
  };

  // Enroll From Modal Handler
  const handleEnrollFromModal = (courseTitle) => {
    setFormData(prev => ({ ...prev, course: courseTitle }));
    setSelectedCourse(null);
    setIsApplyModalOpen(true);
  };

  // Filter Courses based on Search Input
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ------------------ ADMIN SECTION VIEW ------------------
  if (view === 'admin') {
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4 font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative border border-slate-100"
          >
            <button
              onClick={() => setView('student')}
              className="absolute top-4 right-4 text-xs font-bold text-gray-400 hover:text-slate-800 transition"
            >
              ← Public Site
            </button>

            <div className="text-center mb-6">
              <div className="bg-red-100 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-black shadow-inner">🔒</div>
              <h2 className="text-2xl font-black text-slate-900">Admin Authentication</h2>
              <p className="text-xs text-gray-500 mt-1">Enter credentials to access LITE control panel.</p>
            </div>

            {loginError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 mb-4 bg-red-100 text-red-700 text-xs font-bold rounded-lg text-center border border-red-200">
                {loginError}
              </motion.div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg text-xs hover:bg-slate-800 transition shadow-lg"
              >
                UNLOCK CONTROL PANEL
              </motion.button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-[10px] text-gray-400">
              Default Credentials: <span className="font-mono text-slate-700 font-bold">admin / admin123</span>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-slate-900 text-white px-8 py-3 flex justify-between items-center text-xs">
          <span className="font-bold">🎓 LITE College Admin Control Panel (Active Session)</span>
          <div className="flex gap-3">
            <button
              onClick={() => setView('student')}
              className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-white font-bold hover:bg-slate-700 transition"
            >
              🌐 View Website
            </button>
            <button
              onClick={handleAdminLogout}
              className="bg-red-600 px-3 py-1.5 rounded text-white font-bold hover:bg-red-700 transition"
            >
              🔒 Logout
            </button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // ------------------ PUBLIC WEBSITE VIEW ------------------
  return (
    <div className="font-sans text-gray-800 bg-gray-50 relative overflow-hidden">

      {/* 1. ANIMATED NAVBAR */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center px-6 md:px-10 py-4 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40"
      >
        <div className="flex items-center gap-3">
          <motion.svg
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-10 h-10 text-red-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13l-8-3.64V17l8 4 8-4v-5.64L12 15z" fill="#DC2626" />
            <path d="M8 10l-2 2 2 2M16 10l2 2-2 2" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </motion.svg>
          <div>
            <span className="text-xl font-black text-red-600 tracking-tight">LITE</span>
            <span className="text-sm font-bold text-blue-900 block -mt-1">COMPUTER COLLEGE</span>
          </div>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <a href="#home" className="hover:text-red-600 transition">Home</a>
          <a href="#about" className="hover:text-red-600 transition">About</a>
          <a href="#courses" className="hover:text-red-600 transition">Courses</a>
          <a href="#contact" className="hover:text-red-600 transition">Contact</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('admin')}
            className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition"
          >
            {isLoggedIn ? '⚙️ Dashboard' : '🔑 Admin Panel'}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setPromoCode(''); setIsApplyModalOpen(true); }}
            className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition shadow-md shadow-red-200"
          >
            Apply Now
          </motion.button>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION WITH CINEMATIC MOTION */}
      <section id="home" className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 md:px-10 py-24 flex flex-col md:flex-row items-center justify-between relative">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 space-y-6 z-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Unlock Your Future in <br /><span className="text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Technology</span>
          </h1>
          <p className="text-gray-300 max-w-md text-sm md:text-base leading-relaxed">
            Learn industry-standard skills in coding, design, and data. Join LITE Computer College and start building your career today.
          </p>
          <div className="flex gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#courses"
              className="bg-red-600 px-6 py-3 rounded-md font-medium hover:bg-red-700 transition shadow-lg shadow-red-900/40 inline-block"
            >
              Explore Courses
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#about"
              className="border border-white/40 px-6 py-3 rounded-md font-medium hover:bg-white/10 transition inline-block text-center"
            >
              Learn More
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mt-12 md:mt-0 flex justify-center relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur-lg opacity-30"></div>
            <img
              src="/images/hero.jpg"
              alt="Students"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"; }}
              className="rounded-xl shadow-2xl border-2 border-white/20 max-w-full h-80 object-cover relative z-10"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* 3. STATS BANNER */}
      <section className="max-w-6xl mx-auto -mt-10 px-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/95 backdrop-blur p-6 rounded-xl shadow-xl border border-gray-100 text-center"
        >
          <div><h2 className="text-3xl font-extrabold text-blue-900">15,000+</h2><p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">Students Trained</p></div>
          <div><h2 className="text-3xl font-extrabold text-blue-900">25+</h2><p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">Expert Faculty</p></div>
          <div><h2 className="text-3xl font-extrabold text-blue-900">50+</h2><p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">Courses Offered</p></div>
          <div><h2 className="text-3xl font-extrabold text-blue-900">95%</h2><p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">Placement Rate</p></div>
        </motion.div>
      </section>

      {/* 4. PROMO BANNER WITH LIVE COUNTDOWN TIMER */}
      <section className="bg-blue-950 text-white my-16 py-12 px-6 relative overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto bg-blue-900/60 p-8 rounded-2xl border border-blue-800 flex flex-col md:flex-row items-center justify-between relative shadow-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [12, 15, 12] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center font-bold text-xs shadow-lg z-10"
          >
            <span>FLAT</span>
            <span className="text-base">50%</span>
            <span>OFF</span>
          </motion.div>

          <div className="space-y-4 md:w-2/3">
            <span className="bg-red-600/30 text-red-400 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-widest border border-red-500/20">
              Limited Time Deal
            </span>
            <h2 className="text-3xl font-bold">Unlock Your Coding Potential Today!</h2>
            <p className="text-sm text-gray-300">Get unlimited access to all premium courses, mentorship programs, and certification exams for half the price.</p>

            <div className="flex gap-3 text-center my-4">
              {['00', String(timeLeft.hours).padStart(2, '0'), String(timeLeft.minutes).padStart(2, '0'), String(timeLeft.seconds).padStart(2, '0')].map((val, idx) => (
                <div key={idx} className="bg-blue-950 px-3 py-2 rounded-lg border border-blue-800 min-w-[55px] shadow-inner">
                  <div className={`text-xl font-bold ${idx === 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{val}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider">{['Days', 'Hours', 'Mins', 'Secs'][idx]}</div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClaimDiscount}
              className="bg-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/50"
            >
              Claim 50% Discount Now
            </motion.button>
          </div>

          <div className="mt-6 md:mt-0 md:w-1/3 bg-gray-900/90 p-4 rounded-xl border border-gray-800 font-mono text-xs text-green-400 shadow-inner">
            <div><span className="text-purple-400">const</span> course = <span className="text-yellow-300">"Full Stack"</span>;</div>
            <div>discount = <span className="text-red-400">"50%"</span>;</div>
            <div className="mt-4 pt-2 border-t border-gray-800 text-gray-400">
              Original Price: <span className="line-through text-red-400">42,000 PKR</span><br />
              <span className="text-white font-bold text-sm">Now: 21,000 PKR</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. WHY CHOOSE LITE */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-10 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-3xl font-bold text-blue-950">Why Choose LITE?</h2>
          <p className="text-gray-500 text-sm mt-1">We provide more than just education; we provide a career path.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 mt-10"
        >
          {[
            { title: 'Expert Instructors', desc: 'Learn from industry professionals with years of real-world experience in tech.' },
            { title: 'Recognized Certification', desc: 'Earn certificates globally valued by top tech employers.' },
            { title: 'Job Placement', desc: 'Career counseling and job placement support to land your dream job.' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={scaleIn}
              whileHover={{ y: -8 }}
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition duration-300"
            >
              <h3 className="font-bold text-lg text-blue-900">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 6. POPULAR COURSES WITH HOVER ANIMATION */}
      <section id="courses" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-blue-950">Popular Courses</h2>
            <p className="text-gray-500 text-sm">Click any course to view complete details & syllabus.</p>
          </div>
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="🔍 Search course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-red-600 bg-white shadow-sm transition"
            />
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((c) => (
                <motion.div
                  key={c._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedCourse(c)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col justify-between cursor-pointer hover:shadow-xl transition duration-300 group"
                >
                  <div>
                    {c.badge && <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10 shadow-md">{c.badge}</span>}
                    <div className="overflow-hidden h-44 bg-gray-200">
                      <img
                        src={c.image}
                        alt={c.title}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"; }}
                        className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-blue-900">
                    <span>⏱ {c.duration}</span>
                    <span className="text-red-600 text-sm">{c.price}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-400 py-8 text-xs">No courses found matching "{searchTerm}"</p>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 7. MEET OUR FACULTY */}
      <section className="bg-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-950">Meet Our Faculty</h2>
          <p className="text-gray-500 text-sm mt-1">Dedicated professionals committed to your success.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {faculty.length > 0 ? (
              faculty.map((f, idx) => (
                <motion.div
                  key={f._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-xl shadow-sm text-center flex flex-col justify-between hover:shadow-lg transition"
                >
                  <div>
                    <img
                      src={f.image}
                      alt={f.name}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"; }}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-blue-900 mb-3 shadow-md"
                    />
                    <h3 className="font-bold text-gray-900">{f.name}</h3>
                    <p className="text-[10px] font-bold text-red-600 tracking-wider uppercase mt-1">{f.role}</p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">{f.bio}</p>
                  </div>
                  {f.phone && <p className="text-xs font-semibold text-blue-900 mt-3 pt-2 border-t border-gray-100">{f.phone}</p>}
                </motion.div>
              ))
            ) : (
              <p className="col-span-1 sm:col-span-2 md:col-span-4 text-center text-gray-400 py-4 text-xs">No faculty members added yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* 8. CONTACT & ENQUIRY FORM */}
      <section id="contact" className="bg-[#1a2c42] py-20 px-6 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">

          {/* Left Column: Get In Touch */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5 text-white space-y-6"
          >
            <h2 className="text-3xl font-extrabold tracking-tight">Get In Touch</h2>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Ready to start your journey? Contact us today for a free counseling session and discover the right course for you.
            </p>

            <div className="space-y-5 text-xs pt-2">
              {[
                { icon: '📍', title: 'Address:', text: 'OPP S.T Paul Church Sialkot Road Gujranwala.' },
                { icon: '📞', title: 'Phone:', text: '+92 301-5588503' },
                { icon: '✉️', title: 'Email:', text: 'info@litecomputercollege.com' },
                { icon: '⏰', title: 'Working Hours:', text: 'Mon - Sat: 9:00 AM - 8:00 PM', sub: 'Sunday: Closed' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 text-sm shadow-md">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200">{item.title}</h4>
                    <p className="text-gray-300 mt-0.5">{item.text}</p>
                    {item.sub && <p className="text-gray-400 text-[11px]">{item.sub}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-4">
              {['f', '𝕏', '📷', 'in', '▶'].map((social, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2, backgroundColor: '#DC2626' }}
                  className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition text-gray-200"
                >
                  {social}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Enquiry Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7"
          >
            <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-gray-800 space-y-4 border border-white/20">
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">Enquiry Form</h3>

              {statusMsg && <div className="p-3 bg-green-100 text-green-800 text-xs rounded-lg font-semibold text-center">{statusMsg}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg text-xs bg-gray-50 outline-none focus:border-red-600 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg text-xs bg-gray-50 outline-none focus:border-red-600 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg text-xs bg-gray-50 outline-none focus:border-red-600 transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg text-xs bg-gray-50 outline-none focus:border-red-600 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Interested Course *</label>
                  <select value={formData.course} required onChange={e => setFormData({ ...formData, course: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg text-xs bg-gray-50 outline-none focus:border-red-600 transition">
                    <option value="">Select a Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Message</label>
                <textarea placeholder="Tell us about your goals..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg text-xs bg-gray-50 h-24 outline-none focus:border-red-600 transition"></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={formData.agreeToTerms}
                  onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="agree" className="text-[11px] text-gray-600 leading-tight">
                  I agree to receive calls and emails from LITE Computer College regarding courses.
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-red-700 text-white py-3.5 rounded-full font-bold hover:bg-red-800 transition text-xs shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <span>✈️</span> SUBMIT ENQUIRY
              </motion.button>
            </form>
          </motion.div>

        </div>
      </section>

      {/* 9. ANIMATED COURSE DETAIL POPUP MODAL */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm hover:bg-black/70 z-10 transition"
              >
                ✕
              </button>
              <img src={selectedCourse.image} alt={selectedCourse.title} className="w-full h-52 object-cover bg-gray-100" />
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{selectedCourse.title}</h3>
                    <p className="text-xs font-bold text-red-600 mt-1">Duration: {selectedCourse.duration} | Price: {selectedCourse.price}</p>
                  </div>
                  {selectedCourse.badge && <span className="bg-blue-100 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">{selectedCourse.badge}</span>}
                </div>
                <hr />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Course Overview</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{selectedCourse.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Key Learning Highlights</h4>
                  <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                    <li>Hands-on Practical Training & Real World Projects</li>
                    <li>1-on-1 Mentorship from Senior Industry Professionals</li>
                    <li>Course Completion Certificate valued globally</li>
                    <li>Dedicated Job Placement Counseling Session</li>
                  </ul>
                </div>
                <div className="pt-4 border-t flex justify-end gap-3">
                  <button onClick={() => setSelectedCourse(null)} className="px-5 py-2.5 rounded-lg text-xs font-bold border hover:bg-gray-100 transition">Close</button>
                  <button
                    onClick={() => handleEnrollFromModal(selectedCourse.title)}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-red-700 transition"
                  >
                    Enroll In This Course Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. ANIMATED APPLY NOW POPUP MODAL */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-lg transition"
              >
                ✕
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-1">Online Student Admission</h3>
              <p className="text-xs text-gray-500 mb-4">Fill out the form below to register with LITE College.</p>

              {promoCode && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 flex justify-between items-center">
                  <span>🔥 Discount Applied: {promoCode} (50% OFF)</span>
                </div>
              )}

              {statusMsg && <div className="p-2 mb-4 bg-green-100 text-green-700 text-xs rounded font-bold">{statusMsg}</div>}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="First Name *" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="border p-2 rounded text-xs w-full outline-none focus:border-red-600" />
                  <input type="text" placeholder="Last Name *" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="border p-2 rounded text-xs w-full outline-none focus:border-red-600" />
                </div>
                <input type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border p-2 rounded text-xs w-full outline-none focus:border-red-600" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Phone Number *" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="border p-2 rounded text-xs w-full outline-none focus:border-red-600" />
                  <select value={formData.course} required onChange={e => setFormData({ ...formData, course: e.target.value })} className="border p-2 rounded text-xs w-full bg-white outline-none focus:border-red-600">
                    <option value="">Select Course *</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <textarea placeholder="Any specific requirements?" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="border p-2 rounded text-xs w-full h-16 outline-none focus:border-red-600"></textarea>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 text-xs transition shadow-md"
                >
                  CONFIRM APPLICATION
                </motion.button>
              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 11. FOOTER */}
      <footer className="bg-[#0f1d2e] text-gray-400 py-12 px-6 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">💻</span>
              <h4 className="text-white font-bold text-sm tracking-wide">LITE Computer College</h4>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Empowering students with cutting-edge computer education since 2010. Your success is our mission.
            </p>
            <div className="flex gap-2 pt-2">
              {['f', '𝕏', '📷', 'in'].map((social, idx) => (
                <motion.button key={idx} whileHover={{ scale: 1.2, backgroundColor: '#DC2626' }} className="bg-white/10 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition">
                  {social}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Quick Links</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#home" className="hover:text-white transition">Home</a></li>
              <li><a href="#about" className="hover:text-white transition">About Us</a></li>
              <li><a href="#courses" className="hover:text-white transition">Courses</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Popular Courses</h4>
            <ul className="space-y-2 text-[11px]">
              {courses.slice(0, 6).map((c) => (
                <li key={c._id}>
                  <a href="#courses" onClick={() => setSelectedCourse(c)} className="hover:text-white transition">{c.title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Contact Info</h4>
            <div className="space-y-2 text-[11px] text-gray-400">
              <p className="flex items-start gap-2"><span>📍</span> OPP S.T Paul Church Sialkot Road Gujranwala</p>
              <p className="flex items-center gap-2"><span>📞</span> +92 301-5588503</p>
              <p className="flex items-center gap-2"><span>✉️</span> info@litecollege.com</p>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800/80 pt-6 text-center text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>© 2026 LITE Computer College. All Rights Reserved.</div>
          <div className="flex gap-4">
            <a href="#contact" className="hover:text-gray-300 transition">Privacy Policy</a>
            <span>|</span>
            <a href="#contact" className="hover:text-gray-300 transition">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}