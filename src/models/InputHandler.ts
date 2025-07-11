type InputCallback = (action: string) => void;

export default class InputHandler {
    private callback: InputCallback;

    constructor(callback: InputCallback) {
        this.callback = callback;
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    public bindListeners(): void {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    public unbindListeners(): void {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        switch (e.code) {
            case "ArrowLeft":
                e.preventDefault();
                this.callback("MOVE_LEFT");
                break;
            case "ArrowRight":
                e.preventDefault();
                this.callback("MOVE_RIGHT");
                break;
            case "ArrowDown":
                e.preventDefault();
                this.callback("SOFT_DROP");
                break;
            case "ArrowUp":
                e.preventDefault();
                this.callback("ROTATE");
                break;
        }
    }
}