"use client";
import { FormEvent, useState } from "react";

export function AdminLogin() {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const password = new FormData(e.currentTarget).get("password");
    const response = await fetch("/api/admin/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ password }) });
    if (response.ok) location.reload(); else { const data = await response.json() as {error?:string}; setError(data.error || "登录失败"); setBusy(false); }
  }
  return <main className="admin-login"><form className="login-card" onSubmit={login}><span className="brand-mark">YC</span><p className="eyebrow">STAFF ONLY</p><h1>工作人员入口</h1><p>该页面仅供青年科创中心招新工作人员查看报名数据。</p><label><span>管理员密码</span><input name="password" type="password" required autoFocus placeholder="请输入管理员密码" /></label>{error && <p className="error">{error}</p>}<button disabled={busy}>{busy ? "正在验证…" : "进入管理后台"}</button><a href="/">← 返回报名首页</a></form></main>;
}
