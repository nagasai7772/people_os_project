import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { RefreshCw, Plus, Search, Trash2, Pencil, AlertCircle, Network, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[] };
type Config = {
  title: string; endpoint: string; description: string; columns: string[];
  fields?: Field[]; create?: boolean; edit?: boolean; remove?: boolean; mode?: 'tree' | 'settings';
};
const configs: Record<string, Config> = {
  employees: { title:'Employees', endpoint:'/employees?limit=100&page=1', description:'Manage employee records and reporting relationships.', columns:['employee_code','first_name','last_name','official_email','department_name','designation_name','employment_status'], fields:[
    {key:'employee_code',label:'Employee ID',required:true},{key:'first_name',label:'First name',required:true},{key:'last_name',label:'Last name',required:true},{key:'official_email',label:'Official email',type:'email',required:true},{key:'phone',label:'Phone'},{key:'department_id',label:'Department ID'},{key:'designation_id',label:'Designation ID'},{key:'manager_id',label:'Manager employee ID'},{key:'employment_type',label:'Employment type'},{key:'employment_status',label:'Status'},{key:'joining_date',label:'Joining date',type:'date'},{key:'work_location',label:'Work location'}], create:true,edit:true,remove:true },
  departments: { title:'Departments',endpoint:'/departments',description:'Organize teams, department heads and reporting units.',columns:['name','code','description','head_name','employee_count','status'],fields:[{key:'name',label:'Department name',required:true},{key:'code',label:'Department code',required:true},{key:'description',label:'Description'},{key:'head_employee_id',label:'Head employee UUID'},{key:'parent_department_id',label:'Parent department UUID'}],create:true,edit:true,remove:true },
  designations: { title:'Designations',endpoint:'/designations',description:'Manage job titles, levels and department assignments.',columns:['name','code','department_name','job_level','employee_count','status'],fields:[{key:'name',label:'Designation name',required:true},{key:'code',label:'Designation code',required:true},{key:'department_id',label:'Department UUID'},{key:'job_level',label:'Job level'},{key:'description',label:'Description'}],create:true,edit:true,remove:true },
  performance: { title:'Performance',endpoint:'/performance',description:'Create and review employee performance records.',columns:['employee_name','review_period','reviewer_name','overall_score','status'],fields:[{key:'employee_id',label:'Employee UUID',required:true},{key:'reviewer_id',label:'Reviewer employee UUID'},{key:'review_period',label:'Review period',required:true},{key:'overall_score',label:'Overall score (1–5)',type:'number'},{key:'strengths',label:'Strengths'},{key:'improvement_areas',label:'Areas to improve'},{key:'comments',label:'Comments'}],create:true,edit:true,remove:false },
  users: { title:'User Management',endpoint:'/users',description:'Manage login accounts, linked employees and access roles.',columns:['name','email','role','employee_name','status','last_login_at'],fields:[{key:'name',label:'Full name',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'password',label:'Temporary password',type:'password',required:true},{key:'role',label:'Role (ADMIN, MANAGER, EMPLOYEE)',required:true},{key:'employee_id',label:'Linked employee UUID'}],create:true,edit:false,remove:false },
  notifications: { title:'Notifications',endpoint:'/notifications',description:'Review your PeopleOS notifications.',columns:['title','message','type','is_read','created_at'],create:false,edit:false,remove:false },
  organization: { title:'Organization Chart',endpoint:'/employees/org-chart',description:'Explore employee reporting relationships.',columns:[],mode:'tree',create:false,edit:false,remove:false },
  reports: { title:'Reports & Analytics',endpoint:'/reports/employees',description:'Employee reporting data from your organization.',columns:['employee_code','first_name','last_name','official_email','department','designation','employment_status','joining_date'],create:false,edit:false,remove:false },
  settings: { title:'Organization Settings',endpoint:'/settings',description:'View and update organization profile settings.',columns:['organization_name','company_email','phone','website','industry','company_size'],fields:[{key:'organization_name',label:'Organization name',required:true},{key:'company_email',label:'Company email',type:'email'},{key:'phone',label:'Phone'},{key:'website',label:'Website'},{key:'address',label:'Address'},{key:'industry',label:'Industry'},{key:'company_size',label:'Company size'}],mode:'settings',create:false,edit:true,remove:false },
};
const labels: Record<string,string> = {employee_code:'Employee ID',first_name:'First name',last_name:'Last name',official_email:'Email',department_name:'Department',designation_name:'Designation',employment_status:'Status',employee_count:'Employees',head_name:'Department head',job_level:'Level',employee_name:'Employee',review_period:'Review period',reviewer_name:'Reviewer',overall_score:'Score',last_login_at:'Last login',is_read:'Read',created_at:'Created',department:'Department',designation:'Designation',joining_date:'Joining date'};
function display(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
export function DataModulePage({ module }: { module: string }) {
  const config = configs[module] ?? configs.employees;
  const { user } = useAuth();
  const [rows,setRows] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [search,setSearch] = useState('');
  const [editing,setEditing] = useState<any|null>(null);
  const [form,setForm] = useState<Record<string,string>>({});
  const [saving,setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result:any = await apiRequest<any>(config.endpoint);
      if (module === 'settings') setRows(result ? [result] : []);
      else if (module === 'organization') setRows(Array.isArray(result) ? result : []);
      else if (module === 'reports') setRows(Array.isArray(result) ? result : []);
      else if (module === 'employees') setRows(result?.items ?? []);
      else setRows(Array.isArray(result) ? result : []);
    } catch(e) { setError(e instanceof Error ? e.message : 'Unable to load data'); setRows([]); }
    finally { setLoading(false); }
  },[config.endpoint,module]);
  useEffect(()=>{void load();},[load]);

  const filtered = useMemo(()=>rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase())),[rows,search]);
  const startCreate=()=>{setEditing({});setForm({});};
  const startEdit=(row:any)=>{setEditing(row);const next:Record<string,string>={};(config.fields||[]).forEach(f=>next[f.key]=row[f.key] == null ? '' : String(row[f.key]));setForm(next);};
  const submit=async(e:FormEvent)=>{e.preventDefault();setSaving(true);setError('');
    try {
      const payload:Record<string,unknown>={};
      (config.fields||[]).forEach(f=>{const v=form[f.key];if(v!==undefined && v!=='') payload[f.key]=f.type==='number'?Number(v):v;});
      const id=editing?.id;
      if(module==='settings') await apiRequest('/settings',{method:'PUT',body:JSON.stringify(payload)});
      else await apiRequest(id?`${config.endpoint.split('?')[0]}/${id}`:config.endpoint.split('?')[0],{method:id?'PATCH':'POST',body:JSON.stringify(payload)});
      setEditing(null);await load();
    } catch(e){setError(e instanceof Error?e.message:'Save failed');}
    finally{setSaving(false);}
  };
  const remove=async(row:any)=>{if(!row.id||!window.confirm('Delete this record? This action cannot be undone.'))return;try{await apiRequest(`${config.endpoint.split('?')[0]}/${row.id}`,{method:'DELETE'});await load();}catch(e){setError(e instanceof Error?e.message:'Delete failed');}};
  const markRead=async(row:any)=>{try{await apiRequest(`/notifications/${row.id}/read`,{method:'PATCH'});await load();}catch(e){setError(e instanceof Error?e.message:'Update failed');}};
  const isAdmin=user?.role==='admin';
  const canManage=isAdmin || (user?.role==='manager' && ['employees','performance'].includes(module));
  const renderTree=(nodes:any[],depth=0):ReactNode=>nodes.map(n=><div key={n.id} className="ml-5 border-l border-border pl-4 py-2"><div className="rounded-lg border border-border bg-card p-3"><p className="font-medium">{n.first_name} {n.last_name}</p><p className="text-xs text-muted-foreground">{n.designation_name||'No designation'} · {n.department_name||'Unassigned'}</p><p className="text-xs text-muted-foreground">{n.employee_code}</p></div>{n.children?.length?renderTree(n.children,depth+1):null}</div>);
  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold">{config.title}</h1><p className="mt-1 text-sm text-muted-foreground">{config.description}</p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading?'animate-spin':''}`}/>Refresh</Button>{config.create&&canManage&&<Button onClick={startCreate}><Plus className="mr-2 h-4 w-4"/>Add new</Button>}</div></div>
    {error&&<div role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
    {editing!==null&&<div className="rounded-xl border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{editing.id?'Edit':'Create'} {config.title.slice(0,-1)}</h2><Button size="icon" variant="ghost" onClick={()=>setEditing(null)}><X className="h-4 w-4"/></Button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{(config.fields||[]).filter(f=>!(module==='users'&&editing.id&&f.key==='password')).map(f=><label key={f.key} className="space-y-1 text-sm"><span>{f.label}{f.required?' *':''}</span><Input type={f.type||'text'} required={f.required} value={form[f.key]||''} onChange={e=>setForm(s=>({...s,[f.key]:e.target.value}))}/></label>)}<div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4"/>{saving?'Saving…':'Save'}</Button><Button type="button" variant="outline" onClick={()=>setEditing(null)}>Cancel</Button></div></form></div>}
    {config.mode==='tree'?<div className="rounded-xl border border-border bg-card p-5">{loading?'Loading organization…':rows.length?renderTree(rows):<p className="text-sm text-muted-foreground">No organization hierarchy found.</p>}</div>:config.mode==='settings'?<div className="rounded-xl border border-border bg-card p-5"><div className="grid gap-3 sm:grid-cols-2">{rows[0]?config.columns.map(k=><div key={k}><p className="text-xs text-muted-foreground">{labels[k]||k}</p><p className="mt-1 font-medium">{display(rows[0][k])}</p></div>):<p className="text-sm text-muted-foreground">No organization settings saved yet.</p>}</div>{canManage&&<Button className="mt-5" onClick={()=>startEdit(rows[0]||{})}><Pencil className="mr-2 h-4 w-4"/>Edit settings</Button>}</div>:<div className="overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center gap-2 border-b border-border p-4"><Search className="h-4 w-4 text-muted-foreground"/><Input className="max-w-sm" placeholder={`Search ${config.title.toLowerCase()}…`} value={search} onChange={e=>setSearch(e.target.value)}/><span className="ml-auto text-xs text-muted-foreground">{filtered.length} records</span></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-muted/40"><tr>{config.columns.map(k=><th key={k} className="px-4 py-3 font-medium">{labels[k]||k.replaceAll('_',' ')}</th>)}{(config.edit||config.remove||module==='notifications')&&<th className="px-4 py-3">Actions</th>}</tr></thead><tbody>{loading?<tr><td colSpan={config.columns.length+((config.edit||config.remove||module==='notifications')?1:0)} className="p-8 text-center text-muted-foreground">Loading records…</td></tr>:filtered.length?filtered.map((row,i)=><tr key={row.id||i} className="border-t border-border">{config.columns.map(k=><td key={k} className="px-4 py-3">{display(row[k])}</td>)}{(config.edit||config.remove||module==='notifications')&&<td className="px-4 py-3">{module==='notifications'?<Button size="sm" variant="outline" disabled={row.is_read} onClick={()=>void markRead(row)}>{row.is_read?'Read':'Mark read'}</Button>:<div className="flex gap-1">{config.edit&&canManage&&<Button size="icon" variant="ghost" onClick={()=>startEdit(row)}><Pencil className="h-4 w-4"/></Button>}{config.remove&&canManage&&<Button size="icon" variant="ghost" onClick={()=>void remove(row)}><Trash2 className="h-4 w-4"/></Button>}</div>}</td>}</tr>):<tr><td colSpan={config.columns.length+((config.edit||config.remove||module==='notifications')?1:0)} className="p-8 text-center text-muted-foreground">No records found.</td></tr>}</tbody></table></div></div>}
    <p className="text-xs text-muted-foreground">Connected to PeopleOS API · Changes are saved to your PostgreSQL database.</p>
  </div>;
}
