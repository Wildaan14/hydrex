// HYDREX — Water Report PDF Generator
// Based on VWBA 2.0 (WRI/LimnoTech/BlueRisk/BEF)
// Appendix D: D-1 Curve Number | D-2 Withdrawal | D-3 Volume Provided | D-4 Recharge | D-5 Volume Captured | D-6 Volume Treated | D-9 NPS

import { jsPDF } from "jspdf";

// ─────────────────────────── INTERFACES ───────────────────────────

export interface WaterFootprintData {
  sector: string;
  withdrawal: number;
  returnFlow: number;
  netConsumption: number;
  blueWater: number;
  status: string;
  category: string;
}

export interface WaterStockData {
  watershedArea: number;
  precipitation: number;
  evapotranspiration: number;
  surfaceRunoff: number;
  totalWithdrawal: number;
  deltaS: number;
  status: string;
  pressureLevel: string;
  recommendation: string;
  P_vol: number;
  ET_vol: number;
  Q_vol: number;
}

export interface WaterCreditData {
  projectType: string;
  volumeWithProject: number;
  volumeWithoutProject: number;
  fundingContribution: number;
  vwb: number;
  eligibleCredit: number;
  projectImpact: string;
}

export interface HydrexReportData {
  waterFootprint?: WaterFootprintData;
  waterStock?: WaterStockData;
  waterCredit?: WaterCreditData;
  language?: "id" | "en";
  organizationName?: string;
  projectName?: string;
  reportDate?: string;
}

// ─────────────────────────── UTILITIES ───────────────────────────

const fmt = (n: number, d = 1): string => {
  if (isNaN(n) || n === null || n === undefined) return "0";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + " M";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + " Jt";
  return n.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
};

const PROJECT_TYPE_LABELS: Record<string, { id: string; en: string; method: string }> = {
  groundwater_recharge:  { id: "Recharge Air Tanah",    en: "Groundwater Recharge",   method: "D-4" },
  rainwater_harvesting:  { id: "Panen Air Hujan",       en: "Rainwater Harvesting",   method: "D-4" },
  wetland_restoration:   { id: "Restorasi Lahan Basah", en: "Wetland Restoration",    method: "D-5" },
  stormwater_bmp:        { id: "Stormwater BMP",        en: "Stormwater BMP",         method: "D-5" },
  wash_supply:           { id: "Penyediaan WASH",       en: "WASH Water Supply",      method: "D-3" },
  wastewater_treatment:  { id: "Pengolahan Limbah Air", en: "Wastewater Treatment",   method: "D-6" },
  reforestation:         { id: "Reforestasi",           en: "Reforestation",          method: "D-1/D-4" },
  irrigation_efficiency: { id: "Efisiensi Irigasi",    en: "Irrigation Efficiency",  method: "D-2" },
};

// ─────────────────────────── COLORS ───────────────────────────

type RGB = [number, number, number];

const C: Record<string, RGB> = {
  ocean:    [14, 165, 233],
  teal:     [20, 184, 166],
  emerald:  [16, 185, 129],
  amber:    [245, 158, 11],
  rose:     [244, 63, 94],
  ink:      [5, 13, 26],
  navy:     [10, 22, 40],
  slate:    [15, 31, 56],
  white:    [255, 255, 255],
  offwhite: [226, 240, 255],
  muted:    [107, 140, 173],
  mid:      [160, 200, 230],
};

// ─────────────────────────── PDF CLASS ───────────────────────────

class HydrexReportPDF {
  private doc: jsPDF;
  private lang: "id" | "en";
  private W: number;
  private H: number;
  private margin = 18;
  private currentPage = 1;
  private logoBase64: string | null = null;

  constructor(lang: "id" | "en" = "id") {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.lang = lang;
    this.W = this.doc.internal.pageSize.getWidth();
    this.H = this.doc.internal.pageSize.getHeight();
  }

  async loadLogo(): Promise<void> {
    try {
      const res = await fetch("/logo.png");
      const blob = await res.blob();
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => { this.logoBase64 = reader.result as string; resolve(); };
        reader.readAsDataURL(blob);
      });
    } catch { this.logoBase64 = null; }
  }

  private drawHydrexLogo(x: number, y: number, size: number) {
    if (this.logoBase64) {
      try { this.doc.addImage(this.logoBase64, "PNG", x, y, size, size); return; } catch {}
    }
    this.doc.setFillColor(...C.ocean); this.doc.circle(x + size/2, y + size/2, size/2, "F");
    this.doc.setFillColor(...C.teal);  this.doc.circle(x + size/2, y + size/2, size/3, "F");
    this.doc.setFillColor(...C.navy);  this.doc.circle(x + size/2, y + size/2, size/6, "F");
    this.doc.setFillColor(...C.ocean); this.doc.circle(x + size/2, y + size/2, size/12, "F");
  }

  private paintBg(top: RGB, bot: RGB) {
    for (let i = 0; i < this.H; i += 1.5) {
      const r = i / this.H;
      this.doc.setFillColor(
        Math.round(top[0]*(1-r)+bot[0]*r),
        Math.round(top[1]*(1-r)+bot[1]*r),
        Math.round(top[2]*(1-r)+bot[2]*r),
      );
      this.doc.rect(0, i, this.W, 1.5, "F");
    }
  }

  private paintHeader(h = 42) {
    for (let i = 0; i < h; i++) {
      const r = i / h;
      this.doc.setFillColor(
        Math.round(C.ink[0]*(1-r)+C.slate[0]*r),
        Math.round(C.ink[1]*(1-r)+C.slate[1]*r),
        Math.round(C.ink[2]*(1-r)+C.slate[2]*r),
      );
      this.doc.rect(0, i, this.W, 1, "F");
    }
    this.doc.setFillColor(...C.ocean); this.doc.rect(0, 0, this.W, 2, "F");
    this.doc.setFillColor(...C.teal);  this.doc.rect(this.W-30, 0, 30, 2, "F");
  }

  private addPageHeader(title: string, subtitle?: string) {
    this.paintHeader();
    this.drawHydrexLogo(this.margin, 9, 22);
    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(8); this.doc.setTextColor(...C.ocean);
    this.doc.text("HYDREX", this.margin+26, 16);
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(6.5); this.doc.setTextColor(...C.muted);
    this.doc.text("Water Accounting Platform", this.margin+26, 21);
    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(14); this.doc.setTextColor(...C.offwhite);
    this.doc.text(title, this.W-this.margin, 18, {align:"right"});
    if (subtitle) {
      this.doc.setFont("helvetica","normal"); this.doc.setFontSize(7.5); this.doc.setTextColor(...C.mid);
      this.doc.text(subtitle, this.W-this.margin, 25, {align:"right"});
    }
    this.doc.setTextColor(0,0,0);
  }

  private addPageFooter(pageLabel: string) {
    const y = this.H-12;
    this.doc.setDrawColor(...C.ocean); this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, y-2, this.W-this.margin, y-2);
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(7); this.doc.setTextColor(...C.muted);
    this.doc.text("HYDREX Water Accounting Platform", this.margin, y+3);
    const today = new Date().toLocaleDateString(this.lang==="id"?"id-ID":"en-US",{year:"numeric",month:"long",day:"numeric"});
    this.doc.text(today, this.W/2, y+3, {align:"center"});
    this.doc.text(pageLabel, this.W-this.margin, y+3, {align:"right"});
    this.doc.setTextColor(0,0,0);
  }

  private addDisclaimer() {
    const y = this.H-22;
    this.doc.setFillColor(7, 30, 55);
    this.doc.rect(this.margin, y, this.W-2*this.margin, 8, "F");
    this.doc.setFont("helvetica","italic"); this.doc.setFontSize(6.5); this.doc.setTextColor(...C.muted);
    const msg = this.lang==="id"
      ? "Perhitungan ini merupakan estimasi berdasarkan metodologi VWBA 2.0 (WRI/LimnoTech). Verifikasi independen diperlukan untuk validasi resmi."
      : "Calculations are estimates based on VWBA 2.0 methodology (WRI/LimnoTech). Independent verification required for official validation.";
    this.doc.text(msg, this.margin+3, y+5);
    this.doc.setTextColor(0,0,0);
  }

  private newPage(title: string, subtitle?: string): number {
    this.doc.addPage(); this.currentPage++;
    this.addPageHeader(title, subtitle); return 50;
  }

  private sectionHeader(label: string, y: number, color: RGB = C.ocean): number {
    this.doc.setFillColor(...color); this.doc.rect(this.margin, y, 3, 8, "F");
    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(10); this.doc.setTextColor(...color);
    this.doc.text(label, this.margin+7, y+6);
    this.doc.setDrawColor(...color); this.doc.setLineWidth(0.25);
    const tw = this.doc.getTextWidth(label);
    this.doc.line(this.margin+7+tw+3, y+3, this.W-this.margin, y+3);
    this.doc.setTextColor(0,0,0); return y+13;
  }

  private metricCard(label: string, value: string, unit: string, y: number, color: RGB, formula?: string): number {
    const cardH = formula ? 36 : 28;
    const usableW = this.W-2*this.margin;
    this.doc.setFillColor(...color); this.doc.roundedRect(this.margin, y, usableW, cardH, 3, 3, "F");
    this.doc.setFillColor(Math.min(255,color[0]+30), Math.min(255,color[1]+30), Math.min(255,color[2]+30));
    this.doc.roundedRect(this.W-this.margin-28, y, 28, cardH, 3, 3, "F");
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(8); this.doc.setTextColor(...C.white);
    this.doc.text(label, this.margin+8, y+9);
    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(18); this.doc.setTextColor(...C.white);
    this.doc.text(value, this.margin+8, y+22);
    if (unit) {
      this.doc.setFont("helvetica","normal"); this.doc.setFontSize(9);
      const vw = this.doc.getTextWidth(value)*(18/9)*0.55;
      this.doc.text(unit, this.margin+8+vw+2, y+22);
    }
    if (formula) {
      this.doc.setFont("helvetica","italic"); this.doc.setFontSize(7); this.doc.setTextColor(220,240,255);
      this.doc.text(formula, this.margin+8, y+32);
    }
    this.doc.setTextColor(0,0,0); return y+cardH+5;
  }

  private dataRow(label: string, value: string, y: number, alt=false, vc?: RGB): number {
    const rowH = 9;
    if (alt) { this.doc.setFillColor(8,22,44); this.doc.rect(this.margin, y, this.W-2*this.margin, rowH, "F"); }
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(9); this.doc.setTextColor(...C.mid);
    this.doc.text(label, this.margin+6, y+6.5);
    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(9); this.doc.setTextColor(...(vc??C.ocean));
    this.doc.text(value, this.W-this.margin-6, y+6.5, {align:"right"});
    this.doc.setTextColor(0,0,0); return y+rowH;
  }

  private formulaBox(formula: string, vars: [string,string][], y: number, color: RGB = C.ocean): number {
    const rows = Math.ceil(vars.length/2);
    const boxH = 14+rows*9;
    this.doc.setFillColor(5,18,40); this.doc.setDrawColor(...color); this.doc.setLineWidth(0.4);
    this.doc.roundedRect(this.margin, y, this.W-2*this.margin, boxH, 3, 3, "FD");
    this.doc.setFont("courier","bold"); this.doc.setFontSize(9); this.doc.setTextColor(...color);
    this.doc.text(formula, this.margin+6, y+9);
    const col1X = this.margin+6, col2X = this.W/2;
    vars.forEach(([sym,desc],i) => {
      const row = Math.floor(i/2), col = i%2;
      const vx = col===0?col1X:col2X, vy = y+16+row*9;
      this.doc.setFont("courier","normal"); this.doc.setFontSize(7.5); this.doc.setTextColor(...C.teal);
      this.doc.text(sym, vx, vy);
      this.doc.setFont("helvetica","normal"); this.doc.setTextColor(...C.muted);
      const sw = this.doc.getTextWidth(sym)*(7.5/10)+1.5;
      this.doc.text(` = ${desc}`, vx+sw+1, vy);
    });
    this.doc.setTextColor(0,0,0); return y+boxH+6;
  }

  private statusBadge(label: string, value: string, y: number, color: RGB): number {
    const usableW = this.W-2*this.margin;
    this.doc.setFillColor(...color); this.doc.roundedRect(this.margin, y, usableW, 14, 3, 3, "F");
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(8); this.doc.setTextColor(...C.white);
    this.doc.text(label, this.margin+6, y+9);
    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(9);
    this.doc.text(value, this.W-this.margin-6, y+9, {align:"right"});
    this.doc.setTextColor(0,0,0); return y+18;
  }

  private noteBox(lines: string[], y: number, color: RGB = C.ocean): number {
    const boxH = 8+lines.length*7;
    this.doc.setFillColor(5,18,40); this.doc.rect(this.margin, y, 2.5, boxH, "F");
    this.doc.setFillColor(...color); this.doc.rect(this.margin, y, 2.5, boxH, "F");
    this.doc.setFillColor(5,18,40); this.doc.rect(this.margin+2.5, y, this.W-2*this.margin-2.5, boxH, "F");
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(7.5);
    lines.forEach((line,i) => {
      this.doc.setTextColor(...C.muted);
      this.doc.text(line, this.margin+8, y+6+i*7);
    });
    this.doc.setTextColor(0,0,0); return y+boxH+6;
  }

  // ══════════════ COVER PAGE ══════════════
  addCoverPage(data: HydrexReportData) {
    this.paintBg(C.ink, C.navy);
    this.doc.setFillColor(...C.ocean); this.doc.rect(0, 0, this.W, 3, "F");
    this.doc.setFillColor(...C.teal);  this.doc.rect(this.W-40, 0, 40, 3, "F");

    const cx = this.W/2, cy = this.H/2-20;
    [55,75,95].forEach((r,i) => {
      this.doc.setDrawColor(...C.ocean); this.doc.setLineWidth(0.15-i*0.03);
      this.doc.circle(cx, cy, r, "S");
    });

    const logoSize = 36;
    this.drawHydrexLogo(cx-logoSize/2, cy-logoSize/2, logoSize);

    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(36); this.doc.setTextColor(...C.offwhite);
    this.doc.text("HYDREX", cx, cy+logoSize/2+14, {align:"center"});
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(9); this.doc.setTextColor(...C.ocean);
    this.doc.text("WATER ACCOUNTING PLATFORM", cx, cy+logoSize/2+22, {align:"center"});

    const cardY = cy+logoSize/2+32;
    this.doc.setFillColor(10,22,40); this.doc.setDrawColor(...C.ocean); this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin+10, cardY, this.W-2*this.margin-20, 38, 4, 4, "FD");
    this.doc.setFont("helvetica","bold"); this.doc.setFontSize(16); this.doc.setTextColor(...C.offwhite);
    const titleText = this.lang==="id" ? "LAPORAN VOLUMETRIC WATER BENEFIT" : "VOLUMETRIC WATER BENEFIT REPORT";
    this.doc.text(titleText, cx, cardY+13, {align:"center"});
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(8); this.doc.setTextColor(...C.ocean);
    this.doc.text("Berdasarkan VWBA 2.0 — WRI · LimnoTech · BlueRisk · BEF", cx, cardY+22, {align:"center"});
    this.doc.text("Appendix D: Water Footprint · Water Stock · Water Credit", cx, cardY+29, {align:"center"});
    if (data.organizationName) {
      this.doc.setFont("helvetica","bold"); this.doc.setFontSize(10); this.doc.setTextColor(...C.teal);
      this.doc.text(data.organizationName, cx, cardY+38, {align:"center"});
    }

    const dateY = cardY+52;
    const dateStr = data.reportDate||new Date().toLocaleDateString(this.lang==="id"?"id-ID":"en-US",{year:"numeric",month:"long",day:"numeric"});
    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(8); this.doc.setTextColor(...C.muted);
    this.doc.text(this.lang==="id"?`Tanggal: ${dateStr}`:`Date: ${dateStr}`, cx, dateY, {align:"center"});
    if (data.projectName) this.doc.text(this.lang==="id"?`Proyek: ${data.projectName}`:`Project: ${data.projectName}`, cx, dateY+7, {align:"center"});

    // Section badges
    const badgeY = this.H-38;
    const secs = [
      {label:"Water\nFootprint", color:C.ocean as RGB, has:!!data.waterFootprint},
      {label:"Water\nStock", color:C.teal as RGB, has:!!data.waterStock},
      {label:"Water\nCredit", color:C.emerald as RGB, has:!!data.waterCredit},
    ];
    const bW=42, gap=8, totalW=secs.length*(bW+gap)-gap;
    const startX = (this.W-totalW)/2;
    secs.forEach((s,i) => {
      const bx = startX+i*(bW+gap);
      this.doc.setFillColor(s.has?s.color[0]:15, s.has?s.color[1]:30, s.has?s.color[2]:55);
      this.doc.setDrawColor(...s.color); this.doc.setLineWidth(0.4);
      this.doc.roundedRect(bx, badgeY, bW, 16, 3, 3, s.has?"F":"FD");
      this.doc.setFont("helvetica",s.has?"bold":"normal"); this.doc.setFontSize(7);
      this.doc.setTextColor(...(s.has?C.white:s.color));
      s.label.split("\n").forEach((line,li) => this.doc.text(line, bx+bW/2, badgeY+6+li*5.5, {align:"center"}));
    });

    this.doc.setFont("helvetica","normal"); this.doc.setFontSize(7); this.doc.setTextColor(...C.muted);
    this.doc.text("www.hydrex.id", cx, this.H-10, {align:"center"});
    this.doc.setTextColor(0,0,0);
  }

  // ══════════════ WATER FOOTPRINT ══════════════
  addWaterFootprintSection(data: WaterFootprintData) {
    let y = this.newPage(
      "Water Footprint",
      this.lang==="id" ? "Jejak Konsumsi Air — VWBA 2.0 Appendix D-2" : "Water Consumption — VWBA 2.0 Appendix D-2"
    );

    y = this.sectionHeader(this.lang==="id"?"Metodologi & Rumus":"Methodology & Formula", y, C.ocean);
    y = this.formulaBox("VWB = Withdrawal_with_project - Withdrawal_without_project", [
      ["Net Consumption", this.lang==="id"?"Konsumsi bersih air (m3/tahun)":"Net water consumption (m3/year)"],
      ["Withdrawal",      this.lang==="id"?"Total pengambilan air dari sumber":"Total water withdrawn from source"],
      ["Return Flow",     this.lang==="id"?"Volume air dikembalikan ke sistem":"Volume returned to hydrological system"],
      ["Blue Water",      this.lang==="id"?"Air hilang dari sistem hidrologis":"Water lost from hydrological system"],
    ], y, C.ocean);

    y = this.sectionHeader(this.lang==="id"?"Hasil Perhitungan":"Calculation Results", y, C.ocean);
    const vc = data.category.includes("Kritis")?C.rose:data.category.includes("Intervensi")?C.amber:C.emerald;

    y = this.metricCard("Net Water Consumption", fmt(data.netConsumption), "m3/tahun", y, C.ocean,
      `= ${fmt(data.withdrawal)} - ${fmt(data.returnFlow)} m3/thn`);
    y = this.metricCard("Blue Water Consumption", fmt(data.blueWater), "m3/tahun", y, C.teal,
      this.lang==="id"?"Air hilang secara permanen dari sistem hidrologis":"Water permanently lost from the hydrological system");
    y = this.statusBadge(this.lang==="id"?"Status Konsumsi":"Consumption Status", `${data.status} - ${data.category}`, y, vc);

    y = this.sectionHeader(this.lang==="id"?"Data Input":"Input Data", y, C.muted);
    y = this.dataRow(this.lang==="id"?"Sektor":"Sector", data.sector, y, true);
    y = this.dataRow("Total Withdrawal", `${fmt(data.withdrawal)} m3/tahun`, y, false);
    y = this.dataRow("Return Flow", `${fmt(data.returnFlow)} m3/tahun`, y, true);
    y = this.dataRow("Net Consumption (Calculated)", `${fmt(data.netConsumption)} m3/tahun`, y, false, C.ocean);

    y += 4;
    y = this.sectionHeader(this.lang==="id"?"Ambang Batas Interpretasi":"Interpretation Thresholds", y, C.muted);
    ([
      ["< 1.000", this.lang==="id"?"Rendah - Efisien":"Low - Efficient", C.emerald],
      ["1.000 - 10.000", this.lang==="id"?"Sedang - Perlu Monitoring":"Medium - Monitoring Required", C.teal],
      ["10.000 - 50.000", this.lang==="id"?"Tinggi - Perlu Intervensi":"High - Intervention Required", C.amber],
      ["> 50.000", this.lang==="id"?"Sangat Tinggi - Kritis":"Very High - Critical", C.rose],
    ] as [string,string,RGB][]).forEach(([range,label,col],i) => {
      y = this.dataRow(`${range} m3/tahun`, label, y, i%2===0, col);
    });

    y = this.noteBox([
      "VWBA 2.0 (D-2): Withdrawal & Consumption method — Reduced Water Demand objective.",
      this.lang==="id"?"Aktivitas: transaksi air legal, efisiensi operasional, deteksi dan perbaikan kebocoran.":"Activities: legal water transactions, operational efficiency, leak detection and repair.",
    ], y+4, C.ocean);

    this.addDisclaimer();
    this.addPageFooter(`${this.lang==="id"?"Halaman":"Page"} ${this.currentPage}`);
  }

  // ══════════════ WATER STOCK ══════════════
  addWaterStockSection(data: WaterStockData) {
    let y = this.newPage(
      this.lang==="id"?"Water Stock - Neraca Air DAS":"Water Stock - Watershed Balance",
      "Simplified Water Balance Model — VWBA 2.0 / D-4"
    );

    y = this.sectionHeader(this.lang==="id"?"Metodologi & Rumus":"Methodology & Formula", y, C.teal);
    y = this.formulaBox("dS = P - ET - Q - W", [
      ["dS", this.lang==="id"?"Perubahan stok air (m3/tahun)":"Change in water storage (m3/year)"],
      ["P",  this.lang==="id"?"Presipitasi (mm/thn x km2 x 1000)":"Precipitation (mm/yr x km2 x 1000)"],
      ["ET", this.lang==="id"?"Evapotranspirasi aktual (mm/thn)":"Actual evapotranspiration (mm/yr)"],
      ["Q",  this.lang==="id"?"Limpasan permukaan (mm/thn)":"Surface runoff (mm/yr)"],
      ["W",  this.lang==="id"?"Total withdrawal di DAS (m3/thn)":"Total watershed withdrawal (m3/yr)"],
      ["1000", this.lang==="id"?"Faktor konversi mm ke m3 per km2":"Conversion factor mm to m3 per km2"],
    ], y, C.teal);

    y = this.sectionHeader(this.lang==="id"?"Hasil Perhitungan":"Calculation Results", y, C.teal);
    const dc = data.deltaS>=0?C.emerald:(data.deltaS>-10000?C.amber:C.rose);
    y = this.metricCard("dS - "+(this.lang==="id"?"Perubahan Stok Air":"Change in Water Storage"),
      (data.deltaS>=0?"+":"")+fmt(data.deltaS), "m3/tahun", y, dc,
      `= ${fmt(data.P_vol)} - ${fmt(data.ET_vol)} - ${fmt(data.Q_vol)} - ${fmt(data.totalWithdrawal)}`);

    const pc = data.pressureLevel==="Kritis"?C.rose:data.pressureLevel==="Tinggi"?C.amber:C.emerald;
    y = this.statusBadge(this.lang==="id"?"Status DAS":"Watershed Status",
      `${data.status} | ${this.lang==="id"?"Tekanan":"Pressure"}: ${data.pressureLevel}`, y, pc);

    y = this.sectionHeader(this.lang==="id"?"Rincian Volume Komponen (m3/tahun)":"Component Volume Breakdown (m3/year)", y, C.muted);
    y = this.dataRow("P - "+(this.lang==="id"?"Presipitasi":"Precipitation"), `${fmt(data.P_vol)} m3`, y, true, C.ocean);
    y = this.dataRow("ET - "+(this.lang==="id"?"Evapotranspirasi":"Evapotranspiration"), `${fmt(data.ET_vol)} m3`, y, false, C.amber);
    y = this.dataRow("Q - "+(this.lang==="id"?"Limpasan Permukaan":"Surface Runoff"), `${fmt(data.Q_vol)} m3`, y, true, C.teal);
    y = this.dataRow("W - "+(this.lang==="id"?"Total Withdrawal":"Total Withdrawal"), `${fmt(data.totalWithdrawal)} m3`, y, false, C.rose);
    this.doc.setDrawColor(...C.teal); this.doc.setLineWidth(0.4);
    this.doc.line(this.margin, y+2, this.W-this.margin, y+2); y += 6;
    y = this.dataRow("dS = P - ET - Q - W", `${data.deltaS>=0?"+":""}${fmt(data.deltaS)} m3`, y, true, data.deltaS>=0?C.emerald:C.rose);

    y = this.sectionHeader(this.lang==="id"?"Data Input":"Input Data", y+4, C.muted);
    y = this.dataRow(this.lang==="id"?"Luas DAS":"Watershed Area", `${fmt(data.watershedArea)} km2`, y, true);
    y = this.dataRow("Presipitasi (P)", `${fmt(data.precipitation)} mm/tahun`, y, false);
    y = this.dataRow("Evapotranspirasi (ET)", `${fmt(data.evapotranspiration)} mm/tahun`, y, true);
    y = this.dataRow(this.lang==="id"?"Limpasan Permukaan (Q)":"Surface Runoff (Q)", `${fmt(data.surfaceRunoff)} mm/tahun`, y, false);
    y = this.dataRow(this.lang==="id"?"Total Withdrawal (W)":"Total Withdrawal (W)", `${fmt(data.totalWithdrawal)} m3/tahun`, y, true);

    y = this.noteBox([
      `${this.lang==="id"?"Rekomendasi":"Recommendation"}: ${data.recommendation}`,
      "VWBA 2.0: Water balance used as hydrological context for conservation project prioritization.",
    ], y+4, pc);

    this.addDisclaimer();
    this.addPageFooter(`${this.lang==="id"?"Halaman":"Page"} ${this.currentPage}`);
  }

  // ══════════════ WATER CREDIT ══════════════
  addWaterCreditSection(data: WaterCreditData) {
    const ptLabel = PROJECT_TYPE_LABELS[data.projectType];
    let y = this.newPage(
      "Water Credit - VWB",
      `Volumetric Water Benefit — VWBA 2.0 Step 3.3 | ${ptLabel?.method??"D-x"}`
    );

    y = this.sectionHeader(this.lang==="id"?"Metodologi & Rumus":"Methodology & Formula", y, C.emerald);
    y = this.formulaBox("VWB = V(with-project) - V(without-project)", [
      ["VWB",           this.lang==="id"?"Volumetric Water Benefit (m3/tahun)":"Volumetric Water Benefit (m3/year)"],
      ["V(with)",       this.lang==="id"?"Volume air dengan intervensi proyek":"Water volume with project intervention"],
      ["V(without)",    this.lang==="id"?"Volume baseline tanpa proyek":"Baseline volume without project"],
      ["Eligible Credit", this.lang==="id"?"VWB x (% Kontribusi / 100)":"VWB x (% Contribution / 100)"],
      ["Method",        ptLabel?`${ptLabel.method} - ${this.lang==="id"?ptLabel.id:ptLabel.en}`:data.projectType],
      ["Step 3.1-3.3",  this.lang==="id"?"Identifikasi objective & pilih indikator VWB":"Identify objective & select VWB indicator"],
    ], y, C.emerald);

    y = this.sectionHeader(this.lang==="id"?"Hasil Perhitungan VWB":"VWB Calculation Results", y, C.emerald);
    const vc = data.vwb>0?C.emerald:data.vwb===0?C.amber:C.rose;
    y = this.metricCard("VWB - Volumetric Water Benefit",
      (data.vwb>=0?"+":"")+fmt(data.vwb), "m3/tahun", y, vc,
      `= ${fmt(data.volumeWithProject)} - ${fmt(data.volumeWithoutProject)} m3/thn`);
    y = this.metricCard(this.lang==="id"?"Eligible Water Credit":"Eligible Water Credit",
      fmt(data.eligibleCredit), "m3/tahun", y, C.emerald,
      `= ${fmt(data.vwb)} x ${data.fundingContribution}% ${this.lang==="id"?"kontribusi pendanaan":"funding contribution"}`);
    y = this.statusBadge(this.lang==="id"?"Dampak Proyek":"Project Impact", data.projectImpact, y, vc);

    y = this.sectionHeader(this.lang==="id"?"Data Input & Detail":"Input Data & Details", y, C.muted);
    y = this.dataRow(this.lang==="id"?"Tipe Proyek":"Project Type", ptLabel?(this.lang==="id"?ptLabel.id:ptLabel.en):data.projectType, y, true);
    y = this.dataRow("Metode VWBA", ptLabel?.method??"-", y, false, C.emerald);
    y = this.dataRow("V(with-project)", `${fmt(data.volumeWithProject)} m3/tahun`, y, true, C.emerald);
    y = this.dataRow("V(without-project / Baseline)", `${fmt(data.volumeWithoutProject)} m3/tahun`, y, false, C.muted);
    y = this.dataRow("VWB (Selisih)", `${data.vwb>=0?"+":""}${fmt(data.vwb)} m3/tahun`, y, true, vc);
    y = this.dataRow(this.lang==="id"?"Kontribusi Pendanaan":"Funding Contribution", `${data.fundingContribution}%`, y, false, C.ocean);
    y = this.dataRow("Eligible Credit (VWB x %)", `${fmt(data.eligibleCredit)} m3/tahun`, y, true, C.emerald);

    y = this.noteBox([
      this.lang==="id"?"(1) Setiap kredit dicatat dalam registry dan hanya dapat digunakan sekali (retirement).":"(1) Each credit must be registered and can only be retired once.",
      this.lang==="id"?"(2) Transaksi kredit hanya dalam DAS yang sama atau memiliki konektivitas hidrologis.":"(2) Credit transactions only within same watershed or hydrologically connected.",
      this.lang==="id"?"(3) Baseline harus terverifikasi dan metode kuantifikasi terdokumentasi (VWBA Step 3.4).":"(3) Baseline must be verified and quantification method documented (VWBA Step 3.4).",
      this.lang==="id"?"(4) Verifikasi independen diperlukan untuk validasi resmi (VWBA Step 5).":"(4) Independent verification required for official validation (VWBA Step 5).",
    ], y+4, C.emerald);

    this.addDisclaimer();
    this.addPageFooter(`${this.lang==="id"?"Halaman":"Page"} ${this.currentPage}`);
  }

  // ══════════════ INTEGRATED ANALYSIS ══════════════
  addIntegratedAnalysis(data: HydrexReportData) {
    if (!data.waterFootprint||!data.waterStock||!data.waterCredit) return;
    const fp=data.waterFootprint, ws=data.waterStock, wc=data.waterCredit;

    let y = this.newPage(
      this.lang==="id"?"Analisis Terintegrasi":"Integrated Analysis",
      this.lang==="id"?"Penilaian Keberlanjutan Komprehensif":"Comprehensive Sustainability Assessment"
    );

    y = this.sectionHeader(this.lang==="id"?"Ringkasan Tiga Pilar":"Three-Pillar Summary", y, C.ocean);
    const pillarW = (this.W-2*this.margin-8)/3;
    [
      {title:"Water Footprint", value:fmt(fp.netConsumption), unit:"m3/thn", color:C.ocean as RGB, sub:fp.status},
      {title:"dS DAS", value:(ws.deltaS>=0?"+":"")+fmt(ws.deltaS), unit:"m3/thn", color:(ws.deltaS>=0?C.emerald:C.rose) as RGB, sub:ws.status},
      {title:"VWB Credit", value:"+"+fmt(wc.eligibleCredit), unit:"m3/thn", color:C.emerald as RGB, sub:wc.projectImpact.split("-")[0]},
    ].forEach((p,i) => {
      const px = this.margin+i*(pillarW+4);
      this.doc.setFillColor(...p.color); this.doc.roundedRect(px, y, pillarW, 32, 3, 3, "F");
      this.doc.setFont("helvetica","bold"); this.doc.setFontSize(7); this.doc.setTextColor(...C.white);
      this.doc.text(p.title, px+pillarW/2, y+8, {align:"center"});
      this.doc.setFontSize(13); this.doc.text(p.value, px+pillarW/2, y+20, {align:"center"});
      this.doc.setFont("helvetica","normal"); this.doc.setFontSize(6.5);
      this.doc.text(p.unit, px+pillarW/2, y+26, {align:"center"});
      this.doc.setFont("helvetica","italic"); this.doc.setFontSize(5.5);
      this.doc.text(p.sub, px+pillarW/2, y+31, {align:"center"});
    });
    y += 40;

    const excess = fp.netConsumption-Math.abs(ws.deltaS);
    const balanced = excess<=0;
    const verdC = balanced?C.emerald:C.rose;

    y = this.sectionHeader(this.lang==="id"?"Penilaian Keberlanjutan":"Sustainability Assessment", y, verdC);
    const verdict = balanced
      ? (this.lang==="id"?"SEIMBANG - Konsumsi bersih masih dalam batas kapasitas DAS.":"BALANCED - Net consumption within watershed capacity.")
      : (this.lang==="id"?`TIDAK SEIMBANG - Defisit ${fmt(excess)} m3/tahun. Wajib peroleh water credit.`:`UNBALANCED - Deficit of ${fmt(excess)} m3/year. Water credits required.`);
    y = this.metricCard(
      this.lang==="id"?"Status Keberlanjutan":"Sustainability Status",
      balanced?(this.lang==="id"?"SEIMBANG":"BALANCED"):(this.lang==="id"?"DEFISIT":"DEFICIT"),
      balanced?"v":"x", y, verdC, verdict);

    y = this.sectionHeader(this.lang==="id"?"Perhitungan Kesenjangan":"Gap Calculation", y, C.muted);
    y = this.dataRow(this.lang==="id"?"Net Water Consumption (Footprint)":"Net Water Consumption (Footprint)", `${fmt(fp.netConsumption)} m3/thn`, y, true, C.ocean);
    y = this.dataRow(this.lang==="id"?"Kapasitas Tersedia DAS (|dS|)":"Available Watershed Capacity (|dS|)", `${fmt(Math.abs(ws.deltaS))} m3/thn`, y, false, ws.deltaS>=0?C.emerald:C.rose);
    y = this.dataRow(this.lang==="id"?"Kesenjangan (Footprint - Kapasitas)":"Gap (Footprint - Capacity)", `${excess>=0?"+":""}${fmt(excess)} m3/thn`, y, true, excess>0?C.rose:C.emerald);
    y = this.dataRow(this.lang==="id"?"Eligible Water Credit (VWB)":"Eligible Water Credit (VWB)", `+${fmt(wc.eligibleCredit)} m3/thn`, y, false, C.emerald);
    const netBal = wc.eligibleCredit-excess;
    y = this.dataRow(this.lang==="id"?"Net Balance Setelah Kredit":"Net Balance After Credits",
      `${netBal>=0?"+":""}${fmt(netBal)} m3/thn`, y, true, netBal>=0?C.emerald:C.rose);

    const actions: string[] = [];
    if (ws.deltaS<0) actions.push(this.lang==="id"?"DAS defisit - prioritaskan proyek konservasi segera.":"Watershed deficit - prioritize conservation projects immediately.");
    if (fp.category.includes("Kritis")) actions.push(this.lang==="id"?"Water footprint kritis - kurangi konsumsi dan peroleh water credit tambahan.":"Critical footprint - reduce consumption and obtain additional water credits.");
    if (wc.vwb>0) actions.push(this.lang==="id"?`Proyek menghasilkan ${fmt(wc.eligibleCredit)} m3/thn credit eligible.`:`Project generates ${fmt(wc.eligibleCredit)} m3/yr eligible credit.`);
    actions.push(this.lang==="id"?"Pastikan semua kredit tercatat dalam registry HYDREX (VWBA 2.0 Step 4).":"Ensure all credits are registered in HYDREX registry (VWBA 2.0 Step 4).");
    actions.push(this.lang==="id"?"Verifikasi independen diperlukan (VWBA 2.0 Step 5).":"Independent verification required (VWBA 2.0 Step 5).");

    y = this.noteBox(actions, y+4, verdC);

    y = this.sectionHeader(this.lang==="id"?"Referensi Metodologi VWBA 2.0":"VWBA 2.0 Methodology Reference", y, C.muted);
    ([
      ["VWBA 2.0", "WRI/LimnoTech/BlueRisk/BEF — Volumetric Water Benefit Accounting v2.0"],
      ["D-1", "Curve Number — Runoff reduction / Avoided runoff"],
      ["D-2", "Withdrawal & Consumption — Reduced demand"],
      ["D-3", "Volume Provided — WASH & water supply"],
      ["D-4", "Recharge — Groundwater & seasonal water storage"],
      ["D-5", "Volume Captured — Stormwater & water bodies"],
      ["D-6", "Volume Treated — Water quality improvement"],
      ["D-9", "NPS Pollution Reduction — Volume improved"],
    ] as [string,string][]).forEach(([code,desc],i) => {
      y = this.dataRow(code, desc, y, i%2===0, i===0?C.ocean:C.muted);
    });

    this.addDisclaimer();
    this.addPageFooter(`${this.lang==="id"?"Halaman":"Page"} ${this.currentPage}`);
  }

  save(filename: string) { this.doc.save(filename); }
}

// ─────────────────────────── EXPORTS ───────────────────────────

export const generateWaterFootprintPDF = async (data: WaterFootprintData, lang: "id"|"en" = "id") => {
  const pdf = new HydrexReportPDF(lang);
  await pdf.loadLogo();
  pdf.addCoverPage({ waterFootprint: data, language: lang });
  pdf.addWaterFootprintSection(data);
  pdf.save(`hydrex-water-footprint-${Date.now()}.pdf`);
};

export const generateWaterStockPDF = async (data: WaterStockData, lang: "id"|"en" = "id") => {
  const pdf = new HydrexReportPDF(lang);
  await pdf.loadLogo();
  pdf.addCoverPage({ waterStock: data, language: lang });
  pdf.addWaterStockSection(data);
  pdf.save(`hydrex-water-stock-${Date.now()}.pdf`);
};

export const generateWaterCreditPDF = async (data: WaterCreditData, lang: "id"|"en" = "id") => {
  const pdf = new HydrexReportPDF(lang);
  await pdf.loadLogo();
  pdf.addCoverPage({ waterCredit: data, language: lang });
  pdf.addWaterCreditSection(data);
  pdf.save(`hydrex-water-credit-${Date.now()}.pdf`);
};

export const generateCompleteWaterReportPDF = async (data: HydrexReportData) => {
  const lang = data.language ?? "id";
  const pdf = new HydrexReportPDF(lang);
  await pdf.loadLogo();
  pdf.addCoverPage(data);
  if (data.waterFootprint) pdf.addWaterFootprintSection(data.waterFootprint);
  if (data.waterStock) pdf.addWaterStockSection(data.waterStock);
  if (data.waterCredit) pdf.addWaterCreditSection(data.waterCredit);
  if (data.waterFootprint && data.waterStock && data.waterCredit) pdf.addIntegratedAnalysis(data);
  pdf.save(`hydrex-laporan-lengkap-${Date.now()}.pdf`);
};

export default HydrexReportPDF;
