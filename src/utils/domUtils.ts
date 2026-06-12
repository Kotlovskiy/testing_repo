export class DomManipulator {
    renderUserContent(elementId: string, userHtml: string): void {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = userHtml;  // XSS!
        }
    }

    insertUserHtml(selector: string, position: InsertPosition, html: string): void {
        const element = document.querySelector(selector);
        if (element) {
            element.insertAdjacentHTML(position, html);  // XSS!
        }
    }

    writeUserContent(content: string): void {
        document.write(content);  // XSS!
    }
}
