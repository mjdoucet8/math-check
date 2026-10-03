import { audio, audioControls } from './audio.ts';
import { Vessels } from '../domain/vessels.ts';
const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
export class VesselEncounter {
    private model: Vessels;
    snapshot() { return this.model.snapshot(); }
    private active = false;
    private message = '';
    private lastFocus: HTMLElement | null = null;
    private readonly panel = document.getElementById('vessel-panel')!;
    private readonly content = document.getElementById('vessel-content')!;
    private readonly abort = new AbortController();
    constructor(private readonly onOpen: () => void, private readonly onClose: () => void, private readonly onRestore: (count: number) => void, initial = new Vessels(), private readonly onChange: () => void = () => {}) {
        this.model = initial;
        this.panel.addEventListener('click', event => {
            const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
            if (!button || button.hasAttribute('data-audio-toggle'))
                return;
            const action = button.dataset.action;
            if (action === 'close') {
                this.close();
                return;
            }
            if (action === 'listen') {
                this.say(`Put ${words[this.model.progress.target]!.toLowerCase()} portions into the vessel. Pump adds one portion. Empty clears the vessel. Choose Confirm when you are ready.`);
                return;
            }
            if (action === 'pump') {
                this.model.pump();
                this.message = '';
                if (this.model.phase === 'guided')
                    this.say(words[this.model.quantity]!);
            }
            if (action === 'empty') {
                this.model.empty();
                this.message = '';
            }
            if (action === 'confirm') {
                const result = this.model.confirm();
                if (result === 'incorrect')
                    this.message = 'The water is not quite right. You can Empty the vessel and try again.';
                if (result === 'correct') {
                    this.onRestore(this.model.completed.length);
                    this.message = '';
                }
            }
            if (action === 'next')
                this.model.next();
            if (action === 'demo') {
                this.model.demonstrate();
                this.message = '';
            }
            if (action === 'practice') {
                this.model.practicePump();
                this.say(words[this.model.practice]!);
            }
            if (action === 'return') {
                this.model.returnToTask();
                this.message = 'Your vessel is just as you left it. Try again when you are ready.';
            }
            if (action === 'guide') {
                this.model.guide();
                this.message = '';
            }
            this.render(); this.onChange();
            if (event.detail === 0)
                (this.content.querySelector<HTMLElement>(`[data-action="${action}"]:not(:disabled)`) ?? this.content.querySelector<HTMLElement>('[data-action="close"]'))?.focus();
        }, { signal: this.abort.signal });
        this.panel.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                this.close();
            }
            if (event.key === 'Tab') {
                const buttons = [...this.panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')], index = buttons.indexOf(document.activeElement as HTMLButtonElement);
                if (event.shiftKey && index <= 0 || !event.shiftKey && index === buttons.length - 1) {
                    event.preventDefault();
                    (event.shiftKey ? buttons.at(-1) : buttons[0])?.focus();
                }
            }
        }, { signal: this.abort.signal });
    }
    open() { if (this.active)
        return; this.lastFocus = document.activeElement as HTMLElement; this.active = true; this.panel.hidden = false; this.onOpen(); this.render(); this.content.querySelector<HTMLButtonElement>('[data-action="close"]')!.focus(); }
    close() { if (!this.active)
        return; this.active = false; this.panel.hidden = true; this.cancelSpeech(); this.onClose(); (this.lastFocus?.matches('button,input') ? this.lastFocus : document.getElementById('pause'))?.focus(); }
    reset() { this.close(); this.model = new Vessels(); this.message = ''; }
    dispose() { this.abort.abort(); this.cancelSpeech(); }
    private say(text: string) { audio.say(text); }
    private cancelSpeech() { audio.cancelSpeech(); }
    private vessel(quantity: number) { return `<div class="glass-vessel" role="img" aria-label="Glass vessel with visible water portions">${Array.from({ length: quantity }, () => '<div class="water-portion"></div>').join('')}</div>`; }
    private render() {
        const c = this.model;
        this.panel.dataset.phase = c.phase;
        this.panel.dataset.evidence = JSON.stringify({ current: c.progress, completed: c.completed });
        let title = `Put ${words[c.progress.target]!.toLowerCase()} portions into the vessel.`, body = '';
        if (c.phase === 'complete') {
            title = 'The garden has water again.';
            body = '<div class="restoration-symbol" aria-hidden="true">✧</div><p>The fountain sings, and the plants begin to wake. An explorer satchel waits in a newly opened garden corner.</p><button data-action="close">Explore the garden</button>';
        }
        else if (c.phase === 'success') {
            title = 'Water reaches another corner.';
            body = `${this.vessel(c.quantity)}<p>A little more of the garden is waking.</p><button data-action="next">${c.completed.length === 5 ? 'Finish restoration' : 'Find the next vessel'}</button>`;
        }
        else if (c.phase === 'demo') {
            title = 'Try the practice pump.';
            body = `<p>This is a separate practice vessel. Your answer stays as you left it.</p>${this.vessel(c.practice)}<p class="count-word" role="status">${c.practice ? words[c.practice] : 'One pump gives one portion.'}</p><button data-action="${c.practice < 3 ? 'practice' : 'return'}">${c.practice < 3 ? 'Pump the practice vessel' : 'Try your vessel'}</button>`;
        }
        else
            body = `<p>${c.phase === 'guided' ? 'We emptied this vessel. Pump once at a time and count with me.' : 'Each Pump gives the same portion. Empty clears the whole vessel.'}</p>${this.vessel(c.quantity)}<p class="encounter-feedback" role="status">${c.phase === 'guided' ? c.quantity ? words[c.quantity] : 'Pump the first portion.' : this.message}</p><div class="encounter-actions"><button data-action="pump" ${c.quantity >= 8 || c.phase === 'guided' && c.quantity === c.progress.target ? 'disabled' : ''}>Pump</button>${c.phase === 'task' ? '<button data-action="empty">Empty</button>' : ''}<button data-action="confirm" ${c.phase === 'guided' && c.quantity !== c.progress.target ? 'disabled' : ''}>Confirm</button>${c.helpAvailable ? '<button data-action="demo">Show me with a practice pump</button>' : ''}${c.guidedAvailable ? '<button data-action="guide">Count together</button>' : ''}</div>`;
        this.content.innerHTML = `<header><span class="eyebrow">THE HIDDEN GARDEN</span><button data-action="close" aria-label="Back to garden">×</button></header><h2 id="vessel-title">${title}</h2>${document.getElementById("game")?.dataset.journeyPropsArt === "true" && c.phase !== "complete" ? '<span class="garden-pump-art" aria-hidden="true"></span>' : ""}${body}${audioControls(c.phase === 'task')}`;
        audio.refresh();
    }
}
