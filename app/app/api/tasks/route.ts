import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const sql = getDb()
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    const tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    const sql = getDb()
    const [task] = await sql`
      INSERT INTO tasks (title) VALUES (${title.trim()}) RETURNING *
    `
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, done } = await req.json()
    const sql = getDb()
    const [task] = await sql`
      UPDATE tasks SET done = ${done} WHERE id = ${id} RETURNING *
    `
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const sql = getDb()
    await sql`DELETE FROM tasks WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
