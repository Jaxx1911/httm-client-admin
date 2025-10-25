"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

const BASE_MODELS = [
  { id: "vit5-base", label: "viT5 Base (Default)" },
  { id: "vit5-large", label: "viT5 Large" },
  { id: "vit5-small", label: "viT5 Small" },
]

export function RetrainModelDialog({ open, onOpenChange, modelId, onSuccess }) {
  const [baseModel, setBaseModel] = useState("vit5-base")
  const [trainingData, setTrainingData] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (!open) {
      setBaseModel("vit5-base")
      setTrainingData("")
      setError("")
      setResults(null)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!trainingData.trim()) {
      setError("Training data is required")
      return
    }

    if (!modelId) {
      setError("Model ID is missing")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/models/${modelId}/retrain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseModel,
          trainingData: trainingData.split("\n").filter((line) => line.trim()),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to retrain model")
      }

      const data = await response.json()
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!modelId || !results) return

    try {
      setLoading(true)
      const response = await fetch(`/api/models/${modelId}/save-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to save results")
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setResults(null)
    setTrainingData("")
    setBaseModel("vit5-base")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Retrain Model</DialogTitle>
          <DialogDescription>Retrain your model with new training data</DialogDescription>
        </DialogHeader>

        {!results ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-model" className="text-foreground font-medium">
                  Base Model
                </Label>
                <Select value={baseModel} onValueChange={setBaseModel} disabled={loading}>
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
                rows={6}
                disabled={loading}
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
                {loading ? "Training..." : "Start Retraining"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-primary border border-primary/20">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Training completed successfully!</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Training Results</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ResultCard label="Accuracy" value={(results.accuracy * 100).toFixed(2)} />
                <ResultCard label="Precision" value={(results.precision * 100).toFixed(2)} />
                <ResultCard label="Recall" value={(results.recall * 100).toFixed(2)} />
                <ResultCard label="F1 Score" value={(results.f1 * 100).toFixed(2)} />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Results"}
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
