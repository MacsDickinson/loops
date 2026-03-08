import type { IIdeaRepository } from '../domain/ports/idea-repository'
import type { ISpecificationRepository } from '@/contexts/discovery/domain/ports/specification-repository'
import type { ISessionRepository } from '@/contexts/discovery/domain/ports/session-repository'
import type { Idea } from '../domain/entities/idea'

interface CreateIdeaInput {
  workspaceId: string
  name: string
  description: string
  productId: string | null
  createdBy: string
}

interface CreateIdeaResult {
  idea: Idea
  specificationId: string
  sessionId: string
}

export class CreateIdea {
  constructor(
    private ideaRepo: IIdeaRepository,
    private specRepo: ISpecificationRepository,
    private sessionRepo: ISessionRepository
  ) {}

  async execute(input: CreateIdeaInput): Promise<CreateIdeaResult> {
    const idea = await this.ideaRepo.create({
      workspaceId: input.workspaceId,
      productId: input.productId,
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
    })

    const spec = await this.specRepo.create({
      workspaceId: input.workspaceId,
      ideaId: idea.id,
      featureId: null,
      createdBy: input.createdBy,
      title: input.name,
      description: input.description,
      requirements: [],
      acceptanceTests: [],
      status: 'draft',
      linkedGithubPr: null,
      linkedLinearIssue: null,
    })

    const session = await this.sessionRepo.create({
      specificationId: spec.id,
      startedBy: input.createdBy,
      status: 'active',
      personasUsed: [],
    })

    return {
      idea,
      specificationId: spec.id,
      sessionId: session.id,
    }
  }
}
