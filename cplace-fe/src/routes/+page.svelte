<svelte:window on:keydown={handleKeyPress} on:wheel={handleScroll} on:resize={handleResize} />
<svelte:head>
    <title>CPlusPatch's r/Place</title>
</svelte:head>
<div class="w-dvw h-dvh bg-dark-900" role="grid" tabindex="0">
    <canvas bind:this={canvasEl} on:click={handleClick} class="[image-rendering:pixelated]"></canvas>
</div>

<script lang="ts">
import { Game } from "$lib/Game";
import { onMount } from "svelte";

const CELL_SIZE = 10;

let canvasEl: HTMLCanvasElement;
let game: Game;

onMount(() => {
    game = new Game(canvasEl, CELL_SIZE, "wss://api.place.cpluspatch.com");
    game.start();
    handleResize();
});

const handleKeyPress = (event: KeyboardEvent) => game.handleKeyPress(event);
const handleScroll = (event: WheelEvent) => game.handleScroll(event);
const handleClick = (event: MouseEvent) => game.handleClick(event);
const handleResize = () => {
    if (game) {
        game.handleResize();
    }
};
</script>