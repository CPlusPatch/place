<svelte:window on:keydown={handleKeyPress} on:wheel={handleScroll} on:resize={handleResize} />
<svelte:head>
    <title>CPlusPatch's r/Place</title>
</svelte:head>
<div class="w-dvw h-dvh bg-dark-900" role="grid" tabindex="0">
    <canvas bind:this={canvasEl} width="{canvasWidth}" height="{canvasHeight}" class="[image-rendering:pixelated]"></canvas>
</div>

<script lang="ts">
import { Game } from "$lib/Game";
import { onMount } from "svelte";

const BOARD_WIDTH = 100;
const BOARD_HEIGHT = 100;
const CELL_SIZE = 10;

let canvasEl: HTMLCanvasElement;
let canvasWidth = 0;
let canvasHeight = 0;
let game: Game;

onMount(() => {
    game = new Game(canvasEl, BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE);
    game.start();
    handleResize();
});

const handleKeyPress = (event: KeyboardEvent) => game.handleKeyPress(event);
const handleScroll = (event: WheelEvent) => game.handleScroll(event);
const handleResize = () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    game.handleResize();
};
</script>