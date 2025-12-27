import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/lib/db'
import { Job } from '@/entities/Job'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataSource = await getDataSource()
    const jobRepository = dataSource.getRepository(Job)

    const job = await jobRepository.findOne({
      where: { id: params.id },
      relations: ['category'],
    })

    if (!job) {
      return NextResponse.redirect(new URL('/jobs', request.url))
    }

    // Redirect directly to applyUrl
    return NextResponse.redirect(job.applyUrl, { status: 302 })
  } catch (error) {
    console.error('Error redirecting to job:', error)
    return NextResponse.redirect(new URL('/jobs', request.url))
  }
}

