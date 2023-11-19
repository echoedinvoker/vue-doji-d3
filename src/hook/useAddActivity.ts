import { useMutation } from "@tanstack/vue-query";
import { addActivity as addActivityApi } from "../service/apiActivity";
import { useToast } from "vue-toast-notification";

export function useAddActivity() {
  const $toast = useToast();
  const { mutate: addActivity, isLoading: isAdding } = useMutation({
    mutationFn: addActivityApi,
    onSuccess: () => $toast.success("You did it!"),
    onError: () => $toast.error("something wrong!"),
  });

  return { addActivity, isAdding };
}
