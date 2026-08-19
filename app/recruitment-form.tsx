"use client";

import { FormEvent, useMemo, useState } from "react";

const departments = ["办公室", "科研立项部", "培训发展部", "对外联络部", "策划宣传部", "赛事组织部"];

export function RecruitmentForm() {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [choices, setChoices] = useState(["", "", ""]);
  const available = useMemo(() => departments, []);

  function validatePersonal(form: HTMLFormElement) {
    const data = new FormData(form);
    const requiredFields = [
      ["name", "姓名"],
      ["gender", "性别"],
      ["studentId", "学号"],
      ["college", "学院"],
      ["majorClass", "专业班级"],
      ["phone", "手机号码"],
      ["wechat", "微信号"],
    ] as const;
    const missing = requiredFields.find(([name]) => !String(data.get(name) ?? "").trim());
    if (missing) return `请填写${missing[1]}。`;

    const phone = String(data.get("phone") ?? "").trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) return "请输入正确的 11 位手机号码。";

    const email = String(data.get("email") ?? "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "请输入正确的常用邮箱，或将邮箱留空。";
    return "";
  }

  function goToChoices(form: HTMLFormElement | null) {
    if (!form) return;
    const message = validatePersonal(form);
    if (message) {
      setError(message);
      setStep(1);
      return;
    }
    setError("");
    setStep(2);
  }

  function goToIntroduction(form: HTMLFormElement | null) {
    if (!form) return;
    const message = validatePersonal(form);
    if (message) {
      setError(message);
      setStep(1);
      return;
    }
    if (new Set(choices).size !== 3 || choices.some((item) => !item)) {
      setError("请选择三个不同的志愿部门。");
      setStep(2);
      return;
    }
    setError("");
    setStep(3);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formElement = event.currentTarget;
    const personalMessage = validatePersonal(formElement);
    if (personalMessage) {
      setError(personalMessage);
      setStep(1);
      return;
    }
    if (new Set(choices).size !== 3 || choices.some((item) => !item)) {
      setError("请选择三个不同的志愿部门。");
      setStep(2);
      return;
    }
    const consent = formElement.elements.namedItem("consent") as HTMLInputElement | null;
    if (!consent?.checked) {
      setError("请勾选信息真实性及招新使用同意项后再提交。");
      setStep(3);
      return;
    }
    setBusy(true);
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "提交失败，请稍后再试");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="success-page">
        <section className="success-card">
          <div className="success-mark">✓</div>
          <p className="eyebrow">SUBMISSION RECEIVED</p>
          <h1>报名已提交</h1>
          <p>感谢你选择青年科创中心。请保持电话和微信畅通，后续安排将通过群内通知。</p>
          <button className="secondary" onClick={() => window.location.reload()}>返回首页</button>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header className="hero">
        <nav><span className="brand-mark"><img src="/qnkczx-logo-v2.png" alt="" /></span><span className="brand-lockup"><strong>对外经济贸易大学青年科创中心</strong><small>Youth Science &amp; Technology Innovation Center</small></span><a href="/admin">工作人员入口</a></nav>
        <div className="hero-copy">
          <p className="eyebrow">2026 · JOIN OUR TEAM</p>
          <h1>让热爱，<br/><em>发生一点新变化。</em></h1>
          <p className="lead">六个部门，一段崭新的大学经历。选择你的方向，与一群认真的伙伴一起，把想法做成现实。</p>
          <div className="department-cloud">
            {departments.map((item, index) => <span key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</span>)}
          </div>
        </div>
      </header>

      <section className="form-section" id="apply">
        <div className="form-intro">
          <p className="eyebrow">APPLICATION</p>
          <h2>加入我们</h2>
          <p>请认真填写以下信息。带 <i>*</i> 的项目为必填项，提交后请勿重复报名。</p>
          <ol className="steps">
            <li className={step === 1 ? "active" : ""}><b>01</b><span>个人信息</span></li>
            <li className={step === 2 ? "active" : ""}><b>02</b><span>志愿选择</span></li>
            <li className={step === 3 ? "active" : ""}><b>03</b><span>自我介绍</span></li>
          </ol>
        </div>

        <form onSubmit={submit} className="application-form" noValidate>
          <div className={step === 1 ? "panel active" : "panel"}>
            <div className="field-grid">
              <label><span>姓名 *</span><input name="name" required placeholder="请输入真实姓名" /></label>
              <label><span>性别 *</span><select name="gender" required defaultValue=""><option value="" disabled>请选择</option><option>男</option><option>女</option><option>其他</option></select></label>
              <label><span>学号 *</span><input name="studentId" required inputMode="numeric" placeholder="请输入学号" /></label>
              <label><span>学院 *</span><input name="college" required placeholder="例如：中国金融学院" /></label>
              <label><span>专业班级 *</span><input name="majorClass" required placeholder="例如：国金2601" /></label>
              <label><span>政治面貌</span><select name="politicalStatus" defaultValue="群众"><option>群众</option><option>共青团员</option><option>中共预备党员</option><option>中共党员</option></select></label>
              <label><span>手机号码 *</span><input name="phone" required inputMode="tel" pattern="1[3-9][0-9]{9}" placeholder="11 位手机号" /></label>
              <label><span>微信号 *</span><input name="wechat" required placeholder="用于后续联系" /></label>
              <label><span>QQ 号</span><input name="qq" inputMode="numeric" placeholder="选填" /></label>
              <label><span>常用邮箱</span><input name="email" type="email" placeholder="选填" /></label>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="actions"><button type="button" onClick={(event) => goToChoices(event.currentTarget.form)}>下一步 · 选择志愿</button></div>
          </div>

          <div className={step === 2 ? "panel active" : "panel"}>
            <div className="choice-list">
              {["第一志愿", "第二志愿", "第三志愿"].map((label, index) => (
                <label className="choice" key={label}>
                  <b>0{index + 1}</b><span>{label} *</span>
                  <select name={`choice${index + 1}`} required value={choices[index]} onChange={(e) => setChoices((old) => old.map((v, i) => i === index ? e.target.value : v))}>
                    <option value="">请选择部门</option>
                    {available.map((dep) => <option key={dep} value={dep} disabled={choices.includes(dep) && choices[index] !== dep}>{dep}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <p className="hint">三个志愿须选择不同部门，我们会综合志愿顺序与面试情况进行安排。</p>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="actions"><button className="back" type="button" onClick={() => { setError(""); setStep(1); }}>上一步</button><button type="button" onClick={(event) => goToIntroduction(event.currentTarget.form)}>下一步 · 介绍自己</button></div>
          </div>

          <div className={step === 3 ? "panel active" : "panel"}>
            <label><span>个人简介</span><textarea name="introduction" placeholder="请简单介绍你的性格、特长、兴趣爱好等（选填）" /></label>
            <label><span>相关经历</span><textarea name="experience" placeholder="社团、学生工作、项目或比赛经历，选填" /></label>
            <label><span>加入青年科创中心的期待</span><textarea name="expectation" placeholder="你希望在这里收获什么？又想带来什么？（选填）" /></label>
            <label className="consent"><input name="consent" type="checkbox" /><span>我确认以上信息真实有效，并同意仅将信息用于本次招新联络与选拔。</span></label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="actions"><button className="back" type="button" onClick={() => { setError(""); setStep(2); }}>上一步</button><button type="submit" disabled={busy}>{busy ? "正在提交…" : "确认提交报名"}</button></div>
          </div>
        </form>
      </section>
      <footer><span>© 2026 青年科创中心</span><span>保持好奇 · 勇于实践 · 一起成长</span></footer>
    </main>
  );
}
