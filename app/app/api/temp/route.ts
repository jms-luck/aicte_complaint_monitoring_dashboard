import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50
    const offset = (page - 1) * limit

    const sql = getDb()

    if (search) {
      const pattern = `%${search}%`
      const rows = await sql`
        SELECT * FROM temp
        WHERE institute_name ILIKE ${pattern}
           OR application_no ILIKE ${pattern}
           OR permanent_id ILIKE ${pattern}
        ORDER BY sno
        LIMIT ${limit} OFFSET ${offset}
      `
      const [{ count }] = await sql`
        SELECT COUNT(*) FROM temp
        WHERE institute_name ILIKE ${pattern}
           OR application_no ILIKE ${pattern}
           OR permanent_id ILIKE ${pattern}
      `
      return NextResponse.json({ rows, total: parseInt(count), page, limit })
    }

    const rows = await sql`SELECT * FROM temp ORDER BY sno LIMIT ${limit} OFFSET ${offset}`
    const [{ count }] = await sql`SELECT COUNT(*) FROM temp`
    return NextResponse.json({ rows, total: parseInt(count), page, limit })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
