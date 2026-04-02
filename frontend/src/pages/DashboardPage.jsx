import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import './DashboardPage.css';

const MOCK_STATS = {
  revenue: { value: '₹2.4Cr', change: '+18%', up: true, label: 'Revenue this month' },
  leads: { value: '342', change: '+24', up: true, label: 'Active leads' },
  deals: { value: '28', change: '-3', up: false, label: 'Deals closing soon' },
  winRate: { value: '64%', change: '+6%', up: true, label: 'Win rate' },
};

const MOCK_LEADS = [
  { id: 1, name: 'Priya Sharma', company: 'Infosys Ltd', value: '₹12L', stage: 'Proposal', avatar: 'PS', color: '#c9a84c' },
  { id: 2, name: 'Rohan Mehta', company: 'TCS Global', value: '₹8.5L', stage: 'Negotiation', avatar: 'RM', color: '#2d7a5e' },
  { id: 3, name: 'Ananya Iyer', company: 'Wipro Tech', value: '₹21L', stage: 'Qualified', avatar: 'AI', color: '#7c6ba8' },
  { id: 4, name: 'Karan Bose', company: 'HCL Systems', value: '₹4.2L', stage: 'Discovery', avatar: 'KB', color: '#c45c5c' },
  { id: 5, name: 'Divya Nair', company: 'Cognizant', value: '₹16L', stage: 'Proposal', avatar: 'DN', color: '#d4822a' },
  { id: 6, name: 'Arjun Patel', company: 'Tech Mahindra', value: '₹9L', stage: 'Won', avatar: 'AP', color: '#2d7a5e' },
];

const MOCK_TASKS = [
  { id: 1, title: 'Follow up with Priya on Q2 proposal', due: 'Today, 3:00 PM', priority: 'high', done: false },
  { id: 2, title: 'Send contract draft to TCS team', due: 'Today, 5:30 PM', priority: 'high', done: false },
  { id: 3, title: 'Prepare demo for Wipro pitch', due: 'Tomorrow', priority: 'medium', done: false },
  { id: 4, title: 'Update CRM records for Q1 deals', due: 'Mar 28', priority: 'low', done: true },
  { id: 5, title: 'Review HCL discovery call notes', due: 'Mar 27', priority: 'medium', done: false },
  { id: 6, title: 'Schedule onboarding for Arjun', due: 'Mar 29', priority: 'low', done: true },
];

const MOCK_PIPELINE = [
  { stage: 'Discovery', count: 8, value: '₹34L', color: '#7c6ba8', pct: 25 },
  { stage: 'Qualified', count: 12, value: '₹68L', color: '#c9a84c', pct: 42 },
  { stage: 'Proposal', count: 7, value: '₹91L', color: '#d4822a', pct: 30 },
  { stage: 'Negotiation', count: 5, value: '₹54L', color: '#2d7a5e', pct: 20 },
  { stage: 'Won', count: 3, value: '₹29L', color: '#3da37d', pct: 12 },
];

const STAGE_COLORS = {
  Discovery: '#7c6ba8', Qualified: '#c9a84c', Proposal: '#d4822a',
  Negotiation: '#2d7a5e', Won: '#3da37d', Lost: '#c45c5c',
};

const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };

// Role permission helpers
const ROLE_PERMISSIONS = {
  admin: { tabs: ['overview', 'leads', 'pipeline', 'tasks'], canCreateLead: true, canEditLead: true, canDeleteLead: true, canCreateTask: true, canEditTask: true, canDeleteTask: true },
  sales: { tabs: ['overview', 'leads', 'pipeline', 'tasks'], canCreateLead: true, canEditLead: true, canDeleteLead: false, canCreateTask: true, canEditTask: true, canDeleteTask: false },
  user:  { tabs: ['overview', 'tasks'], canCreateLead: false, canEditLead: false, canDeleteLead: false, canCreateTask: false, canEditTask: false, canDeleteTask: false },
};

const getPermissions = (role) => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;

const ROLE_LABELS = { admin: 'Administrator', sales: 'Sales Rep', user: 'Viewer' };
const ROLE_COLORS = { admin: '#c9a84c', sales: '#2d7a5e', user: '#7c6ba8' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const perms = getPermissions(user?.role);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // CRUD State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, lRes, tRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getLeads(),
        dashboardAPI.getTasks()
      ]);
      setStats(sRes.data.data);
      setLeads(lRes.data.data);
      setTasks(tRes.data.data);
      
      // Calculate pipeline from leads
      const stages = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
      const pipe = stages.map(stage => {
        const stageLeads = lRes.data.data.filter(l => l.status === stage);
        const val = stageLeads.reduce((acc, l) => acc + (parseInt(l.value.replace(/[^0-9]/g, '')) || 0), 0);
        return {
          stage,
          count: stageLeads.length,
          value: `₹${val.toLocaleString('en-IN')}`,
          color: STAGE_COLORS[stage] || '#ccc',
          pct: lRes.data.data.length > 0 ? (stageLeads.length / lRes.data.data.length) * 100 : 0
        };
      });
      setPipeline(pipe);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await dashboardAPI.updateTask(id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' });
      fetchData();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleLeadSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingItem) {
        await dashboardAPI.updateLead(editingItem.id, formData);
      } else {
        await dashboardAPI.createLead(formData);
      }
      setShowLeadModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert("Error saving lead");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await dashboardAPI.deleteLead(id);
      fetchData();
    } catch (err) {
      alert("Error deleting lead");
    }
  };

  const handleTaskSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingItem) {
        await dashboardAPI.updateTask(editingItem.id, formData);
      } else {
        await dashboardAPI.createTask(formData);
      }
      setShowTaskModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert("Error saving task");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await dashboardAPI.deleteTask(id);
      fetchData();
    } catch (err) {
      alert("Error deleting task");
    }
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTasks = tasks.filter(t => !t.done).length;

  const allNavItems = [
    { key: 'overview', icon: '⬡', label: 'Overview' },
    { key: 'leads', icon: '◈', label: 'Leads' },
    { key: 'pipeline', icon: '◫', label: 'Pipeline' },
    { key: 'tasks', icon: '◻', label: 'Tasks', badge: pendingTasks },
  ];
  const navItems = allNavItems.filter(item => perms.tabs.includes(item.key));

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="brand-icon-sm">◆</span>
          <span className="brand-name-sm">DASH</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-info-sm">
              <span className="user-name-sm">{user?.name || 'Demo User'}</span>
              <span className="user-role-sm" style={{ color: ROLE_COLORS[user?.role] || '#aaa' }}>
                {ROLE_LABELS[user?.role] || user?.role || 'User'}
              </span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out">⏻</button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="dash-main">
        {/* Top bar */}
        <header className="dash-header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(s => !s)}>☰</button>
            <div className="header-title-group">
              <h1 className="header-title">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'leads' && 'Leads'}
                {activeTab === 'pipeline' && 'Pipeline'}
                {activeTab === 'tasks' && 'Tasks'}
              </h1>
              <span className="header-date">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
          <div className="header-right">
            {activeTab === 'leads' && perms.canCreateLead && (
              <button className="add-btn-primary" onClick={() => { setEditingItem(null); setShowLeadModal(true); }}>
                + Add Lead
              </button>
            )}
            {activeTab === 'tasks' && perms.canCreateTask && (
              <button className="add-btn-primary" onClick={() => { setEditingItem(null); setShowTaskModal(true); }}>
                + Add Task
              </button>
            )}
            
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input
                className="search-input"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="profile-wrap" ref={profileRef}>
              <button className="profile-btn" onClick={() => setProfileOpen(o => !o)}>
                <div className="profile-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>
              {profileOpen && (
                <div className="profile-dropdown fade-in">
                  <div className="profile-dd-header">
                    <div className="profile-dd-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <div>
                      <div className="profile-dd-name">{user?.name || 'Demo User'}</div>
                      <div className="profile-dd-email">{user?.email || 'demo@crm.com'}</div>
                    </div>
                  </div>
                  <div className="profile-dd-divider" />
                  <button className="profile-dd-item" onClick={handleLogout}>
                    <span>⏻</span> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="dash-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your pipeline...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab 
                  stats={stats} 
                  leads={leads} 
                  tasks={tasks} 
                  toggleTask={toggleTask} 
                  pipeline={pipeline} 
                />
              )}
              {activeTab === 'leads' && (
                <LeadsTab 
                  leads={filteredLeads} 
                  onEdit={perms.canEditLead ? (l) => { setEditingItem(l); setShowLeadModal(true); } : null}
                  onDelete={perms.canDeleteLead ? handleDeleteLead : null}
                />
              )}
              {activeTab === 'pipeline' && <PipelineTab pipeline={pipeline} />}
              {activeTab === 'tasks' && (
                <TasksTab 
                  tasks={tasks} 
                  toggleTask={perms.canEditTask ? toggleTask : null}
                  onEdit={perms.canEditTask ? (t) => { setEditingItem(t); setShowTaskModal(true); } : null}
                  onDelete={perms.canDeleteTask ? handleDeleteTask : null}
                />
              )}
            </>
          )}
        </div>
      </main>

      {showLeadModal && (
        <LeadModal 
          onClose={() => setShowLeadModal(false)} 
          onSubmit={handleLeadSubmit}
          initialData={editingItem}
          loading={formLoading}
        />
      )}

      {showTaskModal && (
        <TaskModal 
          onClose={() => setShowTaskModal(false)} 
          onSubmit={handleTaskSubmit}
          initialData={editingItem}
          loading={formLoading}
        />
      )}
    </div>
  );
}

/* ── Overview Tab ── */
function OverviewTab({ stats, leads, tasks, toggleTask, pipeline }) {
  if (!stats) return null;
  
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 4);
  const recentLeads = leads.slice(0, 4);

  const statItems = [
    { label: 'Total Leads', value: stats.totalLeads, change: '+12%', up: true },
    { label: 'Hot Leads', value: stats.hotLeads, change: '+5', up: true },
    { label: 'Revenue', value: stats.revenue, change: '+18%', up: true },
    { label: 'Win Rate', value: stats.conversionRate, change: '+2%', up: true },
  ];

  return (
    <div className="overview-grid fade-up">
      {/* Stat cards */}
      <div className="stats-row">
        {statItems.map((s, idx) => (
          <div className="stat-card" key={idx}>
            <span className="stat-card-label">{s.label}</span>
            <div className="stat-card-value">{s.value}</div>
            <span className={`stat-card-change ${s.up ? 'up' : 'down'}`}>
              {s.up ? '↑' : '↓'} {s.change} vs last month
            </span>
          </div>
        ))}
      </div>

      {/* Pipeline mini */}
      <div className="overview-card pipeline-mini">
        <div className="card-header">
          <h3 className="card-title">Pipeline Overview</h3>
          <span className="card-total">Standard View</span>
        </div>
        <div className="pipeline-bars">
          {pipeline.map(p => (
            <div className="pipeline-bar-row" key={p.stage}>
              <div className="pb-meta">
                <span className="pb-stage">{p.stage}</span>
                <span className="pb-value">{p.value}</span>
              </div>
              <div className="pb-track">
                <div className="pb-fill" style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
              <span className="pb-count">{p.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="overview-card">
        <div className="card-header">
          <h3 className="card-title">Recent Leads</h3>
        </div>
        <div className="leads-list">
          {recentLeads.map(l => (
            <div className="lead-row" key={l.id}>
              <div className="lead-avatar" style={{ background: (STAGE_COLORS[l.status] || '#ccc') + '22', color: STAGE_COLORS[l.status] }}>
                {l.name.charAt(0)}
              </div>
              <div className="lead-info">
                <span className="lead-name">{l.name}</span>
                <span className="lead-company">{l.company}</span>
              </div>
              <div className="lead-right">
                <span className="lead-value">{l.value}</span>
                <span className="lead-stage-badge" style={{ background: (STAGE_COLORS[l.status] || '#ccc') + '18', color: STAGE_COLORS[l.status] }}>
                  {l.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="overview-card">
        <div className="card-header">
          <h3 className="card-title">Pending Tasks</h3>
        </div>
        <div className="tasks-list">
          {pendingTasks.map(t => (
            <TaskItem key={t.id} task={t} onToggle={toggleTask} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Leads Tab ── */
function LeadsTab({ leads, onEdit, onDelete }) {
  return (
    <div className="fade-up">
      <div className="leads-table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Company</th>
              <th>Deal Value</th>
              <th>Stage</th>
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className="lead-table-row">
                <td>
                  <div className="lead-cell">
                    <div className="lead-avatar" style={{ background: (STAGE_COLORS[l.status] || '#ccc') + '22', color: STAGE_COLORS[l.status] }}>
                      {l.name.charAt(0)}
                    </div>
                    <span className="lead-name">{l.name}</span>
                  </div>
                </td>
                <td><span className="table-company">{l.company}</span></td>
                <td><span className="table-value">{l.value}</span></td>
                <td>
                  <span className="lead-stage-badge" style={{ background: (STAGE_COLORS[l.status] || '#ccc') + '18', color: STAGE_COLORS[l.status] }}>
                    {l.status}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                <td>
                  <div className="table-actions">
                    {onEdit && <button className="action-btn" onClick={() => onEdit(l)} title="Edit">✎</button>}
                    {onDelete && <button className="action-btn delete" onClick={() => onDelete(l.id)} title="Delete">✕</button>}
                  </div>
                </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Pipeline Tab ── */
function PipelineTab({ pipeline }) {
  const total = pipeline.reduce((s, p) => s + p.count, 0);

  return (
    <div className="fade-up pipeline-page">
      <div className="pipeline-summary">
        {pipeline.map(p => (
          <div className="pipeline-summary-card" key={p.stage} style={{ borderTopColor: p.color }}>
            <div className="ps-stage" style={{ color: p.color }}>{p.stage}</div>
            <div className="ps-count">{p.count}</div>
            <div className="ps-value">{p.value}</div>
          </div>
        ))}
      </div>

      <div className="pipeline-detail-card">
        <h3 className="card-title" style={{ marginBottom: 24 }}>Stage Breakdown</h3>
        {pipeline.map(p => {
          const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
          return (
            <div className="pipeline-detail-row" key={p.stage}>
              <div className="pdr-left">
                <div className="pdr-dot" style={{ background: p.color }} />
                <div>
                  <div className="pdr-stage">{p.stage}</div>
                  <div className="pdr-meta">{p.count} leads · {p.value}</div>
                </div>
              </div>
              <div className="pdr-bar-wrap">
                <div className="pdr-bar-track">
                  <div className="pdr-bar-fill" style={{ width: `${pct}%`, background: p.color }} />
                </div>
                <span className="pdr-pct">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tasks Tab ── */
function TasksTab({ tasks, toggleTask, onEdit, onDelete }) {
  const pending = tasks.filter(t => t.status !== 'Completed');
  const done = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="fade-up tasks-page">
      <div className="tasks-section">
        <h3 className="tasks-section-title">Pending <span className="tasks-count">{pending.length}</span></h3>
        <div className="tasks-list-full">
          {pending.map(t => (
            <TaskItem 
              key={t.id} 
              task={t} 
              onToggle={toggleTask} 
              full 
              onEdit={() => onEdit(t)}
              onDelete={() => onDelete(t.id)}
            />
          ))}
        </div>
      </div>
      {done.length > 0 && (
        <div className="tasks-section">
          <h3 className="tasks-section-title">Completed <span className="tasks-count done">{done.length}</span></h3>
          <div className="tasks-list-full">
            {done.map(t => (
              <TaskItem 
                key={t.id} 
                task={t} 
                onToggle={toggleTask} 
                full 
                onEdit={() => onEdit(t)}
                onDelete={() => onDelete(t.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reusable TaskItem ── */
function TaskItem({ task, onToggle, full, onEdit, onDelete }) {
  const isDone = task.status === 'Completed';
  return (
    <div className={`task-item ${isDone ? 'task-done' : ''}`}>
      <button className={`task-check ${isDone ? 'checked' : ''}`} onClick={() => onToggle && onToggle(task.id)} style={!onToggle ? { cursor: 'default', opacity: 0.6 } : {}}>
        {isDone && '✓'}
      </button>
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        {full && (
          <span className={`task-priority prio-${task.priority?.toLowerCase()}`}>{task.priority}</span>
        )}
      </div>
      <span className="task-due">{task.due}</span>
      {full && (onEdit || onDelete) && (
        <div className="task-actions">
          {onEdit && <button className="action-btn-sm" onClick={onEdit}>✎</button>}
          {onDelete && <button className="action-btn-sm delete" onClick={onDelete}>✕</button>}
        </div>
      )}
    </div>
  );
}

/* ── Lead Modal ── */
function LeadModal({ onClose, onSubmit, initialData, loading }) {
  const [formData, setFormData] = useState(initialData || {
    name: '', company: '', email: '', status: 'Discovery', value: '₹0', source: 'Direct'
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card fade-up">
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="form-group">
            <label>Contact Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Priya Sharma" />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. TechNova" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Deal Value</label>
              <input value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} placeholder="₹0" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                {Object.keys(STAGE_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Saving...</> : initialData ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Task Modal ── */
function TaskModal({ onClose, onSubmit, initialData, loading }) {
  const [formData, setFormData] = useState(initialData || {
    title: '', priority: 'Medium', due: '', assignee: '', status: 'Pending'
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card fade-up">
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="form-group">
            <label>Task Title</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Follow up with client" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={formData.due} onChange={e => setFormData({...formData, due: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Saving...</> : initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
