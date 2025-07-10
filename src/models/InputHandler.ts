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
                this.callback("MOVE_LEFT");
                break;
            case "ArrowRight":
                this.callback("MOVE_RIGHT");
                break;
            case "ArrowDown":
                this.callback("SOFT_DROP");
                break;
            case "ArrowUp":
                this.callback("ROTATE");
                break;
        }
    }
}