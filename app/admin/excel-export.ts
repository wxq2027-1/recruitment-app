type ExportRow = {
  name: string; gender: string; studentId: string; college: string; majorClass: string;
  politicalStatus: string; phone: string; wechat: string; qq: string; email: string;
  choice1: string; choice2: string; choice3: string; introduction: string;
  experience: string; expectation: string; createdAt: string;
};

type ExportGroup = { label: string; rows: ExportRow[] };

type ZipLike = {
  file(path: string, content: string, options?: Record<string, unknown>): ZipLike;
  generateAsync(options: Record<string, unknown>): Promise<Blob>;
};

type JSZipConstructor = new () => ZipLike;

declare global {
  interface Window { JSZip?: JSZipConstructor; }
}

const headers = [
  "姓名", "性别", "学号", "学院", "专业班级", "政治面貌", "手机号码", "微信号", "QQ号",
  "常用邮箱", "第一志愿", "第二志愿", "第三志愿", "个人简介", "相关经历", "加入期待", "提交时间",
];

const widths = [12, 8, 18, 22, 18, 14, 18, 20, 18, 26, 16, 16, 16, 36, 36, 36, 22];

let jsZipPromise: Promise<JSZipConstructor> | null = null;

function loadJSZip() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  if (jsZipPromise) return jsZipPromise;
  jsZipPromise = new Promise<JSZipConstructor>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/jszip.min.js";
    script.async = true;
    script.onload = () => window.JSZip ? resolve(window.JSZip) : reject(new Error("Excel 组件加载失败"));
    script.onerror = () => reject(new Error("Excel 组件加载失败，请刷新页面后重试"));
    document.head.appendChild(script);
  });
  return jsZipPromise;
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function columnName(index: number) {
  let name = "";
  for (let current = index + 1; current > 0; current = Math.floor((current - 1) / 26)) {
    name = String.fromCharCode(65 + ((current - 1) % 26)) + name;
  }
  return name;
}

function rowValues(row: ExportRow) {
  return [
    row.name, row.gender, row.studentId, row.college, row.majorClass, row.politicalStatus,
    row.phone, row.wechat, row.qq, row.email, row.choice1, row.choice2, row.choice3,
    row.introduction, row.experience, row.expectation, row.createdAt,
  ];
}

function worksheetXml(rows: ExportRow[]) {
  const values = [headers, ...rows.map(rowValues)];
  const sheetRows = values.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
      return `<c r="${reference}" t="inlineStr" s="${rowIndex === 0 ? 1 : 2}"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}"${rowIndex === 0 ? ' ht="25" customHeight="1"' : ''}>${cells}</row>`;
  }).join("");
  const columnWidths = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("");
  const lastRow = Math.max(values.length, 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:Q${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>${columnWidths}</cols>
  <sheetData>${sheetRows}</sheetData>
  <autoFilter ref="A1:Q${lastRow}"/>
</worksheet>`;
}

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const rootRelationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>
  <sheets>
    <sheet name="第一志愿" sheetId="1" r:id="rId1"/>
    <sheet name="第二志愿" sheetId="2" r:id="rId2"/>
    <sheet name="第三志愿" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`;

const workbookRelationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Microsoft YaHei"/><family val="2"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Microsoft YaHei"/><family val="2"/></font>
  </fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF164B35"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="2"><border/><border><left style="thin"><color rgb="FFD9E1DB"/></left><right style="thin"><color rgb="FFD9E1DB"/></right><top style="thin"><color rgb="FFD9E1DB"/></top><bottom style="thin"><color rgb="FFD9E1DB"/></bottom><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="49" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="常规" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

export function buildDepartmentWorkbookZip(JSZip: JSZipConstructor, department: string, groups: ExportGroup[]) {
  const zip = new JSZip();
  const fixedDate = new Date("2026-01-01T00:00:00.000Z");
  const add = (path: string, content: string) => zip.file(path, content, { date: fixedDate });

  add("[Content_Types].xml", contentTypesXml);
  add("_rels/.rels", rootRelationshipsXml);
  add("xl/workbook.xml", workbookXml);
  add("xl/_rels/workbook.xml.rels", workbookRelationshipsXml);
  add("xl/styles.xml", stylesXml);
  [0, 1, 2].forEach((index) => add(`xl/worksheets/sheet${index + 1}.xml`, worksheetXml(groups[index]?.rows ?? [])));
  add("docProps/app.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>青年科创中心招新管理台</Application><TitlesOfParts><vt:vector size="3" baseType="lpstr"><vt:lpstr>第一志愿</vt:lpstr><vt:lpstr>第二志愿</vt:lpstr><vt:lpstr>第三志愿</vt:lpstr></vt:vector></TitlesOfParts></Properties>`);
  add("docProps/core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(department)}面试者名单</dc:title><dc:creator>青年科创中心招新管理台</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>`);

  return zip;
}

export async function exportDepartmentExcel(department: string, groups: ExportGroup[]) {
  const JSZip = await loadJSZip();
  const zip = buildDepartmentWorkbookZip(JSZip, department, groups);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const anchor = document.createElement("a");
  const date = new Date();
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `青年科创中心_${department}_面试者信息_${day}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}
