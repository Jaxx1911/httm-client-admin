"use client"

import { useState, useEffect } from "react"
import { SamplesList } from "./samples-list"
import { useRetrainModel, useSaveTrainResults } from "@/hooks/use-models"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

export function RetrainModelDialog({ open, onOpenChange, model, onSuccess }) {
  const [selectionData, setSelectionData] = useState({ isSelectAll: false, samples: [] })
  const [trainingResults, setTrainingResults] = useState(null)

  const retrainModelMutation = useRetrainModel()
  const saveResultsMutation = useSaveTrainResults()

  useEffect(() => {
    if (!open) {
      setSelectionData({ isSelectAll: false, samples: [] })
      setTrainingResults(null)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!model) {
      return
    }

    if (!selectionData.isSelectAll && selectionData.samples.length === 0) {
      return
    }

    try {
      const result = await retrainModelMutation.mutateAsync({
        id: model.id,
        is_select_all: selectionData.isSelectAll,
        sample_ids: selectionData.samples,
        base_model_id: null,
        model_name: model.name,
        is_retrain: true,
      })

      // Lưu kết quả để hiển thị
      setTrainingResults(result.data)
    } catch (err) {
      console.error("Retrain model error:", err)
    }
  }

  const handleSave = async () => {
    if (!trainingResults) return

    try {
      await saveResultsMutation.mutateAsync(trainingResults)

      // Reset form và đóng dialog
      setSelectionData({ isSelectAll: false, samples: [] })
      setTrainingResults(null)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error("Save results error:", err)
    }
  }

  const handleCancel = () => {
    setTrainingResults(null)
    setSelectionData({ isSelectAll: false, samples: [] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-full border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Huấn luyện lại mô hình</DialogTitle>
          <DialogDescription>Huấn luyện lại mô hình với dữ liệu mới</DialogDescription>
        </DialogHeader>

        {!trainingResults ? (
          // Form retrain
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Samples List */}
            <SamplesList 
              onSelectionChange={setSelectionData}
            />
          
            {retrainModelMutation.error && (
              <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{retrainModelMutation.error.message || "Failed to retrain model"}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={retrainModelMutation.isPending}
                className="border-border text-foreground hover:bg-muted"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={retrainModelMutation.isPending || (!selectionData.isSelectAll && selectionData.samples.length === 0)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {retrainModelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {retrainModelMutation.isPending ? "Đang huấn luyện..." : "Bắt đầu huấn luyện"}
              </Button>
            </div>
          </form>
        ) : (
          // Kết quả retrain
          <div className="space-y-4">
            <div className="flex items-center gap-2 py-2 text-primary">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Huấn luyện hoàn tất!</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Kết quả huấn luyện</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ResultCard 
                  label="Accuracy" 
                  value={((trainingResults.accuracy || 0) * 100).toFixed(2)} 
                />
                <ResultCard 
                  label="Precision" 
                  value={((trainingResults.precision || 0) * 100).toFixed(2)} 
                />
                <ResultCard 
                  label="Recall" 
                  value={((trainingResults.recall || 0) * 100).toFixed(2)} 
                />
                <ResultCard 
                  label="F1 Score" 
                  value={((trainingResults.f1_score || 0) * 100).toFixed(2)} 
                />
              </div>
            </div>

            {saveResultsMutation.error && (
              <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{saveResultsMutation.error.message || "Failed to save results"}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saveResultsMutation.isPending}
                className="border-border text-foreground hover:bg-muted"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveResultsMutation.isPending}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saveResultsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {saveResultsMutation.isPending ? "Đang lưu..." : "Lưu kết quả"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ResultCard({ label, value }) {
  return (
    <Card className="border-border bg-gradient-to-br from-muted/50 to-muted/30">
      <CardContent className="pt-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{value}%</p>
      </CardContent>
    </Card>
  )
}
