//This program renders the professor dashboard for QR generation (1–60min expiry), manual attendance, and reporting.

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import {
  QrCodeIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Alert from './ui/Alert';
import FileUpload from './ui/FileUpload';

const ProfessorDashboard = ({ darkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('qr-generation');
  const [qrData, setQrData] = useState(null);
  const [qrSize, setQrSize] = useState(200);
  useEffect(() => {
    const calc = () => setQrSize(Math.max(150, Math.min(300, Math.floor((window.innerWidth || 320) * 0.8))));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubject, setNewSubject] = useState({
    subjectName: '',
    subjectCode: '',
    year: '1st',
    section: 'A',
    description: ''
  });
  const [attendanceCount, setAttendanceCount] = useState(1);
  const [expiryTime, setExpiryTime] = useState(5);
  const [manualEmail, setManualEmail] = useState('');
  const [manualMarkMessage, setManualMarkMessage] = useState('');
  const [removeEmail, setRemoveEmail] = useState('');
  const [removeMessage, setRemoveMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectStats, setSubjectStats] = useState({});
  const [studentsModal, setStudentsModal] = useState({ open: false, subject: null, students: [], loading: false });

  const [success, setSuccess] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importHistory, setImportHistory] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
    fetchImportHistory();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/api/subjects', {
        headers: { 'Authorization': token }
      });
      const data = res.data?.subjects || res.data || [];
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0]._id);
      }
      //Pre-compute stats for subjects.
      await Promise.all(
        data.map(async (subj) => {
          try {
            const [studentsRes, sessionsRes] = await Promise.all([
              api.get(`/api/subjects/${subj._id}/students`, { headers: { 'Authorization': token } }),
              api.get(`/api/subjects/${subj._id}/sessions`, { headers: { 'Authorization': token } })
            ]);
            const eligible = studentsRes.data?.students?.length || 0;
            const sessions = sessionsRes.data?.sessions || [];
            const totalSessions = sessions.length;
            const totalPresent = sessions.reduce((sum, s) => sum + (s.presentCount || 0), 0);
            const avgRate = totalSessions > 0 && eligible > 0 ? Math.round((totalPresent / (totalSessions * eligible)) * 100) : 0;
            setSubjectStats(prev => ({ ...prev, [subj._id]: { eligible, totalSessions, avgRate } }));
          } catch (e) {
            //Ignore per-subject stat errors, do not block UI.
          }
        })
      );
    } catch (error) {

      console.error('Error fetching subjects:', error);
      setError('Failed to fetch subjects');
    }
  };

  const createSubject = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/subjects', newSubject, {
        headers: { 'Authorization': token }
      });
      setSuccess('Subject created successfully!');
      setNewSubject({
        subjectName: '',
        subjectCode: '',
        year: '1st',
        section: 'A',
        description: ''
      });
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      setError(error.response?.data?.message || 'Failed to create subject');
    } finally {

      setLoading(false);
    }
  };

  const generateQR = async () => {
    if (!selectedSubject) {
      setError('Please select a subject first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedSubjectData = subjects.find(s => s._id === selectedSubject);
      const res = await api.post('/api/attendance/generate',
        {
          subjectId: selectedSubject,
          subject: selectedSubjectData?.subjectName || 'Unknown',
          year: selectedSubjectData?.year || '1st',
          section: selectedSubjectData?.section || 'A',
          attendanceCount,
          expiryMinutes: expiryTime
        },
        { headers: { 'Authorization': token } }
      );
      setQrData(res.data);
      setSuccess('QR code generated successfully!');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Error generating QR code');
    } finally {
      setLoading(false);
    }
  };

  const markAttendanceManual = async () => {
    if (!manualEmail || !selectedSubject) {
      setError('Please enter email and select a subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedSubjectData = subjects.find(s => s._id === selectedSubject);
      const res = await api.post('/api/attendance/mark-manual',
        {
          email: manualEmail,
          subjectId: selectedSubject,
          subject: selectedSubjectData?.subjectName || 'Unknown',
          attendanceCount
        },
        { headers: { 'Authorization': token } }
      );
      setManualMarkMessage(res.data.message);
      setManualEmail('');
      setSuccess('Attendance marked successfully!');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Error marking attendance manually');
    } finally {
      setLoading(false);
    }
  };

  const removeAttendanceManual = async () => {
    if (!removeEmail) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/attendance/remove-attendance-manual',
        { email: removeEmail },
        { headers: { 'Authorization': token } }
      );
      setRemoveMessage(res.data.message);
      setRemoveEmail('');
      setSuccess('Attendance removed successfully!');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Error removing attendance manually');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await api.post(
        '/api/import-export/import',
        formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      setSuccess(`Successfully imported ${res.data.imported || 0} records`);
      setUploadFile(null);
      setUploadProgress(0);
      fetchImportHistory();
    } catch (error) {
      console.error('Import error:', error);
      setError(error.response?.data?.message || 'Error importing file');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        format: format,
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      });

      const res = await api.get(
        `/api/import-export/export?${params.toString()}`,
        {
          headers: { 'Authorization': token },
          responseType: 'blob'
        }
      );

      //Create download link.
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`Attendance data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      setError(error.response?.data?.message || 'Error exporting data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async (format) => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(
        `/api/import-export/template?format=${format}`,
        {
          headers: { 'Authorization': token },
          responseType: 'blob'
        }
      );

      //Create download link.
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`Template downloaded successfully`);
    } catch (error) {
      console.error('Template download error:', error);
      setError(error.response?.data?.message || 'Error downloading template');
    } finally {
      setLoading(false);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const res = await api.get('/api/import-export/history', {
        headers: { 'Authorization': token }
      });
      setImportHistory(res.data.history || []);
    } catch (error) {
      console.error('Error fetching import history:', error);
      //History is optional, don't show error.
    }
  };

  const borderColors = ['border-blue-500','border-green-500','border-purple-500','border-yellow-500','border-pink-500','border-indigo-500'];

  const openStudentsModal = async (subj) => {
    try {
      setStudentsModal({ open: true, subject: subj, students: [], loading: true });
      const [studentsRes, sessionsRes] = await Promise.all([
        api.get(`/api/subjects/${subj._id}/students`, { headers: { 'Authorization': token } }),
        api.get(`/api/subjects/${subj._id}/sessions`, { headers: { 'Authorization': token } })
      ]);
      const students = studentsRes.data?.students || [];
      const sessions = sessionsRes.data?.sessions || [];
      const sessionSets = sessions.map(s => new Set((s.attendances || []).filter(a => a.present).map(a => String(a.studentId?._id || a.studentId))));
      const totalSessions = sessions.length || 0;
      const enhanced = students.map(st => {
        const id = String(st._id);
        const presentCount = sessionSets.reduce((acc, set) => acc + (set.has(id) ? 1 : 0), 0);
        const percent = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
        return { ...st, attendancePercent: percent };
      });
      setStudentsModal({ open: true, subject: subj, students: enhanced, loading: false });
    } catch (e) {
      setStudentsModal({ open: true, subject: subj, students: [], loading: false });
    }
  };

  const tabs = [
    { id: 'qr-generation', label: 'QR Generation', icon: QrCodeIcon },
    { id: 'subject-management', label: 'Subject Management', icon: Cog6ToothIcon },
    { id: 'manual-attendance', label: 'Manual Attendance', icon: UserGroupIcon },
    { id: 'import-export', label: 'Import/Export', icon: DocumentArrowDownIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/assets/logo.svg" alt="Attenova Logo" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Attenova
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Professor Dashboard</span>
            </div>

            <div className="flex items-center space-x-4">

              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="border-gray-300 dark:border-gray-600"
              >

                {darkMode ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Alerts */}
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'qr-generation' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCodeIcon className="h-6 w-6 text-primary-600" />
                  <span>Generate QR Code for Attendance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName} ({subject.subjectCode}) - {subject.year} {subject.section}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Attendance Points"
                    type="number"
                    min="1"
                    value={attendanceCount}
                    onChange={(e) => setAttendanceCount(e.target.value)}
                    helperText="Points to award for attendance"
                  />

                  <Input
                    label="QR Code Expiry Time (minutes)"
                    type="number"
                    min="1"
                    max="60"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    helperText="QR code will expire after this many minutes (1-60)"
                  />
                </div>

                <Button
                  onClick={generateQR}
                  loading={loading}
                  disabled={!selectedSubject}
                  className="w-full md:w-auto"
                >
                  <QrCodeIcon className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            {qrData && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <QRCodeCanvas
                        value={qrData.token}
                        size={qrSize}
                        level="H"
                        className="border border-gray-200 dark:border-gray-700 rounded-lg"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>
                          <p className="text-gray-900 dark:text-gray-100">{qrData.subject}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Year & Section:</span>
                          <p className="text-gray-900 dark:text-gray-100">{qrData.year} - {qrData.section}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Attendance Points:</span>
                          <p className="text-gray-900 dark:text-gray-100">{attendanceCount}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Expires at:</span>
                          <p className="text-gray-900 dark:text-gray-100">
                            {new Date(qrData.expiration).toLocaleTimeString()}
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              (in {qrData.expiryDuration} minute{qrData.expiryDuration > 1 ? 's' : ''})
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="font-medium text-gray-700 dark:text-gray-300">QR Token:</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 break-all">
                          {qrData.token}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Subject Management Tab */}
        {activeTab === 'subject-management' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlusIcon className="h-6 w-6 text-primary-600" />
                  <span>Create New Subject</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Subject Name"
                    value={newSubject.subjectName}
                    onChange={(e) => setNewSubject({...newSubject, subjectName: e.target.value})}
                    required
                    placeholder="like Web Development"
                  />

                  <Input
                    label="Subject Code"
                    value={newSubject.subjectCode}
                    onChange={(e) => setNewSubject({...newSubject, subjectCode: e.target.value})}
                    required
                    placeholder="like CS301"
                  />

                  <Select
                    label="Year"
                    value={newSubject.year}
                    onChange={(e) => setNewSubject({...newSubject, year: e.target.value})}
                    required
                  >
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </Select>

                  <Select
                    label="Section"
                    value={newSubject.section}
                    onChange={(e) => setNewSubject({...newSubject, section: e.target.value})}
                    required
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </Select>
                </div>

                <Input
                  label="Description (Optional)"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                  placeholder="Brief description of the subject"
                />

                <Button
                  onClick={createSubject}
                  loading={loading}
                  disabled={!newSubject.subjectName || !newSubject.subjectCode}
                  className="w-full md:w-auto"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Subject
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Subjects</CardTitle>
                <div className="mt-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Search by name or code"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        aria-label="Clear search"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No subjects created yet. Create your first subject above.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects
                      .filter((s) => {
                        const q = searchTerm.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          s.subjectName?.toLowerCase().includes(q) ||
                          s.subjectCode?.toLowerCase().includes(q)
                        );
                      })
                      .map((subject, idx) => {
                        const stats = subjectStats[subject._id] || { eligible: 0, totalSessions: 0, avgRate: 0 };
                        const border = borderColors[idx % borderColors.length];
                        return (
                          <div
                            key={subject._id}
                            className={`border-l-4 ${border} rounded-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {subject.subjectName}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{subject.subjectCode}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {subject.year} - Section {subject.section}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                Active
                              </span>
                            </div>

                            {subject.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                {subject.description}
                              </p>
                            )}

                            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <UsersIcon className="h-4 w-4 text-primary-600" />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{stats.eligible}</div>
                                  <div className="text-xs text-gray-500">Students</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-primary-600" />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{stats.totalSessions}</div>
                                  <div className="text-xs text-gray-500">Sessions</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ChartBarIcon className="h-4 w-4 text-primary-600" />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{stats.avgRate}%</div>
                                  <div className="text-xs text-gray-500">Avg Rate</div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button variant="outline" size="sm" onClick={() => openStudentsModal(subject)}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Students
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manual Attendance Tab */}
        {activeTab === 'manual-attendance' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserGroupIcon className="h-6 w-6 text-primary-600" />
                  <span>Mark Attendance Manually</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName} ({subject.subjectCode}) - {subject.year} {subject.section}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Student Email"
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    required
                    placeholder="student@example.com"
                  />
                </div>

                <Button
                  onClick={markAttendanceManual}
                  loading={loading}
                  disabled={!manualEmail || !selectedSubject}
                  className="w-full md:w-auto"
                >
                  Mark Attendance
                </Button>

                {manualMarkMessage && (
                  <Alert variant="success">
                    {manualMarkMessage}
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                  <span>Remove Attendance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="Student Email"
                  type="email"
                  value={removeEmail}
                  onChange={(e) => setRemoveEmail(e.target.value)}
                  required
                  placeholder="student@example.com"
                />

                <Button
                  variant="danger"
                  onClick={removeAttendanceManual}
                  loading={loading}
                  disabled={!removeEmail}
                  className="w-full md:w-auto"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Remove Attendance
                </Button>

                {removeMessage && (
                  <Alert variant="success">
                    {removeMessage}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import-export' && (
          <div className="space-y-6">
            {/* Export Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DocumentArrowDownIcon className="h-6 w-6 text-primary-600" />
                  <span>Export Attendance Data</span>
                </CardTitle>
                <CardDescription>
                  Export attendance records to CSV or Excel format for analysis and record-keeping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date (Optional)"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <Input
                    label="End Date (Optional)"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleExport('csv')}
                    loading={loading}
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('xlsx')}
                    loading={loading}
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DocumentArrowUpIcon className="h-6 w-6 text-primary-600" />
                  <span>Import Attendance Data</span>
                </CardTitle>
                <CardDescription>
                  Import attendance records from CSV or Excel files. Download the template first to ensure proper formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadTemplate('csv')}
                    loading={loading}
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    loading={loading}
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download Excel Template
                  </Button>
                </div>

                <FileUpload
                  onFileSelect={setUploadFile}
                  accept=".csv,.xlsx,.xls"
                  maxSize={5 * 1024 * 1024}
                  disabled={loading}
                />

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleFileUpload}
                  loading={loading}
                  disabled={!uploadFile}
                  className="w-full md:w-auto"
                >
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Upload and Import
                </Button>
              </CardContent>
            </Card>

            {/* Import History */}
            {importHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Import History</CardTitle>
                  <CardDescription>
                    Recent import operations and their results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {importHistory.slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.fileName || 'Unknown file'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.date || item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            item.status === 'success'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {item.status === 'success' ? 'Success' : 'Failed'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.recordsImported || 0} records
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        )}

        {/* Students Modal */}
        {studentsModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6 transition-transform duration-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Students - {studentsModal.subject?.subjectName}
                </h3>
                <button
                  onClick={() => setStudentsModal({ open: false, subject: null, students: [], loading: false })}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {studentsModal.loading ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                ) : studentsModal.students.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No students found.</p>
                ) : (
                  <div className="space-y-2">
                    {studentsModal.students.map((st) => (
                      <div key={st._id} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{st.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{st.email}  {st.year} - {st.section}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{st.attendancePercent}%</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
      <footer className="bg-black text-white text-center text-sm py-4 px-4 mt-8">
        <p className="m-0">Attenova • Created by Mridankan Mandal</p>
      </footer>
    </div>
  );
};

export default ProfessorDashboard;

