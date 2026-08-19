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
  return <main className="admin-login"><form className="login-card" onSubmit={login}><span className="brand-mark"><img src="/qnkczx-logo-v2.png" alt="" /></span><p className="eyebrow">STAFF ONLY</p><h1>工作人员入口</h1><p>输入只读密码可以查看、筛选和导出；输入管理密码还可以删除错误报名记录。</p><label><span>后台密码</span><input name="password" type="password" required autoFocus placeholder="请输入只读密码或管理密码" /></label>{error && <p className="error">{error}</p>}<button disabled={busy}>{busy ? "正在验证…" : "进入管理后台"}</button><a href="/">← 返回报名首页</a></form></main>;
}
