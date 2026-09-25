import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { ImpactMaterial } from '../vfx/ImpactFX';
import type { SoundName } from '../audio/SoundEngine';
import { clamp, clamp01 } from '../core/math';

/** Efeitos de tela (implementados pela UI; opcional). */
export interface ScreenFX {
  flash(color: string, alpha: number, duration: number): void;
  vignette(color: string, amount: number): void;
  hitMarker(kill: boolean, ranged: boolean): void;
  popup(text: string, world: THREE.Vector3, color: string, scale: number): void;
  tint(color: string, duration: number): void;
}

const IMPACT_SOUND: Record<ImpactMaterial, SoundName> = {
  flesh: 'hitFlesh', wood: 'hitWood', stone: 'hitStone', metal: 'hitMetal', dummy: 'hitDummy', leaf: 'hitWood',
};

/**
 * Traduz eventos de jogo em "juice": hit stop proporcional à força, tremor
 * direcional, partículas por material no ponto de contato, som sincronizado,
 * números de dano, marcador de acerto e efeitos de tela.
 * Toda a intensidade é modulada pelo painel de ajustes (liga/desliga e escalas).
 *
 * Reaproveitamento: basta instanciar com um GameContext e emitir os mesmos eventos.
 */
export class FeedbackDirector {
  private camRight = new THREE.Vector3();
  private camUp = new THREE.Vector3();

  constructor(private ctx: GameContext, private camera: THREE.Camera, private screen?: ScreenFX) {
    const E = ctx.events;
    const S = ctx.sound;
    const fx = ctx.fx;
    const T = ctx.tuning;

    E.on('hit', ({ hit, result, source }) => {
      if (result.ignored) return;
      const s = clamp(hit.strength + (hit.charged ? 0.25 : 0), 0.1, 1.3);
      const eff = result.effectiveness;
      const mat: ImpactMaterial = hit.hurtbox.material ?? result.material;
      const p = hit.point;
      const toPlayerView = source === 'enemy';

      // --- aparo
      if (result.parried) {
        S.play('parry', { pos: p });
        fx.parry(p, hit.dir);
        ctx.clock.hitStop(0.16);
        ctx.clock.slowWorld(0.3, 0.55);
        ctx.shake.add(0.35);
        this.kick(hit.dir, 0.12);
        this.screen?.flash('#bff8ff', T.screenFx ? 0.45 : 0, 0.18);
        this.screen?.popup('APARO!', p, '#8ff4ff', 1.35);
        return;
      }
      // --- bloqueio (jogador bloqueou o inimigo)
      if (result.blocked && toPlayerView) {
        S.play('block', { pos: p, intensity: s });
        fx.block(p, hit.dir, hit.normal);
        ctx.clock.hitStop(0.06);
        ctx.shake.add(0.18 + s * 0.12);
        this.kick(hit.dir, 0.06);
        if (result.damage > 0) this.screen?.popup(`-${result.damage}`, p, '#ffb0b0', 0.8);
        else this.screen?.popup('Bloqueio', p, '#e8eef6', 0.8);
        return;
      }
      // --- ricochete (escudo de metal inimigo, pedra com espada)
      if (result.deflected) {
        S.play(mat === 'stone' ? 'hitStone' : 'hitMetal', { pos: p, intensity: 0.4 });
        S.play('wallClank', { pos: p, intensity: 0.3, vol: 0.6 });
        fx.impact('metal', p, hit.dir, hit.normal, 0.7, p.y - 1.5);
        ctx.clock.hitStop(0.07);
        ctx.shake.add(0.2);
        this.kick(hit.dir, -0.08);
        this.screen?.popup('Ricochete!', p, '#ffd27a', 0.8);
        return;
      }
      if (result.blocked) {
        // flecha no escudo de metal
        S.play('arrowHit', { pos: p, variant: 'metal' });
        fx.impact('metal', p, hit.dir, hit.normal, 0.4, p.y - 1.5);
        return;
      }

      // --- acerto
      const floorY = Math.max(0, p.y - 1.6);
      const intensity = clamp01(0.25 + s * 0.8) * (0.35 + 0.65 * Math.min(1, eff));
      if (hit.projectile) S.play('arrowHit', { pos: p, variant: mat === 'metal' ? 'metal' : mat === 'stone' ? 'stone' : 'wood' });
      S.play(IMPACT_SOUND[mat], { pos: p, intensity: s * Math.max(0.3, Math.min(1, eff)), pitch: hit.projectile ? 1.15 : 1 });
      fx.impact(mat, p, hit.dir, hit.normal, intensity, floorY);

      if (toPlayerView) {
        // jogador tomou dano
        S.play('playerHurt', { pos: p });
        ctx.clock.hitStop(0.09);
        ctx.shake.add(0.5);
        this.kick(hit.dir, 0.18);
        if (T.screenFx) this.screen?.vignette('#ff2030', 0.8);
        return;
      }
      // hit stop proporcional à força; ferramenta errada = mais curto; abate = mais longo
      let stop = 0.02 + Math.pow(s, 1.3) * 0.13;
      if (hit.projectile) stop = 0.02 + s * 0.03;
      if (eff < 0.3) stop *= 0.5;
      if (result.killed) stop *= 1.6;
      ctx.clock.hitStop(stop);
      ctx.shake.add((hit.projectile ? 0.05 : 0.07 + s * 0.32) * (result.killed ? 1.4 : 1));
      if (!hit.projectile) this.kick(hit.dir, 0.03 + s * 0.06);

      if (T.damageNumbers && result.damage > 0) {
        const big = hit.charged || s > 0.8;
        const color = hit.hurtbox.tag === 'head' ? '#ffe066' : big ? '#ffb347' : '#ffffff';
        this.screen?.popup(String(result.damage), p, color, 0.8 + clamp01(result.damage / 40) * 0.9);
      }
      if (source === 'player') {
        const dist = this.camera.position.distanceTo(p);
        if (hit.projectile) {
          // confirmação clara de acerto à distância
          S.play('hitConfirm', { vol: 1, pitch: result.killed ? 1.25 : 1 });
          fx.flash(p, 0xffffff, 0.35 * Math.max(1, dist / 7), 0.12);
          if (hit.hurtbox.tag === 'head') this.screen?.popup('NA CABEÇA!', p.clone().setY(p.y + 0.4), '#ffe066', 1.1);
        }
        if (mat === 'flesh' || hit.projectile) this.screen?.hitMarker(result.killed, hit.projectile);
      }
    });

    E.on('swing', ({ pos, intensity }) => S.play('whoosh', { pos, intensity }));
    E.on('miss', ({ intensity }) => {
      // golpe no vazio: só o "whoosh" + leve inércia (sem hit stop / partículas)
      if (intensity > 0.6) ctx.shake.push(0, -0.02, intensity);
    });
    E.on('wallHit', ({ pos, dir, normal, material, intensity }) => {
      const m: ImpactMaterial = material === 'wood' ? 'wood' : material === 'metal' ? 'metal' : 'stone';
      S.play(m === 'wood' ? 'hitWood' : 'wallClank', { pos, intensity });
      fx.impact(m === 'wood' ? 'wood' : 'metal', pos, dir, normal, 0.6, pos.y - 1.4);
      ctx.clock.hitStop(0.06);
      ctx.shake.add(0.2);
      this.screen?.popup('Ricochete!', pos, '#ffd27a', 0.7);
    });
    E.on('footstep', ({ pos, surface, intensity, player }) => {
      const variant = surface === 'stone' || surface === 'metal' ? 'stone' : surface === 'wood' ? 'wood' : 'grass';
      S.play('step', { pos, variant, intensity, vol: player ? 1 : 0.5 });
      if (player && intensity > 0.75) fx.dust(pos, 0.25, 0.2);
    });
    E.on('jump', ({ pos }) => {
      S.play('jump', { pos });
      fx.dust(pos, 0.3, 0.25);
    });
    E.on('land', ({ pos, intensity, player }) => {
      S.play('land', { pos, intensity });
      fx.dust(pos, 0.3 + intensity * 1.6, 0.3 + intensity * 0.7);
      if (player && intensity > 0.35) ctx.shake.add(intensity * intensity * 0.45);
    });
    E.on('dodge', ({ pos }) => {
      S.play('dodge', { pos });
      fx.dust(pos, 0.5, 0.3);
    });
    E.on('perfectDodge', ({ pos }) => {
      S.play('flurry', { pos });
      fx.sparkle(pos.clone().setY(pos.y + 1), 0xbfefff, 24, 4);
      this.screen?.tint('rgba(120,200,255,0.18)', 1.6);
      ctx.events.emit('toast', { text: 'Esquiva perfeita! Ataque agora!', kind: 'good' });
    });
    E.on('flurryHit', () => ctx.shake.add(0.08));
    E.on('chargeStart', ({ pos }) => S.play('chargeStart', { pos }));
    E.on('chargeReady', ({ pos }) => {
      S.play('chargeReady', { pos });
      fx.sparkle(pos, 0x9fe8ff, 16, 2.5);
    });
    E.on('bowFire', ({ pos, power }) => {
      S.play('bowRelease', { pos, intensity: power });
      ctx.shake.push(0, 0.015 * power, 1);
    });
    E.on('pickup', ({ pos, item }) => {
      S.play('pickup', { pos, pitch: item === 'stone' ? 0.85 : item === 'arrow' ? 1.2 : 1 });
      fx.sparkle(pos, 0xfff2a0, 10, 2);
    });
    E.on('treeFell', ({ pos }) => S.play('treeCreak', { pos }));
    E.on('treeLanded', ({ pos }) => {
      S.play('treeFall', { pos });
      const d = this.camera.position.distanceTo(pos);
      ctx.shake.add(0.55 / (1 + d * 0.15));
    });
    E.on('rockCrack', ({ pos }) => S.play('rockCrack', { pos }));
    E.on('rockBroke', ({ pos }) => {
      S.play('rockBreak', { pos });
      ctx.shake.add(0.4);
      ctx.clock.hitStop(0.05);
    });
    E.on('enemyWindup', ({ pos }) => {
      S.play('enemyWindup', { pos });
      fx.flash(pos, 0xff8a3d, 0.5, 0.25, false, 0.4);
    });
    E.on('enemyDeath', ({ pos }) => {
      S.play('enemyDeath', { pos });
      fx.poof(pos);
    });
    E.on('enemySpawn', ({ pos }) => {
      S.play('enemySpawn', { pos });
      fx.poof(pos.clone().setY(pos.y + 0.3), 0x3a2a4a, 0.8);
    });
  }

  /** Empurrão de câmera na direção do golpe (em espaço de tela). */
  private kick(dir: THREE.Vector3, amount: number) {
    this.camRight.setFromMatrixColumn(this.camera.matrixWorld, 0);
    this.camUp.setFromMatrixColumn(this.camera.matrixWorld, 1);
    this.ctx.shake.push(dir.dot(this.camRight), dir.dot(this.camUp), amount);
  }
}
