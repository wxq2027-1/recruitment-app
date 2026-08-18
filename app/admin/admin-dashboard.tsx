"use client";
import { useEffect, useMemo, useState } from "react";

type Row = { id:number; name:string; gender:string; studentId:string; college:string; majorClass:string; politicalStatus:string; phone:string; wechat:string; qq:string; email:string; choice1:string; choice2:string; choice3:string; introduction:string; experience:string; expectation:string; createdAt:string };
const departments = ["全部部门", "办公室", "科研立项部", "培训发展部", "对外联络部", "策划宣传部", "赛事组织部"];

export function AdminDashboard() {
  const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(true); const [dep,setDep]=useState("全部部门"); const [rank,setRank]=useState("全部志愿"); const [query,setQuery]=useState("");
  useEffect(()=>{ fetch("/api/admin/applications").then(r=>r.json()).then((d:{applications?:Row[]})=>setRows(d.applications||[])).finally(()=>setLoading(false)); },[]);
  const filtered=useMemo(()=>rows.filter(r=>{
    const depMatch=dep==="全部部门"||r.choice1===dep||r.choice2===dep||r.choice3===dep;
    const rankMatch=rank==="全部志愿"||(rank==="第一志愿"&&r.choice1===dep)||(rank==="第二志愿"&&r.choice2===dep)||(rank==="第三志愿"&&r.choice3===dep);
    const search=!query||[r.name,r.studentId,r.phone,r.majorClass,r.wechat].some(v=>v.toLowerCase().includes(query.toLowerCase()));
    return depMatch&&rankMatch&&search;
  }),[rows,dep,rank,query]);
  const office=rows.filter(r=>[r.choice1,r.choice2,r.choice3].includes("办公室")).length;
  function rankFor(r:Row){ if(dep==="全部部门") return "—"; return r.choice1===dep?"第一志愿":r.choice2===dep?"第二志愿":"第三志愿"; }
  function exportCsv(){ const headers=["姓名","性别","学号","学院","专业班级","政治面貌","手机","微信","QQ","邮箱","第一志愿","第二志愿","第三志愿","当前部门志愿顺序","个人简介","相关经历","加入期待","提交时间"]; const fields=(r:Row)=>[r.name,r.gender,r.studentId,r.college,r.majorClass,r.politicalStatus,r.phone,r.wechat,r.qq,r.email,r.choice1,r.choice2,r.choice3,rankFor(r),r.introduction,r.experience,r.expectation,r.createdAt]; const esc=(v:unknown)=>`"${String(v??"").replaceAll('"','""')}"`; const csv="\uFEFF"+[headers,...filtered.map(fields)].map(line=>line.map(esc).join(",")).join("\r\n"); const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download=`青年科创中心_${dep}_${rank}_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href); }
  async function logout(){ await fetch("/api/admin/logout",{method:"POST"}); location.reload(); }
  return <main className="admin-shell"><header className="admin-top"><span className="brand-mark">YC</span><div><h1>青年科创中心 · 招新管理台</h1><p>报名数据仅供内部工作使用，请注意保护个人信息</p></div><button onClick={logout}>退出后台</button></header><section className="admin-main"><div className="stats"><div className="stat">总报名人数<b>{rows.length}</b></div><div className="stat">办公室相关报名<b>{office}</b></div><div className="stat">当前筛选结果<b>{filtered.length}</b></div><div className="stat">今日新增<b>{rows.filter(r=>r.createdAt.slice(0,10)===new Date().toISOString().slice(0,10)).length}</b></div></div><div className="filters"><select value={dep} onChange={e=>{setDep(e.target.value); if(e.target.value==="全部部门")setRank("全部志愿")}}>{departments.map(d=><option key={d}>{d}</option>)}</select><select value={rank} onChange={e=>setRank(e.target.value)} disabled={dep==="全部部门"}><option>全部志愿</option><option>第一志愿</option><option>第二志愿</option><option>第三志愿</option></select><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索姓名 / 学号 / 手机"/><button onClick={exportCsv}>导出当前表格</button></div><div className="table-wrap">{loading?<div className="empty">正在加载报名数据…</div>:filtered.length===0?<div className="empty">暂无符合条件的报名记录</div>:<table><thead><tr>{["姓名","志愿顺序","学号","学院 / 专业班级","手机","微信","第一志愿","第二志愿","第三志愿","提交时间"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><b>{r.name}</b> · {r.gender}</td><td><span className="rank">{rankFor(r)}</span></td><td>{r.studentId}</td><td>{r.college} / {r.majorClass}</td><td>{r.phone}</td><td>{r.wechat}</td><td>{r.choice1}</td><td>{r.choice2}</td><td>{r.choice3}</td><td>{r.createdAt}</td></tr>)}</tbody></table>}</div></section></main>;
}
