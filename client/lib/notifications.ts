export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

class NotificationManager {
  private container: HTMLElement | null = null;
  private notifications: Map<string, HTMLElement> = new Map();

  private getOrCreateContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "notification-container";
      this.container.className =
        "fixed top-4 right-4 z-50 space-y-2 pointer-events-none";
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private getNotificationStyles(type: NotificationType): string {
    const baseStyles =
      "pointer-events-auto transform transition-all duration-300 ease-in-out";

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-500 text-white border-green-600`;
      case "error":
        return `${baseStyles} bg-red-500 text-white border-red-600`;
      case "warning":
        return `${baseStyles} bg-yellow-500 text-white border-yellow-600`;
      case "info":
        return `${baseStyles} bg-blue-500 text-white border-blue-600`;
      default:
        return `${baseStyles} bg-gray-500 text-white border-gray-600`;
    }
  }

  private getIcon(type: NotificationType): string {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📋";
    }
  }

  show(options: NotificationOptions): string {
    const container = this.getOrCreateContainer();
    const id = Date.now().toString();

    const notification = document.createElement("div");
    notification.className = `${this.getNotificationStyles(options.type)} px-4 py-3 rounded-lg shadow-lg border-l-4 max-w-sm`;

    const content = `
      <div class="flex items-start gap-3">
        <span class="text-lg flex-shrink-0">${this.getIcon(options.type)}</span>
        <div class="flex-1 min-w-0">
          ${options.title ? `<div class="font-semibold text-sm">${options.title}</div>` : ""}
          <div class="text-sm ${options.title ? "mt-1" : ""}">${options.message}</div>
        </div>
        <button 
          class="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors"
          onclick="this.closest('[data-notification-id]').remove()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    notification.innerHTML = content;
    notification.setAttribute("data-notification-id", id);

    // Add entrance animation
    notification.style.transform = "translateX(100%)";
    notification.style.opacity = "0";

    container.appendChild(notification);
    this.notifications.set(id, notification);

    // Trigger entrance animation
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    }, 50);

    // Auto-remove after duration
    const duration =
      options.duration || (options.type === "error" ? 8000 : 4000);
    setTimeout(() => {
      this.remove(id);
    }, duration);

    return id;
  }

  remove(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      // Exit animation
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";

      setTimeout(() => {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
        this.notifications.delete(id);

        // Clean up container if no notifications
        if (this.notifications.size === 0 && this.container) {
          document.body.removeChild(this.container);
          this.container = null;
        }
      }, 300);
    }
  }

  clear(): void {
    this.notifications.forEach((_, id) => this.remove(id));
  }
}

const notificationManager = new NotificationManager();

// Convenience functions
export const showSuccess = (message: string, title?: string) => {
  return notificationManager.show({ type: "success", message, title });
};

export const showError = (message: string, title?: string) => {
  return notificationManager.show({ type: "error", message, title });
};

export const showWarning = (message: string, title?: string) => {
  return notificationManager.show({ type: "warning", message, title });
};

export const showInfo = (message: string, title?: string) => {
  return notificationManager.show({ type: "info", message, title });
};

export const showNotification = (options: NotificationOptions) => {
  return notificationManager.show(options);
};

export const removeNotification = (id: string) => {
  notificationManager.remove(id);
};

export const clearAllNotifications = () => {
  notificationManager.clear();
};

// Upload-specific notifications
export const showUploadSuccess = (filename?: string) => {
  const message = filename
    ? `${filename} uploaded successfully!`
    : "Image uploaded successfully!";
  return showSuccess(message, "Upload Complete");
};

export const showUploadError = (error: string, filename?: string) => {
  const title = filename ? `Failed to upload ${filename}` : "Upload Failed";
  return showError(error, title);
};

export const showSaveSuccess = (section?: string) => {
  const message = section
    ? `${section} saved successfully!`
    : "Changes saved successfully!";
  return showSuccess(message, "Save Complete");
};

export const showSaveError = (error: string, section?: string) => {
  const title = section ? `Failed to save ${section}` : "Save Failed";
  return showError(error, title);
};

export default notificationManager;
