import { Modal } from './Modal';
import { NotificationOptions } from '../../types';

export class NotificationService {
    private modal: Modal;
    private static instance: NotificationService;

    private constructor() {
        this.modal = new Modal('notification-modal');
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    show(options: NotificationOptions): void {
        const type = options.type || 'info';
        const title = options.title || this.getDefaultTitle(type);
        
        this.modal.setTitle(title);
        this.modal.setContent(`<p>${options.message}</p>`);
        this.modal.show();
    }

    private getDefaultTitle(type: string): string {
        switch (type) {
            case 'success': return 'Успех';
            case 'error': return 'Ошибка';
            case 'warning': return 'Предупреждение';
            default: return 'Информация';
        }
    }

    success(message: string, title?: string): void {
        this.show({ type: 'success', message, title: title || 'Успех' });
    }

    error(message: string, title?: string): void {
        this.show({ type: 'error', message, title: title || 'Ошибка' });
    }

    warning(message: string, title?: string): void {
        this.show({ type: 'warning', message, title: title || 'Предупреждение' });
    }

    info(message: string, title?: string): void {
        this.show({ type: 'info', message, title: title || 'Информация' });
    }
}

export const notification = NotificationService.getInstance();