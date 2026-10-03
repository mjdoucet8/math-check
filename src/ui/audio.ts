/** Optional local browser audio. Text and task evidence never depend on it. */
class GameAudio {
  muted = false;
  private speechFailed = false;
  private cueFailed = false;
  private context: AudioContext | null = null;
  private readonly tones = new Set<OscillatorNode>();
  get narrationAvailable() {
    try { return !this.speechFailed && typeof window.speechSynthesis?.speak === 'function' && typeof window.SpeechSynthesisUtterance === 'function'; }
    catch { return false; }
  }
  toggle() {
    this.muted = !this.muted;
    if (this.muted) this.stop();
    else this.unlock();
    this.refresh();
  }
  unlock() {
    if (this.muted || this.cueFailed) return;
    try {
      if (!('AudioContext' in window)) throw new Error('Audio unavailable');
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => this.failCue());
    } catch { this.failCue(); }
  }
  private failCue() { this.cueFailed = true; this.refresh(); }
  say(text: string) {
    if (this.muted || !this.narrationAvailable) return;
    try {
      this.cancelSpeech();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'en'; speech.rate = .85;
      speech.onerror = event => {
        // Closing or muting deliberately cancels narration.
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        this.speechFailed = true; this.refresh();
      };
      window.speechSynthesis.speak(speech);
    } catch { this.speechFailed = true; this.refresh(); }
  }
  cancelSpeech() {
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { /* Text remains available. */ }
  }
  cue() {
    if (this.muted || this.cueFailed) return;
    this.unlock();
    const context = this.context;
    if (!context || context.state !== 'running') return;
    try {
      // A quiet, brief rising chime only after a confirmed restoration.
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const tone = context.createOscillator(), volume = context.createGain();
        const start = context.currentTime + index * .11;
        tone.type = 'sine'; tone.frequency.value = frequency;
        volume.gain.setValueAtTime(0, start);
        volume.gain.linearRampToValueAtTime(.035, start + .015);
        volume.gain.exponentialRampToValueAtTime(.0001, start + .27);
        tone.connect(volume); volume.connect(context.destination);
        this.tones.add(tone);
        tone.onended = () => { this.tones.delete(tone); tone.disconnect(); volume.disconnect(); };
        tone.start(start); tone.stop(start + .29);
      });
    } catch { this.failCue(); }
  }
  stop() {
    this.cancelSpeech();
    for (const tone of this.tones) { try { tone.stop(); } catch { /* Already ended. */ } }
    this.tones.clear();
  }
  refresh() {
    document.querySelectorAll<HTMLButtonElement>('[data-audio-toggle]').forEach(button => {
      button.textContent = this.muted ? 'Sound off' : 'Sound on';
      button.setAttribute('aria-pressed', String(!this.muted));
    });
    document.querySelectorAll<HTMLButtonElement>('[data-action="listen"]').forEach(button => {
      button.disabled = this.muted || !this.narrationAvailable;
    });
    const text = this.muted ? 'Sound is off. All instructions are written here.'
      : !this.narrationAvailable ? 'Narration is unavailable in this browser. Follow the written instructions.'
      : this.cueFailed ? 'Sound cues are unavailable. Written feedback is always shown.' : 'Listen if you like. You can turn sound off at any time.';
    document.querySelectorAll<HTMLElement>('[data-audio-hint]').forEach(hint => {
      if (hint.textContent !== text) hint.textContent = text;
    });
  }
  dispose() { this.stop(); if (this.context) void this.context.close().catch(() => {}); this.context = null; }
}
export const audio = new GameAudio();
export function audioControls(instructions: boolean) {
  return `<div class="audio-controls">${instructions ? '<button class="listen" data-action="listen">Listen to instructions</button>' : ''}<button data-audio-toggle aria-pressed="true">Sound on</button></div><p class="audio-hint" data-audio-hint aria-live="polite"></p>`;
}
