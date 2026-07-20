import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventApi } from "../../../api/eventApi";

export const useEventDetails = (id) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getById(id),
  });

  const event = data?.data || null;

  const fetchEventDetails = () => {
    queryClient.invalidateQueries({ queryKey: ['event', id] });
  };

  const errorMessage = error ? "We couldn't retrieve the details for this event. Please verify the ID or try again." : null;

  // We provide setEvent as a no-op or cache update if strictly needed,
  // but preferably components should use mutations to update event state.
  const setEvent = (newData) => {
    queryClient.setQueryData(['event', id], (old) => {
      return { ...old, data: typeof newData === 'function' ? newData(old?.data) : newData };
    });
  };

  return { event, setEvent, isLoading, error: errorMessage, fetchEventDetails };
};
