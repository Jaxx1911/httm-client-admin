"use client"

import { useState, useEffect } from "react"
import { useSamples } from "@/hooks/use-samples"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

export function SamplesList({ onSelectionChange }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [excludedSamples, setExcludedSamples] = useState(new Set()) // Samples bị loại trừ khi Select All
  const [includedSamples, setIncludedSamples] = useState(new Set()) // Samples được chọn khi không Select All
  const itemsPerPage = 10

  // Fetch samples using custom hook
  const { data, isLoading: loadingSamples } = useSamples(currentPage, itemsPerPage, true)

  const samples = data?.samples || []
  const totalPages = Math.ceil((data?.total || 0) / itemsPerPage)

  // Gửi data lên parent component mỗi khi có thay đổi
  useEffect(() => {
    if (isSelectedAll) {
      // Chế độ Select All: gửi danh sách samples bị loại trừ
      onSelectionChange({
        isSelectAll: true,
        samples: Array.from(excludedSamples)
      })
    } else {
      // Chế độ thường: gửi danh sách samples được chọn
      onSelectionChange({
        isSelectAll: false,
        samples: Array.from(includedSamples)
      })
    }
  }, [isSelectedAll, excludedSamples, includedSamples])

  const handleSelectAll = () => {
    if (isSelectedAll) {
      // Tắt Select All
      setIsSelectedAll(false)
      setExcludedSamples(new Set())
      setIncludedSamples(new Set())
    } else {
      // Bật Select All
      setIsSelectedAll(true)
      setExcludedSamples(new Set()) // Reset excluded list
      setIncludedSamples(new Set()) // Clear included list
    }
  }

  const toggleSample = (sampleId) => {
    if (isSelectedAll) {
      const newExcluded = new Set(excludedSamples)
      if (newExcluded.has(sampleId)) {
        newExcluded.delete(sampleId) // Bỏ khỏi danh sách loại trừ = chọn lại
      } else {
        newExcluded.add(sampleId) // Thêm vào danh sách loại trừ = bỏ chọn
      }
      setExcludedSamples(newExcluded)
    } else {
      // Chế độ thường: toggle included list
      const newIncluded = new Set(includedSamples)
      if (newIncluded.has(sampleId)) {
        newIncluded.delete(sampleId)
      } else {
        newIncluded.add(sampleId)
      }
      setIncludedSamples(newIncluded)
    }
  }

  // Check xem sample có được chọn không
  const isSampleSelected = (sampleId) => {
    if (isSelectedAll) {
      return !excludedSamples.has(sampleId) // Select All: chọn nếu KHÔNG có trong excluded
    } else {
      return includedSamples.has(sampleId) // Thường: chọn nếu có trong included
    }
  }

  // Tính số lượng samples được chọn để hiển thị
  const getSelectedCount = () => {
    if (isSelectedAll) {
      const total = data?.total || 0
      return `${total - excludedSamples.size}/${total}`
    } else {
      return `${includedSamples.size}/${data?.total || 0}`
    }
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-foreground font-medium">
          Training Samples ({getSelectedCount()} selected)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={loadingSamples || samples.length === 0}
          className="h-8"
        >
          {isSelectedAll ? "Deselect All" : "Select All"}
        </Button>
      </div>

      <ScrollArea className="h-[400px] border border-border rounded-md bg-input/50">
        {loadingSamples ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : samples.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Không tìm thấy mẫu dữ liệu
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {samples.map((sample) => (
              <div key={sample.id} className="flex gap-3 p-3 border border-border rounded-lg bg-card transition-colors">
                <Checkbox
                  checked={isSampleSelected(sample.id)}
                  onCheckedChange={() => toggleSample(sample.id)}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{sample.id}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <h4 className="text-sm font-medium text-foreground line-clamp-1">{sample.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {truncateText(sample.input_text, 150)}
                  </p>
                  <p className="text-xs text-foreground/80 line-clamp-1">
                    {truncateText(sample.target_summary, 100)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loadingSamples}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loadingSamples}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
