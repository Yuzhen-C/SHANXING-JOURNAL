import { musicFile, narration, summitFile } from './audioCatalog';

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
type Track = 'music' | 'voice';
type Layer = Track | 'summit';

// The two tracks share one output, so that WeChat can mix speech and music
// after a single user gesture, including on iPhones with one media channel.
export class Sound {
  music = true;
  voice = true;
  private context?: AudioContext;
  private clips = new Map<string, Promise<AudioBuffer>>();
  private sources: Partial<Record<Layer, AudioBufferSourceNode>> = {};
  private gains: Partial<Record<Layer, GainNode>> = {};
  private media: Partial<Record<Layer, HTMLAudioElement>> = {};
  private pausedMedia = new Set<Layer>();
  private revision = { music: 0, voice: 0, summit: 0 };
  private active = false;
  private speaking = false;
  private musicRequested = false;
  private celebrating = false;
  private current?: string;

  constructor(
    private onFailure: (track: Track) => void,
    private onVoiceEnd: () => void = () => {},
  ) {}

  activate() {
    if (!this.active) {
      this.active = true;
      const Context = window.AudioContext || (window as AudioWindow).webkitAudioContext;
      if (Context) {
        try { this.context = new Context(); } catch { /* Use the native media player. */ }
      }
    }
    if (this.context && this.context.state !== 'running') void this.context.resume().catch(() => {});
  }

  private stop(track: Layer) {
    this.revision[track]++;
    this.pausedMedia.delete(track);
    const source = this.sources[track];
    if (source) {
      source.onended = null;
      source.stop();
      source.disconnect();
      delete this.sources[track];
    }
    this.gains[track]?.disconnect();
    delete this.gains[track];
    this.media[track]?.pause();
    if (this.media[track]) this.media[track]!.onended = null;
    if (track === 'voice') this.duck(false);
    else if (track === 'music') this.musicRequested = false;
    else { this.celebrating = false; this.duck(this.speaking); }
  }

  private buffer(path: string, context: AudioContext) {
    const url = import.meta.env.BASE_URL + path;
    let clip = this.clips.get(url);
    if (!clip) {
      clip = fetch(url).then(response => {
        if (!response.ok) throw new Error('Audio unavailable');
        return response.arrayBuffer();
      }).then(bytes => context.decodeAudioData(bytes));
      this.clips.set(url, clip);
      void clip.catch(() => this.clips.delete(url));
    }
    return clip;
  }

  prepare(key: string) {
    const track = narration[key];
    if (track && this.voice && this.context) void this.buffer(track.file, this.context).catch(() => {});
    if (key === 'yuhuang' && this.music && this.context) void this.buffer(summitFile, this.context).catch(() => {});
  }

  private duck(speaking: boolean) {
    this.speaking = speaking;
    const volume = speaking ? 0.18 : this.celebrating ? 0.22 : 0.54;
    if (this.context) this.gains.music?.gain.setTargetAtTime(volume, this.context.currentTime, 0.16);
    if (this.media.music) this.media.music.volume = volume;
  }

  private async play(track: Layer, path: string) {
    this.stop(track);
    if (track === 'music') this.musicRequested = true;
    const version = this.revision[track];
    const url = import.meta.env.BASE_URL + path;
    try {
      if (this.context) {
        const context = this.context;
        const buffer = await this.buffer(path, context);
        if (version !== this.revision[track]) return;
        const node = context.createBufferSource();
        const gain = context.createGain();
        node.buffer = buffer;
        node.loop = track === 'music';
        gain.gain.value = track === 'music' ? (this.speaking ? 0.18 : 0.54) : 1;
        node.connect(gain);
        gain.connect(context.destination);
        this.sources[track] = node;
        this.gains[track] = gain;
        if (track !== 'music') node.onended = () => {
          node.disconnect();
          gain.disconnect();
          delete this.sources[track];
          delete this.gains[track];
          this.finish(track);
        };
        node.start();
      } else {
        const audio = this.media[track] ?? new Audio();
        this.media[track] = audio;
        audio.src = url;
        audio.loop = track === 'music';
        audio.volume = track === 'music' ? (this.speaking ? 0.18 : 0.54) : 1;
        if (track !== 'music') audio.onended = () => this.finish(track);
        await audio.play();
      }
      if (track === 'voice' && version === this.revision.voice) this.duck(true);
      if (track === 'summit' && version === this.revision.summit) {
        this.celebrating = true;
        this.duck(this.speaking);
      }
    } catch {
      if (version === this.revision[track]) {
        this.stop(track);
        if (track !== 'summit') this.onFailure(track);
      }
    }
  }

  private finish(track: 'summit' | 'voice') {
    if (track === 'summit') {
      this.celebrating = false;
      this.duck(this.speaking);
    } else {
      this.duck(false);
      this.onVoiceEnd();
    }
  }

  summit() {
    if (this.music) void this.play('summit', summitFile);
  }

  private startMusic() {
    if (this.music && !this.musicRequested) void this.play('music', musicFile);
  }

  visit(key?: string) {
    this.activate();
    this.current = key;
    this.stop('voice');
    this.stop('summit');
    this.startMusic();
    if (key && this.voice) this.repeat();
  }

  repeat() {
    this.activate();
    const clip = this.current && narration[this.current];
    if (clip) void this.play('voice', clip.file);
  }

  toggle(track: Track) {
    this.activate();
    this[track] = !this[track];
    if (!this[track]) {
      this.stop(track);
      if (track === 'music') this.stop('summit');
    }
    else if (track === 'music') this.startMusic();
    else this.repeat();
  }

  suspend() {
    void this.context?.suspend().catch(() => {});
    if (!this.context) {
      for (const track of ['music', 'voice', 'summit'] as const) {
        const audio = this.media[track];
        if (audio && !audio.paused && !audio.ended) {
          this.pausedMedia.add(track);
          audio.pause();
        }
      }
    }
  }

  resume() {
    if (!this.active) return;
    if (this.context) {
      void this.context.resume().catch(() => {});
      return;
    }
    for (const track of this.pausedMedia) {
      const version = this.revision[track];
      void this.media[track]?.play().catch(() => {
        if (this.revision[track] !== version) return;
        this.stop(track);
        if (track !== 'summit') this.onFailure(track);
      });
    }
    this.pausedMedia.clear();
  }
}
