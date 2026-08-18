"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: number; name: string; gender: string; studentId: string; college: string;
  majorClass: string; politicalStatus: string; phone: string; wechat: string;
  qq: string; email: string; choice1: string; choice2: string; choice3: string;
  introduction: string; experience: string; expectation: string; createdAt: string;
};

const departments = ["办公室", "科研立项部", "培训发展部", "对外联络部", "策划宣传部", "赛事组织部"];
const ranks = [
  { label: "第一志愿", field: "choice1" as const },
  { label: "第二志愿", field: "choice2" as const },
  { label: "第三志愿", field: "choice3" as const },
];

function ApplicantCard({ row }: { row: Row }) {
  return (
    <article className="applicant-card">
      <div className="applicant-head">
        <div><h3>{row.name}</h3><span>{row.gender} · {row.politicalStatus}</span></div>
        <time>{row.createdAt}</time>
      </div>
      <dl className="info-grid">
        <div><dt>学号</dt><dd>{row.studentId}</dd></div>
        <div><dt>学院</dt><dd>{row.college}</dd></div>
        <div><dt>专业班级</dt><dd>{row.majorClass}</dd></div>
        <div><dt>手机号码</dt><dd><a href={`tel:${row.phone}`}>{row.phone}</a></dd></div>
        <div><dt>微信号</dt><dd>{row.wechat}</dd></div>
        <div><dt>QQ / 邮箱</dt><dd>{row.qq || "—"} / {row.email || "—"}</dd></div>
        <div><dt>三个志愿</dt><dd>① {row.choice1}　② {row.choice2}　③ {row.choice3}</dd></div>
      </dl>
      <details><summary>查看个人介绍、经历和加入期待</summary><div className="detail-copy"><b>个人简介</b><p>{row.introduction}</p><b>相关经历</b><p>{row.experience || "未填写"}</p><b>加入期待</b><p>{row.expectation}</p></div></details>
    </article>
  );
}

export function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("办公室");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/applications").then((response) => response.json())
      .then((data: { applications?: Row[] }) => setRows(data.applications || []))
      .finally(() => setLoading(false));
  }, []);

  const searched = useMemo(() => rows.filter((row) => !query ||
    [row.name, row.studentId, row.phone, row.majorClass, row.wechat]
      .some((value) => value.toLowerCase().includes(query.toLowerCase()))), [rows, query]);

  const groups = ranks.map((rank) => ({
    ...rank,
    rows: searched.filter((row) => row[rank.field] === department),
  }));
  const departmentTotal = groups.reduce((total, group) => total + group.rows.length, 0);

  function exportDepartment() {
    const headers = ["当前部门志愿顺序", "姓名", "性别", "学号", "学院", "专业班级", "政治面貌", "手机", "微信", "QQ", "邮箱", "第一志愿", "第二志愿", "第三志愿", "个人简介", "相关经历", "加入期待", "提交时间"];
    const lines = groups.flatMap((group) => group.rows.map((row) => [group.label, row.name, row.gender, row.studentId, row.college, row.majorClass, row.politicalStatus, row.phone, row.wechat, row.qq, row.email, row.choice1, row.choice2, row.choice3, row.introduction, row.experience, row.expectation, row.createdAt]));
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = "\uFEFF" + [headers, ...lines].map((line) => line.map(escape).join(",")).join("\r\n");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    anchor.download = `青年科创中心_${department}_报名名单_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); location.reload(); }

  return (
    <main className="admin-shell">
      <header className="admin-top"><span className="brand-mark">YC</span><div><h1>青年科创中心 · 招新管理台</h1><p>报名数据仅供内部工作使用，请注意保护个人信息</p></div><button onClick={logout}>退出后台</button></header>
      <section className="admin-main">
        <div className="stats"><div className="stat">总报名人数<b>{rows.length}</b></div><div className="stat">当前部门<b>{department}</b></div><div className="stat">部门相关报名<b>{departmentTotal}</b></div><div className="stat">今日新增<b>{rows.filter((row) => row.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}</b></div></div>
        <div className="department-tabs" aria-label="选择部门">{departments.map((item) => <button key={item} className={item === department ? "active" : ""} onClick={() => setDepartment(item)}>{item}</button>)}</div>
        <div className="filters"><div><strong>{department}</strong><span>下列名单已按志愿顺序自动分类</span></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名 / 学号 / 手机 / 微信"/><button onClick={exportDepartment}>导出 {department} 名单</button></div>
        {loading ? <div className="empty">正在加载报名数据…</div> : <div className="rank-groups">{groups.map((group, index) => <section className="rank-section" key={group.label}><header><span>0{index + 1}</span><div><h2>{group.label}</h2><p>{group.rows.length} 名同学将 {department} 填为{group.label}</p></div></header>{group.rows.length ? <div className="applicant-list">{group.rows.map((row) => <ApplicantCard row={row} key={row.id}/>)}</div> : <div className="empty small">暂无{group.label}报名记录</div>}</section>)}</div>}
      </section>
    </main>
  );
}
