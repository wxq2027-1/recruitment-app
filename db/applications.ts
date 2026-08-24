import { env } from "cloudflare:workers";

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

type D1RunResult = {
  success?: boolean;
  meta?: { changes?: number };
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1RunResult>;
  all<T>(): Promise<{ results?: T[] }>;
};

type D1Database = {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
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

function getDatabase(): D1Database {
  const database = (env as unknown as { DB?: D1Database }).DB;
  if (!database) {
    throw new Error("D1_BINDING_UNAVAILABLE");
  }
  return database;
}

let schemaReady: Promise<void> | undefined;

function ensureSchema(database: D1Database) {
  schemaReady ??= database
    .batch([
      database.prepare(CREATE_APPLICATIONS_TABLE),
      database.prepare(
        "CREATE UNIQUE INDEX IF NOT EXISTS applications_student_id_unique ON applications (student_id)",
      ),
      database.prepare(
        "CREATE INDEX IF NOT EXISTS idx_applications_choice_1 ON applications (choice_1)",
      ),
      database.prepare(
        "CREATE INDEX IF NOT EXISTS idx_applications_choice_2 ON applications (choice_2)",
      ),
      database.prepare(
        "CREATE INDEX IF NOT EXISTS idx_applications_choice_3 ON applications (choice_3)",
      ),
    ])
    .then(() => undefined)
    .catch((error) => {
      schemaReady = undefined;
      throw error;
    });

  return schemaReady;
}

export async function createApplication(
  record: Omit<ApplicationRecord, "id" | "createdAt">,
) {
  const database = getDatabase();
  await ensureSchema(database);

  try {
    await database
      .prepare(
        `INSERT INTO applications (
          name, gender, student_id, college, major_class, political_status,
          phone, wechat, qq, email, choice_1, choice_2, choice_3,
          introduction, experience, expectation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
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
      )
      .run();
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
  const database = getDatabase();
  await ensureSchema(database);

  const { results = [] } = await database
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
    .all<ApplicationRecord>();

  return results;
}

export async function deleteApplication(id: number) {
  const database = getDatabase();
  await ensureSchema(database);

  const result = await database
    .prepare("DELETE FROM applications WHERE id = ?")
    .bind(id)
    .run();

  return (result.meta?.changes ?? 0) > 0;
}
