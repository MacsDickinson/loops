import type { ISpecificationRepository } from '../domain/ports/specification-repository'
import type { ISessionRepository } from '../domain/ports/session-repository'
import type { Specification } from '../domain/entities/specification'
import { canComplete } from '../domain/entities/specification'

export class CompleteSpecification {
  constructor(
    private specRepo: ISpecificationRepository,
    private sessionRepo: ISessionRepository
  ) {}

  async execute(specificationId: string): Promise<Specification> {
    const spec = await this.specRepo.findById(specificationId)
    if (!spec) {
      throw new Error(`Specification not found: ${specificationId}`)
    }

    if (!canComplete(spec)) {
      throw new Error(
        'Specification must have at least one requirement and one acceptance test to be marked complete'
      )
    }

    if (spec.status === 'complete') {
      throw new Error('Specification is already complete')
    }

    // Complete any active discovery sessions
    const activeSession = await this.sessionRepo.findActiveBySpec(specificationId)
    if (activeSession) {
      await this.sessionRepo.updateStatus(activeSession.id, 'completed')
    }

    return this.specRepo.updateStatus(specificationId, 'complete')
  }
}
