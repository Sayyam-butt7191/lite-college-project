import React, { useState, useEffect } from 'react';
import { API } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lite-college-project.onrender.com';

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  // Form States
  const [courseData, setCourseData] = useState({ title: '', description: '', duration: '', price: '', badge: '', image: '' });
  const [facultyData, setFacultyData] = useState({ name: '', role: '', bio: '', phone: '', image: '' });

  // Edit States
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingFacultyId, setEditingFacultyId] = useState(null);

  const fetchData = () => {
    const fetchCourses = API ? API.get('/api/courses') : fetch(`${API_BASE_URL}/api/courses`).then(res => res.json());
    const fetchFaculty = API ? API.get('/api/faculty') : fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json());
    const fetchEnquiries = API ? API.get('/api/enquiries') : fetch(`${API_BASE_URL}/api/enquiries`).then(res => res.json());

    Promise.all([fetchCourses, fetchFaculty, fetchEnquiries])
      .then(([coursesRes, facultyRes, enquiriesRes]) => {
        setCourses(coursesRes.data || coursesRes || []);
        setFaculty(facultyRes.data || facultyRes || []);
        setEnquiries(enquiriesRes.data || enquiriesRes || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add or Update Course
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const endpoint = editingCourseId 
      ? `/api/courses/${editingCourseId}` 
      : '/api/courses';
    const method = editingCourseId ? 'PUT' : 'POST';

    try {
      let res;
      if (API) {
        res = editingCourseId ? await API.put(endpoint, courseData) : await API.post(endpoint, courseData);
      } else {
        res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData)
        });
      }

      alert(editingCourseId ? 'Course Updated Successfully!' : 'Course Added Successfully!');
      setCourseData({ title: '', description: '', duration: '', price: '', badge: '', image: '' });
      setEditingCourseId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save course. Check server logs.');
    }
  };

  // Add or Update Faculty
  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    const endpoint = editingFacultyId 
      ? `/api/faculty/${editingFacultyId}` 
      : '/api/faculty';
    const method = editingFacultyId ? 'PUT' : 'POST';

    try {
      let res;
      if (API) {
        res = editingFacultyId ? await API.put(endpoint, facultyData) : await API.post(endpoint, facultyData);
      } else {
        res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(facultyData)
        });
      }

      alert(editingFacultyId ? 'Faculty Member Updated!' : 'Faculty Member Added!');
      setFacultyData({ name: '', role: '', bio: '', phone: '', image: '' });
      setEditingFacultyId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save faculty. Check server logs.');
    }
  };

  // Select Course for Editing
  const handleEditCourseSelect = (course) => {
    setEditingCourseId(course._id);
    setCourseData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      price: course.price,
      badge: course.badge || '',
      image: course.image
    });
  };

  // Select Faculty for Editing
  const handleEditFacultySelect = (f) => {
    setEditingFacultyId(f._id);
    setFacultyData({
      name: f.name,
      role: f.role,
      bio: f.bio,
      phone: f.phone || '',
      image: f.image
    });
  };

  // Delete Course
  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        if (API) {
          await API.delete(`/api/courses/${id}`);
        } else {
          await fetch(`${API_BASE_URL}/api/courses/${id}`, { method: 'DELETE' });
        }
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete Faculty
  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        if (API) {
          await API.delete(`/api/faculty/${id}`);
        } else {
          await fetch(`${API_BASE_URL}/api/faculty/${id}`, { method: 'DELETE' });
        }
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">🎓 LITE Admin Control Panel</h1>
      </div>
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-600">
          <p className="text-xs text-gray-500 uppercase font-bold">Total Enquiries</p>
          <p className="text-3xl font-bold text-slate-800">{enquiries.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-red-600">
          <p className="text-xs text-gray-500 uppercase font-bold">Active Courses</p>
          <p className="text-3xl font-bold text-slate-800">{courses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-600">
          <p className="text-xs text-gray-500 uppercase font-bold">Total Faculty</p>
          <p className="text-3xl font-bold text-slate-800">{faculty.length}</p>
        </div>
      </div>

      {/* ADD / EDIT FORMS SECTION */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        
        {/* COURSE FORM */}
        <form onSubmit={handleSaveCourse} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-md font-bold text-slate-800">
              {editingCourseId ? '✏️ Edit Course' : '➕ Add New Course'}
            </h2>
            {editingCourseId && (
              <button 
                type="button" 
                onClick={() => { setEditingCourseId(null); setCourseData({ title: '', description: '', duration: '', price: '', badge: '', image: '' }); }}
                className="text-xs text-red-600 underline font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <input type="text" placeholder="Course Title *" required value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} className="border p-2 rounded text-xs w-full" />
          <textarea placeholder="Description *" required value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} className="border p-2 rounded text-xs w-full h-16"></textarea>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Duration (e.g. 3 Months) *" required value={courseData.duration} onChange={e => setCourseData({...courseData, duration: e.target.value})} className="border p-2 rounded text-xs w-full" />
            <input type="text" placeholder="Price (e.g. 15,000 PKR) *" required value={courseData.price} onChange={e => setCourseData({...courseData, price: e.target.value})} className="border p-2 rounded text-xs w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Badge (Optional: Trending/Best Seller)" value={courseData.badge} onChange={e => setCourseData({...courseData, badge: e.target.value})} className="border p-2 rounded text-xs w-full" />
            <input type="text" placeholder="Image URL (e.g. /images/web-dev.jpg) *" required value={courseData.image} onChange={e => setCourseData({...courseData, image: e.target.value})} className="border p-2 rounded text-xs w-full" />
          </div>
          <button type="submit" className={`w-full text-white py-2 rounded text-xs font-bold ${editingCourseId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-900 hover:bg-blue-800'}`}>
            {editingCourseId ? 'UPDATE COURSE' : 'SAVE COURSE'}
          </button>
        </form>

        {/* FACULTY FORM */}
        <form onSubmit={handleSaveFaculty} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-md font-bold text-slate-800">
              {editingFacultyId ? '✏️ Edit Faculty Member' : '👨‍🏫 Add New Faculty'}
            </h2>
            {editingFacultyId && (
              <button 
                type="button" 
                onClick={() => { setEditingFacultyId(null); setFacultyData({ name: '', role: '', bio: '', phone: '', image: '' }); }}
                className="text-xs text-red-600 underline font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <input type="text" placeholder="Teacher Name *" required value={facultyData.name} onChange={e => setFacultyData({...facultyData, name: e.target.value})} className="border p-2 rounded text-xs w-full" />
          <input type="text" placeholder="Role/Designation *" required value={facultyData.role} onChange={e => setFacultyData({...facultyData, role: e.target.value})} className="border p-2 rounded text-xs w-full" />
          <textarea placeholder="Short Bio *" required value={facultyData.bio} onChange={e => setFacultyData({...facultyData, bio: e.target.value})} className="border p-2 rounded text-xs w-full h-16"></textarea>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Phone Number" value={facultyData.phone} onChange={e => setFacultyData({...facultyData, phone: e.target.value})} className="border p-2 rounded text-xs w-full" />
            <input type="text" placeholder="Image URL (e.g. /images/teacher1.jpg) *" required value={facultyData.image} onChange={e => setFacultyData({...facultyData, image: e.target.value})} className="border p-2 rounded text-xs w-full" />
          </div>
          <button type="submit" className={`w-full text-white py-2 rounded text-xs font-bold ${editingFacultyId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {editingFacultyId ? 'UPDATE FACULTY' : 'SAVE FACULTY'}
          </button>
        </form>

      </div>

      {/* MANAGE COURSES & FACULTY LISTS WITH EDIT & DELETE */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        
        {/* COURSES LIST */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Manage Courses ({courses.length})</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {courses.map(c => (
              <div key={c._id} className="flex justify-between items-center p-3 border rounded text-xs bg-gray-50">
                <div>
                  <p className="font-bold text-slate-800">{c.title}</p>
                  <p className="text-gray-500">{c.duration} | {c.price}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditCourseSelect(c)} className="bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600 font-bold transition">Edit</button>
                  <button onClick={() => handleDeleteCourse(c._id)} className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 font-bold transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FACULTY LIST */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Manage Faculty ({faculty.length})</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {faculty.map(f => (
              <div key={f._id} className="flex justify-between items-center p-3 border rounded text-xs bg-gray-50">
                <div>
                  <p className="font-bold text-slate-800">{f.name}</p>
                  <p className="text-red-600 font-semibold">{f.role}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditFacultySelect(f)} className="bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600 font-bold transition">Edit</button>
                  <button onClick={() => handleDeleteFaculty(f._id)} className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 font-bold transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ENQUIRIES TABLE */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 text-slate-800">Student Enquiries Received</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Course Interested</th>
                <th className="p-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length > 0 ? (
                enquiries.map((e) => (
                  <tr key={e._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{e.firstName} {e.lastName}</td>
                    <td className="p-3">{e.email}</td>
                    <td className="p-3">{e.phone}</td>
                    <td className="p-3 text-red-600 font-medium">{e.course}</td>
                    <td className="p-3 text-gray-500">{e.message || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-400">No enquiries found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}