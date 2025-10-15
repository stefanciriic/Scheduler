import { toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

class Toast {
  private static showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const options = { ...defaultOptions };
    
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
    }
  }

  static error(message: string) {
    this.showToast(message, 'error');
  }

  static success(message: string) {
    this.showToast(message, 'success');
  }

  static warning(message: string) {
    this.showToast(message, 'warning');
  }

  static info(message: string) {
    this.showToast(message, 'info');
  }
}

export default Toast;