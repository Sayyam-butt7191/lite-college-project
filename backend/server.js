const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. MONGODB CONNECTION SETUP
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lite_college_db';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Database Connected Successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. MONGOOSE SCHEMAS & MODELS (Database Collections)

// (A) Applications / Enquiries Collection
const enquirySchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    course: String,
    message: String,
    appliedAt: { type: Date, default: Date.now }
});
const Enquiry = mongoose.model('Enquiry', enquirySchema);

// (B) Courses Collection
const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    duration: String,
    price: String,
    badge: String,
    image: String
});
const Course = mongoose.model('Course', courseSchema);

// (C) Faculty Collection
const facultySchema = new mongoose.Schema({
    name: String,
    role: String,
    bio: String,
    phone: String,
    image: String
});
const Faculty = mongoose.model('Faculty', facultySchema);


// 3. API ROUTES

// Test Route (To check MongoDB Status)
app.get('/api/status', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ status: 'API Online', database: dbStatus });
});

// ------------ ENQUIRIES / APPLICATIONS APIs ------------

// GET All Enquiries (For Admin Panel)
app.get('/api/enquiries', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ appliedAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST New Application / Enquiry (From Student Form)
app.post('/api/enquiry', async (req, res) => {
    try {
        const newEnquiry = new Enquiry(req.body);
        await newEnquiry.save();
        console.log('📥 New Student Application Saved to MongoDB:', newEnquiry);
        res.status(201).json({ message: 'Application Saved Successfully!', enquiry: newEnquiry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ------------ COURSES APIs (GET, POST, PUT, DELETE) ------------

// GET Courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST New Course
app.post('/api/courses', async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Update Course (EDIT)
app.put('/api/courses/:id', async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCourse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Course
app.delete('/api/courses/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ------------ FACULTY APIs (GET, POST, PUT, DELETE) ------------

// GET Faculty
app.get('/api/faculty', async (req, res) => {
    try {
        const faculty = await Faculty.find();
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST New Faculty Member
app.post('/api/faculty', async (req, res) => {
    try {
        const newFaculty = new Faculty(req.body);
        await newFaculty.save();
        res.status(201).json(newFaculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Update Faculty Member (EDIT)
app.put('/api/faculty/:id', async (req, res) => {
    try {
        const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedFaculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Faculty Member
app.delete('/api/faculty/:id', async (req, res) => {
    try {
        await Faculty.findByIdAndDelete(req.params.id);
        res.json({ message: 'Faculty deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 4. SERVER LISTEN PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});