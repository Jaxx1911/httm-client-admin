"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2 } from "lucide-react"

const BASE_MODELS = [
  { id: "vit5-base", label: "viT5 Base (Default)" },
  { id: "vit5-large", label: "viT5 Large" },
  { id: "vit5-small", label: "viT5 Small" },
]

export function TrainModelDialog({ open, onOpenChange, onSuccess }) {
  const [modelName, setModelName] = useState("")
  const [baseModel, setBaseModel] = useState("vit5-base")
  const [trainingData, setTrainingData] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!modelName.trim()) {
      setError("Model name is required")
      return
    }

    if (!trainingData.trim()) {
      setError("Training data is required")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/models/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName,
          baseModel,
          trainingData: trainingData.split("\n").filter((line) => line.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to train model")
      }

      setModelName("")
      setBaseModel("vit5-base")
      setTrainingData("")
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Train New Model</DialogTitle>
          <DialogDescription>Create a new viT5 model with your training data</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <SelectContent className="border-border bg-card">
                {BASE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-foreground">
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="training-data" className="text-foreground font-medium">
              Training Data
            </Label>
            <Textarea
              id="training-data"
              placeholder="Enter training samples (one per line)"
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
              rows={5}
              className="border-border bg-input text-foreground placeholder:text-muted-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground">Enter one training sample per line</p>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Training..." : "Train Model"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
