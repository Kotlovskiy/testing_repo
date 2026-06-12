export class DomManipulator {
    renderUserContent(elementId: string, userHtml: string): void {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = userHtml;
        }
    }

    insertUserHtml(selector: string, position: InsertPosition, html: string): void {
        const element = document.querySelector(selector);
        if (element) {
            element.insertAdjacentHTML(position, html);
        }
    }

    writeUserContent(content: string): void {
        document.write(content);
    }
}

export const domManipulator = new DomManipulator();
