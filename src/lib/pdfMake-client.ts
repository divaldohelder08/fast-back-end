import PdfPrinter from "pdfmake";
import type { TFontDictionary } from "pdfmake/interfaces";
//Spell:ignore bolditalics

const fonts: TFontDictionary = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};
export const printer = new PdfPrinter(fonts);
