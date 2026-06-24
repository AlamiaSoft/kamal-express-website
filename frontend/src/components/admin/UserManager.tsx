import React, { useState, useEffect } from 'react';
import {
  User, RefreshCw, AlertCircle, X, Save, Shield
} from 'lucide-react';

interface UserManagerProps {
  token: string | null;
  role: string;
  username: string; // current logged-in username
  onSessionExpired: () => void;
}

export default function UserManager({ token, role, username, onSessionExpired }: UserManagerProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersErrorMsg, setUsersErrorMsg] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // User Form fields
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'Admin' | 'Staff' | 'Viewer'>('Staff');
  const [userStatus, setUserStatus] = useState<'Active' | 'Suspended'>('Active');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userModalError, setUserModalError] = useState('');

  useEffect(() => {
    if (token && role === 'Admin') {
      fetchUsers();
    }
  }, [token, role]);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersErrorMsg('');
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        onSessionExpired();
        throw new Error('Session expired or unauthorized.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch users.');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setUsersErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    setIsSavingUser(true);
    try {
      const isEdit = !!selectedUser;
      const url = isEdit ? `/api/admin/users/${selectedUser.id}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';
      
      const bodyPayload: any = {
        username: userUsername,
        fullName: userFullName,
        email: userEmail,
        role: userRole,
        status: userStatus
      };
      
      if (userPassword.trim()) {
        bodyPayload.password = userPassword;
      } else if (!isEdit) {
        throw new Error('Password is required for new users.');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (response.status === 401 || response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 && errData.message) {
          throw new Error(errData.message);
        }
        onSessionExpired();
        throw new Error('Session expired or unauthorized.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (data.errors ? data.errors.join(' ') : 'Failed to save user.'));
      }

      fetchUsers();
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setUserModalError(err.message || 'An error occurred.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 && errData.message) {
          throw new Error(errData.message);
        }
        onSessionExpired();
        throw new Error('Session expired or unauthorized.');
      }

      if (!response.ok) {
        throw new Error('Failed to delete user.');
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  if (role !== 'Admin') {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md mx-auto space-y-4">
        <Shield className="w-12 h-12 text-slate-350 mx-auto" />
        <h3 className="text-sm font-extrabold text-slate-800">Access Restricted</h3>
        <p className="text-xs text-slate-400">Only administrators are authorized to manage user accounts and system credentials.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 block tracking-tight">System Users & Access Roles</h3>
        <button
          onClick={() => {
            setSelectedUser(null);
            setUserUsername('');
            setUserPassword('');
            setUserFullName('');
            setUserEmail('');
            setUserRole('Staff');
            setUserStatus('Active');
            setUserModalError('');
            setIsUserModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto sm:ml-0"
        >
          Add System User
        </button>
      </div>

      {isUsersLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading system users...</p>
        </div>
      ) : usersErrorMsg ? (
        <div className="py-20 text-center space-y-4 max-w-xs mx-auto text-xs text-red-500 font-semibold">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p>{usersErrorMsg}</p>
          <button
            onClick={fetchUsers}
            className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-slate-150"
          >
            Retry Fetching
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <User className="w-8 h-8 text-slate-350 mx-auto" />
          <h4 className="text-xs font-bold text-slate-800">No users found</h4>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                <th className="py-4 px-6 text-left">User Details</th>
                <th className="py-4 px-6 text-left">Email Address</th>
                <th className="py-4 px-6 text-center">Role</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="py-4.5 px-6 space-y-0.5 text-left">
                    <span className="font-extrabold block text-slate-900">{u.full_name}</span>
                    <span className="text-[10px] text-slate-400 font-bold block">@{u.username}</span>
                  </td>
                  <td className="py-4.5 px-6 text-left font-semibold text-slate-800">
                    {u.email}
                  </td>
                  <td className="py-4.5 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      u.role === 'Admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : u.role === 'Staff'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      u.status === 'Active'
                        ? 'bg-green-50 text-green-800 border border-green-100'
                        : 'bg-red-50 text-red-800 border border-red-100'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setUserUsername(u.username);
                        setUserPassword('');
                        setUserFullName(u.full_name);
                        setUserEmail(u.email);
                        setUserRole(u.role);
                        setUserStatus(u.status);
                        setUserModalError('');
                        setIsUserModalOpen(true);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-750 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all"
                    >
                      Edit
                    </button>
                    {u.username !== username && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-xs font-bold text-red-650 hover:text-red-700 cursor-pointer bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-100 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Add/Edit Dialog Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-150 text-left animate-in zoom-in-95 duration-250">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-950">
                {selectedUser ? 'Edit User Credentials' : 'Add System User'}
              </h3>
              <button
                onClick={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
                className="text-slate-400 hover:text-slate-650 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="p-6 space-y-4">
              {userModalError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-655 font-semibold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{userModalError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs font-semibold">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Username</label>
                  <input
                    type="text"
                    required
                    disabled={!!selectedUser}
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="john_doe"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white font-bold disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="john@kamalexpress.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">
                    Password {selectedUser && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    required={!selectedUser}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder={selectedUser ? '••••••••' : 'Enter password'}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white"
                  />
                </div>

                {/* Role & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Access Role</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      disabled={selectedUser?.username === username}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white text-slate-700 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Staff">Staff</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Account Status</label>
                    <select
                      value={userStatus}
                      onChange={(e) => setUserStatus(e.target.value as any)}
                      disabled={selectedUser?.username === username}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white text-slate-700 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-xs text-center cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSavingUser ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
