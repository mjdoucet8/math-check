import { StoneChallenge, STONE_SUPPLY, STONE_TARGET } from '../domain/stones.ts';
const words = ['One', 'Two', 'Three', 'Four', 'Five'];
const stoneArt = '<svg viewBox="0 0 64 48" aria-hidden="true"><ellipse cx="32" cy="39" rx="25" ry="7" fill="#132f3544"/><path d="M7 29 15 12 38 6 55 17 59 31 42 40 17 39Z" fill="#96b5ac"/><path d="m15 12 23-6 17 11-24 8-24 4Z" fill="#c4d1b7"/><path d="m31 25 24-8 4 14-17 9-11-15Z" fill="#7e9f98"/></svg>';

export class StoneEncounter {
  private challenge = new StoneChallenge();
  private readonly panel: HTMLElement;
  private readonly content: HTMLElement;
  private readonly abort = new AbortController();
  private lastFocus: HTMLElement | null = null;
  private active = false;
  private message = '';
  constructor(private readonly onOpen: () => void, private readonly onClose: () => void, private readonly onComplete: () => void) {
    this.panel = document.getElementById('challenge-panel')!;
    this.content = document.getElementById('challenge-content')!;
    this.panel.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'close') { this.close(); return; }
      if (action === 'listen') { this.say('Put five stones into the tray. Tap a stone to move it. Choose Confirm when you are ready.'); return; }
      if (button.dataset.stone !== undefined) { this.challenge.toggle(Number(button.dataset.stone)); this.message = ''; }
      if (action === 'confirm') {
        const result = this.challenge.confirm();
        if (result === 'correct') { this.onComplete(); this.say('The harbour light is awake.'); }
        if (result === 'incorrect') this.message = 'The light is still quiet. Take another look at your stones.';
      }
      if (action === 'demo') { this.challenge.demonstrate(); this.message = ''; }
      if (action === 'practice') { this.challenge.nextPracticeStone(); this.say(words[this.challenge.demoStep - 1]!); }
      if (action === 'return') { this.challenge.returnToTask(); this.message = 'Now try your tray. Your stones are where you left them.'; }
      if (action === 'guide') { this.challenge.guide(); this.message = ''; }
      if (action === 'place') { this.challenge.placeGuidedStone(); this.say(words[this.challenge.selected.size - 1]!); }
      this.render();
      // Keep focus on the action after DOM replacement, without forcing touch focus.
      if (event.detail === 0) {
        const selector = button.dataset.stone !== undefined ? `[data-stone="${button.dataset.stone}"]` : `[data-action="${action}"]`;
        (this.content.querySelector(selector) as HTMLElement | null)?.focus();
      }
    }, { signal: this.abort.signal });
    this.panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); this.close(); }
      if (event.key === 'Tab') {
        const buttons = [...this.panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === buttons.length - 1)) {
          event.preventDefault(); (event.shiftKey ? buttons.at(-1) : buttons[0])?.focus();
        }
      }
    }, { signal: this.abort.signal });
  }
  open() {
    if (this.active) return;
    this.lastFocus = document.activeElement as HTMLElement;
    this.active = true; this.panel.hidden = false; this.onOpen(); this.render();
    this.panel.querySelector<HTMLButtonElement>('[data-action="close"]')!.focus();
  }
  close() {
    if (!this.active) return;
    this.active = false; this.panel.hidden = true; this.cancelSpeech(); this.onClose(); this.lastFocus?.focus();
  }
  reset() { this.close(); this.challenge = new StoneChallenge(); this.message = ''; }
  dispose() { this.cancelSpeech(); this.abort.abort(); }
  private say(text: string) {
    if (!('speechSynthesis' in window)) return;
    this.cancelSpeech(); const speech = new SpeechSynthesisUtterance(text); speech.lang = 'en'; speech.rate = .85;
    window.speechSynthesis.speak(speech);
  }
  private cancelSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  private stone(id: number, selected: boolean, practice = false) {
    if (practice || this.challenge.phase === 'guided') return `<span class="stone ${selected ? 'counted' : ''}" aria-hidden="true">${stoneArt}</span>`;
    return `<button class="stone" data-stone="${id}" aria-label="${selected ? 'Return stone to shore' : 'Move stone into tray'}">${stoneArt}</button>`;
  }
  private render() {
    const c = this.challenge;
    this.panel.dataset.phase = c.phase; this.panel.dataset.evidence = JSON.stringify(c.progress);
    const title = c.phase === 'complete' ? 'The harbour light is awake.' : c.phase === 'demo' ? 'Let’s count these practice stones.' : c.phase === 'guided' ? 'Let’s place five together.' : 'Put five stones into the tray.';
    let body = '';
    if (c.phase === 'complete') body = '<div class="restoration-symbol" aria-hidden="true">✧</div><p>A warm light reaches across the harbour. The coastal path is next.</p><button data-action="close">Continue exploring</button>';
    else if (c.phase === 'demo') body = `<p>These are practice stones. Your tray will stay as you left it.</p><div class="practice-stones">${[0,1,2].map(id => this.stone(id, id < c.demoStep, true)).join('')}</div><p class="count-word" role="status">${words[c.demoStep - 1] ?? 'Start with one stone.'}</p><button data-action="${c.demoStep < 3 ? 'practice' : 'return'}">${c.demoStep < 3 ? 'Count the next stone' : 'Try your stones'}</button>`;
    else {
      const stones = Array.from({ length: STONE_SUPPLY }, (_, id) => id);
      body = `<p>${c.phase === 'guided' ? 'We set the stones back. Place one at a time and count with me.' : 'Tap a stone to move it. Tap it again to bring it back.'}</p><div class="stone-zones"><section><h3>Shore stones</h3><div class="stone-grid">${stones.filter(id => !c.selected.has(id)).map(id => this.stone(id, false)).join('')}</div></section><section class="stone-tray"><h3>Brass tray</h3><div class="stone-grid">${stones.filter(id => c.selected.has(id)).map(id => this.stone(id, true)).join('')}</div></section></div><p class="encounter-feedback" role="status">${c.phase === 'guided' ? words[c.selected.size - 1] ?? 'Place the first stone.' : this.message}</p><div class="encounter-actions">${c.phase === 'guided' && c.selected.size < STONE_TARGET ? '<button data-action="place">Place a stone</button>' : `<button data-action="confirm" ${c.phase === 'task' && c.progress.attempts.at(-1)?.quantity === c.selected.size && this.message ? 'disabled' : ''}>Confirm</button>`}${c.helpAvailable ? '<button data-action="demo">Show me with practice stones</button>' : ''}${c.guidedAvailable ? '<button data-action="guide">Count together</button>' : ''}</div>`;
    }
    this.content.innerHTML = `<header><span class="eyebrow">THE HARBOUR LIGHT</span><button data-action="close" aria-label="Back to harbour">×</button></header><h2 id="challenge-title">${title}</h2>${body}${c.phase === 'task' && 'speechSynthesis' in window ? '<button class="listen" data-action="listen">Listen to instructions</button>' : ''}`;
  }
}
