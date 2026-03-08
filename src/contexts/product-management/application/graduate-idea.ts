import { supabaseServer } from '@/shared/infrastructure/supabase/server'

interface GraduateIdeaInput {
  ideaId: string
  productId: string
  graduatedBy: string
}

interface GraduateIdeaResult {
  featureId: string
}

export class GraduateIdea {
  async execute(input: GraduateIdeaInput): Promise<GraduateIdeaResult> {
    const { data, error } = await supabaseServer.rpc('graduate_idea', {
      p_idea_id: input.ideaId,
      p_product_id: input.productId,
      p_graduated_by: input.graduatedBy,
    })

    if (error) {
      throw new Error(`Graduation failed: ${error.message}`)
    }

    return { featureId: data as string }
  }
}
