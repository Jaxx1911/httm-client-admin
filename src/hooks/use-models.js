import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
    onSuccess: () => {},
  })
}

// Hook để lưu kết quả training
export function useSaveTrainResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trainingResults) => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/model/save',
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trainingResults),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save training results")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate và refetch danh sách models sau khi save thành công
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


export function useActivateModel() {
  const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (modelId) => {
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL + `/model/activate/${modelId}`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to activate model")
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['models'] })
        },
    })
}
