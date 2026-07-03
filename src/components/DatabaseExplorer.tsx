import React, { useState, useEffect } from 'react';
import { Database, Table, ChevronRight, Info, Code, Terminal, Copy, Check, FileText, Play, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Student, Room, Payment, Complaint } from '../types';

interface DbInfo {
  database: string;
  tables: {
    name: string;
    columns: any[];
    rowCount: number;
    sql?: string;
  }[];
  fullDdl?: string;
}

interface Props {
  students: Student[];
  rooms: Room[];
  payments: Payment[];
  complaints: Complaint[];
}

export default function DatabaseExplorer({ students, rooms, payments, complaints }: Props) {
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('Student');
  const [activeTab, setActiveTab] = useState<'data' | 'ddl' | 'dictionary' | 'full_ddl'>('data');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // SQL Query states
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM Student;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const fetchDbInfo = () => {
    setIsLoading(true);
    fetch('/api/database/info')
      .then(res => res.json())
      .then(data => {
        if (data.tables && data.tables.length > 0) {
          setDbInfo(data);
          // Set initial table if the current one is not in the list
          const exists = data.tables.some((t: any) => t.name === selectedTable);
          if (!exists) {
            setSelectedTable(data.tables[0].name);
          }
        } else if (data.tables) {
          setDbInfo(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching db info:', err);
        setIsLoading(false);
      });
  };

  // Reset query based on selected table
  useEffect(() => {
    if (activeTab === 'data') {
      const defaultQuery = `SELECT * FROM "${selectedTable}";`;
      setSqlQuery(defaultQuery);
      handleExecuteQuery(defaultQuery);
    }
  }, [selectedTable, activeTab]);

  const handleExecuteQuery = async (queryToRun = sqlQuery) => {
    setIsQuerying(true);
    setQueryError(null);
    try {
      const res = await fetch('/api/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun })
      });
      const data = await res.json();
      if (data.success) {
        setQueryResult(data.data);
        
        // If the query was a data-modifying or schema-modifying SQL, refresh the catalog!
        const normalizedQuery = queryToRun.trim().toUpperCase();
        if (!normalizedQuery.startsWith('SELECT') || normalizedQuery.includes('CREATE') || normalizedQuery.includes('ALTER') || normalizedQuery.includes('DROP') || normalizedQuery.includes('INSERT') || normalizedQuery.includes('UPDATE') || normalizedQuery.includes('DELETE')) {
          fetchDbInfo();
        }
      } else {
        setQueryResult(null);
        setQueryError(data.error || 'Failed to execute query.');
      }
    } catch (err: any) {
      console.error('Query error:', err);
      setQueryResult(null);
      setQueryError(err.message || 'Network error executing SQL query.');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTableInfo = dbInfo?.tables?.find(t => t.name === selectedTable);

  if (isLoading && !dbInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary font-medium">Introspecting SQL Database Schema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">SQL Database Backend</h2>
          <p className="text-text-secondary text-sm">View underlying SQL tables, execute raw queries, check DDL schemas, and relationships</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg">
          <Database className="w-5 h-5 text-accent" />
          <span className="font-mono text-sm font-semibold text-accent">Relational Database Engine (SQL Standard)</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table List Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Table className="w-4 h-4 text-text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Database Tables</span>
          </div>
          
          {dbInfo?.tables?.map((table) => (
            <button
              key={table.name}
              onClick={() => {
                setSelectedTable(table.name);
                if (activeTab === 'full_ddl') {
                  setActiveTab('data');
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group border text-left",
                selectedTable === table.name && activeTab !== 'full_ddl'
                  ? "bg-white dark:bg-card-bg border-accent shadow-sm text-accent dark:text-white"
                  : "bg-gray-50/50 dark:bg-white/5 border-transparent hover:border-border text-gray-700 dark:text-text-secondary"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-md transition-colors",
                  selectedTable === table.name && activeTab !== 'full_ddl' ? "bg-accent text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500"
                )}>
                  <Table className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-sm capitalize">{table.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-500">
                  {table.rowCount} rows
                </span>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white",
                  selectedTable === table.name && activeTab !== 'full_ddl' ? "rotate-90 text-accent" : ""
                )} />
              </div>
            </button>
          ))}

          {/* Special Option: Full DDL Script */}
          <button
            onClick={() => setActiveTab('full_ddl')}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group border text-left mt-3",
              activeTab === 'full_ddl'
                ? "bg-white dark:bg-card-bg border-accent shadow-sm text-accent dark:text-white"
                : "bg-amber-500/10 dark:bg-amber-500/5 border-transparent hover:border-amber-500/20 text-amber-600 dark:text-amber-400"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-1.5 rounded-md",
                activeTab === 'full_ddl' ? "bg-accent text-white" : "bg-amber-500/20 text-amber-600"
              )}>
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm">Full Schema DDL</span>
            </div>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform",
              activeTab === 'full_ddl' ? "rotate-90 text-accent" : "text-gray-400"
            )} />
          </button>

          {/* Mentor Tips Box */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl mt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400">Mentor Tip:</p>
                <p className="text-[11px] leading-relaxed text-yellow-700 dark:text-yellow-400/80">
                  This engine runs standard relational SQL. You can write JOIN queries to connect Students with Rooms, or run aggregates to compute total hostel dues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Viewer Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Navigation Tabs */}
          {activeTab !== 'full_ddl' && (
            <div className="flex border-b dark:border-border/60 gap-1">
              <button
                onClick={() => setActiveTab('data')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
                  activeTab === 'data'
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Terminal className="w-4 h-4" />
                SQL Query Console
              </button>
              <button
                onClick={() => setActiveTab('ddl')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
                  activeTab === 'ddl'
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Code className="w-4 h-4" />
                Table Schema (SQL DDL)
              </button>
              <button
                onClick={() => setActiveTab('dictionary')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
                  activeTab === 'dictionary'
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Table className="w-4 h-4" />
                Column Dictionary
              </button>
            </div>
          )}

          {/* 1. QUERY RESULT (SELECT) TAB */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Terminal Window with input */}
              <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-border/10 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 bg-[#252525] border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 mr-4">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="text-xs font-mono text-gray-400">Interactive SQL Terminal</span>
                  </div>
                  <button
                    onClick={() => handleExecuteQuery()}
                    disabled={isQuerying}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isQuerying ? 'Executing...' : 'QUERY'}</span>
                  </button>
                </div>
                
                {/* Code input textarea */}
                <div className="p-4 bg-[#181818] border-b border-white/5 flex gap-3 items-start">
                  <span className="font-mono text-accent font-bold select-none pt-1">SQL&gt;</span>
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Enter your SQL query here..."
                    className="w-full bg-transparent font-mono text-sm leading-relaxed text-[#DCDCDC] outline-none border-none resize-none min-h-[50px] focus:ring-0"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleExecuteQuery();
                      }
                    }}
                  />
                </div>

                <div className="px-6 py-2 bg-[#202020] border-b border-white/5 flex justify-between text-[11px] font-mono text-gray-500">
                  <span>Press <kbd className="bg-white/5 px-1 py-0.5 rounded">Ctrl + Enter</kbd> to run</span>
                  <span>Try editing the query above!</span>
                </div>

                {/* Console Output Area */}
                <div className="p-6 max-h-[400px] overflow-auto custom-scrollbar">
                  {queryError ? (
                    <div className="flex gap-3 text-red-400 bg-red-950/20 p-4 border border-red-900/30 rounded-xl font-mono text-xs">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <div className="space-y-1">
                        <span className="font-bold">SQL Error:</span>
                        <p className="leading-relaxed whitespace-pre-wrap">{queryError}</p>
                      </div>
                    </div>
                  ) : isQuerying ? (
                    <div className="flex items-center justify-center py-10 space-x-3 text-gray-400 font-mono text-sm">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <span>Executing relational database command...</span>
                    </div>
                  ) : queryResult ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                        <span>Query returned {queryResult.length} row{queryResult.length !== 1 ? 's' : ''}</span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(queryResult, null, 2))}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy Output'}</span>
                        </button>
                      </div>
                      <pre className="font-mono text-sm leading-relaxed text-[#DCDCDC]">
                        {JSON.stringify(queryResult, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-500 font-mono text-xs text-center py-6">No output returned. Type a SQL query and click QUERY.</p>
                  )}
                </div>
              </div>

              {/* Suggestions Box */}
              <div className="bg-white dark:bg-card-bg p-5 rounded-xl border dark:border-border/60">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Example SQL Queries to Try:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={() => {
                      const q = 'SELECT * FROM "Student" WHERE "status" = \'Active\';';
                      setSqlQuery(q);
                      handleExecuteQuery(q);
                    }}
                    className="p-3 text-left font-mono text-xs text-text-secondary bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border dark:border-border transition-colors group flex justify-between items-center"
                  >
                    <span>SELECT Active Students</span>
                    <Play className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => {
                      const q = 'SELECT "Room"."number", "Room"."type", "Room"."pricePerMonth", COUNT("Student"."id") AS "occupants"\nFROM "Room"\nLEFT JOIN "Student" ON "Room"."id" = "Student"."roomId"\nGROUP BY "Room"."id";';
                      setSqlQuery(q);
                      handleExecuteQuery(q);
                    }}
                    className="p-3 text-left font-mono text-xs text-text-secondary bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border dark:border-border transition-colors group flex justify-between items-center"
                  >
                    <span>JOIN Rooms &amp; Occupants</span>
                    <Play className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => {
                      const q = 'SELECT "status", COUNT(*) as "count", SUM("amount") as "total_fee"\nFROM "Payment"\nGROUP BY "status";';
                      setSqlQuery(q);
                      handleExecuteQuery(q);
                    }}
                    className="p-3 text-left font-mono text-xs text-text-secondary bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border dark:border-border transition-colors group flex justify-between items-center"
                  >
                    <span>SUM Fees by Payment Status</span>
                    <Play className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => {
                      const q = 'SELECT * FROM "Complaint" WHERE "priority" = \'High\' ORDER BY "date" DESC;';
                      setSqlQuery(q);
                      handleExecuteQuery(q);
                    }}
                    className="p-3 text-left font-mono text-xs text-text-secondary bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border dark:border-border transition-colors group flex justify-between items-center"
                  >
                    <span>ORDER High Priority Complaints</span>
                    <Play className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. TABLE SCHEMA (SQL DDL) TAB */}
          {activeTab === 'ddl' && (
            <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-border/10 shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-[#252525] border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-4">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <span className="text-xs font-mono text-gray-400">DDL Creation Statement</span>
                </div>
                <button
                  onClick={() => handleCopy(currentTableInfo?.sql || '')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-mono text-gray-400 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              
              <div className="p-6 max-h-[600px] overflow-auto custom-scrollbar">
                <pre className="font-mono text-sm leading-relaxed text-[#56B6C2]">
                  <code className="text-[#ABB2BF]">
                    {currentTableInfo?.sql || `-- No schema statement registered for ${selectedTable}`}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* 3. COLUMN DICTIONARY TABLE */}
          {activeTab === 'dictionary' && (
            <div className="bg-white dark:bg-card-bg rounded-xl border dark:border-border/60 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b dark:border-border/60 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.01]">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Column Properties & Constraints for <span className="text-accent">"{selectedTable}"</span>
                </h3>
                <span className="text-xs font-mono text-text-secondary bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded">
                  {currentTableInfo?.columns?.length || 0} columns detected
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-text-secondary text-[11px] font-bold uppercase tracking-widest border-b dark:border-border/60">
                      <th className="px-6 py-3.5">CID</th>
                      <th className="px-6 py-3.5">Column Name</th>
                      <th className="px-6 py-3.5">SQL Type</th>
                      <th className="px-6 py-3.5 text-center">Nullable</th>
                      <th className="px-6 py-3.5 text-center">Primary Key</th>
                      <th className="px-6 py-3.5">Default Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] dark:divide-border/60">
                    {currentTableInfo?.columns?.map((col: any) => (
                      <tr key={col.cid} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-text-secondary">{col.cid}</td>
                        <td className="px-6 py-3 font-mono text-xs font-bold text-gray-900 dark:text-white">{col.name}</td>
                        <td className="px-6 py-3 font-mono text-xs text-accent font-semibold">{col.type}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            col.notnull === 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                          )}>
                            {col.notnull === 0 ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {col.pk === 1 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                              PRIMARY KEY
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-700">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-text-secondary">
                          {col.dflt_value !== null ? String(col.dflt_value) : 'NULL'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. FULL SCHEMA DDL VIEW (SPECIAL ALL-IN-ONE SCREEN) */}
          {activeTab === 'full_ddl' && (
            <div className="space-y-4">
              <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-border/10 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 bg-[#252525] border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 mr-4">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="text-xs font-mono text-gray-400">Complete Database DDL Setup (hostel_schema.sql)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(dbInfo?.fullDdl || '')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-mono text-gray-400 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Complete Script!' : 'Copy Script'}</span>
                  </button>
                </div>
                
                <div className="p-6 max-h-[500px] overflow-auto custom-scrollbar">
                  <pre className="font-mono text-sm leading-relaxed text-[#A9B2C3]">
                    <code className="text-[#A9B2C3]">
                      {dbInfo?.fullDdl || '-- Full schema DDL not loaded'}
                    </code>
                  </pre>
                </div>
              </div>
              
              <div className="bg-white dark:bg-card-bg p-5 rounded-xl border dark:border-border/60">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Academic & Technical Summary</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  This relational schema contains 4 interconnected tables designed specifically to ensure referential integrity for student hostels:
                </p>
                <ul className="list-disc list-inside text-xs text-text-secondary mt-2 space-y-1">
                  <li><strong>Room</strong> acts as the parent entity for room capacities, categories, and monthly billing rates.</li>
                  <li><strong>Student</strong> maps residents to their specific rooms, referencing <code className="px-1 py-0.5 bg-gray-100 dark:bg-white/5 rounded font-mono text-[11px]">Room(id)</code> via an active foreign key.</li>
                  <li><strong>Payment</strong> models fee transaction logs.</li>
                  <li><strong>Complaint</strong> enables residents to raise support, priority, and maintenance tickets within their allocated rooms.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
