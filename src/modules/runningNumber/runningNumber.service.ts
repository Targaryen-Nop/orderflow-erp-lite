import { ClientSession } from "mongoose";
import { RunningNumber } from "./runningNumber.model";

export type DocType = "CO" | "INV" | "PAY";

function getYearMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

function pad(value: number, length = 5) {
  return String(value).padStart(length, "0");
}

export async function nextRunningNumber(session: ClientSession, docType: DocType) {
  const yearMonth = getYearMonth();
  const prefix = docType;

  const doc = await RunningNumber.findOneAndUpdate(
    { docType, prefix, yearMonth },
    {
      $setOnInsert: { docType, prefix, yearMonth },
      $inc: { currentValue: 1 },
    },
    {
      new: true,
      upsert: true,
      session,
    }
  );

  return `${prefix}-${yearMonth}-${pad(doc.currentValue)}`;
}
