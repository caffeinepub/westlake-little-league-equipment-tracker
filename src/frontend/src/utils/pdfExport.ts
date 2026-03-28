export function exportToPdf(
  title: string,
  columns: string[],
  rows: (string | number)[][],
  _filename: string,
) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${String(cell).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`).join("")}</tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .meta { font-size: 11px; color: #555; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e3a5f; color: white; text-align: left; padding: 6px 8px; font-size: 11px; }
    td { padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
    tr:nth-child(even) td { background: #f5f7fa; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generated: ${new Date().toLocaleDateString()}</p>
  <table>
    <thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
