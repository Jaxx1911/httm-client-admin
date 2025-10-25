"use client"

import { useState } from "react"
import { ModelsList } from "@/components/models/models-list"
import { TrainModelDialog } from "@/components/models/train-model-dialog"
import { RetrainModelDialog } from "@/components/models/re-train-model-dialog"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Bell } from "lucide-react"

export default function ModelsPage() {
  const [showTrainDialog, setShowTrainDialog] = useState(false)
  const [showRetrainDialog, setShowRetrainDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRetrain = (modelId) => {
    setSelectedModel(modelId)
    setShowRetrainDialog(true)
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">Models</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Manage and train your viT5 models</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowTrainDialog(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-sm h-8"
              >
                <Plus className="h-4 w-4" />
                Train New Model
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-4">
            <ModelsList key={refreshKey} onRetrain={handleRetrain} onRefresh={handleRefresh} />
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <TrainModelDialog open={showTrainDialog} onOpenChange={setShowTrainDialog} onSuccess={handleRefresh} />
      <RetrainModelDialog
        open={showRetrainDialog}
        onOpenChange={setShowRetrainDialog}
        modelId={selectedModel}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
