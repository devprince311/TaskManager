import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, LogOut, User, Lock, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const DEMO_USER = { username: 'admin' };
const DEMO_CREDENTIALS = { username: 'admin', password: 'password' };

// Simulate network delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Get tasks from localStorage
const getStoredTasks = () => JSON.parse(localStorage.getItem('tasks')) || [];

// Save tasks to localStorage
const saveStoredTasks = (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks));

// LoginPage Component (Same)
function LoginPage({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await delay(500); // Simulate server delay
    if (
      credentials.username === DEMO_CREDENTIALS.username &&
      credentials.password === DEMO_CREDENTIALS.password
    ) {
      localStorage.setItem('user', JSON.stringify(DEMO_USER));
      onLogin(DEMO_USER);
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Demo credentials: <b>admin / password</b>
        </div>
      </div>
    </div>
  );
}

// Main CRUDApp Component
function CRUDApp({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending', priority: 'medium', completed: false, _id: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6;

  const fetchTasks = () => {
    const allTasks = getStoredTasks();
    let filtered = [...allTasks];

    if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
    if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
    if (filters.search) filtered = filtered.filter(t => t.title.toLowerCase().includes(filters.search.toLowerCase()));

    const startIndex = (currentPage - 1) * itemsPerPage;
    setTasks(filtered.slice(startIndex, startIndex + itemsPerPage));
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, filters]);

  const handleSubmit = async () => {
    setLoading(true);
    await delay(500);

    const allTasks = getStoredTasks();
    let updatedTasks;

    if (form._id) {
      // Edit
      updatedTasks = allTasks.map(t => t._id === form._id ? { ...form } : t);
    } else {
      // Add new
      updatedTasks = [
        ...allTasks,
        { ...form, _id: Date.now().toString(), createdAt: new Date().toISOString() }
      ];
    }

    saveStoredTasks(updatedTasks);
    setForm({ title: '', description: '', status: 'pending', priority: 'medium', completed: false, _id: null });
    setIsEditing(false);
    setCurrentPage(1);
    fetchTasks();
    setLoading(false);
  };

  const editTask = (task) => {
    setForm(task);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({ title: '', description: '', status: 'pending', priority: 'medium', completed: false, _id: null });
    setIsEditing(false);
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    await delay(300);
    const allTasks = getStoredTasks().filter(t => t._id !== id);
    saveStoredTasks(allTasks);
    fetchTasks();
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', search: '' });
    setCurrentPage(1);
  };

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  }[status] || 'bg-gray-100 text-gray-800');

  const getPriorityColor = (priority) => ({
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }[priority] || 'bg-gray-100 text-gray-800');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Task Manager
            </h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.username}!</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Task Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({...form, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.completed}
                    onChange={(e) => setForm({...form, completed: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as completed</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Enter task description"
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Add Task')}
              </button>
              
              {isEditing && (
                <button
                  onClick={cancelEdit}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Search tasks..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Your Tasks</h2>
          
          {loading && tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 text-lg">No tasks found</p>
              <p className="text-gray-400">Add your first task above!</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task, index) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 truncate flex-1 mr-2">
                        {task.title}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editTask(task)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {task.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority} priority
                      </span>
                      {task.completed && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    
                    {task.createdAt && (
                      <div className="pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-purple-600 text-white rounded-lg font-medium">
                    {currentPage}
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={tasks.length <= itemsPerPage}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSampleTasks = () => ([
  {
    _id: Date.now().toString() + "_1",
    title: "Design Homepage",
    description: "Create responsive homepage layout with Tailwind.",
    status: "in-progress",
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: Date.now().toString() + "_2",
    title: "Fix login bug",
    description: "Resolve validation error on login form.",
    status: "pending",
    priority: "medium",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: Date.now().toString() + "_3",
    title: "Deploy to Vercel",
    description: "Push the latest version and test on Vercel.",
    status: "completed",
    priority: "low",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: Date.now().toString() + "_4",
    title: "Write unit tests",
    description: "Add tests for all CRUD operations.",
    status: "pending",
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: Date.now().toString() + "_5",
    title: "Refactor Dashboard",
    description: "Break down into reusable components.",
    status: "in-progress",
    priority: "medium",
    completed: false,
    createdAt: new Date().toISOString(),
  },
]);

useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) setUser(JSON.parse(userData));

  // Add sample tasks only if tasks are empty
  const existingTasks = getStoredTasks();
  if (existingTasks.length === 0) {
    const sampleTasks = getSampleTasks();
    saveStoredTasks(sampleTasks);
  }

  setLoading(false);
}, []);


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return user ? <CRUDApp user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />;
}
