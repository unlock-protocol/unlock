import KeyData from './keyData'

type JobStatus = 'processing' | 'completed' | 'failed'

interface Job {
  id: string
  status: JobStatus
  createdAt: number
  // Can hold result data or error message
  data?: KeyData[] | string
}

class JobStore {
  private static jobs: Map<string, Job> = new Map()

  static createJob(id: string): Job {
    const job: Job = { id, createdAt: Date.now(), status: 'processing' }
    this.jobs.set(id, job)
    return job
  }

  static getJob(id: string): Job | undefined {
    return this.jobs.get(id)
  }

  static updateJob(id: string, status: JobStatus, data?: any): void {
    const job = this.jobs.get(id)
    if (job) {
      job.status = status
      if (data) {
        job.data = data
      }
      this.jobs.set(id, job)
    }
  }

  static removeJob(id: string): void {
    this.jobs.delete(id)
  }

  static cleanOldJobs(): void {
    const time = Date.now() - 10 * 60 * 1000 // 10 minutes in milliseconds
    this.jobs.forEach((job, id) => {
      if (job.createdAt < time) {
        this.jobs.delete(id)
      }
    })
  }
}

export { Job, JobStore, JobStatus }
