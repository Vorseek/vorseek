import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { nextUrl: url, geo } = req;

  url.searchParams.set('country', geo.country);

  req.headers.set('country-test', geo.country);

  return NextResponse.rewrite(url);
}