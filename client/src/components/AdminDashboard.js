//This program renders the administrator dashboard with management, CSV export (session type filter), stats, and audit logs.

import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const AdminDashboard = () => {
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ professors: 0, subjects: 0, students: 0, sessions: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //Forms.
  const [newProf, setNewProf] = useState({ name: '', email: '', password: 'Test123!' });
  const [newSubject, setNewSubject] = useState({ subjectName: '', subjectCode: '', year: '1st', section: 'C', professorEmail: '' });
  const [bulkFile, setBulkFile] = useState(null);
  //CSV Export.
  const [exportSubjectId, setExportSubjectId] = useState('');
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  //Search & Pagination state.
  const [exportSessionType, setExportSessionType] = useState('');
  //Audit logs state.
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const auditLimit = 20;
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditAction, setAuditAction] = useState('');

  const [searchProf, setSearchProf] = useState('');
  const [profPage, setProfPage] = useState(1);
  const profPageSize = 10;
  const [searchSubj, setSearchSubj] = useState('');
  const [subjPage, setSubjPage] = useState(1);
  const subjPageSize = 10;


  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [p, s, st] = await Promise.all([
        api.get('/api/admin/professors'),
        api.get('/api/admin/subjects'),
        api.get('/api/admin/stats'),
      ]);
      setProfessors(p.data.professors || []);

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams({ page: String(auditPage), limit: String(auditLimit) });
      if (auditAction) params.append('action', auditAction);
      const res = await api.get(`/api/admin/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.logs || []);
      setAuditTotal(res.data.total || 0);
    } catch (e) {
      //Don't block admin UI on audit logs errors.
    }
  };

  useEffect(() => { fetchAuditLogs(); }, [auditPage, auditAction]);

      setSubjects(s.data.subjects || []);
      if (st?.data?.totals) setStats(st.data.totals);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const onCreateProfessor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/api/admin/professors', newProf);
      setNewProf({ name: '', email: '', password: 'Test123!' });
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create professor');
    } finally { setLoading(false); }
  };

  const onCreateSubject = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/api/admin/subjects', newSubject);

      setNewSubject({ subjectName: '', subjectCode: '', year: '1st', section: 'C', professorEmail: '' });
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create subject');
    } finally { setLoading(false); }
  };

  const onUploadBulk = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;
    try {
      setLoading(true);
      setError('');
      const form = new FormData();
      form.append('file', bulkFile);
      const res = await api.post('/api/admin/upload-attendance', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert(`Bulk upload done. Sessions: ${res.data.sessionsCreated}, Records: ${res.data.attendanceRecordsCreated}`);
      setBulkFile(null);
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || 'Bulk upload failed');
    } finally { setLoading(false); }
  };
  const onDeactivateProfessor = async (id) => {
    if (!window.confirm('Deactivate this professor?')) return;
    try { setLoading(true); await api.delete(`/api/admin/professors/${id}`); await fetchAll(); }
    catch(e){ setError(e?.response?.data?.message||'Failed to deactivate professor'); }
    finally{ setLoading(false); }
  };


  const onDeactivateSubject = async (id) => {
    if (!window.confirm('Deactivate this subject?')) return;
    try { setLoading(true); await api.delete(`/api/admin/subjects/${id}`); await fetchAll(); }
    catch(e){ setError(e?.response?.data?.message||'Failed to deactivate subject'); }
    finally{ setLoading(false); }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-3">
            <img src="/assets/logo.svg" alt="Attenova Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attenova</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">Administrator Dashboard</span>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card><CardContent><div className="text-xs text-gray-500">Professors</div><div className="text-2xl font-semibold">{stats.professors}</div></CardContent></Card>
        <Card><CardContent><div className="text-xs text-gray-500">Subjects</div><div className="text-2xl font-semibold">{stats.subjects}</div></CardContent></Card>
        <Card><CardContent><div className="text-xs text-gray-500">Students</div><div className="text-2xl font-semibold">{stats.students}</div></CardContent></Card>
        <Card><CardContent><div className="text-xs text-gray-500">Sessions</div><div className="text-2xl font-semibold">{stats.sessions}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Professor Management */}
        <Card>
          <CardHeader><CardTitle>Professor Management</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onCreateProfessor} className="space-y-3">
              <Input label="Name" value={newProf.name} onChange={e => setNewProf({ ...newProf, name: e.target.value })} required />
              <Input label="Email" type="email" value={newProf.email} onChange={e => setNewProf({ ...newProf, email: e.target.value })} required />
              <Input label="Password" type="password" value={newProf.password} onChange={e => setNewProf({ ...newProf, password: e.target.value })} required />
              <Button type="submit" loading={loading}>Create Professor</Button>
            </form>


            <div className="mt-6">
              <h3 className="font-semibold mb-2">All Professors</h3>
              <div className="flex items-center justify-between mb-2 gap-3">
                <Input label="Search" value={searchProf} onChange={e=>{setSearchProf(e.target.value); setProfPage(1);}} placeholder="Search by name or email" />
                <div className="text-xs text-gray-500">{professors.length} total</div>
              </div>
              <ul className="space-y-1 max-h-64 overflow-auto pr-2">
                {professors
                  .filter(p => !searchProf || p.name?.toLowerCase().includes(searchProf.toLowerCase()) || p.email?.toLowerCase().includes(searchProf.toLowerCase()))
                  .slice((profPage-1)*profPageSize, profPage*profPageSize)
                  .map(p => (
                    <li key={p._id} className="text-sm flex items-center justify-between">
                      <span>
                        {p.name} - {p.email} {p.isActive === false && (<span className="ml-2 text-xs text-red-600">(deactivated)</span>)}
                      </span>
                      {p.isActive !== false && (
                        <button className="ml-2 px-2 py-0.5 text-xs border rounded" onClick={() => onDeactivateProfessor(p._id)}>Deactivate</button>
                      )}
                    </li>
                  ))}
              </ul>
              <div className="flex items-center justify-end mt-2 gap-2 text-sm">
                <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={profPage <= 1} onClick={() => setProfPage(p => Math.max(1, p - 1))}>Prev</button>
                <span>Page {profPage}</span>
                <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={professors.filter(p => !searchProf || p.name?.toLowerCase().includes(searchProf.toLowerCase()) || p.email?.toLowerCase().includes(searchProf.toLowerCase())).length <= profPage * profPageSize} onClick={() => setProfPage(p => p + 1)}>Next</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Management */}
        <Card>
          <CardHeader><CardTitle>Subject Management</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onCreateSubject} className="space-y-3">
              <Input label="Subject Name" value={newSubject.subjectName} onChange={e => setNewSubject({ ...newSubject, subjectName: e.target.value })} required />
              <Input label="Subject Code" value={newSubject.subjectCode} onChange={e => setNewSubject({ ...newSubject, subjectCode: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Year" value={newSubject.year} onChange={e => setNewSubject({ ...newSubject, year: e.target.value })} placeholder="e.g., 1st" />
                <Input label="Section" value={newSubject.section} onChange={e => setNewSubject({ ...newSubject, section: e.target.value })} placeholder="e.g., C" />
              </div>
              <Input label="Professor Email" type="email" value={newSubject.professorEmail} onChange={e => setNewSubject({ ...newSubject, professorEmail: e.target.value })} required />
              <Button type="submit" loading={loading}>Create Subject</Button>
            </form>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">All Subjects</h3>
              <div className="flex items-center justify-between mb-2 gap-3">
                <Input label="Search" value={searchSubj} onChange={e=>{setSearchSubj(e.target.value); setSubjPage(1);}} placeholder="Search name/code/year/section/prof" />
                <div className="text-xs text-gray-500">{subjects.length} total</div>
              </div>
              <ul className="space-y-1 max-h-64 overflow-auto pr-2 text-sm">
                {subjects
                  .filter(s=>{const q=searchSubj.toLowerCase();return !q || s.subjectName?.toLowerCase().includes(q) || s.subjectCode?.toLowerCase().includes(q) || s.year?.toLowerCase().includes(q) || s.section?.toLowerCase().includes(q) || s.professorEmail?.toLowerCase().includes(q) || s.professorId?.email?.toLowerCase().includes(q);})
                  .slice((subjPage-1)*subjPageSize, subjPage*subjPageSize)
                  .map(s => (
                    <li key={s._id} className="flex items-center justify-between">
                      <span>{s.subjectCode} - {s.subjectName} ({s.year} / {s.section}) - {s?.professorId?.email || s.professorEmail} {s.isActive===false && <span className="ml-2 text-xs text-red-600">(deactivated)</span>}</span>
                      {s.isActive !== false && (
                        <button className="ml-2 px-2 py-0.5 text-xs border rounded" onClick={()=>onDeactivateSubject(s._id)}>Deactivate</button>
                      )}
                    </li>
                  ))}
              </ul>
              <div className="flex items-center justify-end mt-2 gap-2 text-sm">
                <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={subjPage<=1} onClick={()=>setSubjPage(p=>Math.max(1,p-1))}>Prev</button>
                <span>Page {subjPage}</span>
                <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={subjects.filter(s=>{const q=searchSubj.toLowerCase();return !q || s.subjectName?.toLowerCase().includes(q) || s.subjectCode?.toLowerCase().includes(q) || s.year?.toLowerCase().includes(q) || s.section?.toLowerCase().includes(q) || s.professorEmail?.toLowerCase().includes(q) || s.professorId?.email?.toLowerCase().includes(q);}).length <= subjPage*subjPageSize} onClick={()=>setSubjPage(p=>p+1)}>Next</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Attendance Upload */}
        <Card>
          <CardHeader><CardTitle>Bulk Attendance Upload (CSV)</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onUploadBulk} className="space-y-3">
              <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files?.[0] || null)} />
              <Button type="submit" loading={loading} disabled={!bulkFile}>Upload</Button>
            </form>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              CSV columns: studentEmail, subjectCode, date (YYYY-MM-DD), status (present/absent), sessionName (optional)
            </div>
          </CardContent>
        </Card>


        {/* CSV Export */}
        <Card>
          <CardHeader><CardTitle>Export Attendance CSV</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Subject</label>
                <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={exportSubjectId} onChange={e=>setExportSubjectId(e.target.value)}>
                  <option value="">Select subject...</option>
                  {subjects.map(s=> (
                    <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName} ({s.year}/{s.section})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Start date</label>
                  <input type="date" className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={exportStart} onChange={e=>setExportStart(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">End date</label>
                  <input type="date" className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={exportEnd} onChange={e=>setExportEnd(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Session type</label>
                <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800" value={exportSessionType} onChange={e=>setExportSessionType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="qr">QR Code</option>
                  <option value="manual">Manual</option>
                  <option value="bulk">Bulk Upload</option>
                </select>
              </div>

              <div>
                <Button onClick={async()=>{
                  if(!exportSubjectId){ alert('Please select a subject'); return; }
                  try{
                    setLoading(true);
                    const params = new URLSearchParams({ subjectId: exportSubjectId });
                    if(exportStart) params.append('start', exportStart);
                    if(exportEnd) params.append('end', exportEnd);
                    if(exportSessionType) params.append('sessionType', exportSessionType);
                    const res = await api.get(`/api/admin/export-attendance?${params.toString()}`, { responseType: 'blob' });
                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'attendance.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch(e){
                    setError(e?.response?.data?.message || 'Export failed');
                  } finally { setLoading(false); }
                }}>
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="mt-6">
          <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1" />
              <div>
                <label className="block text-sm mb-1">Action</label>
                <select className="w-56 border rounded px-2 py-1 bg-white dark:bg-gray-800" value={auditAction} onChange={e=>{setAuditPage(1); setAuditAction(e.target.value);}}>
                  <option value="">All</option>
                  <option value="createProfessor">Create Professor</option>
                  <option value="createSubject">Create Subject</option>
                  <option value="deactivateProfessor">Deactivate Professor</option>
                  <option value="deactivateSubject">Deactivate Subject</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Timestamp</th>
                    <th className="py-2 px-2">Action</th>
                    <th className="py-2 px-2">Admin User</th>
                    <th className="py-2 px-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log)=> (
                    <tr key={log._id} className="border-b">
                      <td className="py-2 px-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-2">{log.action}</td>
                      <td className="py-2 px-2">{log.actorId?.name ? `${log.actorId.name} (${log.actorId.email})` : (log.actorEmail || '-')}</td>
                      <td className="py-2 px-2 max-w-md">
                        {log.details ? (
                          <div className="text-gray-700 dark:text-gray-300 truncate">
                            {Object.entries(log.details).map(([k,v])=>`${k}: ${typeof v==='object'? JSON.stringify(v): v}`).join(', ')}
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length===0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500">No logs</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end mt-3 gap-2 text-sm">
              <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={auditPage<=1} onClick={()=>setAuditPage(p=>Math.max(1,p-1))}>Prev</button>
              <span>Page {auditPage} / {Math.max(1, Math.ceil(auditTotal / auditLimit))}</span>
              <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={auditPage >= Math.ceil(auditTotal / auditLimit)} onClick={()=>setAuditPage(p=>p+1)}>Next</button>
            </div>
          </CardContent>
        </Card>


      </div>
      </div>
      <footer className="bg-black text-white text-center text-sm py-4 px-4 mt-8">
        <p className="m-0">Attenova • Created by Mridankan Mandal</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;

