import type { IChangelogRepository } from '../domain/ports/changelog-repository'
import type { SpecificationChange } from '../domain/entities/specification-change'

export class GetSpecificationChangelog {
  constructor(private changelogRepo: IChangelogRepository) {}

  async execute(specificationId: string): Promise<SpecificationChange[]> {
    return this.changelogRepo.findBySpec(specificationId)
  }
}
