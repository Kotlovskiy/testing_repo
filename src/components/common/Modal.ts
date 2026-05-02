export interface ModalOptions {
    title?: string;
    content?: string | HTMLElement;
    onClose?: () => void;
}

export class Modal {
    private modalElement: HTMLElement;
    private overlay: HTMLElement;
    private closeButtons: NodeListOf<Element>;
    private onCloseCallback?: () => void;

    constructor(modalId: string) {
        this.modalElement = document.getElementById(modalId)!;
        this.overlay = this.modalElement.querySelector('.modal-overlay')!;
        this.closeButtons = this.modalElement.querySelectorAll('.modal-close');
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hide());
        });
        
        this.overlay.addEventListener('click', () => this.hide());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    show(options?: ModalOptions): void {
        if (options?.title) {
            const titleElement = this.modalElement.querySelector('.modal-header h3');
            if (titleElement) titleElement.textContent = options.title;
        }
        
        if (options?.content) {
            const bodyElement = this.modalElement.querySelector('.modal-body');
            if (bodyElement) {
                if (typeof options.content === 'string') {
                    bodyElement.innerHTML = options.content;
                } else {
                    bodyElement.innerHTML = '';
                    bodyElement.appendChild(options.content);
                }
            }
        }
        
        this.onCloseCallback = options?.onClose;
        this.modalElement.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hide(): void {
        this.modalElement.style.display = 'none';
        document.body.style.overflow = '';
        
        if (this.onCloseCallback) {
            this.onCloseCallback();
            this.onCloseCallback = undefined;
        }
    }

    isVisible(): boolean {
        return this.modalElement.style.display === 'flex';
    }

    setContent(content: string | HTMLElement): void {
        const bodyElement = this.modalElement.querySelector('.modal-body');
        if (bodyElement) {
            if (typeof content === 'string') {
                bodyElement.innerHTML = content;
            } else {
                bodyElement.innerHTML = '';
                bodyElement.appendChild(content);
            }
        }
    }

    setTitle(title: string): void {
        const titleElement = this.modalElement.querySelector('.modal-header h3');
        if (titleElement) titleElement.textContent = title;
    }
}