import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    console.error('Health check database query error:', err);
    dbStatus = 'unhealthy';
  }

  const isHealthy = dbStatus === 'healthy';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        application: {
          status: 'healthy',
          environment: process.env.NODE_ENV || 'development',
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
