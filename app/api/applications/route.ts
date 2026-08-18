import { applications } from "@/db/schema";
import { getDb } from "@/db";

const departments = ["办公室", "科研立项部", "培训发展部", "对外联络部", "策划宣传部", "赛事组织部"];
const required = ["name", "gender", "studentId", "college", "majorClass", "phone", "wechat", "choice1", "choice2", "choice3", "introduction", "expectation"] as const;

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const clean = (key: string, max = 500) => String(data[key] ?? "").trim().slice(0, max);
    if (required.some((key) => !clean(key))) return Response.json({ error: "请完整填写所有必填项。" }, { status: 400 });
    const choices = [clean("choice1"), clean("choice2"), clean("choice3")];
    if (new Set(choices).size !== 3 || choices.some((c) => !departments.includes(c))) return Response.json({ error: "志愿选择无效或重复。" }, { status: 400 });
    if (!/^1[3-9]\d{9}$/.test(clean("phone"))) return Response.json({ error: "请输入正确的 11 位手机号码。" }, { status: 400 });

    const db = getDb();
    await db.insert(applications).values({
      name: clean("name", 40), gender: clean("gender", 10), studentId: clean("studentId", 30),
      college: clean("college", 80), majorClass: clean("majorClass", 80), politicalStatus: clean("politicalStatus", 30) || "群众",
      phone: clean("phone", 20), wechat: clean("wechat", 80), qq: clean("qq", 30), email: clean("email", 120),
      choice1: choices[0], choice2: choices[1], choice3: choices[2], introduction: clean("introduction", 1200),
      experience: clean("experience", 1200), expectation: clean("expectation", 1200),
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE") || message.includes("student_id")) return Response.json({ error: "该学号已经提交过报名，请勿重复提交。" }, { status: 409 });
    return Response.json({ error: "系统暂时繁忙，请稍后再试。" }, { status: 500 });
  }
}
