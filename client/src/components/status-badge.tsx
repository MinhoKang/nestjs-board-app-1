import { Badge } from "@/components/ui/badge"
import type { BoardStatus } from "@/types"

export function StatusBadge({ status }: { status: BoardStatus }) {
  if (status === "PRIVATE") {
    return <Badge variant="secondary">비공개</Badge>
  }

  return <Badge>공개</Badge>
}
