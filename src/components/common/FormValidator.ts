export class FormValidator {
    private form: HTMLFormElement;
    private errorContainer: HTMLElement | null = null;

    constructor(form: HTMLFormElement, errorContainerId?: string) {
        this.form = form;
        
        if (errorContainerId) {
            this.errorContainer = document.getElementById(errorContainerId);
        }
        
        if (!this.errorContainer) {
            this.errorContainer = this.createErrorContainer();
        }
    }

    private createErrorContainer(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'form-errors';
        container.style.display = 'none';
        
        // Проверяем, что форма существует и имеет родительский элемент
        if (this.form.parentNode) {
            this.form.parentNode.insertBefore(container, this.form);
        } else {
            // Если форма ещё не в DOM, вставляем как первый элемент формы
            this.form.insertBefore(container, this.form.firstChild);
        }
        
        return container;
    }

    clearErrors(): void {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = '';
            this.errorContainer.style.display = 'none';
        }
        
        this.form.querySelectorAll('.field-error').forEach(el => el.remove());
        this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    showErrors(errors: Record<string, string>): void {
        this.clearErrors();
        
        const errorMessages: string[] = [];
        
        Object.entries(errors).forEach(([field, message]) => {
            errorMessages.push(message);
            this.showFieldError(field, message);
        });
        
        if (errorMessages.length > 0 && this.errorContainer) {
            this.errorContainer.innerHTML = errorMessages.map(m => `<div>⚠ ${m}</div>`).join('');
            this.errorContainer.style.display = 'block';
        }
    }

    private showFieldError(fieldName: string, message: string): void {
        const field = this.form.querySelector(`[name="${fieldName}"]`) as HTMLElement;
        if (field) {
            field.classList.add('error');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            
            const parent = field.closest('.form-group') || field.parentElement;
            if (parent) {
                // Проверяем, нет ли уже ошибки для этого поля
                const existingError = parent.querySelector('.field-error');
                if (existingError) {
                    existingError.remove();
                }
                parent.appendChild(errorElement);
            }
        }
    }

    validate(rules: (() => Record<string, string>)[]): boolean {
        this.clearErrors();
        
        const allErrors: Record<string, string> = {};
        
        rules.forEach(rule => {
            const errors = rule();
            Object.assign(allErrors, errors);
        });
        
        if (Object.keys(allErrors).length > 0) {
            this.showErrors(allErrors);
            return false;
        }
        
        return true;
    }
}