import { getStore, PreconditionFailedError } from "@edgeone/pages-blob";

export type ApplicationRecord = {
  id: number;
  name: string;
  gender: string;
  studentId: string;
  college: string;
  majorClass: string;
  politicalStatus: string;
  phone: string;
  wechat: string;
  qq: string;
  email: string;
  choice1: string;
  choice2: string;
  choice3: string;
  introduction: string;
  experience: string;
  expectation: string;
  createdAt: string;
};

const prefix = "applications/";
const getApplicationStore = () => getStore("recruitment-applications");
const keyFor = (studentId: string) => `${prefix}${encodeURIComponent(studentId)}.json`;

export async function createApplication(record: Omit<ApplicationRecord, "id" | "createdAt">) {
  const saved: ApplicationRecord = {
    ...record,
    id: Date.now() * 100 + Math.floor(Math.random() * 100),
    createdAt: new Date().toISOString(),
  };

  try {
    await getApplicationStore().setJSON(keyFor(record.studentId), saved, { onlyIfNew: true });
  } catch (error) {
    if (error instanceof PreconditionFailedError) {
      throw new Error("DUPLICATE_STUDENT_ID");
    }
    throw error;
  }

  return saved;
}

export async function listApplications() {
  const store = getApplicationStore();
  const { blobs } = await store.list({ prefix, consistency: "strong" });
  const records = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );

  return records
    .filter((record): record is ApplicationRecord => Boolean(record && typeof record === "object"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteApplication(id: number) {
  const rows = await listApplications();
  const row = rows.find((item) => item.id === id);
  if (!row) return false;
  await getApplicationStore().delete(keyFor(row.studentId));
  return true;
}
