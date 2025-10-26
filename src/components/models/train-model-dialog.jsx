"use client"

import { useState } from "react"
import { SamplesList } from "./samples-list"
import { useTrainModel, useSaveTrainResults } from "@/hooks/use-models"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

export function TrainModelDialog({ open, onOpenChange, onSuccess, baseModels }) {
  const [modelName, setModelName] = useState("")
  const [baseModel, setBaseModel] = useState("default")
  const [selectionData, setSelectionData] = useState({ isSelectAll: false, samples: [] })
  const [trainingResults, setTrainingResults] = useState(null)
  
  const trainModelMutation = useTrainModel()
  const saveResultsMutation = useSaveTrainResults()

  const handleSubmit = async (e) => {
    console.log("Submitting with data:", { modelName, baseModel, selectionData })
    e.preventDefault()

    if (!modelName.trim()) {
      return
    }

    if (!selectionData.isSelectAll && selectionData.samples.length === 0) {
      return
    }

    try {
      const result = await trainModelMutation.mutateAsync({
        id: null,
        model_name: modelName,
        base_model_id: baseModels.find((bm) => bm.id === baseModel)?.id == "default" ? null : baseModels.find((bm) => bm.id === baseModel)?.id,
        is_select_all: selectionData.isSelectAll,
        sample_ids: selectionData.samples,
      })

      // Lưu kết quả training để hiển thị
      setTrainingResults(result.data)
    } catch (err) {
      console.error("Train model error:", err)
    }
  }

  const handleSave = async () => {
    if (!trainingResults) return

    try {
      await saveResultsMutation.mutateAsync(trainingResults)

      // Reset form và đóng dialog
      setModelName("")
      setBaseModel("default")
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
    setModelName("")
    setBaseModel("default")
    setSelectionData({ isSelectAll: false, samples: [] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-full border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Huấn luyện mô hình mới</DialogTitle>
          <DialogDescription>Tạo mô hình viT5 mới với dữ liệu huấn luyện</DialogDescription>
        </DialogHeader>

        {!trainingResults ? (
          // Form training
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-[2fr_8fr] gap-6">
              {/* Left Side - Model Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-name" className="text-foreground font-medium">
                    Model Name
                  </Label>
                  <Input
                    id="model-name"
                    placeholder="e.g., My Custom Model"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="border-border bg-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-model" className="text-foreground font-medium">
                    Base Model
                  </Label>
                  <Select value={baseModel} onValueChange={setBaseModel}>
                    <SelectTrigger className="border-border bg-input text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border" align="start">
                      {baseModels?.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="text-foreground">
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Side - Training Data */}
              <SamplesList 
                onSelectionChange={setSelectionData}
              />
            </div>          
            {trainModelMutation.error && (
              <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{trainModelMutation.error.message || "Failed to train model"}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={trainModelMutation.isPending}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={trainModelMutation.isPending || (!selectionData.isSelectAll && selectionData.samples.length === 0)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {trainModelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {trainModelMutation.isPending ? "Training..." : "Train Model"}
              </Button>
            </div>
          </form>
        ) : (
          // Kết quả training
          <div className="space-y-4">
            <div className="flex items-center py-2 gap-2 text-primary">
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
