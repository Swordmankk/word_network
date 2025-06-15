"use client"

import { useWordNetworkStore } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function EmbeddingModelSelector() {
  const { embeddingModel, setEmbeddingModel } = useWordNetworkStore()

  return (
    <div className="space-y-2">
      <Label htmlFor="embedding-model">埋め込みモデル</Label>
      <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
        <SelectTrigger id="embedding-model">
          <SelectValue placeholder="埋め込みモデルを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text-embedding-3-small">OpenAI text-embedding-3-small</SelectItem>
          <SelectItem value="text-embedding-3-large">OpenAI text-embedding-3-large</SelectItem>
          <SelectItem value="mistral-embed">Mistral mistral-embed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
