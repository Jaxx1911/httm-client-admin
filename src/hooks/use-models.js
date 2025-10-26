import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Hook để fetch danh sách models
export function useModels(enabled = true) {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/model',
        {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch models")
      }
      
      return response.json()
    },
    enabled,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  })
}

// Hook để train model mới
export function useTrainModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      console.log("payload", payload)
      
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/model/train',
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to train model")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate và refetch danh sách models sau khi train thành công
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}

// Hook để retrain model có sẵn
export function useRetrainModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ modelId, baseModel, trainingData }) => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/models/${modelId}/retrain`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            baseModel,
            trainingData,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to retrain model")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate và refetch danh sách models sau khi retrain thành công
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}

// Hook để xóa model
export function useDeleteModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (modelId) => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/api/models/${modelId}`,
        {
          method: "DELETE",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete model")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}

// Hook để get chi tiết 1 model
export function useModel(modelId, enabled = true) {
  return useQuery({
    queryKey: ['models', modelId],
    queryFn: async () => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/api/models/${modelId}`,
        {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch model details")
      }
      
      return response.json()
    },
    enabled: enabled && !!modelId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
}
