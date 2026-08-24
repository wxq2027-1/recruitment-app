import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

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

const CREATE_APPLICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    student_id TEXT NOT NULL,
    college TEXT NOT NULL,
    major_class TEXT NOT NULL,
    political_status TEXT DEFAULT '群众' NOT NULL,
    phone TEXT NOT NULL,
    wechat TEXT NOT NULL,
    qq TEXT DEFAULT '' NOT NULL,
    email TEXT DEFAULT '' NOT NULL,
    choice_1 TEXT NOT NULL,
    choice_2 TEXT NOT NULL,
    choice_3 TEXT NOT NULL,
    introduction TEXT NOT NULL,
    experience TEXT DEFAULT '' NOT NULL,
    expectation TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )
`;

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;

  const productionDataDirectory = "/data";
  const dataDirectory =
    process.env.DATA_DIR ||
    (process.env.NODE_ENV === "production" && existsSync(productionDataDirectory)
      ? productionDataDirectory
      : path.join(process.cwd(), ".data"));

  mkdirSync(dataDirectory, { recursive: true });
  database = new DatabaseSync(path.join(dataDirectory, "recruitment.sqlite"));
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA busy_timeout = 5000");
  database.exec(CREATE_APPLICATIONS_TABLE);
  database.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS applications_student_id_unique ON applications (student_id)",
  );
  database.exec(
    "CREATE INDEX IF NOT EXISTS idx_applications_choice_1 ON applications (choice_1)",
  );
  database.exec(
    "CREATE INDEX IF NOT EXISTS idx_applications_choice_2 ON applications (choice_2)",
  );
  database.exec(
    "CREATE INDEX IF NOT EXISTS idx_applications_choice_3 ON applications (choice_3)",
  );
  return database;
}

export async function createApplication(
  record: Omit<ApplicationRecord, "id" | "createdAt">,
) {
  const db = getDatabase();

  try {
    db.prepare(
      `INSERT INTO applications (
        name, gender, student_id, college, major_class, political_status,
        phone, wechat, qq, email, choice_1, choice_2, choice_3,
        introduction, experience, expectation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      record.name,
      record.gender,
      record.studentId,
      record.college,
      record.majorClass,
      record.politicalStatus,
      record.phone,
      record.wechat,
      record.qq,
      record.email,
      record.choice1,
      record.choice2,
      record.choice3,
      record.introduction,
      record.experience,
      record.expectation,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("UNIQUE constraint failed") ||
      message.includes("applications.student_id")
    ) {
      throw new Error("DUPLICATE_STUDENT_ID");
    }
    throw error;
  }
}

export async function listApplications() {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT
        id,
        name,
        gender,
        student_id AS studentId,
        college,
        major_class AS majorClass,
        political_status AS politicalStatus,
        phone,
        wechat,
        qq,
        email,
        choice_1 AS choice1,
        choice_2 AS choice2,
        choice_3 AS choice3,
        introduction,
        experience,
        expectation,
        created_at AS createdAt
      FROM applications
      ORDER BY created_at DESC, id DESC`,
    )
    .all() as unknown as ApplicationRecord[];
}

export async function deleteApplication(id: number) {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM applications WHERE id = ?").run(id);
  return result.changes > 0;
}
