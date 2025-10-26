import { useQuery } from "@tanstack/react-query"

export function useSamples(currentPage, itemsPerPage = 10, enabled = true) {
  return useQuery({
    queryKey: ['samples', currentPage, itemsPerPage],
    queryFn: async () => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/api/samples?page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch samples")
      }
      
      return response.json()
    },
    enabled,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  })
}
