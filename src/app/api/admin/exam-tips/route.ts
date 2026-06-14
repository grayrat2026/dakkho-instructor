export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const row = await db.appConfig.findUnique({
      where: { key: 'exam_tips' },
    });

    if (row?.value) {
      try {
        const tips = JSON.parse(row.value);
        return NextResponse.json({ tips });
      } catch {
        // Invalid JSON
      }
    }

    return NextResponse.json({
      tips: { strategies: [], timeManagement: [], commonMistakes: [], wellness: [] },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tips = await req.json();
    const value = JSON.stringify(tips);

    await db.appConfig.upsert({
      where: { key: 'exam_tips' },
      update: { value },
      create: { key: 'exam_tips', value },
    });

    return NextResponse.json({ success: true, message: 'Exam tips updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
