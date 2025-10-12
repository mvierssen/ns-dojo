import "./style.css";

const app = document.querySelector<HTMLDivElement>("#root");
if (!app) throw new Error("Root element not found");

app.innerHTML = `
  <div class="container">
    <h1>Hello World!</h1>
    <p>Welcome to your Vite + TypeScript template</p>
    <button id="clickMe" class="button">Click me!</button>
    <div id="counter" class="counter">Clicks: 0</div>
  </div>
`;

// Add some interactive functionality
let count = 0;
const button = document.querySelector("#clickMe");
const counter = document.querySelector("#counter");

if (!button || !counter) {
  throw new Error("Required elements not found");
}

button.addEventListener("click", () => {
  count++;
  counter.textContent = `Clicks: ${count.toString()}`;
});
