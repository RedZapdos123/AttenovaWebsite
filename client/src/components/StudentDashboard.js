//This program renders the student dashboard for QR scanning, attendance history, and subject statistics.

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import QrReader from 'react-qr-scanner';
import { useNavigate } from 'react-router-dom';
import {
  QrCodeIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Alert from './ui/Alert';

const StudentDashboard = ({ darkMode, toggleDarkMode }) => {
  const [attendance, setAttendance] = useState([]);
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [notification, setNotification] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [scannerActive, setScannerActive] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const markAttendance = async (data) => {
    if (data && data !== scannedData) {
      setScannedData(data);
      setLoading(true);
      setError('');

      try {
        const res = await api.post(
          '/api/attendance/mark',
          { token: data },
          { headers: { 'Authorization': token } }
        );
        setSuccess(res.data.message);
        fetchAttendance();
        fetchDetailedRecords();
        fetchSummary();
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || 'Error marking attendance');
      } finally {
        setLoading(false);
      }
    }
  };

  const markAttendanceManual = async () => {
    if (!manualToken) {
      setError('Please enter a QR token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post(
        'http://localhost:5000/api/attendance/mark',
        { token: manualToken },
        { headers: { 'Authorization': token } }
      );
      setSuccess(res.data.message);
      setManualToken('');
      fetchAttendance();
      fetchDetailedRecords();
      fetchSummary();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Error marking attendance manually');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/api/attendance/record', {
        headers: { 'Authorization': token }
      });
      setAttendance(res.data.records);
    } catch (error) {
      console.error(error);
      setError('Error fetching attendance records');
    }
  };

  const fetchDetailedRecords = async () => {
    try {
      const res = await api.get('/api/attendance/detailed-record', {
        headers: { 'Authorization': token }
      });
      setDetailedRecords(res.data.records || []);
    } catch (error) {
      console.error(error);
      //Fallback to basic records if detailed endpoint doesn't exist.
      setDetailedRecords([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/api/attendance/summary', {
        headers: { 'Authorization': token }
      });
      setSummary(res.data);
    } catch (error) {
      console.error(error);
      //Summary is optional.
      setSummary(null);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchDetailedRecords();
    fetchSummary();

    const notif = localStorage.getItem('attendanceRemovalNotification');
    if (notif) {
      setNotification(notif);
      localStorage.removeItem('attendanceRemovalNotification');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleScanError = (err) => {
    console.error('QR Scanner Error:', err);
  };

  const handleScan = (data) => {
    if (data && scannerActive) {
      markAttendance(data.text || data);
      setScannerActive(false);
      setTimeout(() => setScannerActive(true), 3000); //Prevent multiple scans.
    }
  };

  //Filter and search logic.
  const filteredRecords = detailedRecords.filter(record => {
    const matchesSearch = searchTerm === '' ||
      record.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = filterSubject === '' || record.subject === filterSubject;
    const matchesType = filterType === '' || record.attendanceType === filterType;

    return matchesSearch && matchesSubject && matchesType;
  });

  //Get unique subjects for filter.
  const uniqueSubjects = [...new Set(detailedRecords.map(r => r.subject).filter(Boolean))];

  //Calculate statistics.
  const calculateStats = () => {
    if (summary) {
      return summary;
    }

    //Fallback calculation from basic attendance data.
    const totalAttendances = attendance.reduce((sum, record) => sum + (record.totalAttendances || 0), 0);
    const attendancesGiven = attendance.reduce((sum, record) => sum + (record.attendancesGiven || 0), 0);
    const percentage = totalAttendances > 0 ? ((attendancesGiven / totalAttendances) * 100).toFixed(2) : 0;

    return {
      totalClasses: totalAttendances,
      attendedClasses: attendancesGiven,
      percentage: percentage,
      subjects: attendance.length
    };
  };

  const stats = calculateStats();

  const tabs = [
    { id: 'scanner', label: 'QR Scanner', icon: QrCodeIcon },
    { id: 'records', label: 'Attendance Records', icon: CalendarIcon },
    { id: 'statistics', label: 'Statistics', icon: ChartBarIcon },
  ];

  const previewStyle = {
    height: 300,
    width: '100%',
    maxWidth: 400,
    margin: '0 auto'
  };

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
              <span className="text-sm text-gray-500 dark:text-gray-400">Student Dashboard</span>
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

        {notification && (
          <Alert variant="warning" className="mb-6" onClose={() => setNotification('')}>
            {notification}
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

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCodeIcon className="h-6 w-6 text-primary-600" />
                  <span>Scan QR Code</span>
                </CardTitle>
                <CardDescription>
                  Point your camera at the QR code displayed by your professor to mark attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="border-4 border-primary-200 dark:border-primary-800 rounded-lg overflow-hidden">
                    <QrReader
                      delay={300}
                      onError={handleScanError}
                      onScan={handleScan}
                      style={previewStyle}
                    />
                  </div>
                </div>
                {loading && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Processing...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Token Entry</CardTitle>
                <CardDescription>
                  If the scanner doesn't work, you can manually enter the QR token
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="QR Token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter the QR code token"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      markAttendanceManual();
                    }
                  }}
                />
                <Button
                  onClick={markAttendanceManual}
                  loading={loading}
                  disabled={!manualToken}
                  className="w-full md:w-auto"
                >
                  Submit Token
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FunnelIcon className="h-6 w-6 text-primary-600" />
                  <span>Filter Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by subject..."
                  />

                  <Select
                    label="Subject"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map((subject, idx) => (
                      <option key={idx} value={subject}>{subject}</option>
                    ))}
                  </Select>

                  <Select
                    label="Attendance Type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="qr">QR Scan</option>
                    <option value="manual">Manual</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {attendance.map((record, idx) => (
                <Card key={idx} hover>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {record.subject}
                      </h3>
                      <div className="flex justify-center items-center space-x-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Attended</p>
                          <p className="text-2xl font-bold text-primary-600">
                            {record.attendancesGiven}
                          </p>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600">/</div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Total</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {record.totalAttendances}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${record.totalAttendances > 0
                                ? (record.attendancesGiven / record.totalAttendances) * 100
                                : 0}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {record.totalAttendances > 0
                            ? ((record.attendancesGiven / record.totalAttendances) * 100).toFixed(1)
                            : 0}% Attendance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Records Table */}
            {detailedRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Attendance History</CardTitle>
                  <CardDescription>
                    Showing {filteredRecords.length} of {detailedRecords.length} records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="table-container overflow-x-auto md:overflow-visible hidden md:block">
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Date</th>
                          <th className="table-header-cell">Subject</th>
                          <th className="table-header-cell">Type</th>
                          <th className="table-header-cell">Points</th>
                          <th className="table-header-cell">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record, idx) => (
                            <tr key={idx} className="table-row">
                              <td className="table-cell">
                                {new Date(record.date || record.createdAt).toLocaleDateString()}
                              </td>
                              <td className="table-cell font-medium">
                                {record.subject}
                              </td>
                              <td className="table-cell">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  record.attendanceType === 'qr'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                }`}>
                                  {record.attendanceType === 'qr' ? 'QR Scan' : 'Manual'}
                                </span>
                              </td>
                              <td className="table-cell">
                                {record.attendanceCount || 1}
                              </td>
                              <td className="table-cell">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 inline" />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="table-cell text-center text-gray-500 dark:text-gray-400 py-8">
                              No records found matching your filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                      {/* Mobile card list for detailed records */
                      }
                      <div className="md:hidden space-y-3">
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record, idx) => (
                            <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(record.date || record.createdAt).toLocaleDateString()}</p>
                                  <p className="text-base font-semibold text-gray-900 dark:text-white">{record.subject}</p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.attendanceType === 'qr' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                  {record.attendanceType === 'qr' ? 'QR Scan' : 'Manual'}
                                </span>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-sm">
                                <div className="text-gray-600 dark:text-gray-300">Points: <span className="font-medium">{record.attendanceCount || 1}</span></div>
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No records found matching your filters</p>
                        )}
                      </div>
              </Card>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Classes
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.totalClasses || 0}
                      </p>
                    </div>
                    <CalendarIcon className="h-12 w-12 text-primary-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Classes Attended
                      </p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                        {stats.attendedClasses || 0}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-12 w-12 text-green-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Attendance Rate
                      </p>
                      <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                        {stats.percentage || 0}%
                      </p>
                    </div>
                    <ChartBarIcon className="h-12 w-12 text-primary-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Subjects
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.subjects || attendance.length}
                      </p>
                    </div>
                    <QrCodeIcon className="h-12 w-12 text-gray-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>
                  Your attendance performance across all subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendance.map((record, idx) => {
                    const percentage = record.totalAttendances > 0
                      ? (record.attendancesGiven / record.totalAttendances) * 100
                      : 0;
                    const isGood = percentage >= 75;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.subject}
                          </span>
                          <span className={`text-sm font-semibold ${
                            isGood
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              isGood ? 'bg-green-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{record.attendancesGiven} attended</span>
                          <span>{record.totalAttendances} total</span>
                        </div>
                      </div>
                    );
                  })}

                  {attendance.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No attendance data available yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <footer className="bg-black text-white text-center text-sm py-4 px-4 mt-8">
        <p className="m-0">Attenova • Created by Mridankan Mandal</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
