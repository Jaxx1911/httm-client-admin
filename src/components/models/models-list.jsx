"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, RotateCcw, Trash2, Calendar, Database, Percent, CircleFadingArrowUp } from "lucide-react"

export function ModelsList({ onRetrain, onRefresh, baseModels, setBaseModels }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/model`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setModels(data.models)

      for (const model of data.models) {
        if (!baseModels.find((bm) => bm.id === model.id)) {
          baseModels.push({ id: model.id, label: model.name })
          setBaseModels([...baseModels])
        }
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (modelId) => {
    try {
      await fetch(`/api/models/${modelId}`, { method: "DELETE" })
      setDeleteId(null)
      onRefresh()
    } catch (error) {
      console.error("Failed to delete model:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-muted-foreground text-sm">Loading models...</p>
        </div>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No models yet</h3>
          <p className="text-muted-foreground text-xs mt-1">Create your first model by clicking "Train New Model"</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {models.map((model) => (
        <Card
          key={model.id}
          className="border-border bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden px-2 py-4"
          //style={{padding: 16}}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Model Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg text-foreground truncate">{model.name}</CardTitle>
                  <Badge
                    className={
                      model.status === "completed"
                        ? "bg-green-100 text-green-700" //xanh
                        : model.status === "training"
                        ? "bg-blue-100 text-blue-700" //lam
                        : model.status === "failed"
                        ? "bg-red-100 text-red-700" //do
                        : "bg-gray-100 text-gray-700" + "text-xs"}
                  >
                    {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Base: <span className="font-mono text-foreground/60">{model.base_model_name}</span>
                </CardDescription>
              </div>

              <div className="flex items-center gap-1 ml-auto text-muted-foreground text-sm gap-4">
                <div className="flex items-center">Accuracy: {(model.accuracy * 100).toFixed(1)} <Percent className="h-3 w-3" /></div>
                <div className="flex items-center">Precision: {(model.precision * 100).toFixed(1)} <Percent className="h-3 w-3" /></div>
                <div className="flex items-center">Recall: {(model.recall * 100).toFixed(1)} <Percent className="h-3 w-3" /></div>
                <div className="flex items-center">F1 Score: {(model.f1_score * 100).toFixed(1)} <Percent className="h-3 w-3" /></div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRetrain(model.id)} className="gap-2 text-sm">
                    <RotateCcw className="h-4 w-4" />
                    Huấn luyện lại
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRefresh} className="gap-2 text-sm">
                    <CircleFadingArrowUp className="h-4 w-4" />
                    Kích hoạt
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteId(model.id)}
                    className="gap-2 text-destructive focus:text-destructive text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(model.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Model</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this model? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
