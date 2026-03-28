declare module "jspdf" {
  interface jsPDF {
    save(filename: string): void;
    setFontSize(size: number): void;
    text(text: string, x: number, y: number): void;
  }
  const jsPDF: new () => jsPDF;
  export default jsPDF;
}

declare module "jspdf-autotable" {
  function autoTable(doc: unknown, options: unknown): void;
  export default autoTable;
}
