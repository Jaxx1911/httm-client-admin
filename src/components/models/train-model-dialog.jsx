"use client"

import { useState } from "react"
import { SamplesList } from "./samples-list"
import { useTrainModel } from "@/hooks/use-models"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"

export function TrainModelDialog({ open, onOpenChange, onSuccess, baseModels }) {
  const [modelName, setModelName] = useState("")
  const [baseModel, setBaseModel] = useState("default")
  const [selectionData, setSelectionData] = useState({ isSelectAll: false, samples: [] })
  
  const trainModelMutation = useTrainModel()

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
      await trainModelMutation.mutateAsync({
        model_name: modelName,
        base_model_id: baseModels.find((bm) => bm.name === baseModel)?.id,
        is_select_all: selectionData.isSelectAll,
        sample_ids: selectionData.samples,
      })

      // Reset form
      setModelName("")
      setBaseModel("default")
      setSelectionData({ isSelectAll: false, samples: [] })
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error("Train model error:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-full border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Huấn luyện mô hình mới</DialogTitle>
          <DialogDescription>Tạo mô hình viT5 mới với dữ liệu huấn luyện</DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  )
}
