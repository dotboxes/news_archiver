// src/app/admin/AdminDashboardClient.tsx
"use client";

import {useState} from 'react';
import { Search, User, Shield, Code, Copy, Check, FileText } from 'lucide-react';
import { isAdmin } from '@/lib/admins';
import ArticlesManager from '@/components/ArticlesManager';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role?: string;
    image?: string | null;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    published_date: Date | string | null;
    author?: string | null;
    preview_text?: string | null;
    subtitle?: string | null;
    content: string;
    image_url?: string | null;
    category?: string | null;
}

interface AdminDashboardClientProps {
    currentUser: User;
    allUsers: User[];
    allArticles: Article[];
}

export default function AdminDashboardClient({ currentUser, allUsers = [], allArticles = [] }: AdminDashboardClientProps) {
    const [selectedUser, setSelectedUser] = useState(currentUser);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'articles'>('users');

    const filteredUsers = allUsers.filter(user =>
        user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    return (
        <main className="min-h-screen bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <h1 className="text-[rgb(var(--text-primary))] text-4xl font-bold">Admin Dashboard</h1>
                    </div>
                    <p className="text-secondary">
                        Welcome back, <span className="font-semibold">{currentUser.name || currentUser.email}</span>
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-secondary rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary mb-1">Total Users</p>
                                <p className="text-3xl font-bold text-primary">{allUsers.length}</p>
                            </div>
                            <User className="w-10 h-10 text-blue-600 opacity-60" />
                        </div>
                    </div>
                    <div className="bg-secondary rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary mb-1">Total Articles</p>
                                <p className="text-3xl font-bold text-primary">{allArticles.length}</p>
                            </div>
                            <FileText className="w-10 h-10 text-green-600 opacity-60" />
                        </div>
                    </div>
                    <div className="bg-secondary rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary mb-1">Admins</p>
                                <p className="text-3xl font-bold text-primary">
                                    {allUsers.filter(u => isAdmin(u)).length}
                                </p>
                            </div>
                            <Shield className="w-10 h-10 text-purple-600 opacity-60" />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-secondary rounded-t-md shadow-md mb-6">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                                activeTab === 'users'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-primary hover:text-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <User className="w-4 h-4" />
                                Users & Debug
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('articles')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                                activeTab === 'articles'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-primary hover:text-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" />
                                Manage All Articles
                            </div>
                        </button>
                    </div>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - User Selection */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Current Admin Info Card */}
                            <div className="bg-secondary rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-primary">Your Account</h2>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">
                                        <span className="font-medium">Name:</span> {currentUser.name}
                                    </p>
                                    <p className="text-sm text-secondary">
                                        <span className="font-medium">Email:</span> {currentUser.email}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                            {currentUser.role?.toUpperCase() || 'ADMIN'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Search Card */}
                            <div className="bg-secondary rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-primary mb-4">Select User</h2>

                                {/* Search Input */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* User List */}
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {filteredUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUser(user)}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${
                                                selectedUser.id === user.id
                                                    ? 'bg-secondary border-2 border-blue-500'
                                                    : 'bg-secondary border border-gray-300 hover:bg-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-primary truncate">{user.name || 'No Name'}</p>
                                                    <p className="text-xs text-secondary truncate">{user.email}</p>
                                                </div>
                                                {user.role && (
                                                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                                                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                            user.role === 'moderator' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Debug Info */}
                        <div className="lg:col-span-2">
                            <div className="bg-secondary rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Code className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold text-primary">Debug Information</h2>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(selectedUser.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {copiedId ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy User ID
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Selected User Summary */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                                    <h3 className="font-semibold text-gray-900 mb-2">Selected User</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Name</p>
                                            <p className="font-medium text-gray-900">{selectedUser.name || 'No Name'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Email</p>
                                            <p className="font-medium text-gray-900">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">User ID</p>
                                            <p className="font-mono text-sm text-gray-900 break-all">{selectedUser.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Role</p>
                                            <p className="font-medium text-gray-900 capitalize">{selectedUser.role || 'user'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* JSON Debug Output */}
                                <div>
                                    <h3 className="font-semibold text-primary mb-3">Full Session Data</h3>
                                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-green-400 font-mono text-sm">
                                            {JSON.stringify({ user: selectedUser }, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm text-amber-900">
                                        <strong>To add this user as an admin:</strong> Copy their User ID and add it to the{' '}
                                        <code className="bg-amber-100 px-2 py-1 rounded text-xs">ADMIN_USER_IDS</code> array in{' '}
                                        <code className="bg-amber-100 px-2 py-1 rounded text-xs">lib/admins.ts</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Articles Tab - Now using ArticlesManager component */}
                {activeTab === 'articles' && (
                    <ArticlesManager
                        allArticles={allArticles}
                        showAuthorColumn={true}
                        title="Articles Management"
                        emptyMessage="No articles found in the system."
                    />
                )}
            </div>
        </main>
    );
}