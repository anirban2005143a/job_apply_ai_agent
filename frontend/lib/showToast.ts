import { toast, Bounce } from "react-toastify";

/**
 * Show a toast notification.
 * @param message The message to display
 * @param type 0 = error, 1 = success, 2 = info
 */
export function showToast(message: string, type: 0 | 1 | 2 = 0) {
  const options = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light" as const,
    transition: Bounce,
  };
  if (type === 0) {
    toast.error(message, options);
  } else if (type === 1) {
    toast.success(message, options);
  } else {
    toast.info(message, options);
  }
}
