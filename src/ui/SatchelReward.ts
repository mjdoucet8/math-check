import { SATCHEL_COLOURS, type SatchelColour } from '../domain/journey.ts';

/** A single discoverable reward; choosing a preview does not equip it. */
export class SatchelReward {
  private readonly panel = document.getElementById('reward-panel')!;
  private readonly content = document.getElementById('reward-content')!;
  private readonly abort = new AbortController();
  private active = false;
  private lastFocus: HTMLElement | null = null;
  constructor(private readonly current: () => SatchelColour | null,
    private readonly onOpen: () => void, private readonly onClose: () => void,
    private readonly onEquip: (colour: SatchelColour) => void) {
    this.panel.addEventListener('click', event => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.action;
      if (action === 'close') this.close();
      if (action === 'equip') {
        const choice = this.content.querySelector<HTMLInputElement>('input:checked')!.value as SatchelColour;
        this.onEquip(choice); this.close();
      }
    }, { signal: this.abort.signal });
    this.panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); this.close(); }
      if (event.key === 'Tab') {
        const choices = [...this.content.querySelectorAll<HTMLElement>('button,input:checked')];
        const index = choices.indexOf(document.activeElement as HTMLElement);
        if (event.shiftKey && index <= 0 || !event.shiftKey && index === choices.length - 1) {
          event.preventDefault(); (event.shiftKey ? choices.at(-1) : choices[0])?.focus();
        }
      }
    }, { signal: this.abort.signal });
  }
  open() {
    if (this.active) return;
    this.active = true; this.lastFocus = document.activeElement as HTMLElement;
    this.onOpen(); this.panel.hidden = false;
    const current = this.current();
    this.content.innerHTML = `<header><span class="eyebrow">A GARDEN DISCOVERY</span><button data-action="close" aria-label="Back to garden">×</button></header>
      <h2 id="reward-title">${current ? 'Your explorer satchel' : 'An explorer satchel, waiting for you.'}</h2>
      <p>You brought this garden back to life. Choose a colour for the journeys ahead.</p>
      <fieldset><legend>Choose your satchel colour</legend><div class="satchel-choices">${SATCHEL_COLOURS.map((c, i) => `<label><input type="radio" name="satchel-colour" value="${c.id}" ${(current === c.id || !current && i === 0) ? 'checked' : ''}/>
      <svg viewBox="0 0 100 110" aria-hidden="true"><path d="M20 55 Q12 5 50 9 Q88 5 80 55" fill="none" stroke="#b99a67" stroke-width="7"/><rect x="15" y="40" width="70" height="59" rx="12" fill="${c.hex}" stroke="#e3d1a5" stroke-width="2"/><path d="M16 42 Q50 73 84 42 L84 62 Q50 84 16 62Z" fill="${c.hex}" stroke="#e3d1a5" stroke-width="2"/><rect x="45" y="61" width="10" height="15" rx="2" fill="#e5c67c"/></svg><span>${c.name}</span></label>`).join('')}</div></fieldset>
      <button data-action="equip">${current ? 'Wear this colour' : 'Equip satchel'}</button>`;
    this.content.querySelector<HTMLInputElement>('input:checked')!.focus();
  }
  close() { if (!this.active) return; this.active = false; this.panel.hidden = true; this.onClose(); this.lastFocus?.focus(); }
  reset() { this.close(); }
  dispose() { this.abort.abort(); }
}
