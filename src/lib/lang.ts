import { cookies } from "next/headers";

export type Lang = "zh" | "en";

/** Read the language preference from the cookie. Defaults to "zh". */
export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  if (lang === "zh" || lang === "en") return lang;
  return "zh";
}
