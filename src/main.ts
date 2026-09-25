import './style.css';
import { Game } from './game/Game';

const app = document.getElementById('app')!;
const game = new Game(app);
// acesso pelo console para experimentos: window.game
(window as unknown as { game: Game }).game = game;
