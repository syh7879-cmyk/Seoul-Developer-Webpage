import { NextResponse } from 'next/server';
import type { ApiLabResponse } from '@/src/types/apiLab';

export const jsonResponse = <T>(body: ApiLabResponse<T>, status = 200) =>
  NextResponse.json(body, { status });

export const missingKeyResponse = (source: string, keyName: string) =>
  jsonResponse({
    ok: false,
    source,
    error: `${keyName} 환경변수가 없습니다. .env.local에 API 키를 추가한 뒤 다시 시도하세요.`,
  });

export const safeRawPreview = (raw: unknown) => {
  try {
    const text = JSON.stringify(raw);
    return text.length > 12000 ? `${text.slice(0, 12000)}...` : JSON.parse(text);
  } catch {
    return undefined;
  }
};

export const maskUrl = (url: URL, keyNames: string[]) => {
  const masked = new URL(url.toString());
  keyNames.forEach((keyName) => {
    if (masked.searchParams.has(keyName)) masked.searchParams.set(keyName, '***');
  });
  return masked.toString();
};
