import { Modal } from './Modal';
import { ConfirmOptions } from '../../types';

export class ConfirmModal {
    private static modal: Modal;
    private static currentOptions: ConfirmOptions | null = null;

    private static init(): void {
        if (!this.modal) {
            this.modal = new Modal('confirm-modal');
            
            const confirmBtn = document.getElementById('confirm-ok');
            confirmBtn?.addEventListener('click', () => {
                if (this.currentOptions) {
                    this.currentOptions.onConfirm();
                }
                this.modal.hide();
            });
        }
    }

    static show(options: ConfirmOptions): void {
        this.init();
        this.currentOptions = options;
        
        const title = document.getElementById('confirm-title');
        const message = document.getElementById('confirm-message');
        const confirmBtn = document.getElementById('confirm-ok');
        
        if (title) title.textContent = options.title;
        if (message) message.textContent = options.message;
        if (confirmBtn) {
            confirmBtn.textContent = options.confirmText || 'Подтвердить';
            confirmBtn.className = `btn ${options.isDanger ? 'btn-danger' : 'btn-primary'}`;
        }
        
        this.modal.show({
            onClose: () => {
                this.currentOptions = null;
            }
        });
    }
}