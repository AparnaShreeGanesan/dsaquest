const algorithms = window.DSA_ALGORITHMS;
const linkedLists = window.DSA_LINKED_LISTS;
const stacks = window.DSA_STACKS;
const queues = window.DSA_QUEUES || {};
const panelStates = new Map();
const listStates = new Map();
const stackStates = new Map();
const queueStates = new Map();
const searchStates = new Map();


function parseValues(input) {
  return input.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
}

const complexityDatabase = {
  array: {
    access: complexityEntry("Array Access", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Direct indexing jumps to the memory offset in constant time."),
    search: complexityEntry("Array Linear Search", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Unsorted arrays may require checking every element. Best case happens when the target is first."),
    insert: complexityEntry("Array Insert", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Inserting away from the end shifts later values, so the work grows with n."),
  },
  sort: {
    "bubble-sort": complexityEntry("Bubble Sort", "O(n)", "O(n^2)", "O(n^2)", "O(n^2)", "O(1)", "Adjacent comparisons push large values to the end. Nested passes make the worst case quadratic."),
    "selection-sort": complexityEntry("Selection Sort", "O(n^2)", "O(n^2)", "O(n^2)", "O(n^2)", "O(1)", "Every position scans the unsorted suffix to select the next minimum."),
    "insertion-sort": complexityEntry("Insertion Sort", "O(n)", "O(n^2)", "O(n^2)", "O(n^2)", "O(1)", "Nearly sorted input is fast, but reverse order shifts many elements for each insertion."),
    "merge-sort": complexityEntry("Merge Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Each level merges all n values and there are log n split levels."),
    "quick-sort": complexityEntry("Quick Sort", "O(n log n)", "O(n log n)", "O(n^2)", "O(n log n) average", "O(log n)", "Partitioning is linear per level. Balanced pivots give log n levels; poor pivots can degrade to n levels."),
  },
  search: {
    "linear-search": complexityEntry("Linear Search", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "It scans left to right. Finding the target first is constant time; otherwise every value may be checked."),
    "binary-search": complexityEntry("Binary Search", "O(1)", "O(log n)", "O(log n)", "O(log n)", "O(1)", "Sorted order lets each comparison discard half the remaining search space."),
  },
  list: {
    default: complexityEntry("Linked List Traversal", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Linked lists move node by node because nodes are connected by pointers, not direct indexes."),
    "insert-beginning": complexityEntry("Insert at Beginning", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Only the new node and head pointer change."),
    "insert-end": complexityEntry("Insert at End", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Without a maintained tail pointer, the list must traverse to the final node first."),
    "insert-position": complexityEntry("Insert at Position", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "The insertion itself is O(1), but reaching the position takes up to n pointer hops."),
    "delete-beginning": complexityEntry("Delete at Beginning", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Head moves to the next node; no traversal is needed."),
    "delete-end": complexityEntry("Delete at End", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Singly and circular lists must find the previous tail. Doubly lists can be O(1) if tail is stored."),
    "delete-position": complexityEntry("Delete at Position", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Deleting a known node is constant, but locating it is linear."),
    search: complexityEntry("Search", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "The target may be at head, but in the worst case every node is checked."),
    reverse: complexityEntry("Reverse", "O(n)", "O(n)", "O(n)", "O(n)", "O(1)", "Every next pointer must be redirected once."),
    sort: complexityEntry("Pointer Sort", "O(n log n)", "O(n^2)", "O(n^2)", "O(n^2)", "O(1)", "Simple in-place list sorting compares many node pairs. Merge sort can improve linked-list sorting to O(n log n)."),
    "one-pass-sort": complexityEntry("One Traversal Sort", "O(n)", "O(n)", "O(n)", "O(n)", "O(1)", "This works only for constrained data patterns where nodes can be rearranged or counted during one pass."),
  },
  stack: {
    start: complexityEntry("Stack Build", "O(n)", "O(n)", "O(n)", "O(n)", "O(n)", "Building the initial stack pushes each input value once."),
    push: complexityEntry("Push", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "The new item is placed directly on top."),
    pop: complexityEntry("Pop", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Only the top item is removed."),
    peek: complexityEntry("Peek / Top", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "The top pointer gives direct access."),
    min: complexityEntry("Find Minimum", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "This implementation scans the stack for min. A helper min-stack would make it O(1) with O(n) extra space."),
    max: complexityEntry("Find Maximum", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "This implementation scans all values. A helper max-stack can trade memory for O(1) lookup."),
  },
  queue: {
    start: complexityEntry("Queue Build", "O(n)", "O(n)", "O(n)", "O(n)", "O(n)", "Building the queue enqueues every input value."),
    enqueue: complexityEntry("Enqueue", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Rear moves forward and the value is placed in one slot."),
    dequeue: complexityEntry("Dequeue", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Front moves forward and one value leaves the queue."),
    peek: complexityEntry("Peek / Front", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "The front pointer gives direct access to the next value."),
  },
  "circular-queue": {
    enqueue: complexityEntry("Circular Enqueue", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Modulo arithmetic wraps rear back to the beginning without shifting elements."),
    dequeue: complexityEntry("Circular Dequeue", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Modulo arithmetic advances front while reusing freed slots."),
    peek: complexityEntry("Circular Peek", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Front always points to the next item."),
    start: complexityEntry("Circular Queue Build", "O(n)", "O(n)", "O(n)", "O(n)", "O(n)", "Each initial value is inserted once into the circular buffer."),
  },
  deque: {
    start: complexityEntry("Deque Build", "O(n)", "O(n)", "O(n)", "O(n)", "O(n)", "The initial deque inserts each value once."),
    "insert-front": complexityEntry("Insert Front", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "A deque keeps direct access to both ends."),
    "insert-rear": complexityEntry("Insert Rear", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "The rear end can accept a value directly."),
    "delete-front": complexityEntry("Delete Front", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "The front end is removed directly."),
    "delete-rear": complexityEntry("Delete Rear", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "The rear end is removed directly."),
  },
  "priority-queue": {
    insert: complexityEntry("Priority Queue Insert", "O(1)", "O(log n)", "O(log n)", "O(log n)", "O(1)", "Heap insertion may bubble the new item upward through log n levels."),
    extract: complexityEntry("Extract Highest Priority", "O(log n)", "O(log n)", "O(log n)", "O(log n)", "O(1)", "Removing the root requires heapifying down through the heap height."),
    peek: complexityEntry("Peek Highest Priority", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "The highest priority item is stored at the heap root."),
  },
  recursion: {
    factorial: complexityEntry("Factorial Recursion", "O(n)", "O(n)", "O(n)", "O(n)", "O(n)", "There are n calls, and each call waits on the call stack until the base case returns."),
    fibonacci: complexityEntry("Fibonacci Recursion", "O(1)", "O(2^n)", "O(2^n)", "O(2^n)", "O(n)", "Naive Fibonacci repeats the same subproblems many times; memoization reduces it to O(n)."),
    "sum-n": complexityEntry("Sum N Recursion", "O(n)", "O(n)", "O(n)", "O(n)", "O(n)", "Each number creates one pending recursive call."),
    "binary-search": complexityEntry("Recursive Binary Search", "O(1)", "O(log n)", "O(log n)", "O(log n)", "O(log n)", "Each recursive call halves the search range, but each call also consumes stack space."),
    hanoi: complexityEntry("Tower of Hanoi", "O(2^n)", "O(2^n)", "O(2^n)", "O(2^n)", "O(n)", "Moving n disks requires solving two n-1 disk subproblems around one largest-disk move."),
    "linked-list": complexityEntry("Recursive Linked List Reverse", "O(n)", "O(n)", "O(n)", "O(n)", "O(n)", "Every node is visited once, and recursion stores one stack frame per node."),
    tree: complexityEntry("Tree Recursion", "O(n)", "O(n)", "O(n)", "O(n)", "O(h)", "Each node is visited once. Stack space follows tree height h, which can be n for a skewed tree."),
  },
};

function complexityEntry(title, best, average, worst, time, space, explanation) {
  return { title, best, average, worst, time, space, explanation };
}

function complexityLevel(value) {
  if (/O\(1\)|O\(log/.test(value)) return "efficient";
  if (/O\(n\)$|O\(n\)|O\(n log n\)/.test(value)) return "moderate";
  return "expensive";
}

function ensureComplexityCard(panel) {
  if (!panel) return null;
  const existing = panel.querySelector("[data-dynamic-complexity]");
  if (existing) return existing;

  const card = document.createElement("aside");
  card.className = "dynamic-complexity-card";
  card.dataset.dynamicComplexity = "true";
  card.innerHTML = `
    <div class="complexity-card-head">
      <div>
        <span>Live Complexity</span>
        <strong data-complexity-title>Operation</strong>
      </div>
      <b data-complexity-score>O(1)</b>
    </div>
    <div class="complexity-case-grid">
      <div><span>Best</span><strong data-complexity-best>-</strong></div>
      <div><span>Average</span><strong data-complexity-average>-</strong></div>
      <div><span>Worst</span><strong data-complexity-worst>-</strong></div>
      <div><span>Space</span><strong data-complexity-space>-</strong></div>
    </div>
    <p data-complexity-explanation></p>
    <small data-complexity-step></small>
  `;
  const head = panel.querySelector(".sort-head") || panel.firstElementChild;
  if (head?.nextSibling) {
    panel.insertBefore(card, head.nextSibling);
  } else {
    panel.prepend(card);
  }
  return card;
}

function renderComplexity(panel, entry, stepText = "") {
  const card = ensureComplexityCard(panel);
  if (!card || !entry) return;

  const level = complexityLevel(entry.worst || entry.time || "");
  card.classList.remove("efficient", "moderate", "expensive", "complexity-pulse");
  card.classList.add(level);
  card.querySelector("[data-complexity-title]").textContent = entry.title;
  card.querySelector("[data-complexity-score]").textContent = entry.time;
  card.querySelector("[data-complexity-best]").textContent = entry.best;
  card.querySelector("[data-complexity-average]").textContent = entry.average;
  card.querySelector("[data-complexity-worst]").textContent = entry.worst;
  card.querySelector("[data-complexity-space]").textContent = entry.space;
  card.querySelector("[data-complexity-explanation]").textContent = entry.explanation;
  card.querySelector("[data-complexity-step]").textContent = stepText;
  requestAnimationFrame(() => card.classList.add("complexity-pulse"));
}

function getComplexityEntry(panel, step = null) {
  if (panel?.matches("[data-sort-panel]")) {
    return complexityDatabase.sort[panel.dataset.algorithm];
  }
  if (panel?.matches("[data-search-panel]")) {
    return complexityDatabase.search[panel.dataset.algorithm];
  }
  if (panel?.matches("[data-list-panel]")) {
    const operation = panel.querySelector("[data-list-operation]")?.value || "default";
    return complexityDatabase.list[operation] || complexityDatabase.list.default;
  }
  if (panel?.matches("[data-stack-viz]")) {
    const operation = step?.mode || step?.marker || panel.dataset.stackComplexityOperation || "peek";
    return complexityDatabase.stack[operation] || complexityDatabase.stack.peek;
  }
  if (panel?.matches("[data-queue-panel]")) {
    const key = panel.dataset.queue === "circular-queue-operations" ? "circular-queue" : "queue";
    const operation = step?.op || panel.dataset.queueComplexityOperation || "peek";
    return complexityDatabase[key][operation] || complexityDatabase[key].peek;
  }
  if (panel?.matches("[data-deque-panel]")) {
    const operation = panel.dataset.dequeComplexityOperation || "start";
    return complexityDatabase.deque[operation] || complexityDatabase.deque.start;
  }
  if (panel?.matches("[data-recursion-panel]")) {
    return complexityDatabase.recursion[panel.dataset.recursion] || complexityDatabase.recursion.factorial;
  }
  return complexityDatabase.array.access;
}

function getComplexityStepText(panel, step = null) {
  if (!step) return "Start the visualization to connect each step with its cost.";
  if (panel?.matches("[data-sort-panel]")) {
    if (step.compare?.length) return "Current step: comparison work contributes to total time.";
    if (step.active?.length) return "Current step: movement or swap work is constant, repeated across many steps.";
    if (step.pivot != null) return "Current step: pivot partitioning shapes quick sort recursion depth.";
  }
  if (panel?.matches("[data-search-panel]")) {
    if (panel.dataset.algorithm === "binary-search") return "Current step: one comparison removes half of the remaining range.";
    return "Current step: one more array element is checked from left to right.";
  }
  if (panel?.matches("[data-list-panel]")) {
    if (step.searching?.length || step.active?.length) return "Current step: pointer traversal is why many linked-list operations are O(n).";
    if (step.inserted?.length) return "Current step: pointer rewiring is constant once the position is found.";
  }
  if (panel?.matches("[data-recursion-panel]")) {
    return `Current step: ${step.phase || "call"} phase uses call-stack space.`;
  }
  return step.message ? `Current step: ${step.message}` : "Current step updates the live operation cost.";
}

function updateComplexityPanel(panel, step = null) {
  renderComplexity(panel, getComplexityEntry(panel, step), getComplexityStepText(panel, step));
}

function initDynamicComplexityPanels() {
  document.querySelectorAll("[data-complexity-panel]").forEach((panel) => {
    updateComplexityPanel(panel, null);
  });
}

function stopPanel(panel) {
  const state = panelStates.get(panel);
  if (!state) return;

  state.playing = false;
  state.playButton.textContent = "Play";
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function renderBars(panel) {
  const state = panelStates.get(panel);
  if (!state) return;

  // Guard against missing/malformed state
  const steps = Array.isArray(state.steps) ? state.steps : [];
  const idx = typeof state.index === "number" ? state.index : 0;
  const step = steps[idx];

  if (state.bars) state.bars.innerHTML = "";

  if (!step) {
    state.message.textContent = "Press Start to generate steps.";
    state.counter.textContent = "0 / 0";
    updateComplexityPanel(panel, null);
    return;
  }

  const values = Array.isArray(step.values) ? step.values : [];
  const compare = Array.isArray(step.compare) ? step.compare : [];
  const active = Array.isArray(step.active) ? step.active : [];
  const sorted = Array.isArray(step.sorted) ? step.sorted : [];
  const boundsArr = Array.isArray(step.bounds) ? step.bounds : [];

  if (!values.length) {
    state.message.textContent = step.message || "No steps to display.";
    state.counter.textContent = "0 / 0";
    return;
  }

  const max = Math.max(...values, 1);
  const bounded = new Set(boundsArr);
  const hasBounds = boundsArr.length > 0;

  values.forEach((value, index) => {
    const bar = document.createElement("div");
    const height = 42 + (value / max) * 190;
    bar.className = "bar";
    bar.style.setProperty("--bar-height", `${height}px`);
    bar.textContent = value;

    if (compare.includes(index)) bar.classList.add("compare");
    if (active.includes(index)) bar.classList.add("active");
    if (sorted.includes(index)) bar.classList.add("sorted");
    if (step.pivot === index) bar.classList.add("pivot");
    if (hasBounds && !bounded.has(index)) bar.classList.add("dimmed");

    state.bars.appendChild(bar);
  });

  state.message.textContent = step.message || "";
  state.counter.textContent = `${idx + 1} / ${steps.length}`;
  updateComplexityPanel(panel, step);
}


async function startPanel(panel) {
  const state = panelStates.get(panel);
  stopPanel(panel);

  const values = parseValues(state.valuesInput);
  if (!values.length || values.some(Number.isNaN)) {
    state.message.textContent = "Enter comma-separated integer values.";
    return;
  }

  let payload;
  try {
    const response = await fetch(`/api/visualize/${state.algorithmId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });

    payload = await response.json();
    if (!response.ok) {
      state.message.textContent = payload?.error || "Unable to generate visualization.";
      state.steps = [];
      state.index = 0;
      renderBars(panel);
      return;
    }
  } catch (e) {
    state.message.textContent = "Network/Server error while generating steps.";
    state.steps = [];
    state.index = 0;
    renderBars(panel);
    return;
  }

  state.steps = Array.isArray(payload?.steps) ? payload.steps : [];
  state.index = 0;
  renderBars(panel);
}


function movePanel(panel, offset) {
  const state = panelStates.get(panel);
  stopPanel(panel);
  if (!state.steps.length) return;

  state.index = Math.min(Math.max(state.index + offset, 0), state.steps.length - 1);
  renderBars(panel);
}

function togglePanel(panel) {
  const state = panelStates.get(panel);
  if (!state.steps.length) return;

  state.playing = !state.playing;
  state.playButton.textContent = state.playing ? "Pause" : "Play";

  if (!state.playing) {
    stopPanel(panel);
    return;
  }

  state.timer = setInterval(() => {
    if (state.index >= state.steps.length - 1) {
      stopPanel(panel);
      return;
    }
    state.index += 1;
    renderBars(panel);
  }, Number(state.speedInput.value));
}

function setCodeTab(panel, tab) {
  const state = panelStates.get(panel);
  const codeType = tab.dataset.codeTab;

  panel.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  state.code.textContent = algorithms[state.algorithmId][codeType];
}

document.querySelectorAll("[data-sort-panel]").forEach((panel) => {
  const state = {
    algorithmId: panel.dataset.algorithm,
    steps: [],
    index: 0,
    playing: false,
    timer: null,
    valuesInput: panel.querySelector("[data-values]"),
    speedInput: panel.querySelector("[data-speed]"),
    playButton: panel.querySelector("[data-play]"),
    bars: panel.querySelector("[data-bars]"),
    message: panel.querySelector("[data-message]"),
    counter: panel.querySelector("[data-counter]"),
    code: panel.querySelector("[data-code]"),
  };

  panelStates.set(panel, state);

  panel.querySelector("[data-start]").addEventListener("click", () => startPanel(panel));
  panel.querySelector("[data-prev]").addEventListener("click", () => movePanel(panel, -1));
  panel.querySelector("[data-next]").addEventListener("click", () => movePanel(panel, 1));
  state.playButton.addEventListener("click", () => togglePanel(panel));
  state.speedInput.addEventListener("input", () => {
    if (state.playing) {
      stopPanel(panel);
      togglePanel(panel);
    }
  });

  panel.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setCodeTab(panel, tab));
  });

  startPanel(panel);
});

// ===== SEARCH PANEL FUNCTIONALITY =====

function stopSearchPanel(panel) {
  const state = searchStates.get(panel);
  if (!state) return;

  state.playing = false;
  state.playButton.textContent = "Play";
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function renderSearchPanel(panel) {
  const state = searchStates.get(panel);
  if (!state) return;

  const steps = Array.isArray(state.steps) ? state.steps : [];
  const idx = typeof state.index === "number" ? state.index : 0;
  const step = steps[idx];

  // Update indicators
  if (state.indicators) {
    const leftSpan = state.indicators.querySelector("[data-left-pointer]");
    const midSpan = state.indicators.querySelector("[data-mid-pointer]");
    const rightSpan = state.indicators.querySelector("[data-right-pointer]");
    const currentSpan = state.indicators.querySelector("[data-current-index]");
    const targetSpan = state.indicators.querySelector("[data-target-display]");

    if (leftSpan) leftSpan.textContent = `low: ${step?.left ?? "-"}`;
    if (midSpan) midSpan.textContent = `mid: ${step?.mid ?? "-"}`;
    if (rightSpan) rightSpan.textContent = `high: ${step?.right ?? "-"}`;
    if (currentSpan) currentSpan.textContent = `idx: ${step?.current ?? "-"}`;
    if (targetSpan) targetSpan.textContent = `target: ${state.targetValue ?? "-"}`;
  }

  if (!step) {
    if (state.array) state.array.innerHTML = "";
    if (state.message) state.message.textContent = "Press Start to begin searching.";
    if (state.counter) state.counter.textContent = "0 / 0";
    updateComplexityPanel(panel, null);
    return;
  }

  const values = Array.isArray(step.values) ? step.values : [];
  const compare = Array.isArray(step.compare) ? step.compare : [];
  const active = Array.isArray(step.active) ? step.active : [];
  const bounds = Array.isArray(step.bounds) ? step.bounds : [];
  const found = step.found;

  if (state.array) {
    state.array.innerHTML = "";
    values.forEach((value, index) => {
      const item = document.createElement("div");
      item.className = "search-item";

      // Pointer label slot (above the value box)
      const pointerSlot = document.createElement("div");
      pointerSlot.className = "pointer-slot";
      const pointers = [];
      if (step.left != null && step.left === index) pointers.push("LOW");
      if (step.mid != null && step.mid === index) pointers.push("MID");
      if (step.right != null && step.right === index) pointers.push("HIGH");
      if (!pointers.length && step.current != null && step.current === index) pointers.push("▶");
      pointerSlot.textContent = pointers.join(" ");
      if (pointers.length) pointerSlot.classList.add("pointer-slot--active");

      // Value node box
      const node = document.createElement("div");
      node.className = "search-node";
      node.textContent = value;

      // Index label (below the box)
      const indexLabel = document.createElement("div");
      indexLabel.className = "search-index";
      indexLabel.textContent = index;

      item.appendChild(pointerSlot);
      item.appendChild(node);
      item.appendChild(indexLabel);

      if (compare.includes(index)) item.classList.add("compare");
      if (active.includes(index)) item.classList.add("active");
      if (found === index) item.classList.add("found");
      if (bounds.length > 0 && !bounds.includes(index)) item.classList.add("dimmed");
      if (bounds.includes(index)) item.classList.add("bounds");

      state.array.appendChild(item);
    });
  }

  if (state.message) state.message.textContent = step.message || "";
  if (state.counter) state.counter.textContent = `${idx + 1} / ${steps.length}`;
  updateComplexityPanel(panel, step);
}

async function startSearchPanel(panel) {
  console.log("startSearchPanel called for:", panel.dataset.algorithm);
  const state = searchStates.get(panel);
  console.log("State found:", state);
  stopSearchPanel(panel);

  const values = parseValues(state.valuesInput);
  const target = parseFloat(state.targetInput.value);

  if (!values.length || values.some(Number.isNaN)) {
    if (state.message) state.message.textContent = "Enter comma-separated integer values.";
    return;
  }

  if (Number.isNaN(target)) {
    if (state.message) state.message.textContent = "Enter a valid target value.";
    return;
  }

  state.targetValue = target;

  let payload;
  try {
    const response = await fetch(`/api/visualize/${state.algorithmId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values, target }),
    });

    payload = await response.json();
    if (!response.ok) {
      if (state.message) state.message.textContent = payload?.error || "Unable to generate visualization.";
      state.steps = [];
      state.index = 0;
      renderSearchPanel(panel);
      return;
    }
  } catch (e) {
    if (state.message) state.message.textContent = "Network/Server error while generating steps.";
    state.steps = [];
    state.index = 0;
    renderSearchPanel(panel);
    return;
  }

  state.steps = Array.isArray(payload?.steps) ? payload.steps : [];
  state.index = 0;
  renderSearchPanel(panel);
}

function moveSearchPanel(panel, offset) {
  const state = searchStates.get(panel);
  stopSearchPanel(panel);
  if (!state.steps.length) return;

  state.index = Math.min(Math.max(state.index + offset, 0), state.steps.length - 1);
  renderSearchPanel(panel);
}

function toggleSearchPanel(panel) {
  const state = searchStates.get(panel);
  if (!state.steps.length) return;

  state.playing = !state.playing;
  state.playButton.textContent = state.playing ? "Pause" : "Play";

  if (!state.playing) {
    stopSearchPanel(panel);
    return;
  }

  state.timer = setInterval(() => {
    if (state.index >= state.steps.length - 1) {
      stopSearchPanel(panel);
      return;
    }
    state.index += 1;
    renderSearchPanel(panel);
  }, Number(state.speedInput.value));
}

function setSearchCodeTab(panel, tab) {
  const state = searchStates.get(panel);
  const codeType = tab.dataset.codeTab;

  panel.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  state.code.textContent = algorithms[state.algorithmId][codeType];
}

document.querySelectorAll("[data-search-panel]").forEach((panel) => {
  console.log("Found search panel:", panel.dataset.algorithm);
  console.log("Panel element:", panel);

  const valuesInput = panel.querySelector("[data-values]");
  const targetInput = panel.querySelector("[data-target]");
  const startButton = panel.querySelector("[data-start]");
  const playButton = panel.querySelector("[data-play]");

  console.log("Elements found:", {
    valuesInput,
    targetInput,
    startButton,
    playButton
  });

  const state = {
    algorithmId: panel.dataset.algorithm,
    steps: [],
    index: 0,
    playing: false,
    timer: null,
    targetValue: null,
    valuesInput,
    targetInput,
    speedInput: panel.querySelector("[data-speed]"),
    playButton,
    stage: panel.querySelector("[data-search-stage]"),
    array: panel.querySelector("[data-search-array]"),
    indicators: panel.querySelector("[data-search-indicators]"),
    message: panel.querySelector("[data-message]"),
    counter: panel.querySelector("[data-counter]"),
    code: panel.querySelector("[data-code]"),
  };

  console.log("Search panel state:", state);
  searchStates.set(panel, state);

  console.log("Attaching event listeners for:", panel.dataset.algorithm);
  panel.querySelector("[data-start]").addEventListener("click", () => {
    console.log("Start button clicked for:", panel.dataset.algorithm);
    startSearchPanel(panel);
  });
  panel.querySelector("[data-prev]").addEventListener("click", () => moveSearchPanel(panel, -1));
  panel.querySelector("[data-next]").addEventListener("click", () => moveSearchPanel(panel, 1));
  state.playButton.addEventListener("click", () => toggleSearchPanel(panel));
  state.speedInput.addEventListener("input", () => {
    if (state.playing) {
      stopSearchPanel(panel);
      toggleSearchPanel(panel);
    }
  });

  panel.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setSearchCodeTab(panel, tab));
  });
});

function stopListPanel(panel) {
  const state = listStates.get(panel);
  if (!state) return;

  state.playing = false;
  state.playButton.textContent = "Play";
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function renderListPanel(panel) {
  const state = listStates.get(panel);
  const step = state.steps[state.index];
  const visualNodes = step?.displayNodes || step?.nodes || null;
  const visualValues = visualNodes
    ? visualNodes.map((node) => node.value)
    : step?.displayValues || (state.fullValues?.length ? state.fullValues : step?.values || []);
  state.stage.innerHTML = "";
  state.stage.style.setProperty("--node-count", Math.max(visualValues.length || 1, 1));
  state.stage.classList.toggle("circular-mode", state.listId === "circular-linked-list");
  state.stage.classList.toggle("doubly-mode", state.listId === "doubly-linked-list");
  state.stage.classList.toggle("short-list", visualValues.length <= 3);
  state.stage.classList.toggle("many-nodes", visualValues.length >= 4);
  state.stage.classList.toggle("validated-list", Boolean(step?.validation?.ok));

  if (!step) {
    state.message.textContent = "Press Start to generate steps.";
    state.counter.textContent = "0 / 0";
    updateComplexityPanel(panel, null);
    return;
  }

  const canvas = document.createElement("div");
  canvas.className = "linked-canvas";
  state.stage.appendChild(canvas);

  if (!visualValues.length) {
    canvas.innerHTML = `
      <div class="head-null">
        <span class="pointer-label">HEAD</span>
        <span class="pointer-line">-></span>
        <span class="null-node">NULL</span>
      </div>
    `;
  } else {
    const headPointer = document.createElement("div");
    headPointer.className = "external-pointer head-pointer";
    headPointer.innerHTML = `<span>HEAD</span><b>-></b>`;
    canvas.appendChild(headPointer);

    visualValues.forEach((value, index) => {
      const visualNode = visualNodes?.[index] || null;
      const created = visualNodes ? Boolean((step.nodes || []).some((node) => node.id === visualNode?.id)) : index < step.values.length;
      const group = document.createElement("div");
      group.className = "node-group";
      if (visualNode) {
        group.dataset.nodeId = visualNode.id;
      }

      const node = document.createElement("div");
      node.className = "list-node";
      if (!created) node.classList.add("pending-node");
      if ((step.active || []).includes(index)) node.classList.add("active");
      if ((step.inserted || []).includes(index)) node.classList.add("insert-node");
      if ((step.deleting || []).includes(index)) node.classList.add("delete-node");
      if ((step.searching || []).includes(index)) node.classList.add("search-node");
      if ((step.sorted || []).includes(index)) node.classList.add("sorted-node");
      if (step.prev === index) node.classList.add("prev-pointer-node");
      if (step.next === index) node.classList.add("next-pointer-node");
      if (index === 0) node.classList.add("head-node");
      if (index === visualValues.length - 1) node.classList.add("tail-node");

      const prevCell = state.listId === "doubly-linked-list" ? `<div class="node-cell pointer-cell">prev</div>` : "";
      node.innerHTML = `
        ${prevCell}
        <div class="node-cell data-cell">${value}</div>
        <div class="node-cell pointer-cell">NEXT</div>
        <small>${created ? `node ${visualNode?.id ?? index}` : "pending"}</small>
      `;
      group.appendChild(node);

      if (index === 0) {
        const tag = document.createElement("span");
        tag.className = "node-tag head-tag";
        tag.textContent = "head";
        group.appendChild(tag);
      }
      if (index === visualValues.length - 1) {
        const tag = document.createElement("span");
        tag.className = "node-tag tail-tag";
        tag.textContent = "tail";
        group.appendChild(tag);
      }
      if (step.current === index) {
        const tag = document.createElement("span");
        tag.className = "node-tag current-tag";
        tag.textContent = "current";
        group.appendChild(tag);
      }
      if (step.prev === index) {
        const tag = document.createElement("span");
        tag.className = "node-tag prev-tag";
        tag.textContent = "prev";
        group.appendChild(tag);
      }
      if (step.next === index) {
        const tag = document.createElement("span");
        tag.className = "node-tag next-tag";
        tag.textContent = "next";
        group.appendChild(tag);
      }

      canvas.appendChild(group);

      if (index < visualValues.length - 1) {
        const connected = visualNodes
          ? visualNodes[index]?.nextId === visualNodes[index + 1]?.id
          : index < (step.linkedUntil ?? step.values.length - 1);
        const backConnected = state.listId === "doubly-linked-list" && visualNodes
          ? visualNodes[index + 1]?.prevId === visualNodes[index]?.id
          : connected;
        const connector = document.createElement("div");
        connector.className = `connector${connected ? " linked" : ""}`;
        if (state.listId === "doubly-linked-list" && backConnected) connector.classList.add("back-linked");
        if ((step.reversedLinks || []).includes(index)) connector.classList.add("reversed-link");
        if ((step.bypassLinks || []).includes(index)) connector.classList.add("bypass-link");
        connector.innerHTML = state.listId === "doubly-linked-list"
          ? `<span class="forward">${connected ? "next linked" : "next waiting"}</span><span class="backward">${backConnected ? "prev linked" : "prev waiting"}</span>`
          : `<span class="forward">${connected ? "NEXT ->" : "next waiting"}</span>`;
        canvas.appendChild(connector);
      }
    });

    const tailPointer = document.createElement("div");
    tailPointer.className = "external-pointer tail-pointer";
    tailPointer.innerHTML = `<span>TAIL</span><b>-></b>`;
    canvas.appendChild(tailPointer);

    if (state.listId !== "circular-linked-list" || !step.circular) {
      const nullEnd = document.createElement("div");
      nullEnd.className = "terminal-null";
      nullEnd.textContent = "NULL";
      canvas.appendChild(nullEnd);
    }
  }

  if (step.circular && step.values.length) {
    // Keep the existing label, but also draw a curved animated SVG arrow.
    const loop = document.createElement("div");
    loop.className = "circular-loop";
    loop.textContent = "tail.next -> head";
    state.stage.appendChild(loop);

    // Defer SVG computation until DOM nodes are laid out.
    requestAnimationFrame(() => {
      drawCircularReturnArrow(state.stage);
    });
  }


  state.message.textContent = step.message;
  if (step.validation) {
    state.message.textContent = `${step.message} ${step.validation.ok ? "Structure validated." : step.validation.message}`;
  }
  state.counter.textContent = `${state.index + 1} / ${state.steps.length}`;
  updateComplexityPanel(panel, step);

  requestAnimationFrame(() => {
    moveLinkedListViewport(state.stage);
  });
}

function drawCircularReturnArrow(stage) {
  if (stage.dataset.circularArrowDrawn === "1") {
    // allow redraw after resize/step; remove marker.
    stage.dataset.circularArrowDrawn = "0";
  }

  stage.dataset.circularArrowDrawn = "1";

  const tailNode = stage.querySelector(".list-node.tail-node:not(.pending-node)");
  const headNode = stage.querySelector(".list-node.head-node:not(.pending-node)");
  if (!tailNode || !headNode) return;

  // Remove old SVG overlay if present.
  const old = stage.querySelector("svg.circular-return");
  if (old) old.remove();

  // Ensure stage is a positioning context.
  stage.style.position = stage.style.position || "relative";

  const stageRect = stage.getBoundingClientRect();
  const tailRect = tailNode.getBoundingClientRect();
  const headRect = headNode.getBoundingClientRect();

  const tailX = (tailRect.left - stageRect.left) + tailRect.width / 2;
  const tailY = (tailRect.top - stageRect.top) + tailRect.height / 2;
  const headX = (headRect.left - stageRect.left) + headRect.width / 2;
  const headY = (headRect.top - stageRect.top) + headRect.height / 2;

  // Build an arch above the nodes.
  const dx = headX - tailX;
  const archHeight = Math.max(90, Math.abs(dx) * 0.22);
  const controlY = Math.min(tailY, headY) - archHeight;

  const pathId = `circularPath-${Math.random().toString(16).slice(2)}`;

  // Make SVG cover the entire stage so textPath is always visible.
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("circular-return");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const vbW = stage.clientWidth;
  const vbH = stage.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);

  // Padding so text doesn't overlap nodes (also helps with smaller screens).
  const padTop = 18;

  // Translate curve slightly upward.
  const start = { x: tailX, y: tailY - padTop };
  const end = { x: headX, y: headY - padTop };
  const mid = { x: (start.x + end.x) / 2, y: controlY };

  // Cubic Bezier gives smoother control.
  const cp1 = { x: (start.x * 0.6 + mid.x * 0.4), y: mid.y };
  const cp2 = { x: (end.x * 0.6 + mid.x * 0.4), y: mid.y };

  // Build an SVG curve. IMPORTANT: SVG path direction affects textPath text orientation.
  // We intentionally reverse the path direction so the label renders left-to-right
  // without rotating/mirroring the text.
  const d = `M ${end.x} ${end.y} C ${cp2.x} ${cp2.y}, ${cp1.x} ${cp1.y}, ${start.x} ${start.y}`;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "circular-arrowhead");
  marker.setAttribute("markerWidth", "14");
  marker.setAttribute("markerHeight", "14");
  marker.setAttribute("refX", "11");
  marker.setAttribute("refY", "7");
  marker.setAttribute("orient", "auto");
  const markerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  markerPath.setAttribute("d", "M 0 0 L 14 7 L 0 14 Z");
  marker.appendChild(markerPath);
  defs.appendChild(marker);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("id", pathId);
  path.setAttribute("d", d);


  defs.appendChild(path);
  svg.appendChild(defs);

  // Main arrow stroke.
  const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrowPath.setAttribute("d", d);
  arrowPath.setAttribute("fill", "none");
  arrowPath.setAttribute("class", "circular-return-path");
  arrowPath.setAttribute("marker-end", "url(#circular-arrowhead)");

  svg.appendChild(arrowPath);

  // Standalone label (NOT textPath) positioned manually.
  // Requirements: centered between head and tail, above boxes, near curve midpoint,
  // and not placed directly on the curve path.

  const labelText = "tail.next -> head";

  // Use the computed curve midpoint for centering.
  const labelX = mid.x;

  // Place label above the nodes with clamping to avoid overlap with badges/boxes.
  // mid.y is on/near the curve; we lift it upward by labelLift.
  const labelLift = 26;
  const minY = padTop + 8; // keep it inside the stage viewBox
  const nodeTopY = Math.min(headY, tailY);
  const minGapFromNodes = 22; // keep clear of node top/badge zone

  // Prefer placing the label above the arrow's midpoint.
  // If the curve midpoint is already above the safe zone (rare with small dx),
  // the clamp below will keep it from colliding with node/badges.
  let labelY = mid.y - labelLift;
  labelY = Math.min(labelY, nodeTopY - minGapFromNodes);
  labelY = Math.max(labelY, minY);


  // Lightweight manual background so the label floats above visuals without overlapping.
  // (No background if it would collide; we keep it simple to preserve responsiveness.)
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("class", "circular-return-label");

  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("x", String(labelX));
  text.setAttribute("y", String(labelY));
  text.textContent = labelText;

  svg.appendChild(text);


  // Add animation trigger.
  const shouldAnimate = stage.classList.contains("circular-mode");
  stage.appendChild(svg);

  // Kick the CSS animation by forcing reflow.
  // eslint-disable-next-line no-unused-expressions
  svg.getBoundingClientRect();
  if (shouldAnimate) {
    svg.classList.remove("animate");
    // next frame so animation restarts
    requestAnimationFrame(() => {
      svg.classList.add("animate");
    });
  }
}

function moveLinkedListViewport(stage) {
  const activeNode = stage.querySelector(".list-node.active");



  if (activeNode) {
    activeNode.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    return;
  }

  const tailNode = stage.querySelector(".list-node.tail-node:not(.pending-node)");
  if (tailNode) {
    tailNode.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    return;
  }

  stage.scrollTo({ left: 0, behavior: "smooth" });
}

class SinglyListNode {
  constructor(value, id) {
    this.value = value;
    this.id = id;
    this.next = null;
  }
}

class SinglyLinkedListModel {
  constructor(values = []) {
    this.head = null;
    this.nextId = 1;
    values.forEach((value) => this.insertEnd(value));
  }

  createNode(value) {
    return new SinglyListNode(value, this.nextId++);
  }

  insertBeginning(value) {
    const node = this.createNode(value);
    node.next = this.head;
    this.head = node;
    return node;
  }

  insertEnd(value) {
    const node = this.createNode(value);
    if (!this.head) {
      this.head = node;
      return node;
    }

    let current = this.head;
    while (current.next) current = current.next;
    current.next = node;
    return node;
  }

  insertAtPosition(value, position) {
    const index = Math.min(Math.max(position, 1), this.length() + 1);
    if (index === 1) return this.insertBeginning(value);

    let previous = this.head;
    for (let i = 1; i < index - 1; i += 1) previous = previous.next;
    const node = this.createNode(value);
    node.next = previous.next;
    previous.next = node;
    return node;
  }

  deleteBeginning() {
    if (!this.head) return null;
    const removed = this.head;
    this.head = this.head.next;
    removed.next = null;
    return removed;
  }

  deleteEnd() {
    if (!this.head) return null;
    if (!this.head.next) return this.deleteBeginning();

    let previous = null;
    let current = this.head;
    while (current.next) {
      previous = current;
      current = current.next;
    }
    previous.next = null;
    return current;
  }

  deleteAtPosition(position) {
    if (!this.head) return null;
    const index = Math.min(Math.max(position, 1), this.length());
    if (index === 1) return this.deleteBeginning();

    let previous = this.head;
    for (let i = 1; i < index - 1; i += 1) previous = previous.next;
    const removed = previous.next;
    previous.next = removed?.next || null;
    if (removed) removed.next = null;
    return removed;
  }

  reverse() {
    let previous = null;
    let current = this.head;
    while (current) {
      const next = current.next;
      current.next = previous;
      previous = current;
      current = next;
    }
    this.head = previous;
  }

  sortByRelinking() {
    if (!this.head || !this.head.next) return;

    let swapped = true;
    while (swapped) {
      swapped = false;
      let previous = null;
      let current = this.head;
      while (current?.next) {
        const next = current.next;
        if (current.value > next.value) {
          current.next = next.next;
          next.next = current;
          if (previous) previous.next = next;
          else this.head = next;
          previous = next;
          swapped = true;
        } else {
          previous = current;
          current = current.next;
        }
      }
    }
  }

  sortOneTraversal() {
    let sortedHead = null;
    let current = this.head;

    while (current) {
      const next = current.next;
      if (!sortedHead || current.value <= sortedHead.value) {
        current.next = sortedHead;
        sortedHead = current;
      } else {
        let scan = sortedHead;
        while (scan.next && scan.next.value < current.value) scan = scan.next;
        current.next = scan.next;
        scan.next = current;
      }
      current = next;
    }

    this.head = sortedHead;
  }

  length() {
    return this.toNodes().length;
  }

  toValues() {
    return this.toNodes().map((node) => node.value);
  }

  toNodes() {
    const nodes = [];
    const seen = new Set();
    let current = this.head;

    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      nodes.push(current);
      current = current.next;
    }

    return nodes;
  }

  snapshot(message, options = {}) {
    const nodes = this.toNodes();
    const nodeDtos = nodes.map((node) => ({
      id: node.id,
      value: node.value,
      nextId: node.next?.id ?? null,
    }));
    const displayNodes = options.displayNodes?.map((node) => ({
      id: node.id,
      value: node.value,
      nextId: node.next?.id ?? null,
    }));
    const validation = this.validate(displayNodes || nodeDtos);

    return {
      nodes: nodeDtos,
      values: nodeDtos.map((node) => node.value),
      displayNodes,
      displayValues: displayNodes?.map((node) => node.value),
      message,
      active: options.active || [],
      inserted: options.inserted || [],
      deleting: options.deleting || [],
      searching: options.searching || [],
      sorted: options.sorted || [],
      current: options.current ?? null,
      prev: options.prev ?? null,
      next: options.next ?? null,
      linkedUntil: nodeDtos.length ? nodeDtos.length - 1 : 0,
      reversedLinks: options.reversedLinks || [],
      bypassLinks: options.bypassLinks || [],
      validation,
    };
  }

  validate(displayNodes = null) {
    const nodes = this.toNodes();
    const ids = new Set();

    for (const node of nodes) {
      if (ids.has(node.id)) return { ok: false, message: "Validation failed: cycle detected." };
      ids.add(node.id);
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const expectedNext = nodes[i + 1] || null;
      if (nodes[i].next !== expectedNext) {
        return { ok: false, message: `Validation failed: node ${nodes[i].id}.next is incorrect.` };
      }
    }

    if (displayNodes) {
      const traversalIds = nodes.map((node) => node.id).join(",");
      const traversalIdSet = new Set(nodes.map((node) => node.id));
      const displayTraversalIds = displayNodes
        .filter((node) => traversalIdSet.has(node.id))
        .map((node) => node.id)
        .join(",");
      const allowsPreview = displayNodes.length === nodes.length + 1 || displayNodes.length === nodes.length;
      if (!allowsPreview || displayTraversalIds !== traversalIds) {
        return { ok: false, message: "Validation failed: visual order does not match traversal order." };
      }
    }

    return { ok: true, message: "Structure validated." };
  }
}

function cloneSinglyModel(model) {
  return new SinglyLinkedListModel(model.toValues());
}

function makeSinglyStep(values, message, options = {}) {
  const model = new SinglyLinkedListModel(values);
  return model.snapshot(message, options);
}

function generateSinglyBuildSteps(values, existingModel = null) {
  const model = existingModel || new SinglyLinkedListModel();
  const steps = [model.snapshot("Start with HEAD = NULL.")];

  values.forEach((value) => {
    const node = model.createNode(value);
    const preview = [...model.toNodes(), node];
    steps.push(model.snapshot(`Create node [${value} | NEXT] separately.`, {
      displayNodes: preview,
      active: [preview.length - 1],
      inserted: [preview.length - 1],
    }));
    model.insertEndWithNode(node);
    steps.push(model.snapshot(`Link tail.next to node ${node.id}. HEAD traversal now includes ${value}.`, {
      active: [model.length() - 1],
      inserted: [model.length() - 1],
    }));
  });

  return { steps, model };
}

SinglyLinkedListModel.prototype.insertEndWithNode = function insertEndWithNode(node) {
  node.next = null;
  if (!this.head) {
    this.head = node;
    return node;
  }

  let current = this.head;
  while (current.next) current = current.next;
  current.next = node;
  return node;
};

function runSinglyOperation(panel) {
  const state = listStates.get(panel);
  if (!state || state.listId !== "singly-linked-list") return;
  stopListPanel(panel);

  const operation = state.operationInput.value;
  const value = Number(state.operationValueInput.value);
  const position = Math.max(1, Number.parseInt(state.positionInput.value, 10) || 1);
  const values = (state.currentValues || state.steps[state.index]?.values || []).slice();

  const needsValue = ["insert-beginning", "insert-end", "insert-position", "search"].includes(operation);
  if (needsValue && !Number.isFinite(value)) {
    state.message.textContent = "Enter an integer value for this operation.";
    return;
  }

  if (!state.singlyModel) {
    state.singlyModel = new SinglyLinkedListModel(values);
  }

  const result = generateSinglyOperationSteps(state.singlyModel, operation, value, position);
  state.steps = result.steps;
  state.singlyModel = result.model;
  state.index = 0;
  state.fullValues = [];
  state.currentValues = state.singlyModel.toValues();
  state.valuesInput.value = state.currentValues.join(", ");
  renderListPanel(panel);
}

function runListOperation(panel) {
  const state = listStates.get(panel);
  if (!state) return;
  if (state.listId === "singly-linked-list") {
    runSinglyOperation(panel);
    return;
  }

  stopListPanel(panel);
  const operation = state.operationInput.value;
  const value = Number(state.operationValueInput.value);
  const position = Math.max(1, Number.parseInt(state.positionInput.value, 10) || 1);
  const needsValue = ["insert-beginning", "insert-end", "insert-position", "search"].includes(operation);

  if (needsValue && !Number.isFinite(value)) {
    state.message.textContent = "Enter an integer value for this operation.";
    return;
  }

  if (state.listId === "doubly-linked-list") {
    if (!state.doublyModel) state.doublyModel = new DoublyLinkedListModel(state.currentValues || []);
    const result = generateDoublyOperationSteps(state.doublyModel, operation, value, position);
    state.steps = result.steps;
    state.doublyModel = result.model;
    state.currentValues = state.doublyModel.toValues();
  }

  if (state.listId === "circular-linked-list") {
    if (!state.circularModel) state.circularModel = new CircularLinkedListModel(state.currentValues || []);
    const result = generateCircularOperationSteps(state.circularModel, operation, value, position);
    state.steps = result.steps;
    state.circularModel = result.model;
    state.currentValues = state.circularModel.toValues();
  }

  state.index = 0;
  state.fullValues = [];
  state.valuesInput.value = state.currentValues.join(", ");
  renderListPanel(panel);
}

function generateSinglyOperationSteps(model, operation, value, position) {
  const steps = [model.snapshot(`Initial list: ${model.head ? "HEAD points to first node." : "HEAD = NULL."}`)];
  const length = model.length();
  const clampInsertPos = Math.min(Math.max(position, 1), length + 1);
  const clampDeletePos = Math.min(Math.max(position, 1), Math.max(length, 1));

  const activeAll = () => model.toNodes().map((_, index) => index);

  if (operation === "insert-beginning") {
    const node = model.createNode(value);
    steps.push(model.snapshot(`Create new node [${value} | NEXT] separately.`, {
      displayNodes: [node, ...model.toNodes()],
      active: [0],
      inserted: [0],
    }));
    node.next = model.head;
    steps.push(model.snapshot(`${value}.next now points to old HEAD.`, {
      displayNodes: [node, ...model.toNodes()],
      active: model.head ? [0, 1] : [0],
      inserted: [0],
    }));
    model.head = node;
    steps.push(model.snapshot("HEAD moved to the new node. Node inserted at beginning.", {
      active: [0],
      inserted: [0],
    }));
    return { steps, model };
  }

  if (operation === "insert-end") {
    if (!model.head) {
      model.insertBeginning(value);
      steps.push(model.snapshot("HEAD points to the new node. Node inserted at end.", { active: [0], inserted: [0] }));
      return { steps, model };
    }

    model.toNodes().forEach((node, index, nodes) => {
      steps.push(model.snapshot(index === nodes.length - 1 ? "Tail found. current.next is NULL." : "Traverse current = current.next.", {
        active: [index],
        current: index,
      }));
    });
    const node = model.createNode(value);
    steps.push(model.snapshot(`Create new tail node [${value} | NEXT].`, {
      displayNodes: [...model.toNodes(), node],
      active: [length],
      inserted: [length],
    }));
    const tail = model.toNodes()[length - 1];
    tail.next = node;
    steps.push(model.snapshot("Old tail.next now points to the new node. Node inserted at end.", {
      active: [length - 1, length],
      inserted: [length],
    }));
    return { steps, model };
  }

  if (operation === "insert-position") {
    if (clampInsertPos === 1) return generateSinglyOperationSteps(model, "insert-beginning", value, 1);
    if (clampInsertPos === length + 1) return generateSinglyOperationSteps(model, "insert-end", value, clampInsertPos);

    for (let i = 0; i < clampInsertPos - 1; i += 1) {
      steps.push(model.snapshot(`Traverse to position ${i + 1}.`, { active: [i], current: i }));
    }
    const nodes = model.toNodes();
    const previous = nodes[clampInsertPos - 2];
    const node = model.createNode(value);
    node.next = previous.next;
    steps.push(model.snapshot(`Set new node.next to node at position ${clampInsertPos}.`, {
      displayNodes: [...nodes.slice(0, clampInsertPos - 1), node, ...nodes.slice(clampInsertPos - 1)],
      active: [clampInsertPos - 2, clampInsertPos - 1, clampInsertPos],
      inserted: [clampInsertPos - 1],
      prev: clampInsertPos - 2,
      next: clampInsertPos,
    }));
    previous.next = node;
    steps.push(model.snapshot("previous.next now points to the new node. Node inserted at position.", {
      active: [clampInsertPos - 2, clampInsertPos - 1],
      inserted: [clampInsertPos - 1],
    }));
    return { steps, model };
  }

  if (operation === "delete-beginning") {
    if (!model.head) {
      steps.push(model.snapshot("List is empty. Nothing to delete."));
      return { steps, model };
    }
    steps.push(model.snapshot("Highlight HEAD node for deletion.", { active: [0], deleting: [0] }));
    model.deleteBeginning();
    steps.push(model.snapshot("HEAD moved to the next node. First node removed.", { active: model.head ? [0] : [] }));
    return { steps, model };
  }

  if (operation === "delete-end") {
    if (!model.head) {
      steps.push(model.snapshot("List is empty. Nothing to delete."));
      return { steps, model };
    }
    if (!model.head.next) return generateSinglyOperationSteps(model, "delete-beginning", value, 1);

    for (let i = 0; i < length - 1; i += 1) {
      steps.push(model.snapshot(i === length - 2 ? "Second-last node found." : "Traverse toward the tail.", { active: [i], current: i }));
    }
    steps.push(model.snapshot("Tail node selected. Set second-last.next = NULL.", {
      active: [length - 2, length - 1],
      deleting: [length - 1],
    }));
    model.deleteEnd();
    steps.push(model.snapshot("Tail node removed. Traversal ends at NULL.", { active: [model.length() - 1] }));
    return { steps, model };
  }

  if (operation === "delete-position") {
    if (!model.head) {
      steps.push(model.snapshot("List is empty. Nothing to delete."));
      return { steps, model };
    }
    if (clampDeletePos === 1) return generateSinglyOperationSteps(model, "delete-beginning", value, 1);

    for (let i = 0; i < clampDeletePos - 1; i += 1) {
      steps.push(model.snapshot(`Traverse to position ${i + 1}.`, { active: [i], current: i }));
    }
    steps.push(model.snapshot("Redirect previous.next to target.next.", {
      active: [clampDeletePos - 2, clampDeletePos - 1],
      deleting: [clampDeletePos - 1],
      bypassLinks: [clampDeletePos - 2],
      prev: clampDeletePos - 2,
    }));
    model.deleteAtPosition(clampDeletePos);
    steps.push(model.snapshot("Target node removed. Remaining links are reconnected.", {
      active: model.length() ? [Math.min(clampDeletePos - 2, model.length() - 1)] : [],
    }));
    return { steps, model };
  }

  if (operation === "search") {
    steps.push(model.snapshot(`Searching for ${value} from HEAD.`));
    const nodes = model.toNodes();
    for (let i = 0; i < nodes.length; i += 1) {
      steps.push(model.snapshot(`Visit position ${i + 1}: compare ${value} with ${nodes[i].value}.`, {
        active: [i],
        searching: [i],
        current: i,
      }));
      if (nodes[i].value === value) {
        steps.push(model.snapshot(`Value ${value} found at position ${i + 1}.`, {
          active: [i],
          searching: [i],
        }));
        return { steps, model };
      }
    }
    steps.push(model.snapshot(`Value ${value} not found after reaching NULL.`));
    return { steps, model };
  }

  if (operation === "reverse") {
    if (!model.head || !model.head.next) {
      steps.push(model.snapshot("List has zero or one node. HEAD is already correct.", { active: model.head ? [0] : [] }));
      return { steps, model };
    }
    let previous = null;
    let current = model.head;
    let index = 0;
    while (current) {
      const next = current.next;
      current.next = previous;
      if (previous === null) model.head = current;
      steps.push(model.snapshot("Reverse pointer: current.next now points to previous.", {
        active: [0],
        current: 0,
        prev: previous ? 1 : null,
        next: next ? 0 : null,
        reversedLinks: previous ? [0] : [],
      }));
      previous = current;
      current = next;
      if (current) model.head = current;
      index += 1;
    }
    model.head = previous;
    steps.push(model.snapshot("HEAD moved to the old tail. Linked list reversed.", { active: [0] }));
    return { steps, model };
  }

  if (operation === "sort") {
    if (!model.head || !model.head.next) {
      steps.push(model.snapshot("List has zero or one node. It is already sorted.", { sorted: activeAll() }));
      return { steps, model };
    }

    let swapped = true;
    let pass = 1;
    while (swapped) {
      swapped = false;
      let previous = null;
      let current = model.head;
      let index = 0;
      while (current?.next) {
        const next = current.next;
        steps.push(model.snapshot(`Pass ${pass}: compare ${current.value} and ${next.value}.`, {
          active: [index, index + 1],
          current: index,
        }));
        if (current.value > next.value) {
          current.next = next.next;
          next.next = current;
          if (previous) previous.next = next;
          else model.head = next;
          steps.push(model.snapshot("Relink adjacent nodes into sorted order.", {
            active: [index, index + 1],
            bypassLinks: [index],
          }));
          previous = next;
          index += 1;
          swapped = true;
        } else {
          previous = current;
          current = current.next;
          index += 1;
        }
      }
      steps.push(model.snapshot(`Traversal pass ${pass} complete.`, { sorted: activeAll() }));
      pass += 1;
    }
    steps.push(model.snapshot("Linked list sorted in ascending order by relinking nodes.", { sorted: activeAll() }));
    return { steps, model };
  }

  if (operation === "one-pass-sort") {
    if (!model.head || !model.head.next) {
      steps.push(model.snapshot("List has zero or one node. It is already sorted.", { sorted: activeAll() }));
      return { steps, model };
    }

    let sortedHead = null;
    let current = model.head;
    let visited = 0;
    while (current) {
      const next = current.next;
      current.next = null;
      model.head = sortedHead || current;
      steps.push(model.snapshot(`Detach visited node ${current.value} from the original traversal.`, {
        active: [Math.max(0, visited - 1)],
        current: Math.max(0, visited - 1),
      }));

      if (!sortedHead || current.value <= sortedHead.value) {
        current.next = sortedHead;
        sortedHead = current;
      } else {
        let scan = sortedHead;
        while (scan.next && scan.next.value < current.value) scan = scan.next;
        current.next = scan.next;
        scan.next = current;
      }
      model.head = sortedHead;
      steps.push(model.snapshot("Insert visited node into the sorted chain.", {
        active: [model.toNodes().findIndex((node) => node.id === current.id)],
        inserted: [model.toNodes().findIndex((node) => node.id === current.id)],
        sorted: activeAll(),
      }));
      current = next;
      visited += 1;
    }
    model.head = sortedHead;
    steps.push(model.snapshot("One-traversal insertion ordering complete. HEAD points to the sorted chain.", { sorted: activeAll() }));
    return { steps, model };
  }

  return { steps, model };
}

class DoublyListNode {
  constructor(value, id) {
    this.value = value;
    this.id = id;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedListModel {
  constructor(values = []) {
    this.head = null;
    this.tail = null;
    this.nextId = 1;
    values.forEach((value) => this.insertEnd(value));
  }

  createNode(value) {
    return new DoublyListNode(value, this.nextId++);
  }

  insertBeginning(value) {
    const node = this.createNode(value);
    node.next = this.head;
    if (this.head) this.head.prev = node;
    else this.tail = node;
    this.head = node;
    return node;
  }

  insertEnd(value) {
    const node = this.createNode(value);
    node.prev = this.tail;
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    return node;
  }

  insertNodeEnd(node) {
    node.prev = this.tail;
    node.next = null;
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    return node;
  }

  deleteBeginning() {
    if (!this.head) return null;
    const removed = this.head;
    this.head = removed.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    removed.prev = null;
    removed.next = null;
    return removed;
  }

  deleteEnd() {
    if (!this.tail) return null;
    const removed = this.tail;
    this.tail = removed.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    removed.prev = null;
    removed.next = null;
    return removed;
  }

  deleteAtPosition(position) {
    const index = Math.min(Math.max(position, 1), this.length());
    if (index <= 1) return this.deleteBeginning();
    if (index >= this.length()) return this.deleteEnd();
    const node = this.toNodes()[index - 1];
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
    return node;
  }

  reverse() {
    let current = this.head;
    while (current) {
      const next = current.next;
      current.next = current.prev;
      current.prev = next;
      current = next;
    }
    const oldHead = this.head;
    this.head = this.tail;
    this.tail = oldHead;
  }

  relinkInOrder(nodes) {
    this.head = nodes[0] || null;
    this.tail = nodes[nodes.length - 1] || null;
    nodes.forEach((node, index) => {
      node.prev = nodes[index - 1] || null;
      node.next = nodes[index + 1] || null;
    });
  }

  length() {
    return this.toNodes().length;
  }

  toValues() {
    return this.toNodes().map((node) => node.value);
  }

  toNodes() {
    const nodes = [];
    const seen = new Set();
    let current = this.head;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      nodes.push(current);
      current = current.next;
    }
    return nodes;
  }

  toDto(nodes = this.toNodes()) {
    return nodes.map((node) => ({
      id: node.id,
      value: node.value,
      prevId: node.prev?.id ?? null,
      nextId: node.next?.id ?? null,
    }));
  }

  snapshot(message, options = {}) {
    const nodes = this.toNodes();
    const nodeDtos = this.toDto(nodes);
    const displayNodes = options.displayNodes ? this.toDto(options.displayNodes) : undefined;
    const validation = this.validate(displayNodes || nodeDtos);
    return {
      nodes: nodeDtos,
      values: nodeDtos.map((node) => node.value),
      displayNodes,
      displayValues: displayNodes?.map((node) => node.value),
      message,
      active: options.active || [],
      inserted: options.inserted || [],
      deleting: options.deleting || [],
      searching: options.searching || [],
      sorted: options.sorted || [],
      current: options.current ?? null,
      prev: options.prev ?? null,
      next: options.next ?? null,
      linkedUntil: nodeDtos.length ? nodeDtos.length - 1 : 0,
      reversedLinks: options.reversedLinks || [],
      bypassLinks: options.bypassLinks || [],
      validation,
    };
  }

  validate(displayNodes = null) {
    const nodes = this.toNodes();
    if (!this.head && this.tail) return { ok: false, message: "Validation failed: tail exists without head." };
    if (this.head?.prev) return { ok: false, message: "Validation failed: head.prev must be NULL." };
    if (this.tail?.next) return { ok: false, message: "Validation failed: tail.next must be NULL." };
    if (nodes.length && nodes[nodes.length - 1] !== this.tail) return { ok: false, message: "Validation failed: TAIL is not last in traversal." };
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].next !== (nodes[i + 1] || null)) return { ok: false, message: `Validation failed: node ${nodes[i].id}.next is incorrect.` };
      if (nodes[i].prev !== (nodes[i - 1] || null)) return { ok: false, message: `Validation failed: node ${nodes[i].id}.prev is incorrect.` };
    }
    if (displayNodes) {
      const ids = new Set(nodes.map((node) => node.id));
      const traversalIds = nodes.map((node) => node.id).join(",");
      const displayTraversalIds = displayNodes.filter((node) => ids.has(node.id)).map((node) => node.id).join(",");
      if (displayTraversalIds !== traversalIds) return { ok: false, message: "Validation failed: visual order does not match traversal order." };
    }
    return { ok: true, message: "Structure validated." };
  }
}

class CircularListNode {
  constructor(value, id) {
    this.value = value;
    this.id = id;
    this.next = null;
  }
}

class CircularLinkedListModel {
  constructor(values = []) {
    this.head = null;
    this.tail = null;
    this.nextId = 1;
    values.forEach((value) => this.insertEnd(value));
  }

  createNode(value) {
    return new CircularListNode(value, this.nextId++);
  }

  insertBeginning(value) {
    const node = this.createNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
      node.next = node;
      return node;
    }
    node.next = this.head;
    this.head = node;
    this.tail.next = this.head;
    return node;
  }

  insertEnd(value) {
    const node = this.createNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
      node.next = node;
      return node;
    }
    node.next = this.head;
    this.tail.next = node;
    this.tail = node;
    return node;
  }

  deleteBeginning() {
    if (!this.head) return null;
    const removed = this.head;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      this.tail.next = this.head;
    }
    removed.next = null;
    return removed;
  }

  deleteEnd() {
    if (!this.tail) return null;
    if (this.head === this.tail) return this.deleteBeginning();
    const removed = this.tail;
    let previous = this.head;
    while (previous.next !== this.tail) previous = previous.next;
    previous.next = this.head;
    this.tail = previous;
    removed.next = null;
    return removed;
  }

  deleteAtPosition(position) {
    const length = this.length();
    const index = Math.min(Math.max(position, 1), length);
    if (index <= 1) return this.deleteBeginning();
    if (index >= length) return this.deleteEnd();
    let previous = this.head;
    for (let i = 1; i < index - 1; i += 1) previous = previous.next;
    const removed = previous.next;
    previous.next = removed.next;
    removed.next = null;
    return removed;
  }

  reverse() {
    const length = this.length();
    if (length <= 1) return;
    let previous = this.tail;
    let current = this.head;
    for (let i = 0; i < length; i += 1) {
      const next = current.next;
      current.next = previous;
      previous = current;
      current = next;
    }
    const oldHead = this.head;
    this.head = this.tail;
    this.tail = oldHead;
    this.tail.next = this.head;
  }

  relinkInOrder(nodes) {
    this.head = nodes[0] || null;
    this.tail = nodes[nodes.length - 1] || null;
    if (!nodes.length) return;
    nodes.forEach((node, index) => {
      node.next = nodes[index + 1] || this.head;
    });
  }

  length() {
    return this.toNodes().length;
  }

  toValues() {
    return this.toNodes().map((node) => node.value);
  }

  toNodes() {
    const nodes = [];
    const seen = new Set();
    let current = this.head;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      nodes.push(current);
      current = current.next;
      if (current === this.head) break;
    }
    return nodes;
  }

  toDto(nodes = this.toNodes()) {
    return nodes.map((node) => ({
      id: node.id,
      value: node.value,
      nextId: node.next?.id ?? null,
    }));
  }

  snapshot(message, options = {}) {
    const nodes = this.toNodes();
    const nodeDtos = this.toDto(nodes);
    const displayNodes = options.displayNodes ? this.toDto(options.displayNodes) : undefined;
    const validation = this.validate(displayNodes || nodeDtos);
    return {
      nodes: nodeDtos,
      values: nodeDtos.map((node) => node.value),
      displayNodes,
      displayValues: displayNodes?.map((node) => node.value),
      message,
      active: options.active || [],
      inserted: options.inserted || [],
      deleting: options.deleting || [],
      searching: options.searching || [],
      sorted: options.sorted || [],
      current: options.current ?? null,
      prev: options.prev ?? null,
      next: options.next ?? null,
      linkedUntil: nodeDtos.length ? nodeDtos.length - 1 : 0,
      reversedLinks: options.reversedLinks || [],
      bypassLinks: options.bypassLinks || [],
      circular: Boolean(nodeDtos.length),
      validation,
    };
  }

  validate(displayNodes = null) {
    const nodes = this.toNodes();
    if (!this.head && this.tail) return { ok: false, message: "Validation failed: tail exists without head." };
    if (!nodes.length) return { ok: !this.head && !this.tail, message: "Structure validated." };
    if (nodes[nodes.length - 1] !== this.tail) return { ok: false, message: "Validation failed: TAIL is not last before HEAD." };
    if (this.tail.next !== this.head) return { ok: false, message: "Validation failed: tail.next must point to HEAD." };
    for (let i = 0; i < nodes.length - 1; i += 1) {
      if (nodes[i].next !== nodes[i + 1]) return { ok: false, message: `Validation failed: node ${nodes[i].id}.next is incorrect.` };
    }
    if (displayNodes) {
      const ids = new Set(nodes.map((node) => node.id));
      const traversalIds = nodes.map((node) => node.id).join(",");
      const displayTraversalIds = displayNodes.filter((node) => ids.has(node.id)).map((node) => node.id).join(",");
      if (displayTraversalIds !== traversalIds) return { ok: false, message: "Validation failed: visual order does not match traversal order." };
    }
    return { ok: true, message: "Structure validated." };
  }
}

function buildDoublySteps(values) {
  const model = new DoublyLinkedListModel();
  const steps = [model.snapshot("Start with HEAD = NULL and TAIL = NULL.")];
  values.forEach((value) => {
    const node = model.createNode(value);
    steps.push(model.snapshot(`Create node [PREV | ${value} | NEXT].`, {
      displayNodes: [...model.toNodes(), node],
      active: [model.length()],
      inserted: [model.length()],
    }));
    model.insertNodeEnd(node);
    steps.push(model.snapshot("Update tail.next and new.prev. TAIL points to the new node.", {
      active: [model.length() - 1],
      inserted: [model.length() - 1],
    }));
  });
  return { steps, model };
}

function buildCircularSteps(values) {
  const model = new CircularLinkedListModel();
  const steps = [model.snapshot("Start with HEAD = NULL and TAIL = NULL.")];
  values.forEach((value) => {
    const node = model.createNode(value);
    steps.push(model.snapshot(`Create node ${value}.`, {
      displayNodes: [...model.toNodes(), node],
      active: [model.length()],
      inserted: [model.length()],
    }));
    if (!model.head) {
      model.head = node;
      model.tail = node;
      node.next = node;
    } else {
      node.next = model.head;
      model.tail.next = node;
      model.tail = node;
    }
    steps.push(model.snapshot("Link TAIL.next back to HEAD to preserve the circle.", {
      active: [model.length() - 1, 0],
      inserted: [model.length() - 1],
    }));
  });
  return { steps, model };
}

function generateDoublyOperationSteps(model, operation, value, position) {
  const steps = [model.snapshot(`Initial doubly list: ${model.head ? "HEAD and TAIL are set." : "HEAD = NULL, TAIL = NULL."}`)];
  const length = model.length();
  const insertPos = Math.min(Math.max(position, 1), length + 1);
  const deletePos = Math.min(Math.max(position, 1), Math.max(length, 1));
  const all = () => model.toNodes().map((_, index) => index);

  if (operation === "insert-beginning") {
    const node = model.createNode(value);
    node.next = model.head;
    steps.push(model.snapshot("Create new head and set new.next to old HEAD.", { displayNodes: [node, ...model.toNodes()], active: [0], inserted: [0] }));
    if (model.head) model.head.prev = node;
    else model.tail = node;
    model.head = node;
    steps.push(model.snapshot("Set old HEAD.prev and move HEAD to the new node.", { active: model.head.next ? [0, 1] : [0], inserted: [0] }));
    return { steps, model };
  }

  if (operation === "insert-end") {
    const node = model.createNode(value);
    node.prev = model.tail;
    steps.push(model.snapshot("Create new tail and set new.prev to old TAIL.", { displayNodes: [...model.toNodes(), node], active: [length], inserted: [length] }));
    if (model.tail) model.tail.next = node;
    else model.head = node;
    model.tail = node;
    steps.push(model.snapshot("Set old TAIL.next to the new node. TAIL moved.", { active: [model.length() - 1], inserted: [model.length() - 1] }));
    return { steps, model };
  }

  if (operation === "insert-position") {
    if (insertPos === 1) return generateDoublyOperationSteps(model, "insert-beginning", value, 1);
    if (insertPos === length + 1) return generateDoublyOperationSteps(model, "insert-end", value, insertPos);
    for (let i = 0; i < insertPos - 1; i += 1) steps.push(model.snapshot(`Traverse to position ${i + 1}.`, { active: [i], current: i }));
    const nodes = model.toNodes();
    const before = nodes[insertPos - 2];
    const after = before.next;
    const node = model.createNode(value);
    node.prev = before;
    node.next = after;
    steps.push(model.snapshot("Set new.prev and new.next between adjacent nodes.", { displayNodes: [...nodes.slice(0, insertPos - 1), node, ...nodes.slice(insertPos - 1)], active: [insertPos - 2, insertPos - 1, insertPos], inserted: [insertPos - 1], prev: insertPos - 2, next: insertPos }));
    before.next = node;
    after.prev = node;
    steps.push(model.snapshot("Reconnect previous.next and next.prev through the new node.", { active: [insertPos - 2, insertPos - 1, insertPos], inserted: [insertPos - 1] }));
    return { steps, model };
  }

  if (operation === "delete-beginning") {
    if (!model.head) return { steps: [...steps, model.snapshot("List is empty. Nothing to delete.")], model };
    steps.push(model.snapshot("Remove HEAD and move HEAD to HEAD.next.", { active: [0], deleting: [0] }));
    model.deleteBeginning();
    steps.push(model.snapshot("New HEAD.prev is NULL and removed node is disconnected.", { active: model.head ? [0] : [] }));
    return { steps, model };
  }

  if (operation === "delete-end") {
    if (!model.tail) return { steps: [...steps, model.snapshot("List is empty. Nothing to delete.")], model };
    steps.push(model.snapshot("Remove TAIL and move TAIL to TAIL.prev.", { active: [length - 1], deleting: [length - 1] }));
    model.deleteEnd();
    steps.push(model.snapshot("New TAIL.next is NULL and removed node is disconnected.", { active: model.tail ? [model.length() - 1] : [] }));
    return { steps, model };
  }

  if (operation === "delete-position") {
    if (!model.head) return { steps: [...steps, model.snapshot("List is empty. Nothing to delete.")], model };
    if (deletePos === 1) return generateDoublyOperationSteps(model, "delete-beginning", value, 1);
    if (deletePos === length) return generateDoublyOperationSteps(model, "delete-end", value, deletePos);
    for (let i = 0; i < deletePos - 1; i += 1) steps.push(model.snapshot(`Traverse to position ${i + 1}.`, { active: [i], current: i }));
    steps.push(model.snapshot("Set previous.next to target.next and next.prev to target.prev.", { active: [deletePos - 2, deletePos - 1, deletePos], deleting: [deletePos - 1], bypassLinks: [deletePos - 2] }));
    model.deleteAtPosition(deletePos);
    steps.push(model.snapshot("Target node disconnected completely.", { active: [deletePos - 2] }));
    return { steps, model };
  }

  if (operation === "search") {
    const nodes = model.toNodes();
    for (let i = 0; i < nodes.length; i += 1) {
      steps.push(model.snapshot(`Visit position ${i + 1}: compare ${value} with ${nodes[i].value}.`, { active: [i], searching: [i], current: i }));
      if (nodes[i].value === value) return { steps: [...steps, model.snapshot(`Value ${value} found at position ${i + 1}.`, { active: [i], searching: [i] })], model };
    }
    steps.push(model.snapshot(`Value ${value} not found after reaching NULL.`));
    return { steps, model };
  }

  if (operation === "reverse") {
    const nodes = model.toNodes();
    nodes.forEach((node, index) => {
      steps.push(model.snapshot(`Prepare to swap prev and next for node ${node.value}.`, { active: [index], current: index, reversedLinks: [Math.max(0, index - 1)] }));
    });
    model.reverse();
    steps.push(model.snapshot("HEAD and TAIL swapped. Doubly linked list reversed.", { active: [0] }));
    return { steps, model };
  }

  if (operation === "sort") {
    const sorted = model.toNodes().slice().sort((a, b) => a.value - b.value);
    model.toNodes().forEach((node, index) => steps.push(model.snapshot(`Compare and place node ${node.value} into sorted order.`, { active: [index], current: index })));
    model.relinkInOrder(sorted);
    steps.push(model.snapshot("Nodes sorted by relinking prev and next pointers.", { sorted: all() }));
    return { steps, model };
  }

  return { steps, model };
}

function generateCircularOperationSteps(model, operation, value, position) {
  const steps = [model.snapshot(`Initial circular list: ${model.head ? "TAIL.next points to HEAD." : "HEAD = NULL, TAIL = NULL."}`)];
  const length = model.length();
  const insertPos = Math.min(Math.max(position, 1), length + 1);
  const deletePos = Math.min(Math.max(position, 1), Math.max(length, 1));
  const all = () => model.toNodes().map((_, index) => index);

  if (operation === "insert-beginning") {
    model.insertBeginning(value);
    steps.push(model.snapshot("Insert at beginning and reconnect TAIL.next to the new HEAD.", { active: [0], inserted: [0] }));
    return { steps, model };
  }
  if (operation === "insert-end") {
    model.insertEnd(value);
    steps.push(model.snapshot("Insert at end. New TAIL.next points back to HEAD.", { active: [model.length() - 1, 0], inserted: [model.length() - 1] }));
    return { steps, model };
  }
  if (operation === "insert-position") {
    if (insertPos === 1) return generateCircularOperationSteps(model, "insert-beginning", value, 1);
    if (insertPos === length + 1) return generateCircularOperationSteps(model, "insert-end", value, insertPos);
    for (let i = 0; i < insertPos - 1; i += 1) steps.push(model.snapshot(`Circular traversal visits position ${i + 1}.`, { active: [i], current: i }));
    let previous = model.head;
    for (let i = 1; i < insertPos - 1; i += 1) previous = previous.next;
    const node = model.createNode(value);
    node.next = previous.next;
    steps.push(model.snapshot("Set new.next to the target position node.", { displayNodes: [...model.toNodes().slice(0, insertPos - 1), node, ...model.toNodes().slice(insertPos - 1)], active: [insertPos - 2, insertPos - 1, insertPos], inserted: [insertPos - 1] }));
    previous.next = node;
    steps.push(model.snapshot("previous.next points to new node; circular tail link remains valid.", { active: [insertPos - 2, insertPos - 1], inserted: [insertPos - 1] }));
    return { steps, model };
  }
  if (operation === "delete-beginning") {
    if (!model.head) return { steps: [...steps, model.snapshot("List is empty. Nothing to delete.")], model };
    steps.push(model.snapshot("Delete HEAD and move HEAD to next node.", { active: [0], deleting: [0] }));
    model.deleteBeginning();
    steps.push(model.snapshot("TAIL.next reconnected to HEAD.", { active: model.head ? [0] : [] }));
    return { steps, model };
  }
  if (operation === "delete-end") {
    if (!model.tail) return { steps: [...steps, model.snapshot("List is empty. Nothing to delete.")], model };
    steps.push(model.snapshot("Find previous node, delete TAIL, and reconnect previous.next to HEAD.", { active: [length - 1], deleting: [length - 1] }));
    model.deleteEnd();
    steps.push(model.snapshot("TAIL moved backward; TAIL.next points to HEAD.", { active: model.tail ? [model.length() - 1, 0] : [] }));
    return { steps, model };
  }
  if (operation === "delete-position") {
    if (!model.head) return { steps: [...steps, model.snapshot("List is empty. Nothing to delete.")], model };
    if (deletePos === 1) return generateCircularOperationSteps(model, "delete-beginning", value, 1);
    if (deletePos === length) return generateCircularOperationSteps(model, "delete-end", value, deletePos);
    for (let i = 0; i < deletePos - 1; i += 1) steps.push(model.snapshot(`Circular traversal visits position ${i + 1}.`, { active: [i], current: i }));
    steps.push(model.snapshot("Redirect previous.next to target.next.", { active: [deletePos - 2, deletePos - 1], deleting: [deletePos - 1], bypassLinks: [deletePos - 2] }));
    model.deleteAtPosition(deletePos);
    steps.push(model.snapshot("Target removed and circular structure preserved.", { active: [deletePos - 2] }));
    return { steps, model };
  }
  if (operation === "search") {
    const nodes = model.toNodes();
    for (let i = 0; i < nodes.length; i += 1) {
      steps.push(model.snapshot(`Circular traversal position ${i + 1}: compare ${value} with ${nodes[i].value}.`, { active: [i], searching: [i], current: i }));
      if (nodes[i].value === value) return { steps: [...steps, model.snapshot(`Value ${value} found at position ${i + 1}.`, { active: [i], searching: [i] })], model };
    }
    steps.push(model.snapshot(`Returned to HEAD. Value ${value} was not found.`));
    return { steps, model };
  }
  if (operation === "reverse") {
    const count = model.length();
    for (let i = 0; i < count; i += 1) steps.push(model.snapshot(`Reverse circular link at position ${i + 1}.`, { active: [i], current: i, reversedLinks: [Math.max(0, i - 1)] }));
    model.reverse();
    steps.push(model.snapshot("HEAD and TAIL swapped. New TAIL.next points to HEAD.", { active: [0, model.length() - 1] }));
    return { steps, model };
  }
  if (operation === "sort") {
    const sorted = model.toNodes().slice().sort((a, b) => a.value - b.value);
    model.toNodes().forEach((node, index) => steps.push(model.snapshot(`Visit node ${node.value} for circular sort.`, { active: [index], current: index })));
    model.relinkInOrder(sorted);
    steps.push(model.snapshot("Circular list sorted and TAIL.next reconnected to HEAD.", { sorted: all() }));
    return { steps, model };
  }
  return { steps, model };
}

async function startListPanel(panel) {
  const state = listStates.get(panel);
  stopListPanel(panel);

  const values = parseValues(state.valuesInput);
  if (!values.length || values.some(Number.isNaN)) {
    state.message.textContent = "Enter comma-separated integer node values.";
    return;
  }

  if (state.listId === "singly-linked-list") {
    const result = generateSinglyBuildSteps(values);
    state.steps = result.steps;
    state.singlyModel = result.model;
    state.fullValues = [];
    state.currentValues = values.slice();
    state.index = 0;
    renderListPanel(panel);
    return;
  }

  if (state.listId === "doubly-linked-list") {
    const result = buildDoublySteps(values);
    state.steps = result.steps;
    state.doublyModel = result.model;
    state.fullValues = [];
    state.currentValues = values.slice();
    state.index = 0;
    renderListPanel(panel);
    return;
  }

  if (state.listId === "circular-linked-list") {
    const result = buildCircularSteps(values);
    state.steps = result.steps;
    state.circularModel = result.model;
    state.fullValues = [];
    state.currentValues = values.slice();
    state.index = 0;
    renderListPanel(panel);
    return;
  }

  const response = await fetch(`/api/linked-list/${state.listId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });

  const payload = await response.json();
  if (!response.ok) {
    state.message.textContent = payload.error || "Unable to generate linked-list visualization.";
    return;
  }

  state.steps = payload.steps;
  state.fullValues = values;
  state.index = 0;
  renderListPanel(panel);
}

function moveListPanel(panel, offset) {
  const state = listStates.get(panel);
  stopListPanel(panel);
  if (!state.steps.length) return;

  state.index = Math.min(Math.max(state.index + offset, 0), state.steps.length - 1);
  renderListPanel(panel);
}

function toggleListPanel(panel) {
  const state = listStates.get(panel);
  if (!state.steps.length) return;

  state.playing = !state.playing;
  state.playButton.textContent = state.playing ? "Pause" : "Play";

  if (!state.playing) {
    stopListPanel(panel);
    return;
  }

  state.timer = setInterval(() => {
    if (state.index >= state.steps.length - 1) {
      stopListPanel(panel);
      return;
    }
    state.index += 1;
    renderListPanel(panel);
  }, Number(state.speedInput.value));
}

function setListCodeTab(panel, tab) {
  const state = listStates.get(panel);
  const codeType = tab.dataset.codeTab;

  panel.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  state.code.textContent = linkedLists[state.listId][codeType];
}

document.querySelectorAll("[data-list-panel]").forEach((panel) => {
  const state = {
    listId: panel.dataset.list,
    steps: [],
    fullValues: [],
    index: 0,
    playing: false,
    timer: null,
    valuesInput: panel.querySelector("[data-values]"),
    speedInput: panel.querySelector("[data-speed]"),
    playButton: panel.querySelector("[data-play]"),
    stage: panel.querySelector("[data-list-stage]"),
    message: panel.querySelector("[data-message]"),
    counter: panel.querySelector("[data-counter]"),
    code: panel.querySelector("[data-code]"),
    operationInput: panel.querySelector("[data-list-operation]"),
    operationValueInput: panel.querySelector("[data-list-op-value]"),
    positionInput: panel.querySelector("[data-list-position]"),
    runOperationButton: panel.querySelector("[data-list-run-operation]"),
    currentValues: [],
  };

  listStates.set(panel, state);

  panel.querySelector("[data-start]").addEventListener("click", () => startListPanel(panel));
  panel.querySelector("[data-prev]").addEventListener("click", () => moveListPanel(panel, -1));
  panel.querySelector("[data-next]").addEventListener("click", () => moveListPanel(panel, 1));
  state.runOperationButton?.addEventListener("click", () => runListOperation(panel));
  state.operationInput?.addEventListener("change", () => updateComplexityPanel(panel, state.steps[state.index] || null));
  state.playButton.addEventListener("click", () => toggleListPanel(panel));
  state.speedInput.addEventListener("input", () => {
    if (state.playing) {
      stopListPanel(panel);
      toggleListPanel(panel);
    }
  });

  panel.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setListCodeTab(panel, tab));
  });

  startListPanel(panel);
});

window.addEventListener("resize", () => {
  document.querySelectorAll("[data-list-panel]").forEach((panel) => {
    const state = listStates.get(panel);
    if (state?.steps.length) renderListPanel(panel);
  });
});

const stackVizState = {
  values: [],
  steps: [],
  index: 0,
  playing: false,
  timer: null,
};

function getStackVizPanel() {
  return document.querySelector("[data-stack-viz]");
}

function currentStackValues() {
  return stackVizState.steps[stackVizState.index]?.values?.slice() || stackVizState.values.slice();
}

function addStackStep(values, message, options = {}) {
  if (stackVizState.index < stackVizState.steps.length - 1) {
    stackVizState.steps = stackVizState.steps.slice(0, stackVizState.index + 1);
  }

  stackVizState.steps.push({
    values: values.slice(),
    message,
    activeIndex: options.activeIndex ?? null,
    mode: options.mode || "",
    marker: options.marker || "",
  });
  stackVizState.index = stackVizState.steps.length - 1;
  stackVizState.values = values.slice();
}

function stopStackVisualization() {
  const panel = getStackVizPanel();
  stackVizState.playing = false;
  if (stackVizState.timer) {
    clearInterval(stackVizState.timer);
    stackVizState.timer = null;
  }
  const playButton = panel?.querySelector("[data-stack-play]");
  if (playButton) playButton.textContent = "Play";
}

function startStackVisualization() {
  const panel = getStackVizPanel();
  if (!panel) return;
  panel.dataset.stackComplexityOperation = "start";

  stopStackVisualization();
  const values = parseValues(panel.querySelector("[data-stack-values]"));
  if (!values.length || values.some(Number.isNaN)) {
    setStackMessage("Enter comma-separated integer stack values.");
    return;
  }

  stackVizState.values = [];
  stackVizState.steps = [];
  stackVizState.index = 0;
  addStackStep([], "Start with an empty stack.");

  values.forEach((value) => {
    const next = currentStackValues();
    next.push(value);
    addStackStep(next, `Pushed ${value} onto stack`, {
      activeIndex: next.length - 1,
      mode: "push",
    });
  });

  renderStackVisualization();
}

function renderStackVisualization() {
  const panel = getStackVizPanel();
  const stage = panel?.querySelector("[data-stack-stage]");
  if (!panel || !stage) return;

  const step = stackVizState.steps[stackVizState.index];
  stage.innerHTML = "";

  if (!step) {
    setStackMessage("Press Start to render the stack.");
    panel.querySelector("[data-stack-counter]").textContent = "0 / 0";
    updateStackStats([]);
    updateComplexityPanel(panel, null);
    return;
  }

  const values = step.values;
  if (!values.length) {
    const empty = document.createElement("div");
    empty.className = "stack-empty-state";
    empty.textContent = "empty stack";
    stage.appendChild(empty);
  }

  const topIndex = values.length - 1;
  for (let index = topIndex; index >= 0; index -= 1) {
    const value = values[index];
    const node = document.createElement("div");
    node.className = "stack-viz-node";
    if (index === topIndex) node.classList.add("top-node");
    if (index === step.activeIndex) node.classList.add("active-node");
    if (step.mode === "push" && index === step.activeIndex) node.classList.add("push-node");
    if (step.mode === "pop" && index === step.activeIndex) node.classList.add("pop-node");
    if (step.marker === "min" && index === step.activeIndex) node.classList.add("min-node");
    if (step.marker === "max" && index === step.activeIndex) node.classList.add("max-node");

    node.innerHTML = `<strong>${value}</strong><span>${index === topIndex ? "TOP" : `index ${index}`}</span>`;
    stage.appendChild(node);
  }

  updateStackStats(values);
  panel.querySelector("[data-stack-message]").textContent = step.message;
  panel.querySelector("[data-stack-counter]").textContent = `${stackVizState.index + 1} / ${stackVizState.steps.length}`;
  updateComplexityPanel(panel, step);
}

function updateStackStats(values) {
  const panel = getStackVizPanel();
  if (!panel) return;
  panel.querySelector("[data-stack-top-label]").textContent = `top: ${values.length ? values[values.length - 1] : "-"}`;
  panel.querySelector("[data-stack-size-label]").textContent = `size: ${values.length}`;
  panel.querySelector("[data-stack-min-label]").textContent = `min: ${values.length ? Math.min(...values) : "-"}`;
  panel.querySelector("[data-stack-max-label]").textContent = `max: ${values.length ? Math.max(...values) : "-"}`;
}

function setStackMessage(message) {
  const panel = getStackVizPanel();
  const messageEl = panel?.querySelector("[data-stack-message]");
  if (messageEl) messageEl.textContent = message;
}

function pushStack() {
  const panel = getStackVizPanel();
  if (!panel) return;
  panel.dataset.stackComplexityOperation = "push";

  stopStackVisualization();
  const value = Number(panel.querySelector("[data-stack-value]")?.value);
  if (!Number.isFinite(value)) {
    setStackMessage("Enter an integer value to push.");
    return;
  }

  const values = currentStackValues();
  values.push(value);
  addStackStep(values, `Pushed ${value} onto stack`, {
    activeIndex: values.length - 1,
    mode: "push",
  });
  renderStackVisualization();
}

function popStack() {
  const panel = getStackVizPanel();
  if (panel) panel.dataset.stackComplexityOperation = "pop";
  stopStackVisualization();
  const values = currentStackValues();
  if (!values.length) {
    addStackStep(values, "Stack is empty");
    renderStackVisualization();
    return;
  }

  const topIndex = values.length - 1;
  const removed = values[topIndex];
  addStackStep(values, `Popped top element ${removed}`, {
    activeIndex: topIndex,
    mode: "pop",
  });
  values.pop();
  addStackStep(values, values.length ? `TOP moved to ${values[values.length - 1]}` : "Stack is empty");
  renderStackVisualization();
}

function peekStack() {
  const panel = getStackVizPanel();
  if (panel) panel.dataset.stackComplexityOperation = "peek";
  stopStackVisualization();
  const values = currentStackValues();
  if (!values.length) {
    addStackStep(values, "Stack is empty");
  } else {
    addStackStep(values, `Top element is ${values[values.length - 1]}`, {
      activeIndex: values.length - 1,
      mode: "peek",
    });
  }
  renderStackVisualization();
}

function highlightStackMin() {
  const panel = getStackVizPanel();
  if (panel) panel.dataset.stackComplexityOperation = "min";
  stopStackVisualization();
  const values = currentStackValues();
  if (!values.length) {
    addStackStep(values, "Stack is empty");
  } else {
    const minValue = Math.min(...values);
    addStackStep(values, `Minimum element is ${minValue}`, {
      activeIndex: values.indexOf(minValue),
      marker: "min",
    });
  }
  renderStackVisualization();
}

function highlightStackMax() {
  const panel = getStackVizPanel();
  if (panel) panel.dataset.stackComplexityOperation = "max";
  stopStackVisualization();
  const values = currentStackValues();
  if (!values.length) {
    addStackStep(values, "Stack is empty");
  } else {
    const maxValue = Math.max(...values);
    addStackStep(values, `Maximum element is ${maxValue}`, {
      activeIndex: values.indexOf(maxValue),
      marker: "max",
    });
  }
  renderStackVisualization();
}

function checkStackEmpty() {
  stopStackVisualization();
  const values = currentStackValues();
  addStackStep(values, values.length ? "Stack is not empty" : "Stack is empty");
  renderStackVisualization();
}

function resetStack() {
  stopStackVisualization();
  stackVizState.values = [];
  stackVizState.steps = [];
  stackVizState.index = 0;
  addStackStep([], "Stack reset.");
  renderStackVisualization();
}

function moveStackStep(offset) {
  stopStackVisualization();
  if (!stackVizState.steps.length) return;
  stackVizState.index = Math.min(Math.max(stackVizState.index + offset, 0), stackVizState.steps.length - 1);
  stackVizState.values = currentStackValues();
  renderStackVisualization();
}

function toggleStackPlayback() {
  const panel = getStackVizPanel();
  if (!panel || !stackVizState.steps.length) return;

  stackVizState.playing = !stackVizState.playing;
  panel.querySelector("[data-stack-play]").textContent = stackVizState.playing ? "Pause" : "Play";

  if (!stackVizState.playing) {
    stopStackVisualization();
    return;
  }

  stackVizState.timer = setInterval(() => {
    if (stackVizState.index >= stackVizState.steps.length - 1) {
      stopStackVisualization();
      return;
    }
    stackVizState.index += 1;
    stackVizState.values = currentStackValues();
    renderStackVisualization();
  }, Number(panel.querySelector("[data-stack-speed]").value));
}

function setStackCodeTab(tab) {
  const panel = getStackVizPanel();
  const codeType = tab.dataset.stackCodeTab;
  panel.querySelectorAll("[data-stack-code-tab]").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  panel.querySelector("[data-stack-code]").textContent = stacks["stack-operations"][codeType];
}

(function bindStackVisualization() {
  document.addEventListener("DOMContentLoaded", () => {
    const panel = getStackVizPanel();
    if (!panel) return;

    panel.querySelector("[data-stack-start]").addEventListener("click", startStackVisualization);
    panel.querySelector("[data-stack-push]").addEventListener("click", pushStack);
    panel.querySelector("[data-stack-pop]").addEventListener("click", popStack);
    panel.querySelector("[data-stack-peek]").addEventListener("click", peekStack);
    panel.querySelector("[data-stack-min]").addEventListener("click", highlightStackMin);
    panel.querySelector("[data-stack-max]").addEventListener("click", highlightStackMax);
    panel.querySelector("[data-stack-empty]").addEventListener("click", checkStackEmpty);
    panel.querySelector("[data-stack-reset]").addEventListener("click", resetStack);
    panel.querySelector("[data-stack-prev]").addEventListener("click", () => moveStackStep(-1));
    panel.querySelector("[data-stack-next]").addEventListener("click", () => moveStackStep(1));
    panel.querySelector("[data-stack-play]").addEventListener("click", toggleStackPlayback);
    panel.querySelector("[data-stack-speed]").addEventListener("input", () => {
      if (stackVizState.playing) {
        stopStackVisualization();
        toggleStackPlayback();
      }
    });
    panel.querySelectorAll("[data-stack-code-tab]").forEach((tab) => {
      tab.addEventListener("click", () => setStackCodeTab(tab));
    });

    startStackVisualization();
  });
})();

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

// Queue/stacks rendering is implemented in dedicated panel renderers.
function stopQueuePanel(panel) {
  const state = queueStates.get(panel);
  if (!state) return;
  state.playing = false;
  state.playButton.textContent = "Play";
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}


function renderQueuePanel(panel) {
  const state = queueStates.get(panel);
  const step = state.steps[state.index];

  // Queue rendering (queue + circular queue).
  const container = panel.querySelector("[data-queue-stage]") || state.stage;
  if (container) {
    container.style.minHeight = container.style.minHeight || "140px";
    container.style.background = container.style.background || "rgba(255,0,0,0.1)";
  }

  if (!Array.isArray(state.steps)) state.steps = [];

  if (state.stage?._cqOverlay) {
    state.stage._cqOverlay.remove();
    state.stage._cqOverlay = null;
  }

  const containerStage = state.stage || container;
  if (containerStage) containerStage.innerHTML = "";

  const capacity = state.capacity;
  const buffer = step?.buffer || new Array(capacity).fill(null);

  if (!step) {
    state.message.textContent = "Press Start to generate steps.";
    state.counter.textContent = "0 / 0";
    state.frontLabel.textContent = "front: -";
    state.rearLabel.textContent = "rear: -";
    state.sizeLabel.textContent = "size: -";
    updateComplexityPanel(panel, null);
    return;
  }

  // Determine whether this is a circular queue.
  const isCircular = idToKind(state.id) === "circular";

  // Map logical positions onto physical buffer indices.
  const logicalToPhysical = new Array(capacity).fill(null);

  if (isCircular) {
    for (let logical = 0; logical < step.size; logical++) {
      logicalToPhysical[logical] = (step.front + logical) % capacity;
    }
  } else {
    // linear queue (standard queue panel)
    for (let i = 0; i < capacity; i++) logicalToPhysical[i] = i;
  }

  const activePhysical = Array.isArray(step?.active) ? step.active : [];

  for (let logicalIndex = 0; logicalIndex < capacity; logicalIndex++) {
    const slot = document.createElement("div");
    slot.className = "queue-slot";
    slot.dataset.index = String(logicalIndex);

    const physicalIndex = logicalToPhysical[logicalIndex];
    const value = physicalIndex === null ? null : buffer[physicalIndex];

    if (value !== null && value !== undefined) {
      slot.classList.add("filled");
      slot.textContent = value;
    } else {
      slot.classList.add("empty");
      slot.textContent = "";
    }

    if (physicalIndex !== null && activePhysical.includes(physicalIndex)) {
      slot.classList.add("active");
    }

    const physicalFront = step.front;
    const physicalRear = step.rear;

    if (step.size > 0 && logicalIndex === 0 && physicalIndex === physicalFront) {
      slot.classList.add("front");
    }
    if (step.size > 0 && logicalIndex === step.size - 1 && physicalIndex === physicalRear) {
      slot.classList.add("rear");
    }

    state.stage.appendChild(slot);
  }

  const isEmpty = step.front === -1;
  state.frontLabel.textContent = `front: ${!isEmpty ? step.front : "-"}`;
  state.rearLabel.textContent = `rear: ${!isEmpty ? step.rear : "-"}`;
  state.sizeLabel.textContent = `size: ${step.size ?? "-"}`;
  state.message.textContent = step.message;
  state.counter.textContent = `${state.index + 1} / ${state.steps.length}`;

  // Circular queue dequeue animation
  if (isCircular && step.op === "dequeue" && Array.isArray(step.active) && step.active.length) {
    const removingPhysical = step.active[0];
    const slots = Array.from(state.stage.querySelectorAll(".queue-slot"));
    for (const slot of slots) {
      const logicalIndex = Number(slot.dataset.index);
      const physicalIndex = (step.front + logicalIndex) % capacity;
      if (physicalIndex === removingPhysical) {
        slot.classList.add("cq-front-removing");
        requestAnimationFrame(() => {
          slot.classList.add("cq-front-fadeout");
        });
        break;
      }
    }
  }

  // Circular queue overlay
  if (isCircular && step.size > 0 && step.front !== -1 && step.rear !== -1) {
    drawCircularQueueReturnArrow(state);
  }
  updateComplexityPanel(panel, step);
}



function idToKind(queueId) {
  if (queueId === "circular-queue-operations") return "circular";
  return "linear";
}

function drawCircularQueueReturnArrow(state) {
  const stage = state.stage;
  const step = state.steps[state.index];
  const capacity = state.capacity;

  // Remove old overlay if present
  if (stage._cqOverlay) {
    stage._cqOverlay.remove();
    stage._cqOverlay = null;
  }

  // Make circular queue visually distinct
  stage.classList.add("circular-queue");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.classList.add("queue-cq-svg");

  // ensure positioning context
  stage.style.position = stage.style.position || "relative";

  const vbW = stage.clientWidth;
  const vbH = stage.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);

  const front = step.front;
  const rear = step.rear;
  const shouldWrapAnimate = Boolean(step.wrapAround);

  const slots = Array.from(stage.querySelectorAll(".queue-slot"));
  const slotByLogical = new Map();
  slots.forEach((slot) => {
    const logicalIndex = Number(slot.dataset.index);
    slotByLogical.set(logicalIndex, slot);
  });

  // For a circular queue, logical 0 corresponds to physical front.
  // Rear should correspond to logical step.size-1 (if size>0).
  const frontLogical = 0;
  const rearLogical = Math.max(0, (step.size || 0) - 1);

  const frontSlot = slotByLogical.get(frontLogical);
  const rearSlot = slotByLogical.get(rearLogical);
  if (!frontSlot || !rearSlot) return;

  const stageRect = stage.getBoundingClientRect();
  const frontRect = frontSlot.getBoundingClientRect();
  const rearRect = rearSlot.getBoundingClientRect();

  const frontX = (frontRect.left - stageRect.left) + frontRect.width / 2;
  const frontY = (frontRect.top - stageRect.top) + frontRect.height / 2;
  const rearX = (rearRect.left - stageRect.left) + rearRect.width / 2;
  const rearY = (rearRect.top - stageRect.top) + rearRect.height / 2;

  // Stronger circular arch from REAR -> FRONT
  const dx = frontX - rearX;
  const archHeight = Math.max(70, Math.abs(dx) * 0.35);
  const controlY = Math.min(frontY, rearY) - archHeight;

  const start = { x: rearX, y: rearY - 12 };
  const end = { x: frontX, y: frontY - 12 };
  const mid = { x: (start.x + end.x) / 2, y: controlY };

  const cp1 = { x: (start.x * 0.52 + mid.x * 0.48), y: mid.y };
  const cp2 = { x: (end.x * 0.52 + mid.x * 0.48), y: mid.y };

  const d = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  // arrowhead (toward FRONT)
  const markerId = `cqArrow-${Math.random().toString(16).slice(2)}`;
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", markerId);
  marker.setAttribute("markerWidth", "14");
  marker.setAttribute("markerHeight", "14");
  marker.setAttribute("refX", "10");
  marker.setAttribute("refY", "7");
  marker.setAttribute("orient", "auto");
  const markerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  markerPath.setAttribute("d", "M 0 0 L 14 7 L 0 14 Z");
  markerPath.setAttribute("fill", "rgba(47,111,237,0.95)");
  marker.appendChild(markerPath);
  defs.appendChild(marker);

  svg.appendChild(defs);

  const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrowPath.setAttribute("d", d);
  arrowPath.setAttribute("fill", "none");
  arrowPath.setAttribute("class", "cq-path cq-dash");
  arrowPath.setAttribute("marker-end", `url(#${markerId})`);

  // traversal glow + dash animation via CSS class switch
  if (shouldWrapAnimate) {
    svg.classList.add("animate");
    stage.querySelectorAll(".queue-slot").forEach((s) => s.classList.remove("circular-slot-glow"));
    // Highlight the slot that will become the *front* after wrap.
    // This keeps the REAR->FRONT arrow semantics consistent during circular indexing.
    const wrapTargetPhysical = (step.rear + 1) % capacity;
    stage.querySelectorAll(".queue-slot").forEach((slot) => {
      const logicalIndex = Number(slot.dataset.index);
      const physical = (step.front + logicalIndex) % capacity;
      if (physical === wrapTargetPhysical) slot.classList.add("circular-slot-glow");
    });
  }

  svg.appendChild(arrowPath);

  // Circular label "rear.next -> front" centered above the arch
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("class", "cq-loop-label");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.textContent = "rear.next -> front";

  const labelLift = 30;
  const labelX = mid.x;
  const minY = 16;
  const nodeTopY = Math.min(frontRect.top - stageRect.top, rearRect.top - stageRect.top);
  let labelY = mid.y - labelLift;
  labelY = Math.max(labelY, minY);
  labelY = Math.min(labelY, nodeTopY - 30);

  text.setAttribute("x", String(labelX));
  text.setAttribute("y", String(labelY));
  svg.appendChild(text);

  // Also animate pointer transition by briefly emphasizing rear slot.
  if (shouldWrapAnimate) {
    rearSlot.classList.add("circular-slot-glow");
    setTimeout(() => rearSlot.classList.remove("circular-slot-glow"), 900);
  }

  stage.appendChild(svg);
  stage._cqOverlay = svg;
}




// ===== Deque simple module =====
const dequeState = {
  values: [],
  capacity: 0,
};

function getDequePanel() {
  return document.querySelector("[data-deque-panel]");
}

function parseDequeValues(input) {
  return (input?.value || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
}

function startDequeVisualization() {
  const panel = getDequePanel();
  if (!panel) return;

  const valuesInput = panel.querySelector("[data-deque-values]");
  const capacityInput = panel.querySelector("[data-deque-capacity]");
  const values = parseDequeValues(valuesInput);

  if (!values.length || values.some(Number.isNaN)) {
    setDequeMessage("Enter comma-separated integer values.");
    return;
  }

  let capacity = Number.parseInt(capacityInput?.value, 10);
  if (!Number.isFinite(capacity) || capacity < 1) capacity = values.length || 1;
  capacity = Math.min(capacity, 18);

  dequeState.values = values.slice(0, capacity);
  dequeState.capacity = capacity;
  panel.dataset.dequeComplexityOperation = "start";

  renderDeque();
  setDequeMessage("Deque rendered.");
}

function renderDeque() {
  const container = document.getElementById("deque-visualization");
  if (!container) return;
  const panel = getDequePanel();

  container.innerHTML = "";
  container.classList.toggle("is-empty", dequeState.values.length === 0);

  const left = document.createElement("div");
  left.className = "deque-end-label";
  left.textContent = "FRONT ->";
  container.appendChild(left);

  dequeState.values.forEach((value) => {
    const node = document.createElement("div");
    node.className = "deque-node";
    node.textContent = String(value);
    container.appendChild(node);
  });

  const right = document.createElement("div");
  right.className = "deque-end-label deque-end-label-rear";
  right.textContent = "<- REAR";
  container.appendChild(right);

  setDequeEndpoints();
  updateComplexityPanel(panel, null);
}

function insertFront() {
  const panel = getDequePanel();
  if (!panel) return;

  const value = Number(panel.querySelector("[data-deque-op-value]")?.value);
  if (!Number.isFinite(value)) {
    setDequeMessage("Enter an operation value.");
    return;
  }

  if (dequeState.values.length >= dequeState.capacity) {
    setDequeMessage("Deque is full.");
    return;
  }

  panel.dataset.dequeComplexityOperation = "insert-front";
  dequeState.values.unshift(value);
  renderDeque();
  setDequeMessage(`Inserted ${value} at front.`);
}

function insertRear() {
  const panel = getDequePanel();
  if (!panel) return;

  const value = Number(panel.querySelector("[data-deque-op-value]")?.value);
  if (!Number.isFinite(value)) {
    setDequeMessage("Enter an operation value.");
    return;
  }

  if (dequeState.values.length >= dequeState.capacity) {
    setDequeMessage("Deque is full.");
    return;
  }

  panel.dataset.dequeComplexityOperation = "insert-rear";
  dequeState.values.push(value);
  renderDeque();
  setDequeMessage(`Inserted ${value} at rear.`);
}

function deleteFront() {
  const panel = getDequePanel();
  if (panel) panel.dataset.dequeComplexityOperation = "delete-front";
  if (!dequeState.values.length) {
    setDequeMessage("Deque is empty.");
    updateComplexityPanel(panel, null);
    return;
  }
  const removed = dequeState.values.shift();
  renderDeque();
  setDequeMessage(`Deleted ${removed} from front.`);
}

function deleteRear() {
  const panel = getDequePanel();
  if (panel) panel.dataset.dequeComplexityOperation = "delete-rear";
  if (!dequeState.values.length) {
    setDequeMessage("Deque is empty.");
    updateComplexityPanel(panel, null);
    return;
  }
  const removed = dequeState.values.pop();
  renderDeque();
  setDequeMessage(`Deleted ${removed} from rear.`);
}

function setDequeEndpoints() {
  const panel = getDequePanel();
  if (!panel) return;

  const size = dequeState.values.length;
  const front = size ? dequeState.values[0] : "-";
  const rear = size ? dequeState.values[size - 1] : "-";
  panel.querySelector("[data-deque-front]").textContent = `FRONT ${front}`;
  panel.querySelector("[data-deque-rear]").textContent = `REAR ${rear}`;
}

function setDequeMessage(text) {
  const panel = getDequePanel();
  const status = panel?.querySelector("[data-deque-status]");
  if (status) status.textContent = text;
}

(function bindDequeControls() {
  document.addEventListener("DOMContentLoaded", () => {
    const panel = getDequePanel();
    if (!panel) return;

    panel.querySelector("[data-deque-start]").addEventListener("click", startDequeVisualization);
    panel.querySelector("[data-deque-insert-front]").addEventListener("click", insertFront);
    panel.querySelector("[data-deque-insert-rear]").addEventListener("click", insertRear);
    panel.querySelector("[data-deque-delete-front]").addEventListener("click", deleteFront);
    panel.querySelector("[data-deque-delete-rear]").addEventListener("click", deleteRear);

    startDequeVisualization();
  });
})();


async function startQueuePanel(panel) {
  const state = queueStates.get(panel);
  stopQueuePanel(panel);

  const values = parseValues(state.valuesInput);
  if (!values.length || values.some(Number.isNaN)) {
    state.message.textContent = "Enter comma-separated integer values.";
    return;
  }

  let capacity = state.capacityInput ? parseInt(state.capacityInput.value, 10) : state.capacity;

  if (Number.isNaN(capacity) || capacity < 2) capacity = state.capacity || 10;
  state.capacity = capacity;

  const payload = {
    values,
    capacity: capacity,
  };

  try {
    const response = await fetch(`/api/${state.apiBase}/${state.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      state.message.textContent = data.error || "Unable to generate visualization.";
      state.steps = [];
      state.index = 0;
      renderQueuePanel(panel);
      return;
    }

    state.steps = Array.isArray(data?.steps) ? data.steps : [];
    state.index = 0;
    state.capacity = data.capacity ?? capacity;

    if (!state.steps.length) {
      state.message.textContent = "No animation steps generated.";
    }

    renderQueuePanel(panel);
  } catch (e) {
    console.error("[DSA] startQueuePanel fetch error", e);
    state.message.textContent = "Network/Server error while generating queue steps.";
    state.steps = [];
    state.index = 0;
    renderQueuePanel(panel);
  }
}



function moveQueuePanel(panel, offset) {
  const state = queueStates.get(panel);
  stopQueuePanel(panel);
  if (!state.steps.length) return;
  state.index = Math.min(Math.max(state.index + offset, 0), state.steps.length - 1);
  renderQueuePanel(panel);
}

function toggleQueuePanel(panel) {
  const state = queueStates.get(panel);
  if (!state.steps.length) return;
  state.playing = !state.playing;
  state.playButton.textContent = state.playing ? "Pause" : "Play";

  if (!state.playing) {
    stopQueuePanel(panel);
    return;
  }

  state.timer = setInterval(() => {
    if (state.index >= state.steps.length - 1) {
      stopQueuePanel(panel);
      return;
    }
    state.index += 1;
    renderQueuePanel(panel);
  }, Number(state.speedInput.value));
}

function setQueueCodeTab(panel, tab) {
  const state = queueStates.get(panel);
  const codeType = tab.dataset.codeTab;
  tab.parentElement.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");

  const dataForQueue = queues[state.id];
  if (dataForQueue && dataForQueue[codeType]) {
    state.code.textContent = dataForQueue[codeType];
  }

}

// Queue panels
// queue-operations, circular-queue-operations

document.querySelectorAll("[data-queue-panel]").forEach((panel) => {
  const id = panel.dataset.queue;
  const kind = panel.dataset.queueKind || "queue"; // optional

  let apiBase = "queue";

  const state = {
    id,
    kind: kind,
    apiBase: apiBase,

    capacity: 8,
    steps: [],
    index: 0,
    playing: false,
    timer: null,
    valuesInput: panel.querySelector("[data-values]"),
    capacityInput: panel.querySelector("[data-capacity]"),
    speedInput: panel.querySelector("[data-speed]"),
    playButton: panel.querySelector("[data-play]"),
    stage: panel.querySelector("[data-queue-stage]"),
    message: panel.querySelector("[data-message]"),
    counter: panel.querySelector("[data-counter]"),
    frontLabel: panel.querySelector("[data-queue-front]"),
    rearLabel: panel.querySelector("[data-queue-rear]"),
    sizeLabel: panel.querySelector("[data-queue-size]"),
    code: panel.querySelector("[data-code]"),
  };

  queueStates.set(panel, state);

  panel.querySelector("[data-start]").addEventListener("click", () => startQueuePanel(panel));
  panel.querySelector("[data-prev]").addEventListener("click", () => moveQueuePanel(panel, -1));
  panel.querySelector("[data-next]").addEventListener("click", () => moveQueuePanel(panel, 1));
  state.playButton.addEventListener("click", () => toggleQueuePanel(panel));
  state.speedInput.addEventListener("input", () => {
    if (state.playing) {
      stopQueuePanel(panel);
      toggleQueuePanel(panel);
    }
  });

  panel.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setQueueCodeTab(panel, tab));
  });

  renderQueuePanel(panel);
});

const recursionStates = new Map();

const recursionCode = {
  factorial: {
    pseudocode: `factorial(n):
  if n <= 1:
    return 1
  return n * factorial(n - 1)`,
    python: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    java: `static int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
  },
  fibonacci: {
    pseudocode: `fib(n):
  if n <= 1:
    return n
  left = fib(n - 1)
  right = fib(n - 2)
  return left + right`,
    python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    java: `static int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`,
  },
  "sum-n": {
    pseudocode: `sum(n):
  if n == 0:
    return 0
  return n + sum(n - 1)`,
    python: `def sum_n(n):
    if n == 0:
        return 0
    return n + sum_n(n - 1)`,
    java: `static int sumN(int n) {
    if (n == 0) return 0;
    return n + sumN(n - 1);
}`,
  },
  "binary-search": {
    pseudocode: `binarySearch(a, low, high, target):
  if low > high:
    return -1
  mid = (low + high) / 2
  if a[mid] == target:
    return mid
  if target < a[mid]:
    return binarySearch(a, low, mid - 1, target)
  return binarySearch(a, mid + 1, high, target)`,
    python: `def binary_search(a, low, high, target):
    if low > high:
        return -1
    mid = (low + high) // 2
    if a[mid] == target:
        return mid
    if target < a[mid]:
        return binary_search(a, low, mid - 1, target)
    return binary_search(a, mid + 1, high, target)`,
    java: `static int binarySearch(int[] a, int low, int high, int target) {
    if (low > high) return -1;
    int mid = (low + high) / 2;
    if (a[mid] == target) return mid;
    if (target < a[mid]) return binarySearch(a, low, mid - 1, target);
    return binarySearch(a, mid + 1, high, target);
}`,
  },
  hanoi: {
    pseudocode: `hanoi(n, from, aux, to):
  if n == 1:
    move disk from -> to
    return
  hanoi(n - 1, from, to, aux)
  move disk from -> to
  hanoi(n - 1, aux, from, to)`,
    python: `def hanoi(n, source, auxiliary, target):
    if n == 1:
        move(source, target)
        return
    hanoi(n - 1, source, target, auxiliary)
    move(source, target)
    hanoi(n - 1, auxiliary, source, target)`,
    java: `static void hanoi(int n, char from, char aux, char to) {
    if (n == 1) {
        move(from, to);
        return;
    }
    hanoi(n - 1, from, to, aux);
    move(from, to);
    hanoi(n - 1, aux, from, to);
}`,
  },
  "linked-traversal": {
    pseudocode: `traverse(node):
  if node == NULL:
    return
  visit node
  traverse(node.next)
  return from node`,
    python: `def traverse(node):
    if node is None:
        return
    print(node.value)
    traverse(node.next)
    return`,
    java: `static void traverse(Node node) {
    if (node == null) return;
    System.out.println(node.value);
    traverse(node.next);
}`,
  },
  "recursion-tree": {
    pseudocode: `solve(depth):
  if depth == 0:
    return 1
  left = solve(depth - 1)
  right = solve(depth - 1)
  return left + right + 1`,
    python: `def solve(depth):
    if depth == 0:
        return 1
    return solve(depth - 1) + solve(depth - 1) + 1`,
    java: `static int solve(int depth) {
    if (depth == 0) return 1;
    return solve(depth - 1) + solve(depth - 1) + 1;
}`,
  },
};

function clampInt(value, fallback, min, max) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function copyFrames(frames) {
  return frames.map((frame) => ({ ...frame }));
}

function copyNodes(nodes) {
  return nodes.map((node) => ({ ...node }));
}

function copyEdges(edges) {
  return edges.map((edge) => ({ ...edge }));
}

function copyRods(rods) {
  return {
    A: [...(rods.A || [])],
    B: [...(rods.B || [])],
    C: [...(rods.C || [])],
  };
}

function makeFrame(id, label, params, depth, detail = {}) {
  const functionName = label.split("(")[0];
  return {
    id,
    label,
    params,
    functionName,
    paramValue: detail.paramValue ?? params,
    depth,
    returnValue: detail.returnValue ?? "-",
  };
}

function makeRecursionStep(message, frames, extra = {}) {
  const activeFrame = frames[frames.length - 1];
  const phase = extra.phase || (extra.base ? "base" : extra.returnValue !== undefined ? "return" : "push");
  const defaultInsight = {
    push: "A recursive call is pushed onto the call stack; the caller waits until it returns.",
    base: "The base condition prevents infinite recursion by stopping deeper calls.",
    return: "The active stack frame returns a value, pops away, and control goes back to its caller.",
    work: "The active frame is executing its own logic before choosing the next recursive call.",
  };
  const defaultExplanation = {
    push: "A new stack frame is created for this recursive call. Frames grow downward as calls get deeper.",
    base: "Base condition reached — recursion stops here. Without a base condition, recursion never ends.",
    return: "The function now returns a value. The stack frame pops upward, and the waiting caller continues.",
    work: "The current frame is doing a comparison or move before recursion continues.",
  };
  const visibleFrames = copyFrames(frames).map((frame) => {
    if (frame.id !== (extra.activeId || activeFrame?.id)) return frame;
    return {
      ...frame,
      returnValue: extra.returnValue ?? frame.returnValue ?? "-",
      motion: phase,
    };
  });
  return {
    message,
    stack: visibleFrames,
    activeCall: extra.activeCall || activeFrame?.label || "-",
    activeId: extra.activeId || activeFrame?.id || null,
    depth: frames.length,
    returnValue: extra.returnValue ?? "-",
    base: Boolean(extra.base),
    phase,
    codeFocus: extra.codeFocus || phase,
    insight: extra.insight || defaultInsight[phase],
    explanation: extra.explanation || defaultExplanation[phase] || message,
    nodes: copyNodes(extra.nodes || []),
    edges: copyEdges(extra.edges || []),
    stage: extra.stage || null,
  };
}

function generateLinearRecursion(kind, rawInput) {
  const isFactorial = kind === "factorial";
  const isSum = kind === "sum-n";
  const n = clampInt(rawInput, isFactorial ? 4 : 5, isFactorial ? 1 : 0, 8);
  const name = isFactorial ? "factorial" : "sum";
  const base = isFactorial ? 1 : 0;
  const steps = [];
  const frames = [];
  const nodes = [];
  const edges = [];
  const returns = {};
  let parent = null;

  // Phase 1: Build the call stack (recursive calls going down)
  for (let value = n; value >= base; value -= 1) {
    const id = `${name}-${value}`;
    const label = `${name}(${value})`;
    frames.push(makeFrame(id, label, `n = ${value}`, frames.length, { paramValue: value }));
    nodes.push({ id, label, depth: n - value, state: value === base ? "base" : "active" });
    if (parent) edges.push({ from: parent, to: id });
    parent = id;

    const explanation = value === base
      ? `Base condition reached! ${label} doesn't call itself again.`
      : `Pushing ${label} onto the call stack. Recursion continues with smaller n.`;

    const insight = value === base
      ? "This is the base condition - recursion stops here!"
      : "Each recursive call creates a new stack frame that waits for its child to return.";

    steps.push(makeRecursionStep(`Calling ${label}`, frames, {
      activeId: id,
      phase: "push",
      nodes,
      edges,
      insight,
      explanation,
      codeFocus: value === base ? "base" : "recursive",
      stage: { type: "expression", name, n, current: value, base, returns: { ...returns } },
    }));

    if (value === base) {
      const baseReturn = isFactorial ? 1 : 0;
      returns[value] = baseReturn;
      steps.push(makeRecursionStep("🎯 Base condition reached — recursion stops here!", frames, {
        activeId: id,
        base: true,
        returnValue: baseReturn,
        nodes: nodes.map((node) => node.id === id ? { ...node, state: "base" } : node),
        edges,
        codeFocus: "base",
        insight: "Without this base condition, the function would keep calling itself forever!",
        explanation: `Base condition: ${name}(${value}) returns ${baseReturn} directly.`,
        stage: { type: "expression", name, n, current: value, base, returns: { ...returns } },
      }));
    }
  }

  // Phase 2: Return phase (values coming back up the stack)
  for (let value = base; value <= n; value += 1) {
    const id = `${name}-${value}`;
    const result = isFactorial
      ? (value <= 1 ? 1 : value * returns[value - 1])
      : value + (returns[value - 1] ?? 0);
    returns[value] = result;

    const visible = frames.slice(0, value === base ? frames.length : n - value + 1);

    const explanation = value === base
      ? `Returning ${result} from base case.`
      : isFactorial
        ? `Returning ${result}: ${value} × ${returns[value - 1]} = ${result}`
        : `Returning ${result}: ${value} + ${returns[value - 1] ?? 0} = ${result}`;

    steps.push(makeRecursionStep(`↩️ ${explanation}`, visible, {
      activeId: id,
      returnValue: result,
      nodes: nodes.map((node) => node.id === id ? { ...node, state: "returned" } : node),
      edges,
      insight: "Values are calculated and returned back up the call stack.",
      explanation: `Stack frame for ${name}(${value}) is popped. The result bubbles up to the parent call.`,
      stage: { type: "expression", name, n, current: value, base, returns: { ...returns }, result },
    }));
  }

  return steps;
}

function generateFibonacci(rawInput) {
  const n = clampInt(rawInput, 5, 0, 6);
  const steps = [];
  const nodes = [];
  const edges = [];
  const counts = {};
  let idCounter = 0;

  function walk(value, parentId, frames, depth) {
    const id = `fib-${idCounter++}`;
    const label = `fib(${value})`;
    counts[label] = (counts[label] || 0) + 1;
    nodes.push({ id, label, depth, state: counts[label] > 1 ? "repeated" : "active", sub: counts[label] > 1 ? "again" : "" });
    if (parentId) edges.push({ from: parentId, to: id });

    const nextFrames = [...frames, makeFrame(id, label, `n = ${value}`, frames.length, { paramValue: value })];

    const explanation = counts[label] > 1
      ? `Calling ${label} again! This creates the branching tree structure.`
      : `Calling ${label}. Fibonacci creates TWO recursive calls for each non-base case.`;

    const insight = counts[label] > 1
      ? "This same call was made before - that's why Fibonacci is inefficient!"
      : "Unlike factorial, Fibonacci branches into TWO recursive calls, creating an exponential tree.";

    steps.push(makeRecursionStep(`🌳 ${explanation}`, nextFrames, {
      activeId: id,
      nodes,
      edges,
      insight,
      explanation: `Pushing ${label} onto the call stack. Fibonacci needs fib(n-1) AND fib(n-2).`,
      stage: { type: "fib", current: label, repeated: counts[label] > 1 },
    }));

    if (value <= 1) {
      nodes.find((node) => node.id === id).state = "base";
      steps.push(makeRecursionStep("🎯 Base condition reached — recursion stops here!", nextFrames, {
        activeId: id,
        base: true,
        returnValue: value,
        nodes,
        edges,
        codeFocus: "base",
        insight: "Fibonacci base cases (0, 1) don't call themselves - they return directly.",
        explanation: `Base condition: fib(${value}) returns ${value} directly.`,
        stage: { type: "fib", current: label, result: value },
      }));
      nodes.find((node) => node.id === id).state = "returned";
      return value;
    }

    // First recursive call: fib(n-1)
    steps.push(makeRecursionStep(`📍 First branch: calling fib(${value - 1})`, nextFrames, {
      activeId: id,
      nodes,
      edges,
      insight: "Fibonacci makes TWO separate recursive calls.",
      explanation: `First recursive call: fib(${value}) needs fib(${value - 1}).`,
      stage: { type: "fib", current: label, branch: "left" },
    }));

    const left = walk(value - 1, id, nextFrames, depth + 1);

    // Second recursive call: fib(n-2)
    steps.push(makeRecursionStep(`📍 Second branch: calling fib(${value - 2})`, nextFrames, {
      activeId: id,
      nodes,
      edges,
      insight: "Now making the second recursive call.",
      explanation: `Second recursive call: fib(${value}) also needs fib(${value - 2}).`,
      stage: { type: "fib", current: label, branch: "right" },
    }));

    const right = walk(value - 2, id, nextFrames, depth + 1);

    const result = left + right;
    nodes.find((node) => node.id === id).state = "returned";

    steps.push(makeRecursionStep(`↩️ Returning ${result}: fib(${value - 1}) + fib(${value - 2}) = ${left} + ${right}`, nextFrames, {
      activeId: id,
      returnValue: result,
      nodes,
      edges,
      insight: "Fibonacci combines results from both branches.",
      explanation: `Stack frame popped. fib(${value}) = ${left} + ${right} = ${result}`,
      stage: { type: "fib", current: label, left, right, result },
    }));
    return result;
  }

  walk(n, null, [], 0);
  return steps;
}

function generateBinarySearch(rawInput) {
  const target = clampInt(rawInput, 23, -99, 999);
  const values = [2, 5, 8, 12, 16, 23, 38, 56, 72];
  const steps = [];
  const frames = [];
  const nodes = [];
  const edges = [];
  let idCounter = 0;

  function search(low, high, parentId) {
    const id = `bs-${idCounter++}`;
    const label = `bs(${low}, ${high})`;
    frames.push(makeFrame(id, label, `low=${low}, high=${high}`, frames.length, { paramValue: `target ${target}` }));
    nodes.push({ id, label, depth: frames.length - 1, state: "active" });
    if (parentId) edges.push({ from: parentId, to: id });

    if (low > high) {
      nodes.find((node) => node.id === id).state = "base";
      steps.push(makeRecursionStep("Base condition reached — recursion stops here. low > high, so target is not found.", frames, {
        activeId: id,
        base: true,
        returnValue: -1,
        nodes,
        edges,
        codeFocus: "base",
        insight: "Binary search stops when there is no valid search range left.",
        explanation: "Base condition reached — recursion stops here because LOW crossed HIGH.",
        stage: { type: "binary", values, low, high, mid: -1, target },
      }));
      frames.pop();
      return -1;
    }

    const mid = Math.floor((low + high) / 2);
    steps.push(makeRecursionStep(`Checking LOW=${low}, MID=${mid}, HIGH=${high}.`, frames, {
      activeId: id,
      nodes,
      edges,
      phase: "work",
      codeFocus: "work",
      insight: "This frame compares the target with MID before deciding which smaller range to call.",
      explanation: `The active frame checks index ${mid}. Only one half of the array will become the next recursive call.`,
      stage: { type: "binary", values, low, high, mid, target },
    }));

    if (values[mid] === target) {
      nodes.find((node) => node.id === id).state = "returned";
      steps.push(makeRecursionStep(`Found ${target} at index ${mid}. Returning value ${mid}.`, frames, {
        activeId: id,
        returnValue: mid,
        nodes,
        edges,
        stage: { type: "binary", values, low, high, mid, target, found: mid },
      }));
      frames.pop();
      return mid;
    }

    const next = target < values[mid]
      ? search(low, mid - 1, id)
      : search(mid + 1, high, id);
    nodes.find((node) => node.id === id).state = "returned";
    steps.push(makeRecursionStep(`Returning value ${next}. Popping stack frame.`, frames, {
      activeId: id,
      returnValue: next,
      nodes,
      edges,
      stage: { type: "binary", values, low, high, mid, target, found: next >= 0 ? next : null },
    }));
    frames.pop();
    return next;
  }

  search(0, values.length - 1, null);
  return steps;
}

function generateHanoi(rawInput) {
  const disks = clampInt(rawInput, 3, 1, 4);
  const rods = { A: [], B: [], C: [] };
  for (let disk = disks; disk >= 1; disk -= 1) rods.A.push(disk);
  const steps = [];
  const nodes = [];
  const edges = [];
  let idCounter = 0;

  function hanoi(n, from, aux, to, frames, parentId) {
    const id = `hanoi-${idCounter++}`;
    const label = `hanoi(${n}, ${from}->${to})`;
    const nextFrames = [...frames, makeFrame(id, label, `from=${from}, aux=${aux}, to=${to}`, frames.length, { paramValue: `${n} disk${n === 1 ? "" : "s"}` })];
    nodes.push({ id, label, depth: nextFrames.length - 1, state: n === 1 ? "base" : "active" });
    if (parentId) edges.push({ from: parentId, to: id });
    steps.push(makeRecursionStep(`Calling ${label}`, nextFrames, {
      activeId: id,
      phase: "push",
      nodes,
      edges,
      insight: `A new Hanoi subproblem is pushed: move ${n} disk${n === 1 ? "" : "s"} from ${from} to ${to}.`,
      explanation: `${label} is pushed onto the call stack. Larger disk moves wait until smaller subproblems finish.`,
      stage: { type: "hanoi", rods: copyRods(rods), moving: null },
    }));

    if (n === 1) {
      const disk = rods[from].pop();
      rods[to].push(disk);
      nodes.find((node) => node.id === id).state = "returned";
      steps.push(makeRecursionStep(`Base condition reached — recursion stops here. Move disk ${disk} from ${from} to ${to}.`, nextFrames, {
        activeId: id,
        returnValue: `disk ${disk}`,
        nodes,
        edges,
        codeFocus: "base",
        insight: "For one disk, no smaller subproblem is needed; just move it.",
        explanation: "Base condition reached — recursion stops here for this one-disk problem.",
        stage: { type: "hanoi", rods: copyRods(rods), moving: disk },
      }));
      return;
    }

    hanoi(n - 1, from, to, aux, nextFrames, id);
    const disk = rods[from].pop();
    rods[to].push(disk);
    steps.push(makeRecursionStep(`Move largest disk ${disk} from ${from} to ${to}.`, nextFrames, {
      activeId: id,
      returnValue: `disk ${disk}`,
      nodes,
      edges,
      stage: { type: "hanoi", rods: copyRods(rods), moving: disk },
    }));
    hanoi(n - 1, aux, from, to, nextFrames, id);
    nodes.find((node) => node.id === id).state = "returned";
    steps.push(makeRecursionStep(`Subproblem ${label} complete. Returning.`, nextFrames, {
      activeId: id,
      returnValue: "done",
      nodes,
      edges,
      stage: { type: "hanoi", rods: copyRods(rods), moving: null },
    }));
  }

  hanoi(disks, "A", "B", "C", [], null);
  return steps;
}

function generateLinkedTraversal(rawInput) {
  const values = rawInput.split(",").map((item) => item.trim()).filter(Boolean).map(Number).filter((item) => !Number.isNaN(item)).slice(0, 7);
  const listValues = values.length ? values : [10, 20, 30, 40];
  const steps = [];
  const frames = [];
  const nodes = [];
  const edges = [];

  listValues.forEach((value, index) => {
    const id = `node-${index}`;
    const label = `traverse(${value})`;
    frames.push(makeFrame(id, label, `node.value = ${value}`, frames.length, { paramValue: value }));
    nodes.push({ id, label, depth: index, state: "active" });
    if (index > 0) edges.push({ from: `node-${index - 1}`, to: id });
    steps.push(makeRecursionStep(`Calling traverse on node ${value}.`, frames, {
      activeId: id,
      nodes,
      edges,
      insight: `The traversal frame for node ${value} waits while traverse(node.next) runs.`,
      explanation: `traverse(${value}) is pushed onto the stack, then recursion moves to the next node.`,
      stage: { type: "linked", values: listValues, active: index, returned: [] },
    }));
  });

  const nullId = "node-null";
  frames.push(makeFrame(nullId, "traverse(NULL)", "node = NULL", frames.length, { paramValue: "NULL" }));
  nodes.push({ id: nullId, label: "NULL", depth: listValues.length, state: "base" });
  edges.push({ from: `node-${listValues.length - 1}`, to: nullId });
  steps.push(makeRecursionStep("Base condition reached — recursion stops here. node is NULL.", frames, {
    activeId: nullId,
    base: true,
    returnValue: "stop",
    nodes,
    edges,
    codeFocus: "base",
    insight: "NULL marks the end of the linked list, so traversal must stop.",
    explanation: "Base condition reached — recursion stops here because there is no next node.",
    stage: { type: "linked", values: listValues, active: listValues.length, returned: [] },
  }));

  const returned = [];
  for (let index = listValues.length - 1; index >= 0; index -= 1) {
    returned.push(index);
    nodes.find((node) => node.id === `node-${index}`).state = "returned";
    steps.push(makeRecursionStep(`Returning from node ${listValues[index]}. Popping stack frame.`, frames.slice(0, index + 1), {
      activeId: `node-${index}`,
      returnValue: listValues[index],
      nodes,
      edges,
      stage: { type: "linked", values: listValues, active: index, returned: [...returned] },
    }));
  }

  return steps;
}

function generateRecursionTree(rawInput) {
  const depthLimit = clampInt(rawInput, 3, 1, 4);
  const steps = [];
  const nodes = [];
  const edges = [];
  let idCounter = 0;

  function solve(depth, parentId, frames) {
    const id = `tree-${idCounter++}`;
    const label = `solve(${depth})`;
    const nextFrames = [...frames, makeFrame(id, label, `depth = ${depth}`, frames.length, { paramValue: depth })];
    nodes.push({ id, label, depth: depthLimit - depth, state: depth === 0 ? "base" : "active" });
    if (parentId) edges.push({ from: parentId, to: id });
    steps.push(makeRecursionStep(`Calling ${label}`, nextFrames, {
      activeId: id,
      phase: "push",
      nodes,
      edges,
      insight: `A tree node is created for ${label}; child calls are stacked below it.`,
      explanation: `${label} is pushed onto the call stack and expands into smaller depth calls until depth becomes 0.`,
      stage: { type: "expression", name: "solve", n: depthLimit, current: depth, base: 0, returns: {} },
    }));

    if (depth === 0) {
      nodes.find((node) => node.id === id).state = "returned";
      steps.push(makeRecursionStep("Base condition reached — recursion stops here. Returning value 1.", nextFrames, {
        activeId: id,
        base: true,
        returnValue: 1,
        nodes,
        edges,
        codeFocus: "base",
        insight: "Leaves are the stopping points of this recursion tree.",
        explanation: "Base condition reached — recursion stops here at a leaf.",
        stage: { type: "tree-summary", text: "Leaf returns 1 to its parent." },
      }));
      return 1;
    }

    const left = solve(depth - 1, id, nextFrames);
    const right = solve(depth - 1, id, nextFrames);
    const result = left + right + 1;
    nodes.find((node) => node.id === id).state = "returned";
    steps.push(makeRecursionStep(`Returning value ${result}. Collapse children into parent.`, nextFrames, {
      activeId: id,
      returnValue: result,
      nodes,
      edges,
      stage: { type: "tree-summary", text: `${label} returns ${left} + ${right} + 1 = ${result}.` },
    }));
    return result;
  }

  solve(depthLimit, null, []);
  return steps;
}

function generateRecursionSteps(kind, inputValue) {
  if (kind === "factorial" || kind === "sum-n") return generateLinearRecursion(kind, inputValue);
  if (kind === "fibonacci") return generateFibonacci(inputValue);
  if (kind === "binary-search") return generateBinarySearch(inputValue);
  if (kind === "hanoi") return generateHanoi(inputValue);
  if (kind === "linked-traversal") return generateLinkedTraversal(inputValue);
  return generateRecursionTree(inputValue);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function lineMatchesFocus(kind, line, focus) {
  const text = line.trim();
  if (!text) return false;

  if (focus === "base") {
    return text.startsWith("if ") || text.includes("if (") || text.includes("node is None") || text.includes("node == null");
  }

  if (focus === "return") {
    return text.startsWith("return") || text.includes(" return ") || text.includes("return;") || text.includes("move(");
  }

  if (focus === "work") {
    return text.includes("mid") || text.includes("visit") || text.includes("print") || text.includes("move(");
  }

  if (focus === "push") {
    const recursiveNames = {
      factorial: ["factorial("],
      fibonacci: ["fib("],
      "sum-n": ["sum"],
      "binary-search": ["binarysearch", "binary_search"],
      hanoi: ["hanoi("],
      "linked-traversal": ["traverse("],
      "recursion-tree": ["solve("],
    };
    const needles = recursiveNames[kind] || [];
    return needles.some((needle) => text.toLowerCase().includes(needle))
      && !text.startsWith("def ")
      && !text.startsWith("static ")
      && !text.endsWith(":");
  }

  return false;
}

function renderRecursionCode(state, step) {
  const source = recursionCode[state.kind][state.codeType || "pseudocode"] || "";
  const focus = step?.codeFocus || "push";
  state.code.innerHTML = source
    .split("\n")
    .map((line) => {
      const classes = ["code-line"];
      if (lineMatchesFocus(state.kind, line, focus)) {
        classes.push("active-line", focus === "push" ? "recursive-line" : `${focus}-line`);
      }
      if (focus === "base" && line.trim().startsWith("return")) classes.push("return-line");
      return `<span class="${classes.join(" ")}">${escapeHtml(line) || " "}</span>`;
    })
    .join("");
}

function renderRecursionStack(state, step) {
  state.stack.innerHTML = "";
  const stack = step?.stack || [];
  if (!stack.length) {
    state.stack.innerHTML = '<div class="empty-stack">No active calls</div>';
    return;
  }

  stack.forEach((frame) => {
    const item = document.createElement("div");
    item.className = "call-frame";
    if (frame.motion === "push") item.classList.add("pushing");
    if (frame.id === step.activeId) item.classList.add(step.base ? "base" : "active");
    if (step.phase === "return" && frame.id === step.activeId) item.classList.add("returning");
    const motionText = frame.motion === "return"
      ? "POP upward: this frame is returning"
      : frame.motion === "base"
        ? "BASE: no more recursive calls"
        : frame.motion === "work"
          ? "EXECUTE: decide the next smaller problem"
          : "PUSH downward: new call frame";
    item.innerHTML = `
      <div class="call-frame-header">
        <strong>${escapeHtml(frame.functionName || frame.label)}</strong>
        <span class="call-depth">depth ${frame.depth ?? 0}</span>
      </div>
      <dl>
        <dt>param</dt><dd>${escapeHtml(frame.paramValue ?? frame.params)}</dd>
        <dt>call</dt><dd>${escapeHtml(frame.label)}</dd>
        <dt>return</dt><dd>${escapeHtml(frame.returnValue ?? "-")}</dd>
      </dl>
      <span class="stack-motion">${motionText}</span>
    `;
    state.stack.appendChild(item);
  });
}

function renderRecursionTree(state, step) {
  const svg = state.tree;
  svg.innerHTML = "";
  const nodes = step?.nodes || [];
  const edges = step?.edges || [];
  if (!nodes.length) return;

  const depthGroups = new Map();
  nodes.forEach((node) => {
    if (!depthGroups.has(node.depth)) depthGroups.set(node.depth, []);
    depthGroups.get(node.depth).push(node);
  });

  const positions = new Map();
  const maxDepth = Math.max(...nodes.map((node) => node.depth), 1);
  depthGroups.forEach((group, depth) => {
    group.forEach((node, index) => {
      positions.set(node.id, {
        x: ((index + 1) * 760) / (group.length + 1),
        y: 44 + (depth * 276) / Math.max(maxDepth, 1),
      });
    });
  });

  edges.forEach((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "tree-edge");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y + 23);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y - 23);
    svg.appendChild(line);
  });

  nodes.forEach((node) => {
    const pos = positions.get(node.id);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", `tree-node ${node.state || ""} ${node.id === step.activeId ? "active" : ""}`);
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", 25);
    svg.appendChild(circle);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "tree-label");
    label.setAttribute("x", pos.x);
    label.setAttribute("y", pos.y - 3);
    label.textContent = node.label.length > 12 ? node.label.replace("traverse", "trav") : node.label;
    svg.appendChild(label);

    if (node.sub || node.state === "repeated") {
      const sub = document.createElementNS("http://www.w3.org/2000/svg", "text");
      sub.setAttribute("class", "tree-sub");
      sub.setAttribute("x", pos.x);
      sub.setAttribute("y", pos.y + 15);
      sub.textContent = node.sub || "repeat";
      svg.appendChild(sub);
    }
  });
}

function renderRecursionStage(state, step) {
  state.stage.innerHTML = "";
  const stage = step?.stage;
  if (!stage) return;

  if (stage.type === "binary") {
    const row = document.createElement("div");
    row.className = "binary-array";
    stage.values.forEach((value, index) => {
      const cell = document.createElement("div");
      cell.className = "array-cell";
      if (index >= stage.low && index <= stage.high) cell.classList.add("in-range");
      if (index === stage.mid) cell.classList.add("mid");
      if (index === stage.found) cell.classList.add("found");
      const marks = [];
      if (index === stage.low) marks.push("LOW");
      if (index === stage.mid) marks.push("MID");
      if (index === stage.high) marks.push("HIGH");
      cell.innerHTML = `${value}<small>${marks.join(" ")}</small>`;
      row.appendChild(cell);
    });
    state.stage.appendChild(row);
    return;
  }

  if (stage.type === "hanoi") {
    const board = document.createElement("div");
    board.className = "hanoi-stage";
    ["A", "B", "C"].forEach((rodName) => {
      const rod = document.createElement("div");
      rod.className = "hanoi-rod";
      rod.innerHTML = `<strong>${rodName}</strong>`;
      (stage.rods[rodName] || []).forEach((disk) => {
        const diskEl = document.createElement("div");
        diskEl.className = `hanoi-disk ${disk === stage.moving ? "moving" : ""}`;
        diskEl.style.width = `${42 + disk * 28}px`;
        diskEl.textContent = disk;
        rod.appendChild(diskEl);
      });
      board.appendChild(rod);
    });
    state.stage.appendChild(board);
    return;
  }

  if (stage.type === "linked") {
    const row = document.createElement("div");
    row.className = "linked-recursion-row";
    stage.values.forEach((value, index) => {
      const node = document.createElement("div");
      node.className = "list-call-node";
      if (index === stage.active) node.classList.add("active");
      if (stage.returned.includes(index)) node.classList.add("returned");
      node.textContent = `${value} ->`;
      row.appendChild(node);
    });
    const nullNode = document.createElement("div");
    nullNode.className = `list-call-node ${stage.active === stage.values.length ? "base" : ""}`;
    nullNode.textContent = "NULL";
    row.appendChild(nullNode);
    state.stage.appendChild(row);
    return;
  }

  if (stage.type === "tree-summary") {
    state.stage.innerHTML = `<div class="return-ribbon">${stage.text}</div>`;
    return;
  }

  const expression = document.createElement("div");
  expression.className = "recursion-expression";
  if (stage.type === "fib") {
    expression.innerHTML = `
      <span class="recursion-token active">${stage.current}</span>
      ${stage.repeated ? '<span class="recursion-token">Repeated call highlighted</span>' : ""}
      ${stage.left !== undefined ? `<span class="recursion-token returned">${stage.left} + ${stage.right} = ${stage.result}</span>` : ""}
      ${stage.result !== undefined && stage.left === undefined ? `<span class="recursion-token base">return ${stage.result}</span>` : ""}
    `;
  } else {
    for (let value = stage.n; value >= stage.base; value -= 1) {
      const token = document.createElement("span");
      token.className = "recursion-token";
      if (value === stage.current) token.classList.add("active");
      if (value === stage.base) token.classList.add("base");
      if (stage.returns?.[value] !== undefined) token.classList.add("returned");
      const returned = stage.returns?.[value] !== undefined ? ` = ${stage.returns[value]}` : "";
      token.textContent = `${stage.name}(${value})${returned}`;
      expression.appendChild(token);
    }
  }
  state.stage.appendChild(expression);
  if (stage.result !== undefined) {
    const ribbon = document.createElement("div");
    ribbon.className = "return-ribbon";
    ribbon.textContent = `Returning value ${stage.result} upward.`;
    state.stage.appendChild(ribbon);
  }
}

function renderRecursionPanel(panel) {
  const state = recursionStates.get(panel);
  const step = state.steps[state.index];
  if (!step) {
    state.message.textContent = "Press Start to generate recursion steps.";
    state.counter.textContent = "0 / 0";
    state.callLabel.textContent = "call: -";
    state.depthLabel.textContent = "depth: 0";
    state.returnLabel.textContent = "return: -";
    state.insight.textContent = "Recursion stores unfinished calls on the call stack.";
    state.explainer.textContent = "Start the visualization to see calls push onto the stack, stop at the base condition, and pop while returning values.";
    state.explainer.classList.remove("push", "base", "return", "work");
    state.stack.innerHTML = '<div class="empty-stack">No active calls</div>';
    state.tree.innerHTML = "";
    state.stage.innerHTML = "";
    renderRecursionCode(state, null);
    updateComplexityPanel(panel, null);
    return;
  }

  renderRecursionStack(state, step);
  renderRecursionTree(state, step);
  renderRecursionStage(state, step);
  renderRecursionCode(state, step);
  state.message.textContent = step.message;
  state.counter.textContent = `${state.index + 1} / ${state.steps.length}`;
  state.callLabel.textContent = `call: ${step.activeCall}`;
  state.depthLabel.textContent = `depth: ${step.depth}`;
  state.returnLabel.textContent = `return: ${step.returnValue}`;
  state.insight.textContent = step.insight;
  state.explainer.textContent = step.explanation;
  state.explainer.classList.remove("push", "base", "return", "work");
  state.explainer.classList.add(step.phase);
  updateComplexityPanel(panel, step);
}

function stopRecursionPanel(panel) {
  const state = recursionStates.get(panel);
  if (!state) return;
  state.playing = false;
  state.playButton.textContent = "Play";
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function startRecursionPanel(panel) {
  const state = recursionStates.get(panel);
  stopRecursionPanel(panel);
  state.steps = generateRecursionSteps(state.kind, state.input.value);
  state.index = 0;
  renderRecursionPanel(panel);
}

function moveRecursionPanel(panel, offset) {
  const state = recursionStates.get(panel);
  stopRecursionPanel(panel);
  if (!state.steps.length) return;
  state.index = Math.min(Math.max(state.index + offset, 0), state.steps.length - 1);
  renderRecursionPanel(panel);
}

function toggleRecursionPanel(panel) {
  const state = recursionStates.get(panel);
  if (!state.steps.length) return;
  state.playing = !state.playing;
  state.playButton.textContent = state.playing ? "Pause" : "Play";
  if (!state.playing) {
    stopRecursionPanel(panel);
    return;
  }
  const advance = () => {
    if (state.index >= state.steps.length - 1) {
      stopRecursionPanel(panel);
      return;
    }
    state.index += 1;
    renderRecursionPanel(panel);
    const step = state.steps[state.index];
    const basePause = step?.phase === "base" ? 1.9 : 1;
    state.timer = setTimeout(advance, Number(state.speed.value) * basePause);
  };
  state.timer = setTimeout(advance, Number(state.speed.value));
}

function setRecursionCodeTab(panel, tab) {
  const state = recursionStates.get(panel);
  const type = tab.dataset.recursionCodeTab;
  tab.parentElement.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  state.codeType = type;
  renderRecursionCode(state, state.steps[state.index]);
}

document.querySelectorAll("[data-recursion-panel]").forEach((panel) => {
  const state = {
    kind: panel.dataset.recursion,
    steps: [],
    index: 0,
    playing: false,
    timer: null,
    input: panel.querySelector("[data-recursion-input]"),
    speed: panel.querySelector("[data-recursion-speed]"),
    playButton: panel.querySelector("[data-recursion-play]"),
    stack: panel.querySelector("[data-recursion-stack]"),
    tree: panel.querySelector("[data-recursion-tree]"),
    stage: panel.querySelector("[data-recursion-stage]"),
    message: panel.querySelector("[data-recursion-message]"),
    counter: panel.querySelector("[data-recursion-counter]"),
    callLabel: panel.querySelector("[data-recursion-call]"),
    depthLabel: panel.querySelector("[data-recursion-depth]"),
    returnLabel: panel.querySelector("[data-recursion-return]"),
    insight: panel.querySelector("[data-recursion-insight]"),
    explainer: panel.querySelector("[data-recursion-explainer]"),
    code: panel.querySelector("[data-recursion-code]"),
    codeType: "pseudocode",
  };

  recursionStates.set(panel, state);
  renderRecursionCode(state, null);
  panel.querySelector("[data-recursion-start]").addEventListener("click", () => startRecursionPanel(panel));
  panel.querySelector("[data-recursion-prev]").addEventListener("click", () => moveRecursionPanel(panel, -1));
  panel.querySelector("[data-recursion-next]").addEventListener("click", () => moveRecursionPanel(panel, 1));
  state.playButton.addEventListener("click", () => toggleRecursionPanel(panel));
  state.speed.addEventListener("input", () => {
    if (state.playing) {
      stopRecursionPanel(panel);
      toggleRecursionPanel(panel);
    }
  });
  panel.querySelectorAll("[data-recursion-code-tab]").forEach((tab) => {
    tab.addEventListener("click", () => setRecursionCodeTab(panel, tab));
  });
  startRecursionPanel(panel);
});

const practiceTopics = [
  ["arrays", "Arrays"],
  ["linked-lists", "Linked Lists"],
  ["doubly-linked-lists", "Doubly Linked Lists"],
  ["circular-linked-lists", "Circular Linked Lists"],
  ["stack", "Stack"],
  ["queue", "Queue"],
  ["circular-queue", "Circular Queue"],
  ["deque", "Deque"],
  ["priority-queue", "Priority Queue"],
  ["recursion", "Recursion"],
  ["linear-search", "Linear Search"],
  ["binary-search", "Binary Search"],
  ["sorting-algorithms", "Sorting Algorithms"],
  ["trees", "Trees"],
  ["graphs", "Graphs"],
];

const topicLabels = Object.fromEntries(practiceTopics);
Object.assign(topicLabels, {
  "bubble-sort": "Bubble Sort",
  "selection-sort": "Selection Sort",
  "insertion-sort": "Insertion Sort",
  "quick-sort": "Quick Sort",
});

const quizQuestions = {
  "arrays": [
    quizItem("Easy", "What is the time complexity of accessing arr[i] in an array?", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], "O(1)", "Arrays store contiguous memory, so index access computes the address directly."),
    quizItem("Medium", "Why can inserting in the middle of an array take O(n)?", ["Elements may need shifting", "Array values are unsorted", "Indexes start at zero", "Arrays cannot store duplicates"], "Elements may need shifting", "To make room, every later element can move one position."),
    quizItem("Hard", "Which pattern is commonly used for in-place array partition problems?", ["Two pointers", "Recursive stack only", "Hash-only lookup", "Tree rotation"], "Two pointers", "Two pointers can maintain regions such as low/mid/high without extra arrays."),
  ],
  "linked-lists": [
    quizItem("Easy", "What does each singly linked list node usually store?", ["Data and next pointer", "Data and two child pointers", "Only an index", "A heap priority"], "Data and next pointer", "A singly node stores its value and a reference to the next node."),
    quizItem("Medium", "Why is inserting at the head O(1)?", ["Only the new node and head pointer change", "The whole list is sorted", "All nodes are copied", "The tail is scanned"], "Only the new node and head pointer change", "No traversal is required for head insertion."),
    quizItem("Hard", "Which technique detects a cycle with O(1) extra space?", ["Fast and slow pointers", "Sorting the list", "Binary search", "Breadth-first search"], "Fast and slow pointers", "Floyd's cycle detection uses two speeds; if a cycle exists, they meet."),
  ],
  "doubly-linked-lists": [
    quizItem("Easy", "What extra pointer does a doubly linked list node have?", ["prev", "root", "priority", "mid"], "prev", "The prev pointer enables backward traversal."),
    quizItem("Medium", "What must be updated when deleting a middle node?", ["Both neighboring links", "Only array length", "Only the head value", "Only recursion depth"], "Both neighboring links", "The previous node's next and next node's prev must bypass the deleted node."),
    quizItem("Hard", "Why are doubly linked lists useful in LRU cache design?", ["They remove and move nodes in O(1)", "They sort automatically", "They require no hash map", "They use binary search"], "They remove and move nodes in O(1)", "With direct node references from a map, recency order can be updated in constant time."),
  ],
  "circular-linked-lists": [
    quizItem("Easy", "What makes a linked list circular?", ["Tail points back to head", "Head is always null", "Nodes are stored contiguously", "Every node has two children"], "Tail points back to head", "The last node links back to the first node, forming a loop."),
    quizItem("Medium", "How do you stop traversal in a circular linked list?", ["When you return to the start node", "When index equals -1", "When the array is sorted", "When stack is empty"], "When you return to the start node", "A circular list may never reach null, so the starting node is the sentinel."),
    quizItem("Hard", "Which classic problem naturally fits circular lists?", ["Josephus problem", "Binary search", "Merge sort only", "Tree diameter"], "Josephus problem", "Repeated removals around a circle map directly to circular links."),
  ],
  "stack": [
    quizItem("Easy", "What principle does a stack follow?", ["LIFO", "FIFO", "Level order", "Sorted order"], "LIFO", "The last item pushed is the first item popped."),
    quizItem("Medium", "What does push do?", ["Adds an item to the top", "Removes the front item", "Sorts the stack", "Searches all nodes"], "Adds an item to the top", "Push places the new value at the stack top."),
    quizItem("Hard", "How can Min Stack return minimum in O(1)?", ["Use an auxiliary min stack", "Sort after every push", "Use binary search on stack", "Use a queue only"], "Use an auxiliary min stack", "A helper stack stores the minimum seen at each depth."),
  ],
  "queue": [
    quizItem("Easy", "What principle does a queue follow?", ["FIFO", "LIFO", "DFS", "Heap order"], "FIFO", "The first item enqueued is the first item dequeued."),
    quizItem("Medium", "Which pointer changes during dequeue?", ["Front", "Rear only", "Pivot", "Root"], "Front", "Dequeue removes from the front and advances the front pointer."),
    quizItem("Hard", "Why is a queue central to BFS?", ["It processes nodes level by level", "It reverses recursion", "It sorts edges", "It stores only leaves"], "It processes nodes level by level", "FIFO order preserves discovery layers in breadth-first search."),
  ],
  "circular-queue": [
    quizItem("Easy", "What operation lets circular queues reuse freed slots?", ["Modulo indexing", "Tree rotation", "Stack popping", "Recursive splitting"], "Modulo indexing", "Front and rear wrap around using modulo capacity."),
    quizItem("Medium", "Why track size in a circular queue?", ["To distinguish full from empty", "To sort values", "To calculate hash keys", "To remove recursion"], "To distinguish full from empty", "front == rear can be ambiguous without size or an extra empty slot."),
    quizItem("Hard", "When rear moves from the last slot to slot 0, what happened?", ["Wraparound", "Overflow by default", "Binary search", "Heapify"], "Wraparound", "Modulo arithmetic wraps rear back to the beginning."),
  ],
  "deque": [
    quizItem("Easy", "What does a deque allow?", ["Insert and delete at both ends", "Only push at top", "Only sorted insert", "Only tree traversal"], "Insert and delete at both ends", "A deque is a double-ended queue."),
    quizItem("Medium", "Which problem commonly uses a monotonic deque?", ["Sliding Window Maximum", "Factorial", "Linear probing", "Tree serialization only"], "Sliding Window Maximum", "The deque keeps useful max candidates in decreasing order."),
    quizItem("Hard", "In 0-1 BFS, where do zero-weight edges go?", ["Front of deque", "Always discarded", "Rear of deque", "Into a recursion stack"], "Front of deque", "Zero-cost moves should be processed before cost-one moves."),
  ],
  "priority-queue": [
    quizItem("Easy", "What does a priority queue remove first?", ["Highest or lowest priority item", "Oldest item only", "Newest item only", "Middle item"], "Highest or lowest priority item", "Priority queues order removal by priority rather than insertion time."),
    quizItem("Medium", "What structure commonly implements a priority queue?", ["Heap", "Plain stack", "Circular list only", "Unsorted string"], "Heap", "Binary heaps support efficient insert and extract operations."),
    quizItem("Hard", "What is typical heap insert complexity?", ["O(log n)", "O(1) always", "O(n^2)", "O(2^n)"], "O(log n)", "The new item may bubble up through the heap height."),
  ],
  "recursion": [
    quizItem("Easy", "What must every recursive solution have?", ["Base case", "Hash map", "Queue", "Pivot"], "Base case", "The base case stops recursion from continuing forever."),
    quizItem("Medium", "Why does recursion use extra space?", ["Call stack stores unfinished calls", "Arrays are always copied", "CPU sorts frames", "Loops are forbidden"], "Call stack stores unfinished calls", "Each active call keeps local state until it returns."),
    quizItem("Hard", "Why is naive Fibonacci expensive?", ["It repeats overlapping subproblems", "It never has a base case", "It uses a queue", "It sorts every call"], "It repeats overlapping subproblems", "The same Fibonacci values are recomputed many times."),
  ],
  "linear-search": [
    quizItem("Easy", "Does linear search require sorted input?", ["No", "Yes", "Only for strings", "Only for trees"], "No", "Linear search checks items sequentially and works on unsorted data."),
    quizItem("Medium", "What is the worst-case time for linear search?", ["O(n)", "O(1)", "O(log n)", "O(n log n)"], "O(n)", "The target may be last or missing, requiring all elements to be checked."),
    quizItem("Hard", "When is linear search best case O(1)?", ["Target is first", "Target is missing", "Array is reversed", "Array has duplicates"], "Target is first", "Only one comparison is needed when the first element matches."),
  ],
  "binary-search": [
    quizItem("Easy", "What input does binary search require?", ["Sorted data", "Only negative data", "A linked list only", "Random order"], "Sorted data", "The algorithm decides which half to discard using sorted order."),
    quizItem("Medium", "What is binary search average time complexity?", ["O(log n)", "O(n)", "O(1) always", "O(n^2)"], "O(log n)", "Each comparison halves the remaining search space."),
    quizItem("Hard", "Why use mid = low + (high - low) / 2?", ["Avoid integer overflow", "Sort the array", "Use more memory", "Skip comparisons"], "Avoid integer overflow", "It prevents low + high from overflowing in fixed-size integer languages."),
  ],
  "sorting-algorithms": [
    quizItem("Easy", "Which sorting algorithm repeatedly swaps adjacent out-of-order elements?", ["Bubble Sort", "Binary Search", "BFS", "Stack Push"], "Bubble Sort", "Bubble sort compares neighbors and bubbles larger values rightward."),
    quizItem("Medium", "Which sort is efficient for nearly sorted arrays?", ["Insertion Sort", "Selection Sort always", "Naive Fibonacci", "Linear Search"], "Insertion Sort", "Insertion sort shifts only a few items when the array is nearly sorted."),
    quizItem("Hard", "What causes worst-case quick sort O(n^2)?", ["Very unbalanced partitions", "Using arrays", "Having duplicates only", "Using recursion at all"], "Very unbalanced partitions", "Bad pivots can leave one side nearly as large as the original array."),
  ],
  "trees": [
    quizItem("Easy", "What is the top node of a tree called?", ["Root", "Tail", "Rear", "Pivot"], "Root", "The root is the starting node with no parent."),
    quizItem("Medium", "Which traversal visits left, root, right?", ["Inorder", "Level order", "Postfix", "Heapify"], "Inorder", "Inorder traversal processes the left subtree, node, then right subtree."),
    quizItem("Hard", "What does tree recursion space depend on?", ["Height of the tree", "Number of edges squared", "Array capacity", "Queue rear only"], "Height of the tree", "The deepest root-to-leaf path determines maximum active call frames."),
  ],
  "graphs": [
    quizItem("Easy", "What do graph vertices represent?", ["Nodes/entities", "Only array indexes", "Stack frames", "Sorted pivots"], "Nodes/entities", "Vertices are the entities connected by edges."),
    quizItem("Medium", "Which structure is used by BFS?", ["Queue", "Stack only", "Heap only", "Circular list only"], "Queue", "BFS uses a queue to process vertices by distance layer."),
    quizItem("Hard", "What does topological sort require?", ["Directed acyclic graph", "Undirected cycle", "Sorted array", "Complete binary tree"], "Directed acyclic graph", "Topological ordering exists only for DAGs."),
  ],
};

quizQuestions["bubble-sort"] = quizQuestions["sorting-algorithms"];
quizQuestions["selection-sort"] = quizQuestions["sorting-algorithms"];
quizQuestions["insertion-sort"] = quizQuestions["sorting-algorithms"];
quizQuestions["quick-sort"] = quizQuestions["sorting-algorithms"];

function quizItem(difficulty, question, options, answer, explanation) {
  return { difficulty, question, options, answer, explanation };
}

const categoryLabels = [
  "Easy",
  "Medium",
  "Hard",
];

const snippetLibrary = {
  twoSum: {
    python: `def two_sum(nums, target):
    seen = {}
    for i, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], i]
        seen[value] = i
    return []`,
    java: `int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[]{seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
  },
  reverseList: {
    python: `def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev`,
    java: `ListNode reverseList(ListNode head) {
    ListNode prev = null, cur = head;
    while (cur != null) {
        ListNode next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}`,
  },
  stack: {
    python: `def valid_parentheses(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs.values():
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False
    return not stack`,
    java: `boolean isValid(String s) {
    Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
    Deque<Character> st = new ArrayDeque<>();
    for (char ch : s.toCharArray()) {
        if (pairs.containsValue(ch)) st.push(ch);
        else if (st.isEmpty() || st.pop() != pairs.get(ch)) return false;
    }
    return st.isEmpty();
}`,
  },
  binarySearch: {
    python: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    java: `int binarySearch(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  },
  recursion: {
    python: `def climb_stairs(n):
    memo = {}
    def solve(i):
        if i <= 1:
            return 1
        if i not in memo:
            memo[i] = solve(i - 1) + solve(i - 2)
        return memo[i]
    return solve(n)`,
    java: `int climbStairs(int n) {
    int[] memo = new int[n + 1];
    return solve(n, memo);
}
int solve(int n, int[] memo) {
    if (n <= 1) return 1;
    if (memo[n] == 0) memo[n] = solve(n - 1, memo) + solve(n - 2, memo);
    return memo[n];
}`,
  },
  tree: {
    python: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
    java: `int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
  },
  graph: {
    python: `from collections import deque

def bfs(graph, start):
    seen, order = {start}, []
    q = deque([start])
    while q:
        node = q.popleft()
        order.append(node)
        for nei in graph[node]:
            if nei not in seen:
                seen.add(nei)
                q.append(nei)
    return order`,
    java: `List<Integer> bfs(List<List<Integer>> graph, int start) {
    boolean[] seen = new boolean[graph.size()];
    Queue<Integer> q = new ArrayDeque<>();
    List<Integer> order = new ArrayList<>();
    seen[start] = true;
    q.offer(start);
    while (!q.isEmpty()) {
        int node = q.poll();
        order.add(node);
        for (int nei : graph.get(node)) {
            if (!seen[nei]) {
                seen[nei] = true;
                q.offer(nei);
            }
        }
    }
    return order;
}`,
  },
  sort: {
    python: `def merge_sort(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    ans = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            ans.append(left[i]); i += 1
        else:
            ans.append(right[j]); j += 1
    return ans + left[i:] + right[j:]`,
    java: `void mergeSort(int[] a, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(a, l, m);
    mergeSort(a, m + 1, r);
    merge(a, l, m, r);
}`,
  },
  queue: {
    python: `from collections import deque

def first_negative(nums, k):
    q, ans = deque(), []
    for i, value in enumerate(nums):
        if value < 0:
            q.append(i)
        while q and q[0] <= i - k:
            q.popleft()
        if i >= k - 1:
            ans.append(nums[q[0]] if q else 0)
    return ans`,
    java: `List<Integer> firstNegative(int[] nums, int k) {
    Deque<Integer> q = new ArrayDeque<>();
    List<Integer> ans = new ArrayList<>();
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] < 0) q.offer(i);
        while (!q.isEmpty() && q.peek() <= i - k) q.poll();
        if (i >= k - 1) ans.add(q.isEmpty() ? 0 : nums[q.peek()]);
    }
    return ans;
}`,
  },
  heap: {
    python: `import heapq

def kth_largest(nums, k):
    heap = []
    for value in nums:
        heapq.heappush(heap, value)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
    java: `int kthLargest(int[] nums, int k) {
    PriorityQueue<Integer> pq = new PriorityQueue<>();
    for (int value : nums) {
        pq.offer(value);
        if (pq.size() > k) pq.poll();
    }
    return pq.peek();
}`,
  },
  stock: {
    python: `def max_profit(prices):
    best = 0
    min_price = float("inf")
    for price in prices:
        min_price = min(min_price, price)
        best = max(best, price - min_price)
    return best`,
    java: `int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE, best = 0;
    for (int price : prices) {
        minPrice = Math.min(minPrice, price);
        best = Math.max(best, price - minPrice);
    }
    return best;
}`,
  },
  kadane: {
    python: `def max_subarray(nums):
    best = cur = nums[0]
    for value in nums[1:]:
        cur = max(value, cur + value)
        best = max(best, cur)
    return best`,
    java: `int maxSubArray(int[] nums) {
    int cur = nums[0], best = nums[0];
    for (int i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
    }
    return best;
}`,
  },
  productExceptSelf: {
    python: `def product_except_self(nums):
    ans = [1] * len(nums)
    prefix = 1
    for i, value in enumerate(nums):
        ans[i] = prefix
        prefix *= value
    suffix = 1
    for i in range(len(nums) - 1, -1, -1):
        ans[i] *= suffix
        suffix *= nums[i]
    return ans`,
    java: `int[] productExceptSelf(int[] nums) {
    int[] ans = new int[nums.length];
    int prefix = 1;
    for (int i = 0; i < nums.length; i++) {
        ans[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = nums.length - 1; i >= 0; i--) {
        ans[i] *= suffix;
        suffix *= nums[i];
    }
    return ans;
}`,
  },
  mergeIntervals: {
    python: `def merge_intervals(intervals):
    intervals.sort()
    merged = []
    for start, end in intervals:
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged`,
    java: `int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
    List<int[]> merged = new ArrayList<>();
    for (int[] in : intervals) {
        if (merged.isEmpty() || in[0] > merged.get(merged.size() - 1)[1]) {
            merged.add(in);
        } else {
            int[] last = merged.get(merged.size() - 1);
            last[1] = Math.max(last[1], in[1]);
        }
    }
    return merged.toArray(new int[merged.size()][]);
}`,
  },
  rotateArray: {
    python: `def rotate(nums, k):
    k %= len(nums)
    nums[:] = nums[-k:] + nums[:-k]`,
    java: `void rotate(int[] nums, int k) {
    k %= nums.length;
    reverse(nums, 0, nums.length - 1);
    reverse(nums, 0, k - 1);
    reverse(nums, k, nums.length - 1);
}
void reverse(int[] a, int l, int r) {
    while (l < r) {
        int t = a[l]; a[l++] = a[r]; a[r--] = t;
    }
}`,
  },
  mergeLists: {
    python: `def merge_two_lists(a, b):
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`,
    java: `ListNode mergeTwoLists(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) {
            tail.next = a; a = a.next;
        } else {
            tail.next = b; b = b.next;
        }
        tail = tail.next;
    }
    tail.next = a != null ? a : b;
    return dummy.next;
}`,
  },
  postfix: {
    python: `def eval_postfix(tokens):
    stack = []
    for token in tokens:
        if token not in "+-*/":
            stack.append(int(token))
            continue
        b, a = stack.pop(), stack.pop()
        if token == "+": stack.append(a + b)
        elif token == "-": stack.append(a - b)
        elif token == "*": stack.append(a * b)
        else: stack.append(int(a / b))
    return stack[-1]`,
    java: `int evalRPN(String[] tokens) {
    Deque<Integer> st = new ArrayDeque<>();
    for (String token : tokens) {
        if (!"+-*/".contains(token)) {
            st.push(Integer.parseInt(token));
        } else {
            int b = st.pop(), a = st.pop();
            if (token.equals("+")) st.push(a + b);
            else if (token.equals("-")) st.push(a - b);
            else if (token.equals("*")) st.push(a * b);
            else st.push(a / b);
        }
    }
    return st.pop();
}`,
  },
  histogram: {
    python: `def largest_rectangle_area(heights):
    stack, best = [], 0
    for i, h in enumerate(heights + [0]):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best`,
    java: `int largestRectangleArea(int[] heights) {
    Deque<Integer> st = new ArrayDeque<>();
    int best = 0;
    for (int i = 0; i <= heights.length; i++) {
        int h = i == heights.length ? 0 : heights[i];
        while (!st.isEmpty() && heights[st.peek()] > h) {
            int height = heights[st.pop()];
            int left = st.isEmpty() ? -1 : st.peek();
            best = Math.max(best, height * (i - left - 1));
        }
        st.push(i);
    }
    return best;
}`,
  },
  generateParentheses: {
    python: `def generate_parentheses(n):
    ans = []
    def backtrack(path, open_count, close_count):
        if len(path) == 2 * n:
            ans.append(path)
            return
        if open_count < n:
            backtrack(path + "(", open_count + 1, close_count)
        if close_count < open_count:
            backtrack(path + ")", open_count, close_count + 1)
    backtrack("", 0, 0)
    return ans`,
    java: `List<String> generateParenthesis(int n) {
    List<String> ans = new ArrayList<>();
    backtrack(ans, new StringBuilder(), 0, 0, n);
    return ans;
}
void backtrack(List<String> ans, StringBuilder path, int open, int close, int n) {
    if (path.length() == 2 * n) { ans.add(path.toString()); return; }
    if (open < n) { path.append('('); backtrack(ans, path, open + 1, close, n); path.deleteCharAt(path.length() - 1); }
    if (close < open) { path.append(')'); backtrack(ans, path, open, close + 1, n); path.deleteCharAt(path.length() - 1); }
}`,
  },
  levelOrder: {
    python: `from collections import deque

def level_order(root):
    if not root:
        return []
    q, ans = deque([root]), []
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        ans.append(level)
    return ans`,
    java: `List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> ans = new ArrayList<>();
    if (root == null) return ans;
    Queue<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        for (int size = q.size(); size > 0; size--) {
            TreeNode node = q.poll();
            level.add(node.val);
            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        ans.add(level);
    }
    return ans;
}`,
  },
  diameter: {
    python: `def diameter_of_binary_tree(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)
    height(root)
    return best`,
    java: `int bestDiameter;
int diameterOfBinaryTree(TreeNode root) {
    bestDiameter = 0;
    height(root);
    return bestDiameter;
}
int height(TreeNode node) {
    if (node == null) return 0;
    int left = height(node.left), right = height(node.right);
    bestDiameter = Math.max(bestDiameter, left + right);
    return 1 + Math.max(left, right);
}`,
  },
  topologicalSort: {
    python: `from collections import deque

def topo_sort(n, edges):
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        graph[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nei in graph[node]:
            indeg[nei] -= 1
            if indeg[nei] == 0:
                q.append(nei)
    return order if len(order) == n else []`,
    java: `List<Integer> topoSort(int n, int[][] edges) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] e : edges) { g.get(e[0]).add(e[1]); indeg[e[1]]++; }
    Queue<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
    List<Integer> order = new ArrayList<>();
    while (!q.isEmpty()) {
        int node = q.poll();
        order.add(node);
        for (int nei : g.get(node)) if (--indeg[nei] == 0) q.offer(nei);
    }
    return order.size() == n ? order : new ArrayList<>();
}`,
  },
};

function practiceQuestion(category, title, difficulty, description, tags, time, space, hint, approach, snippetKey) {
  const code = snippetLibrary[snippetKey] || snippetLibrary.twoSum;
  return { category, title, difficulty, description, tags, time, space, hint, approach, python: code.python, java: code.java };
}

const practiceQuestions = {
  "arrays": [
    practiceQuestion("Top Interview Questions", "Two Sum", "Easy", "Return indices of two values whose sum equals the target.", ["Array", "Hash Map"], "O(n)", "O(n)", "Store complements as you scan.", "Intuition: every value asks whether its partner was seen before. Algorithm: scan once, check target - value in a map, then store value to index. Dry run: for [2,7,11] and 9, 2 is stored, 7 finds 2 and returns [0,1].", "twoSum"),
    practiceQuestion("Beginner Problems", "Find Maximum and Minimum", "Easy", "Scan an array and report both extremes.", ["Array", "Traversal"], "O(n)", "O(1)", "Keep two running answers.", "Initialize min and max with the first value, then update them for each element. This mirrors the visualization idea of visiting every cell exactly once.", "twoSum"),
    practiceQuestion("Medium Problems", "Move Zeroes", "Medium", "Move all zeroes to the end while preserving non-zero order.", ["Array", "Two Pointer"], "O(n)", "O(1)", "Use a write pointer for the next non-zero slot.", "Walk through the array. Whenever you see a non-zero value, swap it into the write position and advance write. Dry run: [0,1,0,3] becomes [1,3,0,0].", "twoSum"),
    practiceQuestion("Advanced Problems", "Trapping Rain Water", "Hard", "Compute water trapped between bars after raining.", ["Array", "Two Pointer"], "O(n)", "O(1)", "The lower side limits the water.", "Use left/right pointers and track leftMax/rightMax. Move the side with smaller max because it determines trapped water at that step.", "twoSum"),
  ],
  "linked-lists": [
    practiceQuestion("Top Interview Questions", "Reverse a Linked List", "Easy", "Reverse all next pointers and return the new head.", ["Linked List", "Pointer"], "O(n)", "O(1)", "Keep prev, current, and next references.", "Intuition: each node should point backward. Algorithm: save next, redirect current.next to prev, advance prev/current. Dry run: 1->2->3 becomes 1<-2<-3.", "reverseList"),
    practiceQuestion("Beginner Problems", "Search in Linked List", "Easy", "Find whether a target value exists in a singly linked list.", ["Linked List", "Traversal"], "O(n)", "O(1)", "Move one node at a time from head.", "Start at head and compare each node value with the target. Stop early when found; otherwise end at null.", "reverseList"),
    practiceQuestion("Medium Problems", "Detect Cycle", "Medium", "Determine whether a linked list contains a cycle.", ["Linked List", "Two Pointer"], "O(n)", "O(1)", "Fast pointer laps slow pointer inside a cycle.", "Use slow=head and fast=head. Move slow one step and fast two steps. If they meet, a cycle exists; if fast reaches null, no cycle.", "reverseList"),
    practiceQuestion("Advanced Problems", "Remove Nth Node From End", "Medium", "Remove the nth node from the end in one pass.", ["Linked List", "Two Pointer"], "O(n)", "O(1)", "Create a gap of n nodes.", "Use a dummy node. Advance fast n steps, then move fast and slow together until fast reaches the end. Delete slow.next.", "reverseList"),
  ],
  "doubly-linked-lists": [
    practiceQuestion("Top Interview Questions", "Flatten Multilevel Doubly Linked List", "Hard", "Flatten child pointers into one doubly linked sequence.", ["Doubly Linked List", "DFS"], "O(n)", "O(n)", "Child lists behave like depth-first branches.", "Traverse nodes, splice each child between current and next, then reconnect prev pointers. A stack can remember the old next node.", "reverseList"),
    practiceQuestion("Beginner Problems", "Insert Before a Node", "Easy", "Insert a value before a given node while maintaining prev and next.", ["Doubly Linked List"], "O(1)", "O(1)", "Four pointer updates are enough.", "Create the node, connect it to previous and current, then repair neighboring prev/next links. Check the head case separately.", "reverseList"),
    practiceQuestion("Medium Problems", "Delete All Occurrences", "Medium", "Remove every node equal to a target value.", ["Doubly Linked List", "Traversal"], "O(n)", "O(1)", "Save next before unlinking.", "Walk through the list. For a matching node, connect node.prev to node.next and node.next to node.prev. Update head when deleting the first node.", "reverseList"),
    practiceQuestion("Advanced Problems", "LRU Cache", "Hard", "Use a hash map and doubly linked list to evict least recently used keys.", ["Doubly Linked List", "Hash Map"], "O(1)", "O(n)", "The list tracks recency; the map jumps to nodes.", "Move accessed nodes to the front. On overflow, remove the tail node and delete its key from the map.", "reverseList"),
  ],
  "circular-linked-lists": [
    practiceQuestion("Top Interview Questions", "Detect Circular Linked List", "Easy", "Check whether the tail points back to the head.", ["Circular List", "Pointer"], "O(n)", "O(1)", "Stop when you either hit null or return to head.", "Start at head.next and advance until the pointer is null or head. Returning to head means circular.", "reverseList"),
    practiceQuestion("Beginner Problems", "Insert in Circular List", "Easy", "Insert a node after the tail and keep the circle intact.", ["Circular List"], "O(1)", "O(1)", "The new node points to head.", "For an empty list, new.next = new. Otherwise set new.next = tail.next, tail.next = new, then optionally move tail.", "reverseList"),
    practiceQuestion("Medium Problems", "Split Circular List", "Medium", "Split one circular list into two halves.", ["Circular List", "Two Pointer"], "O(n)", "O(1)", "Use slow and fast until fast reaches tail.", "Slow stops near the midpoint. Rewire the tail of the first half to head and the tail of the second half to slow.next.", "reverseList"),
    practiceQuestion("Advanced Problems", "Josephus Problem", "Hard", "Eliminate every kth node until one survivor remains.", ["Circular List", "Simulation"], "O(nk)", "O(1)", "The circle makes wraparound natural.", "Keep prev and current. Count k nodes, unlink current, then continue from the next node until one node points to itself.", "reverseList"),
  ],
  "stack": [
    practiceQuestion("Top Interview Questions", "Valid Parentheses", "Easy", "Validate whether every bracket closes in the correct order.", ["Stack", "String"], "O(n)", "O(n)", "Push openings; each closing must match the top.", "The stack stores unfinished openings. Dry run: for ()[], each closing removes its matching opening; an empty final stack is valid.", "stack"),
    practiceQuestion("Beginner Problems", "Implement Stack using Array", "Easy", "Support push, pop, peek, and isEmpty.", ["Stack", "Array"], "O(1)", "O(n)", "The end of the array is the top.", "Push appends, pop removes last, peek reads last. This directly matches the vertical stack visualization.", "stack"),
    practiceQuestion("Medium Problems", "Min Stack", "Medium", "Design a stack that returns the minimum in O(1).", ["Stack", "Design"], "O(1)", "O(n)", "Use a second stack of minimums.", "Push the current minimum alongside each value or only push when a new minimum appears. Pop both stacks when necessary.", "stack"),
    practiceQuestion("Advanced Problems", "Next Greater Element", "Medium", "For each value, find the next greater value to its right.", ["Stack", "Monotonic Stack"], "O(n)", "O(n)", "Keep a decreasing stack.", "When the current value is greater than the stack top, it becomes that top's answer. Push unresolved values.", "stack"),
  ],
  "queue": [
    practiceQuestion("Top Interview Questions", "First Negative in Every Window", "Medium", "Return the first negative number in every size-k window.", ["Queue", "Sliding Window"], "O(n)", "O(k)", "Store indices of negative values.", "The queue holds useful candidates in window order. Remove expired indices from the front and read the current first negative.", "queue"),
    practiceQuestion("Beginner Problems", "Implement Queue using Array", "Easy", "Support enqueue, dequeue, front, and isEmpty.", ["Queue", "Array"], "O(1)", "O(n)", "Use front and rear indices.", "Enqueue at rear, dequeue at front. The visualization's front/rear labels map directly to the two indices.", "queue"),
    practiceQuestion("Medium Problems", "Implement Stack using Queues", "Medium", "Build LIFO behavior using queue operations.", ["Queue", "Stack"], "O(n)", "O(n)", "After push, rotate older values behind the new value.", "Push x, then rotate size-1 elements so x becomes the queue front. Pop then removes the newest item.", "queue"),
    practiceQuestion("Advanced Problems", "Rotten Oranges", "Medium", "Find minutes needed for rot to spread through a grid.", ["Queue", "BFS"], "O(rows*cols)", "O(rows*cols)", "All initially rotten oranges start BFS together.", "Push all rotten cells into a queue. Process level by level; each level is one minute of spread.", "queue"),
  ],
  "circular-queue": [
    practiceQuestion("Top Interview Questions", "Design Circular Queue", "Medium", "Implement fixed-size enqueue/dequeue with wraparound.", ["Circular Queue", "Design"], "O(1)", "O(k)", "Use modulo arithmetic.", "Advance rear by (rear + 1) % capacity on enqueue and front similarly on dequeue. Track size to distinguish full from empty.", "queue"),
    practiceQuestion("Beginner Problems", "Check Full or Empty", "Easy", "Detect queue state in a circular buffer.", ["Circular Queue"], "O(1)", "O(1)", "Size is the simplest truth source.", "If size is 0, empty. If size equals capacity, full. This avoids front == rear ambiguity.", "queue"),
    practiceQuestion("Medium Problems", "Circular Tour", "Medium", "Find a gas station start index to complete the circle.", ["Circular Queue", "Greedy"], "O(n)", "O(1)", "A failed segment cannot be the answer.", "Track tank and deficit. When tank drops below zero, start after the current station and reset tank.", "queue"),
    practiceQuestion("Advanced Problems", "Recent Calls Counter", "Easy", "Count requests in the last 3000 ms.", ["Circular Queue", "Design"], "O(1) amortized", "O(n)", "Remove timestamps outside the window.", "Enqueue the new timestamp, then dequeue while front < t - 3000. Remaining size is the answer.", "queue"),
  ],
  "deque": [
    practiceQuestion("Top Interview Questions", "Sliding Window Maximum", "Hard", "Return the maximum in every size-k window.", ["Deque", "Monotonic Queue"], "O(n)", "O(k)", "Keep indices in decreasing value order.", "Remove expired indices from front. Remove smaller values from back before pushing current. Front is the maximum.", "queue"),
    practiceQuestion("Beginner Problems", "Palindrome using Deque", "Easy", "Check a string by comparing front and rear characters.", ["Deque", "Two Pointer"], "O(n)", "O(n)", "Pop from both ends.", "Load characters into a deque. While more than one remains, compare and remove both ends.", "queue"),
    practiceQuestion("Medium Problems", "Shortest Subarray with Sum at Least K", "Hard", "Find the minimum length subarray with sum >= k.", ["Deque", "Prefix Sum"], "O(n)", "O(n)", "Use increasing prefix sums.", "Maintain candidate prefix indices in a deque. Pop front when a valid length is found and pop back while current prefix is smaller.", "queue"),
    practiceQuestion("Advanced Problems", "0-1 BFS", "Hard", "Find shortest paths when edge weights are 0 or 1.", ["Deque", "Graph"], "O(V+E)", "O(V)", "Weight 0 goes front; weight 1 goes back.", "A deque preserves shortest order without a heap. Relax edges and push nodes based on edge weight.", "queue"),
  ],
  "priority-queue": [
    practiceQuestion("Top Interview Questions", "Kth Largest Element", "Medium", "Find the kth largest value in an unsorted array.", ["Priority Queue", "Heap"], "O(n log k)", "O(k)", "Keep a min-heap of size k.", "Push values into a min-heap. If it grows past k, remove the smallest. The heap root is kth largest.", "heap"),
    practiceQuestion("Beginner Problems", "Sort a Nearly Sorted Array", "Easy", "Sort an array where each element is at most k away.", ["Priority Queue", "Sorting"], "O(n log k)", "O(k)", "The next answer is inside the next k+1 values.", "Push k+1 values into a min-heap, then repeatedly pop the smallest and push the next array value.", "heap"),
    practiceQuestion("Medium Problems", "Merge K Sorted Lists", "Hard", "Merge k sorted linked lists into one sorted list.", ["Priority Queue", "Linked List"], "O(n log k)", "O(k)", "Heap stores the current smallest head.", "Push each list head into a heap. Pop the smallest node, append it, and push its next node.", "heap"),
    practiceQuestion("Advanced Problems", "Task Scheduler", "Medium", "Schedule tasks with cooldown to minimize total time.", ["Priority Queue", "Greedy"], "O(n log n)", "O(1)", "Always run the most frequent available task.", "Use a max-heap for task counts and a cooldown queue for tasks waiting to become available again.", "heap"),
  ],
  "recursion": [
    practiceQuestion("Top Interview Questions", "Climbing Stairs", "Easy", "Count ways to reach step n using 1 or 2 steps.", ["Recursion", "Memoization"], "O(n)", "O(n)", "The last move came from n-1 or n-2.", "Define f(n)=f(n-1)+f(n-2). Memoization keeps the recursion tree from repeating the same branches.", "recursion"),
    practiceQuestion("Beginner Problems", "Factorial", "Easy", "Compute n! recursively.", ["Recursion", "Math"], "O(n)", "O(n)", "Base case is n == 0 or n == 1.", "Each call solves one smaller problem: factorial(n)=n*factorial(n-1). The call stack stores pending multiplications.", "recursion"),
    practiceQuestion("Medium Problems", "Generate Subsets", "Medium", "Return all subsets of a list.", ["Recursion", "Backtracking"], "O(n*2^n)", "O(n)", "At each index choose take or skip.", "The recursion tree branches into include and exclude decisions. When index reaches n, record the path.", "recursion"),
    practiceQuestion("Advanced Problems", "N Queens", "Hard", "Place n queens so none attack each other.", ["Recursion", "Backtracking"], "O(n!)", "O(n)", "Track used columns and diagonals.", "Place one queen per row. Try safe columns, recurse, then undo the placement to explore alternatives.", "recursion"),
  ],
  "linear-search": [
    practiceQuestion("Top Interview Questions", "Linear Search", "Easy", "Return the first index of a target in an array.", ["Searching", "Array"], "O(n)", "O(1)", "Compare one value at a time.", "Start at index 0 and scan right until the target is found or the array ends. This is the exact motion shown in the visualization.", "binarySearch"),
    practiceQuestion("Beginner Problems", "Count Occurrences", "Easy", "Count how many times a target appears.", ["Searching", "Counting"], "O(n)", "O(1)", "Do not stop at the first match.", "Scan every value and increment a counter for each match. Return the counter after the full pass.", "binarySearch"),
    practiceQuestion("Medium Problems", "Find First Repeating Element", "Medium", "Return the first value whose occurrence repeats later.", ["Searching", "Hash Set"], "O(n)", "O(n)", "Scan from right to left.", "Keep a set of seen values. Moving right-to-left lets you update the answer whenever a value is already seen.", "twoSum"),
    practiceQuestion("Advanced Problems", "Search in Unbounded Array", "Medium", "Find a target when the array size is unknown.", ["Searching", "Bounds"], "O(log p)", "O(1)", "Grow the search window exponentially.", "Double the high pointer until it reaches or passes the target, then binary search inside that discovered range.", "binarySearch"),
  ],
  "binary-search": [
    practiceQuestion("Top Interview Questions", "Search in Sorted Array", "Easy", "Find a target in a sorted array.", ["Binary Search", "Searching"], "O(log n)", "O(1)", "Discard the half that cannot contain target.", "Compare target with mid. If smaller, move high left; if larger, move low right. Dry run: low/mid/high shrink toward the answer.", "binarySearch"),
    practiceQuestion("Beginner Problems", "First and Last Occurrence", "Medium", "Return the starting and ending index of a target.", ["Binary Search", "Boundaries"], "O(log n)", "O(1)", "Run binary search twice.", "One search moves left after finding target to locate first. The other moves right to locate last.", "binarySearch"),
    practiceQuestion("Medium Problems", "Peak Element", "Medium", "Find an index greater than its neighbors.", ["Binary Search"], "O(log n)", "O(1)", "Move toward the rising slope.", "If nums[mid] < nums[mid+1], a peak exists to the right. Otherwise it exists at mid or to the left.", "binarySearch"),
    practiceQuestion("Advanced Problems", "Search in Rotated Array", "Medium", "Find a target in a rotated sorted array.", ["Binary Search", "Rotated Array"], "O(log n)", "O(1)", "One half is always sorted.", "Identify the sorted half, decide whether target lies inside it, then discard the other half.", "binarySearch"),
  ],
  "sorting-algorithms": [
    practiceQuestion("Top Interview Questions", "Merge Sort", "Medium", "Sort an array using divide and conquer.", ["Sorting", "Divide and Conquer"], "O(n log n)", "O(n)", "Split first, merge sorted halves.", "The visualization's split/merge rhythm maps to recursion: solve left, solve right, then merge two sorted lists.", "sort"),
    practiceQuestion("Beginner Problems", "Sort 0s, 1s, and 2s", "Medium", "Sort three distinct values in one pass.", ["Sorting", "Two Pointer"], "O(n)", "O(1)", "Maintain low, mid, and high regions.", "Values before low are 0s, after high are 2s, and mid scans unknown values. Swap into the correct region.", "sort"),
    practiceQuestion("Medium Problems", "Kth Smallest Element", "Medium", "Find kth smallest without fully sorting.", ["Sorting", "Quickselect"], "O(n) average", "O(1)", "Partition like quick sort.", "After partition, compare pivot index with k. Recurse only into the side that can contain the answer.", "sort"),
    practiceQuestion("Advanced Problems", "Count Inversions", "Hard", "Count pairs i < j where nums[i] > nums[j].", ["Sorting", "Merge Sort"], "O(n log n)", "O(n)", "Count during merge.", "When a right value is placed before remaining left values, it forms inversions with all those left values.", "sort"),
  ],
  "trees": [
    practiceQuestion("Top Interview Questions", "Maximum Depth of Binary Tree", "Easy", "Return the longest root-to-leaf path length.", ["Tree", "DFS"], "O(n)", "O(h)", "Depth is one plus the deeper child.", "Recursively ask left and right subtrees for their depth. The current answer is 1 + max(left, right).", "tree"),
    practiceQuestion("Beginner Problems", "Inorder Traversal", "Easy", "Visit nodes in left-root-right order.", ["Tree", "Traversal"], "O(n)", "O(h)", "Left side finishes before root.", "DFS left, record root, DFS right. In a BST this produces sorted values.", "tree"),
    practiceQuestion("Medium Problems", "Validate Binary Search Tree", "Medium", "Check whether every node respects BST ordering.", ["Tree", "BST"], "O(n)", "O(h)", "Carry allowed min/max bounds.", "Each left child must be below the node and each right child above it. Recursively tighten the valid range.", "tree"),
    practiceQuestion("Advanced Problems", "Lowest Common Ancestor", "Medium", "Find the deepest node that has both targets below it.", ["Tree", "DFS"], "O(n)", "O(h)", "A node is the answer when targets split across sides.", "Return the node if it matches a target. Recurse left and right; if both return non-null, current is LCA.", "tree"),
  ],
  "graphs": [
    practiceQuestion("Top Interview Questions", "Breadth First Search", "Easy", "Visit graph nodes level by level from a start node.", ["Graph", "BFS"], "O(V+E)", "O(V)", "A queue stores the current frontier.", "Mark start as seen, enqueue it, then repeatedly dequeue and add unseen neighbors. This prevents cycles from repeating.", "graph"),
    practiceQuestion("Beginner Problems", "Count Connected Components", "Medium", "Count separate groups in an undirected graph.", ["Graph", "DFS"], "O(V+E)", "O(V)", "Every unvisited node begins a new component.", "Loop through vertices. If a vertex is unseen, run DFS/BFS from it and increment the component count.", "graph"),
    practiceQuestion("Medium Problems", "Detect Cycle in Directed Graph", "Medium", "Return whether a directed graph has a cycle.", ["Graph", "DFS"], "O(V+E)", "O(V)", "Track nodes in the current recursion path.", "Use colors: unvisited, visiting, done. Seeing a visiting neighbor means a back edge and therefore a cycle.", "graph"),
    practiceQuestion("Advanced Problems", "Dijkstra Shortest Path", "Hard", "Find shortest paths from a source with non-negative weights.", ["Graph", "Priority Queue"], "O((V+E) log V)", "O(V)", "Always expand the closest unsettled node.", "Use a min-heap of distance/node pairs. Skip stale entries and relax outgoing edges to improve distances.", "heap"),
  ],
};

Object.values(practiceQuestions).forEach((questions) => {
  questions.forEach((question) => {
    question.category = question.difficulty;
    question.timeComplexity = question.time;
    question.spaceComplexity = question.space;
  });
});

const extraPracticeQuestions = {
  "arrays": [
    ["Easy", "Best Time to Buy and Sell Stock", "Find the maximum profit from one buy and one sell.", ["Array", "Greedy"], "O(n)", "O(1)", "Track the lowest price before today.", "Intuition: selling today is only useful if we know the cheapest earlier buy. Algorithm: scan prices, update min price, and maximize price - min. Dry run: [7,1,5] sets min to 1 then profit to 4.", "stock"],
    ["Easy", "Rotate Array", "Rotate an array to the right by k positions in place.", ["Array", "Two Pointer"], "O(n)", "O(1)", "Three reversals produce the rotated order.", "Reverse the whole array, reverse the first k values, then reverse the rest. For [1,2,3,4,5] and k=2: [5,4,3,2,1] -> [4,5,3,2,1] -> [4,5,1,2,3].", "rotateArray"],
    ["Medium", "Maximum Subarray", "Find the maximum possible sum over a contiguous subarray.", ["Array", "Dynamic Programming"], "O(n)", "O(1)", "Decide whether to extend or restart at each value.", "Kadane's algorithm keeps current best ending here and global best. If current sum becomes worse than the value alone, restart at the value.", "kadane"],
    ["Medium", "Product of Array Except Self", "Return product of every element except the current index without division.", ["Array", "Prefix Suffix"], "O(n)", "O(1) extra", "Multiply prefix products and suffix products into the answer.", "First pass writes product of values to the left. Second pass multiplies values to the right. Each index receives leftProduct * rightProduct.", "productExceptSelf"],
    ["Medium", "Merge Intervals", "Merge all overlapping intervals.", ["Array", "Sorting"], "O(n log n)", "O(n)", "Sort intervals by start time first.", "Once sorted, only the last merged interval can overlap the current one. Extend its end or append a new interval.", "mergeIntervals"],
    ["Hard", "Maximum Product Subarray", "Find the maximum product of a contiguous subarray.", ["Array", "Dynamic Programming"], "O(n)", "O(1)", "A negative number can turn the smallest product into the largest.", "Track both maxEnding and minEnding. Swap their roles when multiplied by a negative value, then update the answer.", "kadane"],
    ["Hard", "Median of Two Sorted Arrays", "Find the median of two sorted arrays in logarithmic time.", ["Array", "Binary Search"], "O(log(min(n,m)))", "O(1)", "Binary search the smaller array's partition.", "Choose a partition so left halves contain half the values. Adjust until every left value is <= every right value, then compute median from boundary values.", "binarySearch"],
  ],
  "linked-lists": [
    ["Easy", "Merge Two Sorted Lists", "Merge two sorted linked lists into one sorted list.", ["Linked List", "Two Pointer"], "O(n+m)", "O(1)", "Use a dummy head and always attach the smaller node.", "Compare list heads, append the smaller node, and advance that list. When one list ends, attach the remainder.", "mergeLists"],
    ["Easy", "Intersection of Linked Lists", "Return the node where two singly linked lists intersect.", ["Linked List", "Two Pointer"], "O(n+m)", "O(1)", "Switch heads when a pointer reaches the end.", "Two pointers traverse both lists. Switching to the other head equalizes path length, so they meet at the intersection or null.", "reverseList"],
    ["Medium", "Palindrome Linked List", "Check whether linked list values read the same forward and backward.", ["Linked List", "Fast Slow Pointer"], "O(n)", "O(1)", "Reverse the second half, then compare halves.", "Find the midpoint with slow/fast pointers, reverse the second half, compare node by node, and optionally restore the list.", "reverseList"],
    ["Medium", "Add Two Numbers", "Add two numbers stored in reverse-order linked lists.", ["Linked List", "Math"], "O(max(n,m))", "O(max(n,m))", "Carry works the same as column addition.", "Walk both lists together, sum values plus carry, create digit node, and carry sum / 10 to the next position.", "mergeLists"],
    ["Hard", "Reverse Nodes in K Group", "Reverse nodes in groups of size k.", ["Linked List", "Pointer"], "O(n)", "O(1)", "Only reverse when a full group exists.", "Find the kth node, detach the group, reverse it, reconnect previous group tail to new head, and continue.", "reverseList"],
    ["Hard", "Copy List with Random Pointer", "Deep copy a list where each node has next and random pointers.", ["Linked List", "Hash Map"], "O(n)", "O(n)", "Map original nodes to copied nodes.", "First create all copied nodes. Second pass wires next and random using the map. This preserves arbitrary random jumps.", "mergeLists"],
  ],
  "doubly-linked-lists": [
    ["Easy", "Reverse a Doubly Linked List", "Reverse prev and next pointers for every node.", ["Doubly Linked List", "Pointer"], "O(n)", "O(1)", "Swap next and prev at each node.", "For each node, swap prev and next, then move using the new prev pointer. The old tail becomes the new head.", "reverseList"],
    ["Easy", "Delete Head or Tail", "Remove from either end while preserving both links.", ["Doubly Linked List"], "O(1)", "O(1)", "Update the neighbor pointer and the external head/tail.", "For head deletion, move head to head.next and clear prev. For tail deletion, move tail to tail.prev and clear next.", "reverseList"],
    ["Medium", "Browser Back and Forward", "Design history navigation using a doubly linked list.", ["Doubly Linked List", "Design"], "O(1)", "O(n)", "Current page is a node; prev and next are navigation.", "Visit creates a new node after current and drops forward history. Back moves prev up to steps times; forward moves next.", "reverseList"],
    ["Medium", "Find Pairs with Given Sum in Sorted DLL", "Find all pairs in a sorted doubly linked list that sum to target.", ["Doubly Linked List", "Two Pointer"], "O(n)", "O(1)", "Use head and tail like array two pointers.", "Move left forward when sum is small and right backward when sum is large. Record equal sums.", "twoSum"],
    ["Hard", "Design All O One Data Structure", "Maintain keys with O(1) increment, decrement, max, and min.", ["Doubly Linked List", "Hash Map"], "O(1)", "O(n)", "Buckets of equal counts form a doubly linked list.", "Move keys between neighboring count buckets on inc/dec. Head gives min count and tail gives max count.", "reverseList"],
  ],
  "circular-linked-lists": [
    ["Easy", "Traversal of Circular Linked List", "Print each node once without infinite looping.", ["Circular List", "Traversal"], "O(n)", "O(1)", "Stop when the pointer returns to head.", "Handle empty list first. Visit head, then continue with current.next until current equals head again.", "reverseList"],
    ["Medium", "Sorted Insert in Circular Linked List", "Insert a value into a sorted circular linked list.", ["Circular List", "Pointer"], "O(n)", "O(1)", "Find a normal sorted gap or the rotation break.", "Walk pairs current and next. Insert when current <= x <= next, or at the max-to-min boundary.", "reverseList"],
    ["Medium", "Delete Given Node in Circular List", "Delete a target node while preserving the cycle.", ["Circular List", "Pointer"], "O(n)", "O(1)", "Keep track of previous node.", "Find the target by looping until head repeats. Rewire prev.next to current.next and adjust head if needed.", "reverseList"],
    ["Hard", "Josephus Survivor", "Return the survivor when every kth person is removed.", ["Circular List", "Recursion"], "O(n)", "O(1)", "The survivor index shifts after each removal.", "The recurrence is f(1)=0 and f(n)=(f(n-1)+k)%n. Convert to one-based if required.", "recursion"],
  ],
  "stack": [
    ["Medium", "Evaluate Postfix Expression", "Evaluate reverse polish notation tokens.", ["Stack", "Expression"], "O(n)", "O(n)", "Operands wait on the stack until an operator arrives.", "Push numbers. For an operator, pop b then a, compute a op b, and push the result.", "postfix"],
    ["Medium", "Daily Temperatures", "For each day, find how many days until a warmer temperature.", ["Stack", "Monotonic Stack"], "O(n)", "O(n)", "Store unresolved day indices.", "When today's temperature is warmer than the stack top day, today resolves that earlier day. Continue popping smaller temperatures.", "stack"],
    ["Hard", "Largest Rectangle in Histogram", "Find the largest rectangle area in a histogram.", ["Stack", "Monotonic Stack"], "O(n)", "O(n)", "A smaller bar finalizes rectangles for taller bars.", "Use an increasing stack of indices. When height drops, pop and compute area using current index as right boundary.", "histogram"],
    ["Hard", "Basic Calculator", "Evaluate an expression containing integers, plus, minus, and parentheses.", ["Stack", "Parsing"], "O(n)", "O(n)", "Push sign context before entering parentheses.", "Accumulate current number and sign. On '(', push result and sign; on ')', close the sub-expression and merge it.", "postfix"],
  ],
  "queue": [
    ["Easy", "Implement Queue using Stacks", "Build FIFO queue behavior using two stacks.", ["Queue", "Stack"], "O(1) amortized", "O(n)", "Move items to output stack only when needed.", "Push into input stack. For pop/peek, transfer input to output if output is empty, then use output top.", "stack"],
    ["Medium", "Number of Recent Calls", "Count calls within the last 3000 milliseconds.", ["Queue", "Design"], "O(1) amortized", "O(n)", "Old timestamps leave from the front.", "Enqueue the new time and dequeue while front is smaller than t - 3000. Queue size is the answer.", "queue"],
    ["Medium", "Moving Average from Data Stream", "Return average of the last size values.", ["Queue", "Design"], "O(1)", "O(k)", "Keep a running sum.", "Enqueue new value, add it to sum, and if the queue is too large remove the oldest value from sum.", "queue"],
    ["Hard", "Shortest Path in Binary Matrix", "Find shortest 8-direction path in a binary grid.", ["Queue", "BFS"], "O(n^2)", "O(n^2)", "Each BFS layer adds one path length.", "Start from top-left if open, push neighbors that are in bounds and open, and stop when bottom-right is reached.", "graph"],
  ],
  "circular-queue": [
    ["Easy", "Circular Buffer Insert and Delete", "Implement insert/delete operations in a fixed circular buffer.", ["Circular Queue", "Array"], "O(1)", "O(k)", "Front and rear wrap with modulo.", "Use (index + 1) % capacity to wrap around. Track size so full and empty states are unambiguous.", "queue"],
    ["Medium", "Design Circular Deque", "Support insert/delete at both ends with fixed capacity.", ["Circular Queue", "Deque"], "O(1)", "O(k)", "Both front and rear can wrap.", "Insert front by moving front backward with modulo; insert rear at rear then advance. Size tracks capacity.", "queue"],
    ["Medium", "CPU Round Robin Scheduling", "Simulate processes with a circular ready queue.", ["Circular Queue", "Simulation"], "O(total slices)", "O(n)", "Unfinished processes return to the rear.", "Pop the front process, run it for quantum time, and push it back if remaining time is positive.", "queue"],
    ["Hard", "Bounded Blocking Queue Design", "Design a capacity-limited queue API.", ["Circular Queue", "Design"], "O(1)", "O(k)", "A circular array prevents shifting.", "Use front, rear, size, and capacity. Enqueue waits or fails when full; dequeue waits or fails when empty.", "queue"],
  ],
  "deque": [
    ["Easy", "Reverse First K Elements of Queue", "Reverse only the first k queue elements.", ["Deque", "Queue"], "O(n)", "O(k)", "A stack or deque can reverse the first segment.", "Move first k values into a stack, enqueue them back reversed, then rotate the untouched suffix.", "queue"],
    ["Medium", "Constrained Subsequence Sum", "Find max subsequence sum where adjacent chosen indices differ by at most k.", ["Deque", "Dynamic Programming"], "O(n)", "O(k)", "Deque stores best dp values in the active window.", "dp[i] = nums[i] + max(0, best previous dp in window). Maintain decreasing dp indices in a deque.", "queue"],
    ["Hard", "Sliding Window Maximum", "Find maximum value in every window of size k.", ["Deque", "Monotonic Queue"], "O(n)", "O(k)", "The deque front is always the max candidate.", "Remove expired front indices, drop smaller values from the back, push current index, and read front after first window.", "queue"],
    ["Hard", "Shortest Subarray with Sum at Least K", "Find minimum-length subarray whose sum is at least k.", ["Deque", "Prefix Sum"], "O(n)", "O(n)", "Increasing prefix sums remove dominated starts.", "Use prefix sums. Pop front while current - oldest >= k and pop back while current prefix is smaller.", "queue"],
  ],
  "priority-queue": [
    ["Easy", "Last Stone Weight", "Smash the two heaviest stones until one remains.", ["Priority Queue", "Heap"], "O(n log n)", "O(n)", "Use a max-heap.", "Push all stones as priorities. Pop two largest; if unequal, push their difference back.", "heap"],
    ["Medium", "Top K Frequent Elements", "Return the k most frequent values.", ["Priority Queue", "Hash Map"], "O(n log k)", "O(n)", "Count first, then keep the best k.", "Build a frequency map. Maintain a min-heap by frequency and trim it to size k.", "heap"],
    ["Medium", "K Closest Points to Origin", "Return k points closest to (0,0).", ["Priority Queue", "Geometry"], "O(n log k)", "O(k)", "Compare squared distance.", "Keep a max-heap of k closest points. If a new point is closer than heap top, replace it.", "heap"],
    ["Hard", "Find Median from Data Stream", "Support addNum and findMedian efficiently.", ["Priority Queue", "Two Heaps"], "O(log n)", "O(n)", "Lower half max-heap, upper half min-heap.", "Balance heaps so their sizes differ by at most one. Median is top of larger heap or average of both tops.", "heap"],
  ],
  "recursion": [
    ["Easy", "Fibonacci Number", "Compute the nth Fibonacci number.", ["Recursion", "Memoization"], "O(n)", "O(n)", "Cache repeated calls.", "The recursion tree repeats fib(n-2) branches. Memoization stores solved n values and turns exponential work into linear work.", "recursion"],
    ["Easy", "Tower of Hanoi", "Print moves to move n disks between rods.", ["Recursion", "Divide and Conquer"], "O(2^n)", "O(n)", "Move n-1 disks out of the way first.", "Move n-1 from source to helper, move largest disk to target, then move n-1 from helper to target.", "recursion"],
    ["Medium", "Generate Parentheses", "Generate all valid parentheses strings with n pairs.", ["Recursion", "Backtracking"], "O(Cn)", "O(n)", "Never place more ')' than '(' in the path.", "Backtrack with counts of open and close parentheses. Add '(' if open < n and ')' if close < open.", "generateParentheses"],
    ["Hard", "Word Search", "Find whether a word exists in a grid path.", ["Recursion", "Backtracking"], "O(rows*cols*4^L)", "O(L)", "Mark a cell as used during the current path.", "Try every starting cell. DFS to adjacent cells matching the next character, temporarily marking visited cells.", "graph"],
  ],
  "linear-search": [
    ["Easy", "Find Missing Number by Scan", "Find the missing value from 1..n using a visited scan.", ["Linear Search", "Array"], "O(n)", "O(n)", "Mark seen values.", "Create a seen array, mark every value present, then linearly scan for the first unmarked number.", "twoSum"],
    ["Easy", "Sentinel Linear Search", "Search a target with one comparison inside the loop.", ["Linear Search"], "O(n)", "O(1)", "Put the target at the last position temporarily.", "Save the last value, place target at the end, scan until target appears, then restore and validate whether it was real.", "binarySearch"],
    ["Medium", "Find Majority Element", "Find value appearing more than n/2 times.", ["Linear Search", "Voting"], "O(n)", "O(1)", "Cancel different values against each other.", "Boyer-Moore keeps a candidate and count. Equal values add confidence; different values cancel it.", "twoSum"],
    ["Hard", "Minimum Window Substring", "Find the smallest substring containing all required characters.", ["Linear Search", "Sliding Window"], "O(n)", "O(k)", "Expand right, then shrink left while valid.", "Track required counts and formed matches. Once the window is valid, shrink from the left to minimize it.", "queue"],
  ],
  "binary-search": [
    ["Easy", "Square Root using Binary Search", "Return floor square root of a non-negative integer.", ["Binary Search", "Math"], "O(log n)", "O(1)", "Search the answer range, not an array.", "Binary search numbers from 0 to n. If mid*mid <= n, mid is a candidate and search right.", "binarySearch"],
    ["Medium", "Find Minimum in Rotated Sorted Array", "Find the smallest value in a rotated sorted array.", ["Binary Search", "Rotated Array"], "O(log n)", "O(1)", "Compare mid with high.", "If nums[mid] > nums[high], minimum is right of mid. Otherwise it is at mid or left of mid.", "binarySearch"],
    ["Medium", "Koko Eating Bananas", "Find minimum eating speed to finish within h hours.", ["Binary Search", "Answer Search"], "O(n log m)", "O(1)", "Binary search the speed.", "For a speed, compute total hours using ceiling division. If feasible, try smaller speed; otherwise try larger.", "binarySearch"],
    ["Hard", "Aggressive Cows", "Maximize minimum distance between placed cows.", ["Binary Search", "Greedy"], "O(n log range)", "O(1)", "Check if a distance is feasible greedily.", "Sort stalls. For a candidate distance, place cows greedily at the earliest valid stalls. Binary search the largest feasible distance.", "binarySearch"],
  ],
  "sorting-algorithms": [
    ["Easy", "Sort an Array with Insertion Sort", "Implement insertion sort and return sorted values.", ["Sorting", "Insertion Sort"], "O(n^2)", "O(1)", "Grow a sorted prefix.", "For each value, shift larger prefix values one position right and insert the key into the gap.", "sort"],
    ["Medium", "Quick Sort Partition", "Partition an array around a pivot value.", ["Sorting", "Partition"], "O(n)", "O(1)", "Values smaller than pivot go before store index.", "Scan the range. Swap smaller values into the left partition, then place pivot at the store index.", "sort"],
    ["Medium", "Sort Colors", "Sort an array containing only 0, 1, and 2.", ["Sorting", "Dutch Flag"], "O(n)", "O(1)", "Maintain three regions.", "low tracks next 0 slot, high tracks next 2 slot, and mid scans unknown values.", "sort"],
    ["Hard", "External Merge Sort", "Sort data too large for memory.", ["Sorting", "Merge"], "O(n log n)", "O(chunk)", "Sort chunks first, then k-way merge.", "Split input into memory-sized chunks, sort each chunk, write runs, then merge runs with a min-heap.", "heap"],
  ],
  "trees": [
    ["Easy", "Balanced Binary Tree", "Check whether every subtree height differs by at most one.", ["Tree", "DFS"], "O(n)", "O(h)", "Return -1 when a subtree is already unbalanced.", "Postorder DFS computes child heights. If either child is invalid or height gap is too large, bubble up failure.", "tree"],
    ["Medium", "Level Order Traversal", "Return node values level by level.", ["Tree", "BFS"], "O(n)", "O(w)", "Queue stores the next level.", "Process exactly queue.size nodes per level, adding their children for the next round.", "levelOrder"],
    ["Medium", "Diameter of Binary Tree", "Find longest path between any two nodes.", ["Tree", "DFS"], "O(n)", "O(h)", "Each node offers leftHeight + rightHeight as a path.", "DFS returns height while updating a global best diameter with the path passing through each node.", "diameter"],
    ["Hard", "Serialize and Deserialize Binary Tree", "Convert a tree to a string and rebuild it.", ["Tree", "Design"], "O(n)", "O(n)", "Include null markers.", "Preorder traversal writes value or null. Deserialization consumes tokens in the same order to rebuild left and right subtrees.", "tree"],
  ],
  "graphs": [
    ["Easy", "DFS Traversal", "Visit all reachable graph nodes depth-first.", ["Graph", "DFS"], "O(V+E)", "O(V)", "Mark before recursing.", "Add node to seen, record it, then recursively visit unseen neighbors. Seen prevents cycles from looping forever.", "graph"],
    ["Medium", "Detect Cycle in Undirected Graph", "Check whether an undirected graph contains a cycle.", ["Graph", "DFS"], "O(V+E)", "O(V)", "Ignore the edge back to parent.", "DFS with parent tracking. If you see an already visited neighbor that is not parent, there is a cycle.", "graph"],
    ["Medium", "Topological Sort", "Return a valid order for directed acyclic graph tasks.", ["Graph", "Topological Sort"], "O(V+E)", "O(V)", "Start with zero indegree nodes.", "Kahn's algorithm repeatedly removes zero-indegree nodes and reduces indegrees of their outgoing neighbors.", "topologicalSort"],
    ["Hard", "Network Delay Time", "Find when all nodes receive a signal from the source.", ["Graph", "Dijkstra"], "O((V+E) log V)", "O(V+E)", "Use the nearest unprocessed node first.", "Run Dijkstra with a min-heap. Relax directed weighted edges and take the maximum final distance.", "heap"],
  ],
};

Object.entries(extraPracticeQuestions).forEach(([topic, questions]) => {
  const existing = new Set((practiceQuestions[topic] || []).map((question) => question.title));
  questions.forEach(([difficulty, title, description, tags, time, space, hint, approach, snippetKey]) => {
    if (existing.has(title)) return;
    const question = practiceQuestion(difficulty, title, difficulty, description, tags, time, space, hint, approach, snippetKey);
    question.timeComplexity = time;
    question.spaceComplexity = space;
    practiceQuestions[topic].push(question);
    existing.add(title);
  });
});

const practiceState = {
  topic: "arrays",
  difficulty: "all",
  favoritesOnly: false,
  favorites: new Set(JSON.parse(localStorage.getItem("dsaQuestPracticeFavorites") || "[]")),
};

function getQuestionId(topic, question) {
  return `${topic}:${question.title}`;
}

function persistPracticeFavorites() {
  localStorage.setItem("dsaQuestPracticeFavorites", JSON.stringify([...practiceState.favorites]));
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function questionMatches(question, topic) {
  const favoriteMatch = !practiceState.favoritesOnly || practiceState.favorites.has(getQuestionId(topic, question));
  const difficultyMatch = practiceState.difficulty === "all" || question.difficulty === practiceState.difficulty;

  return favoriteMatch && difficultyMatch;
}

function compactQuestionList(questions, topic) {
  if (practiceState.favoritesOnly) return questions;

  const maxPerDifficulty = practiceState.difficulty === "all" ? 3 : 9;
  const visible = [];
  categoryLabels.forEach((difficulty) => {
    visible.push(
      ...questions
        .filter((question) => question.category === difficulty)
        .slice(0, maxPerDifficulty)
    );
  });
  return visible.filter((question) => questionMatches(question, topic));
}

function renderQuestionCard(question, topic) {
  const questionId = getQuestionId(topic, question);
  const card = document.createElement("article");
  card.className = "question-card";

  const toggle = document.createElement("div");
  toggle.className = "question-toggle";
  toggle.setAttribute("role", "button");
  toggle.setAttribute("tabindex", "0");
  toggle.setAttribute("aria-expanded", "false");

  const main = document.createElement("div");
  const titleRow = document.createElement("div");
  titleRow.className = "question-title-row";
  titleRow.appendChild(createTextElement("h4", "", question.title));
  titleRow.appendChild(createTextElement("span", `difficulty-badge ${question.difficulty.toLowerCase()}`, question.difficulty));
  main.appendChild(titleRow);
  main.appendChild(createTextElement("p", "question-description", question.description));

  const meta = document.createElement("div");
  meta.className = "question-meta";
  question.tags.forEach((tag) => meta.appendChild(createTextElement("span", "tag-pill", tag)));
  main.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "question-actions";
  const favoriteButton = document.createElement("button");
  favoriteButton.className = `icon-button ${practiceState.favorites.has(questionId) ? "active" : ""}`;
  favoriteButton.type = "button";
  favoriteButton.title = "Save question";
  favoriteButton.setAttribute("aria-label", "Save question");
  favoriteButton.textContent = practiceState.favorites.has(questionId) ? "*" : "+";
  favoriteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (practiceState.favorites.has(questionId)) {
      practiceState.favorites.delete(questionId);
    } else {
      practiceState.favorites.add(questionId);
    }
    persistPracticeFavorites();
    renderPracticeSession();
  });
  const expandIcon = createTextElement("span", "expand-indicator", "v");
  actions.appendChild(favoriteButton);
  actions.appendChild(expandIcon);

  toggle.appendChild(main);
  toggle.appendChild(actions);

  const details = document.createElement("div");
  details.className = "question-details";
  const detailsInner = document.createElement("div");
  detailsInner.className = "question-details-inner";
  const content = document.createElement("div");
  content.className = "question-detail-content";

  const hintButton = document.createElement("button");
  hintButton.type = "button";
  hintButton.textContent = "Reveal Hint";
  const hintBox = createTextElement("div", "hint-box", question.hint);
  hintButton.addEventListener("click", () => {
    hintBox.classList.toggle("visible");
    hintButton.textContent = hintBox.classList.contains("visible") ? "Hide Hint" : "Reveal Hint";
  });

  content.appendChild(hintButton);
  content.appendChild(hintBox);
  const detailMeta = document.createElement("div");
  detailMeta.className = "question-meta detail-meta";
  detailMeta.appendChild(createTextElement("span", "complexity-pill", `Time ${question.time}`));
  detailMeta.appendChild(createTextElement("span", "complexity-pill", `Space ${question.space}`));
  content.appendChild(detailMeta);
  content.appendChild(createTextElement("div", "approach-box", `Solution Approach: ${question.approach}`));

  const solutionGrid = document.createElement("div");
  solutionGrid.className = "solution-grid";
  [
    ["Python Solution", question.python],
    ["Java Solution", question.java],
  ].forEach(([label, code]) => {
    const block = document.createElement("div");
    block.className = "solution-block";
    block.appendChild(createTextElement("h5", "", label));
    const pre = document.createElement("pre");
    const codeEl = document.createElement("code");
    codeEl.textContent = code;
    pre.appendChild(codeEl);
    block.appendChild(pre);
    solutionGrid.appendChild(block);
  });
  content.appendChild(solutionGrid);
  detailsInner.appendChild(content);
  details.appendChild(detailsInner);

  toggle.addEventListener("click", () => {
    const expanded = card.classList.toggle("expanded");
    toggle.setAttribute("aria-expanded", String(expanded));
  });
  toggle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const expanded = card.classList.toggle("expanded");
    toggle.setAttribute("aria-expanded", String(expanded));
  });

  card.appendChild(toggle);
  card.appendChild(details);
  return card;
}

function renderPracticeSession() {
  const root = document.querySelector("[data-practice-session]");
  if (!root) return;

  const results = root.querySelector("[data-practice-results]");
  const topicLabel = root.querySelector("[data-practice-topic-label]");
  const countLabel = root.querySelector("[data-practice-count]");
  const bookmarkCount = root.querySelector("[data-practice-bookmark-count]");
  const showBookmarks = root.querySelector("[data-practice-show-bookmarks]");
  const topicName = practiceTopics.find(([id]) => id === practiceState.topic)?.[1] || "Arrays";
  const questions = practiceQuestions[practiceState.topic] || [];
  const matched = questions.filter((question) => questionMatches(question, practiceState.topic));
  const filtered = compactQuestionList(matched, practiceState.topic);

  topicLabel.textContent = topicName;
  countLabel.textContent = `${filtered.length} top question${filtered.length === 1 ? "" : "s"}`;
  bookmarkCount.textContent = `${practiceState.favorites.size} favorite${practiceState.favorites.size === 1 ? "" : "s"}`;
  showBookmarks.setAttribute("aria-pressed", String(practiceState.favoritesOnly));
  showBookmarks.textContent = practiceState.favoritesOnly ? "Show All" : "Show Favorites";
  results.innerHTML = "";

  if (!filtered.length) {
    results.appendChild(createTextElement("div", "empty-practice", "No questions match the current filters. Try another topic or difficulty."));
    return;
  }

  categoryLabels.forEach((category) => {
    const group = filtered.filter((question) => question.category === category);
    if (!group.length) return;

    const section = document.createElement("section");
    section.className = "practice-category";
    const head = document.createElement("div");
    head.className = "practice-category-head";
    head.appendChild(createTextElement("h3", "", category));
    head.appendChild(createTextElement("span", "", `${group.length} problem${group.length === 1 ? "" : "s"}`));
    const grid = document.createElement("div");
    grid.className = "practice-card-grid";
    group.forEach((question) => grid.appendChild(renderQuestionCard(question, practiceState.topic)));
    section.appendChild(head);
    section.appendChild(grid);
    results.appendChild(section);
  });
}

const quizState = {
  topic: "arrays",
  questions: [],
  index: 0,
  selected: null,
  answers: [],
};

function resolvePanelTopic(panel) {
  if (panel.matches("[data-sort-panel]")) return panel.dataset.algorithm || "sorting-algorithms";
  if (panel.matches("[data-search-panel]")) return panel.dataset.algorithm || "linear-search";
  if (panel.matches("[data-list-panel]")) {
    const map = {
      "singly-linked-list": "linked-lists",
      "doubly-linked-list": "doubly-linked-lists",
      "circular-linked-list": "circular-linked-lists",
    };
    return map[panel.dataset.list] || "linked-lists";
  }
  if (panel.matches("[data-stack-viz]")) return "stack";
  if (panel.matches("[data-queue-panel]")) return panel.dataset.queue === "circular-queue-operations" ? "circular-queue" : "queue";
  if (panel.matches("[data-deque-panel]")) return "deque";
  if (panel.matches("[data-recursion-panel]")) return "recursion";
  return "arrays";
}

function topicToPracticeTopic(topic) {
  const sortTopics = new Set(["bubble-sort", "selection-sort", "insertion-sort", "quick-sort", "merge-sort"]);
  if (sortTopics.has(topic)) return "sorting-algorithms";
  return topic;
}

function navigateToPracticeTopic(topic) {
  const practiceTopic = topicToPracticeTopic(topic);
  practiceState.topic = practiceTopic;
  practiceState.favoritesOnly = false;
  const root = document.querySelector("[data-practice-session]");
  const select = root?.querySelector("[data-practice-topic]");
  if (select) select.value = practiceTopic;
  renderPracticeSession();
  history.replaceState(null, "", `#practice?topic=${encodeURIComponent(practiceTopic)}`);
  document.querySelector("#practice")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createLearningActions(topic) {
  const row = document.createElement("div");
  row.className = "module-action-row";

  const quizButton = document.createElement("button");
  quizButton.type = "button";
  quizButton.className = "module-action quiz-action";
  quizButton.textContent = "Theory Quiz";
  quizButton.addEventListener("click", () => openQuiz(topic));

  const practiceButton = document.createElement("button");
  practiceButton.type = "button";
  practiceButton.className = "module-action practice-action";
  practiceButton.textContent = "Practice Coding";
  practiceButton.addEventListener("click", () => navigateToPracticeTopic(topic));

  row.appendChild(quizButton);
  row.appendChild(practiceButton);
  return row;
}

function initModuleActionButtons() {
  document.querySelectorAll("[data-complexity-panel]").forEach((panel) => {
    if (panel.querySelector(".module-action-row")) return;
    const topic = resolvePanelTopic(panel);
    const controls = panel.querySelector(".sort-controls");
    const startButton = controls?.querySelector(".primary-action, [data-stack-start], [data-recursion-start], [data-deque-start], [data-start]");
    if (startButton) {
      startButton.insertAdjacentElement("afterend", createLearningActions(topic));
      return;
    }
    const titleBlock = panel.querySelector(".sort-head > div:first-child") || panel.querySelector(".stage-header > div:first-child");
    titleBlock?.appendChild(createLearningActions(topic));
  });
}

function openQuiz(topic) {
  const resolvedTopic = quizQuestions[topic] ? topic : topicToPracticeTopic(topic);
  quizState.topic = resolvedTopic;
  quizState.questions = quizQuestions[resolvedTopic] || quizQuestions.arrays;
  quizState.index = 0;
  quizState.selected = null;
  quizState.answers = [];

  const modal = document.querySelector("[data-quiz-modal]");
  modal?.classList.add("open");
  modal?.setAttribute("aria-hidden", "false");
  renderQuizQuestion();
}

function closeQuiz() {
  const modal = document.querySelector("[data-quiz-modal]");
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
}

function renderQuizQuestion() {
  const body = document.querySelector("[data-quiz-body]");
  const title = document.querySelector("[data-quiz-title]");
  const score = document.querySelector("[data-quiz-score]");
  const progress = document.querySelector("[data-quiz-progress]");
  const step = document.querySelector("[data-quiz-step]");
  if (!body || !title || !score || !progress || !step) return;

  const question = quizState.questions[quizState.index];
  const total = quizState.questions.length;
  const correctCount = quizState.answers.filter((item) => item.isCorrect).length;
  title.textContent = `${topicLabels[quizState.topic] || topicLabels[topicToPracticeTopic(quizState.topic)] || "DSA"} Quiz`;
  score.textContent = `Score ${correctCount}/${total}`;
  step.textContent = `Question ${quizState.index + 1}/${total}`;
  progress.style.width = `${((quizState.index + 1) / total) * 100}%`;

  body.innerHTML = "";
  const questionCard = document.createElement("div");
  questionCard.className = "quiz-question-card";
  questionCard.appendChild(createTextElement("span", "quiz-difficulty", question.difficulty));
  questionCard.appendChild(createTextElement("h4", "", question.question));

  const optionGrid = document.createElement("div");
  optionGrid.className = "quiz-option-grid";
  question.options.forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "quiz-option";
    optionButton.textContent = option;
    optionButton.addEventListener("click", () => {
      quizState.selected = option;
      optionGrid.querySelectorAll(".quiz-option").forEach((button) => button.classList.remove("selected"));
      optionButton.classList.add("selected");
      nextButton.disabled = false;
    });
    optionGrid.appendChild(optionButton);
  });

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "primary-action quiz-next";
  nextButton.textContent = quizState.index === total - 1 ? "Show Result" : "Next Question";
  nextButton.disabled = true;
  nextButton.addEventListener("click", () => {
    const isCorrect = quizState.selected === question.answer;
    quizState.answers.push({
      question: question.question,
      selected: quizState.selected,
      answer: question.answer,
      explanation: question.explanation,
      isCorrect,
    });
    quizState.selected = null;
    if (quizState.index >= total - 1) {
      renderQuizResult();
    } else {
      quizState.index += 1;
      renderQuizQuestion();
    }
  });

  questionCard.appendChild(optionGrid);
  questionCard.appendChild(nextButton);
  body.appendChild(questionCard);
}

function renderQuizResult() {
  const body = document.querySelector("[data-quiz-body]");
  const score = document.querySelector("[data-quiz-score]");
  const progress = document.querySelector("[data-quiz-progress]");
  const step = document.querySelector("[data-quiz-step]");
  if (!body || !score || !progress || !step) return;

  const total = quizState.questions.length;
  const correctCount = quizState.answers.filter((item) => item.isCorrect).length;
  const percent = Math.round((correctCount / total) * 100);
  score.textContent = `Score ${correctCount}/${total}`;
  step.textContent = `Completed ${total}/${total}`;
  progress.style.width = "100%";
  body.innerHTML = "";

  const result = document.createElement("div");
  result.className = "quiz-result";
  result.appendChild(createTextElement("h4", "", `You scored ${percent}%`));
  result.appendChild(createTextElement("p", "", percent >= 80 ? "Strong work. Move into coding practice while the concept is fresh." : "Good checkpoint. Review the explanations below, then try the related practice questions."));

  const review = document.createElement("div");
  review.className = "quiz-review-list";
  quizState.answers.forEach((answer) => {
    const item = document.createElement("div");
    item.className = `quiz-review-item ${answer.isCorrect ? "correct" : "wrong"}`;
    item.appendChild(createTextElement("strong", "", answer.question));
    item.appendChild(createTextElement("span", "", `Your answer: ${answer.selected}`));
    item.appendChild(createTextElement("span", "", `Correct answer: ${answer.answer}`));
    item.appendChild(createTextElement("p", "", answer.explanation));
    review.appendChild(item);
  });

  const actions = document.createElement("div");
  actions.className = "quiz-result-actions";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "Retry Quiz";
  retry.addEventListener("click", () => openQuiz(quizState.topic));
  const practice = document.createElement("button");
  practice.type = "button";
  practice.className = "primary-action";
  practice.textContent = "Practice Coding";
  practice.addEventListener("click", () => {
    closeQuiz();
    navigateToPracticeTopic(quizState.topic);
  });
  actions.appendChild(retry);
  actions.appendChild(practice);

  result.appendChild(review);
  result.appendChild(actions);
  body.appendChild(result);
}

function initQuizModal() {
  document.querySelectorAll("[data-quiz-close]").forEach((button) => {
    button.addEventListener("click", closeQuiz);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeQuiz();
  });
}

const contestProblemBank = {
  arrayMax: {
    title: "Find Maximum Element",
    difficulty: "Easy",
    topic: "Arrays",
    points: 50,
    statement: "Given an array of integers, return the largest value.",
    input: "First line contains n. Second line contains n space-separated integers.",
    output: "Print the maximum integer.",
    constraints: "1 <= n <= 10^5, -10^9 <= arr[i] <= 10^9",
    examples: [{ input: "5\n4 9 1 6 2", output: "9" }],
    hints: ["Track a running best value while scanning once.", "Initialize best with the first element."],
    complexity: "O(n) time, O(1) space",
    checks: {
      python: ["max", "return"],
      java: ["for", "Math.max"],
      javascript: ["Math.max", "return"],
    },
    hidden: ["all negative numbers", "single element array"],
  },
  validParentheses: {
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    points: 50,
    statement: "Return whether every bracket in a string closes in the correct order.",
    input: "One string containing only (), {}, and [].",
    output: "Print true if valid, otherwise false.",
    constraints: "1 <= s.length <= 10^5",
    examples: [{ input: "{[()]}", output: "true" }, { input: "([)]", output: "false" }],
    hints: ["Push opening brackets.", "A closing bracket must match the current top."],
    complexity: "O(n) time, O(n) space",
    checks: {
      python: ["append", "pop", "return"],
      java: ["push", "pop", "return"],
      javascript: ["push", "pop", "return"],
    },
    hidden: ["empty after all matches", "early mismatch"],
  },
  binarySearch: {
    title: "Search Sorted Array",
    difficulty: "Medium",
    topic: "Searching",
    points: 100,
    statement: "Given a sorted array and target, return the target index or -1.",
    input: "First line has n and target. Second line has n sorted integers.",
    output: "Print the index of target, or -1.",
    constraints: "1 <= n <= 10^5",
    examples: [{ input: "6 7\n1 3 5 7 9 11", output: "3" }],
    hints: ["Keep low and high bounds.", "Discard half the search space after each comparison."],
    complexity: "O(log n) time, O(1) space",
    checks: {
      python: ["while", "mid", "return"],
      java: ["while", "mid", "return"],
      javascript: ["while", "mid", "return"],
    },
    hidden: ["missing target", "target at boundary"],
  },
  mergeIntervals: {
    title: "Merge Overlapping Intervals",
    difficulty: "Medium",
    topic: "Arrays",
    points: 100,
    statement: "Merge every overlapping interval and return the compact interval list.",
    input: "First line contains n. Next n lines contain start and end.",
    output: "Print merged intervals in ascending order.",
    constraints: "1 <= n <= 10^5",
    examples: [{ input: "4\n1 3\n2 6\n8 10\n15 18", output: "1 6\n8 10\n15 18" }],
    hints: ["Sort intervals by start.", "Only compare the current interval with the last merged interval."],
    complexity: "O(n log n) time, O(n) space",
    checks: {
      python: ["sort", "append", "return"],
      java: ["sort", "ArrayList", "return"],
      javascript: ["sort", "push", "return"],
    },
    hidden: ["touching intervals", "nested intervals"],
  },
  quickPartition: {
    title: "Quick Sort Partition",
    difficulty: "Medium",
    topic: "Sorting",
    points: 100,
    statement: "Partition an array around the last value as pivot and return the pivot index.",
    input: "First line contains n. Second line contains n integers.",
    output: "Print the final pivot index after partitioning.",
    constraints: "2 <= n <= 10^5",
    examples: [{ input: "5\n4 2 7 1 3", output: "2" }],
    hints: ["Maintain a store index for smaller values.", "Swap the pivot into store index at the end."],
    complexity: "O(n) time, O(1) space",
    checks: {
      python: ["pivot", "for", "return"],
      java: ["pivot", "for", "return"],
      javascript: ["pivot", "for", "return"],
    },
    hidden: ["already partitioned", "all values greater than pivot"],
  },
  reverseList: {
    title: "Reverse Linked List",
    difficulty: "Medium",
    topic: "Linked List",
    points: 100,
    statement: "Reverse a singly linked list and return the new head.",
    input: "A linked list head.",
    output: "The new head after all next pointers are reversed.",
    constraints: "0 <= nodes <= 10^5",
    examples: [{ input: "1 -> 2 -> 3", output: "3 -> 2 -> 1" }],
    hints: ["Keep previous, current, and next references.", "Redirect current.next before advancing."],
    complexity: "O(n) time, O(1) space",
    checks: {
      python: ["prev", "next", "return"],
      java: ["prev", "next", "return"],
      javascript: ["prev", "next", "return"],
    },
    hidden: ["empty list", "single node"],
  },
  recursionSubsets: {
    title: "Generate Subsets",
    difficulty: "Hard",
    topic: "Recursion",
    points: 200,
    statement: "Generate all subsets of a distinct integer array.",
    input: "First line contains n. Second line contains n distinct integers.",
    output: "Print every subset in any valid order.",
    constraints: "0 <= n <= 20",
    examples: [{ input: "3\n1 2 3", output: "[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]" }],
    hints: ["At each index, choose take or skip.", "Backtrack after exploring one branch."],
    complexity: "O(n * 2^n) time, O(n) recursion depth",
    checks: {
      python: ["def", "append", "return"],
      java: ["backtrack", "add", "return"],
      javascript: ["function", "push", "return"],
    },
    hidden: ["empty input", "larger subset tree"],
  },
  graphShortestPath: {
    title: "Shortest Path in Grid",
    difficulty: "Hard",
    topic: "Graphs",
    points: 200,
    statement: "Find the shortest path length from top-left to bottom-right in a binary grid.",
    input: "n and m, followed by a grid of 0 open cells and 1 blocked cells.",
    output: "Print the shortest path length, or -1 if unreachable.",
    constraints: "1 <= n,m <= 200",
    examples: [{ input: "3 3\n0 0 0\n1 1 0\n0 0 0", output: "5" }],
    hints: ["Use BFS from the start cell.", "Each queue layer adds one distance."],
    complexity: "O(n*m) time, O(n*m) space",
    checks: {
      python: ["deque", "while", "return"],
      java: ["Queue", "while", "return"],
      javascript: ["queue", "while", "return"],
    },
    hidden: ["blocked start", "unreachable target"],
  },
};

const contests = [
  contest("easy", "Easy Challenge", 15, "Warm up with fast fundamentals.", ["arrayMax", "validParentheses"]),
  contest("medium", "Medium Challenge", 25, "Classic interview patterns under pressure.", ["binarySearch", "mergeIntervals", "reverseList"]),
  contest("hard", "Hard Challenge", 35, "High-value problems with deeper reasoning.", ["recursionSubsets", "graphShortestPath"]),
  contest("mixed", "Mixed DSA Contest", 40, "A balanced contest across core DSA topics.", ["arrayMax", "binarySearch", "quickPartition", "reverseList", "graphShortestPath"]),
  contest("recursion", "Recursion Challenge", 25, "Backtracking and recursive state control.", ["recursionSubsets", "reverseList"]),
  contest("searching", "Searching Challenge", 20, "Find answers quickly with scans and bounds.", ["arrayMax", "binarySearch"]),
  contest("sorting", "Sorting Challenge", 25, "Ordering, partitioning, and interval logic.", ["quickPartition", "mergeIntervals"]),
  contest("linked", "Linked List Challenge", 20, "Pointer discipline in focused list problems.", ["reverseList", "validParentheses"]),
];

function contest(id, title, duration, description, problemIds) {
  return { id, title, duration, description, problems: problemIds.map((problemId) => contestProblemBank[problemId]) };
}

const contestTemplates = {
  python: `def solve(data):\n    # Write your solution here\n    return ""\n`,
  java: `class Solution {\n    String solve(String data) {\n        // Write your solution here\n        return "";\n    }\n}\n`,
  javascript: `function solve(data) {\n    // Write your solution here\n    return "";\n}\n`,
};

const contestState = {
  contest: null,
  index: 0,
  language: "python",
  codeByProblem: {},
  submissions: {},
  score: 0,
  startedAt: 0,
  remaining: 0,
  timer: null,
  finished: false,
};

const contestProfileDefaults = {
  hp: 100,
  maxHp: 100,
  streak: 7,
  completedContests: 0,
  abandonedContests: 0,
  wonContests: 0,
  totalContests: 0,
  quitStreak: 0,
};

function loadStoredContestProfile() {
  try {
    return JSON.parse(localStorage.getItem("dsaQuestContestProfile") || "{}");
  } catch {
    return {};
  }
}

const contestProfile = {
  ...contestProfileDefaults,
  ...loadStoredContestProfile(),
};

const baseLeaderboard = [
  { user: "Ananya", score: 420, solved: 4, time: "24m 18s" },
  { user: "Rahul", score: 310, solved: 3, time: "21m 04s" },
  { user: "You", score: 0, solved: 0, time: "-" },
  { user: "Maya", score: 180, solved: 2, time: "18m 40s" },
];

function renderContestLobby() {
  const cards = document.querySelector("[data-contest-cards]");
  if (!cards) return;
  cards.innerHTML = "";
  contests.forEach((item, index) => {
    const topDifficulty = getContestDifficulty(item);
    const participants = 1200 + index * 137;
    const card = document.createElement("article");
    card.className = "contest-card";
    card.innerHTML = `
      <div class="contest-card-title-row">
        <h3>${item.title}</h3>
        <span class="difficulty-badge ${topDifficulty.toLowerCase()}">${topDifficulty}</span>
      </div>
      <div class="contest-meta">
        <span>${item.duration} min</span>
        <span>${participants.toLocaleString()} joined</span>
      </div>
    `;
    const start = document.createElement("button");
    start.type = "button";
    start.className = "primary-action";
    start.textContent = "Start Contest";
    start.addEventListener("click", () => startContest(item.id));
    card.appendChild(start);
    cards.appendChild(card);
  });
  renderContestLeaderboard();
}

function renderContestLeaderboard() {
  const board = document.querySelector("[data-contest-leaderboard]");
  if (!board) return;
  const rows = [...baseLeaderboard];
  const solved = Object.values(contestState.submissions).filter((item) => item?.solved).length;
  const elapsed = contestState.startedAt ? formatContestTime(Math.max(0, Math.floor((Date.now() - contestState.startedAt) / 1000))) : "-";
  rows[2] = { user: "You", score: contestState.score, solved, time: solved ? elapsed : "-" };
  rows.sort((a, b) => b.score - a.score || b.solved - a.solved);
  board.innerHTML = `
    <div class="contest-leader-table">
      <div class="contest-leader-row contest-leader-head">
        <span>Rank</span><span>User</span><span>Score</span><span>Solved</span><span>Time</span>
      </div>
    </div>
  `;
  const table = board.querySelector(".contest-leader-table");
  rows.forEach((row, index) => {
    const item = document.createElement("div");
    item.className = "contest-leader-row";
    item.innerHTML = `<strong>#${index + 1}</strong><span>${row.user}</span><span>${row.score}</span><span>${row.solved}</span><span>${row.time}</span>`;
    table.appendChild(item);
  });
}

function persistContestProfile() {
  localStorage.setItem("dsaQuestContestProfile", JSON.stringify(contestProfile));
  fetch("/api/contest/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contestProfile),
  }).catch(() => { });
}

async function loadContestProfile() {
  try {
    const response = await fetch("/api/contest/profile");
    if (!response.ok) throw new Error("profile unavailable");
    const payload = await response.json();
    Object.assign(contestProfile, contestProfileDefaults, contestProfile, payload);
    localStorage.setItem("dsaQuestContestProfile", JSON.stringify(contestProfile));
  } catch {
    Object.assign(contestProfile, contestProfileDefaults, contestProfile);
  }
  renderContestProfile();
}

function renderContestProfile(effect = "") {
  const root = document.querySelector("[data-contest-profile]");
  if (!root) return;
  root.querySelector("[data-contest-hp]").textContent = `${contestProfile.hp}/${contestProfile.maxHp}`;
  root.querySelector("[data-contest-streak]").textContent = contestProfile.streak;
  root.querySelector("[data-contest-abandoned]").textContent = contestProfile.abandonedContests;
  root.classList.remove("hp-hit", "streak-hit");
  if (effect) {
    requestAnimationFrame(() => root.classList.add(effect));
    setTimeout(() => root.classList.remove(effect), 800);
  }
}

function getContestDifficulty(item) {
  const maxPoints = Math.max(...item.problems.map((problem) => problem.points));
  if (maxPoints >= 200) return "Hard";
  if (maxPoints >= 100) return "Medium";
  return "Easy";
}

function startContest(contestId) {
  const selected = contests.find((item) => item.id === contestId) || contests[0];
  clearInterval(contestState.timer);
  Object.assign(contestState, {
    contest: selected,
    index: 0,
    language: "python",
    codeByProblem: {},
    submissions: {},
    score: 0,
    startedAt: Date.now(),
    remaining: selected.duration * 60,
    timer: null,
    finished: false,
  });
  document.querySelector("[data-contest-arena]").hidden = false;
  document.querySelector("[data-contest-analytics]").hidden = true;
  document.querySelector(".contest-bottom-grid")?.classList.remove("analytics-open");
  document.querySelector("[data-contest-title]").textContent = selected.title;
  document.querySelector("[data-contest-exit]").hidden = false;
  renderContestProfile();
  setContestLanguage("python");
  renderContestArena();
  contestState.timer = setInterval(tickContestTimer, 1000);
  document.querySelector("[data-contest-arena]")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function tickContestTimer() {
  if (!contestState.contest || contestState.finished) return;
  contestState.remaining -= 1;
  if (contestState.remaining <= 0) {
    contestState.remaining = 0;
    finishContest("Time is up. Your contest was auto-submitted.");
    return;
  }
  renderContestHeader();
}

function renderContestArena() {
  renderContestHeader();
  renderContestProblemList();
  renderContestProblem();
  renderContestEditor();
  renderContestResults();
  renderContestLeaderboard();
}

function renderContestHeader() {
  const contestItem = contestState.contest;
  if (!contestItem) return;
  const solved = Object.values(contestState.submissions).filter((item) => item?.solved).length;
  const timer = document.querySelector("[data-contest-timer]");
  timer.textContent = formatContestTime(contestState.remaining);
  timer.classList.toggle("warning", contestState.remaining <= 120);
  document.querySelector("[data-contest-score]").textContent = contestState.score;
  document.querySelector("[data-contest-progress]").textContent = `${solved}/${contestItem.problems.length}`;
  document.querySelector("[data-contest-progress-bar]").style.width = `${(solved / contestItem.problems.length) * 100}%`;
}

function renderContestProblemList() {
  const list = document.querySelector("[data-contest-problem-list]");
  if (!list || !contestState.contest) return;
  list.innerHTML = "";
  contestState.contest.problems.forEach((problem, index) => {
    const submission = contestState.submissions[index];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `contest-problem-tab ${index === contestState.index ? "active" : ""} ${submission?.solved ? "solved" : ""}`;
    button.innerHTML = `<span>${index + 1}. ${problem.title}</span><small>${submission?.solved ? "Solved" : problem.difficulty}</small>`;
    button.addEventListener("click", () => {
      saveContestCode();
      contestState.index = index;
      renderContestArena();
    });
    list.appendChild(button);
  });
}

function renderContestProblem() {
  const problem = getCurrentContestProblem();
  if (!problem) return;
  const status = contestState.submissions[contestState.index];
  const badge = document.querySelector("[data-contest-problem-difficulty]");
  badge.className = `difficulty-badge ${problem.difficulty.toLowerCase()}`;
  badge.textContent = problem.difficulty;
  document.querySelector("[data-contest-problem-title]").textContent = problem.title;
  const statusEl = document.querySelector("[data-contest-problem-status]");
  statusEl.className = `contest-status ${status?.solved ? "solved" : status ? "failed" : "pending"}`;
  statusEl.textContent = status?.solved ? "Accepted" : status ? "Attempted" : "Not submitted";
  document.querySelector("[data-contest-problem-copy]").innerHTML = `
    <div><h5>Problem Statement</h5><p>${problem.statement}</p></div>
    <div><h5>Input Format</h5><p>${problem.input}</p></div>
    <div><h5>Output Format</h5><p>${problem.output}</p></div>
    <div><h5>Constraints</h5><p>${problem.constraints}</p></div>
    <div><h5>Hints</h5><p>${problem.hints.join(" ")}</p></div>
  `;
  document.querySelector("[data-contest-complexity]").textContent = `Expected ${problem.complexity}`;
  const samples = document.querySelector("[data-contest-samples]");
  samples.innerHTML = "";
  problem.examples.forEach((example, index) => {
    const sample = document.createElement("div");
    sample.className = "contest-test-case";
    sample.innerHTML = `<strong>Sample ${index + 1}</strong><pre>Input:\n${example.input}\n\nOutput:\n${example.output}</pre>`;
    samples.appendChild(sample);
  });
}

function renderContestEditor() {
  const problem = getCurrentContestProblem();
  const textarea = document.querySelector("[data-contest-code]");
  if (!problem || !textarea) return;
  const key = getContestCodeKey();
  textarea.value = contestState.codeByProblem[key] || contestTemplates[contestState.language];
  updateContestEditor();
  document.querySelectorAll("[data-contest-language]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.contestLanguage === contestState.language);
  });
}

function updateContestEditor() {
  const textarea = document.querySelector("[data-contest-code]");
  const lines = document.querySelector("[data-editor-lines]");
  const highlight = document.querySelector("[data-editor-highlight]");
  if (!textarea || !lines || !highlight) return;
  const lineCount = Math.max(1, textarea.value.split("\n").length);
  lines.textContent = Array.from({ length: lineCount }, (_, index) => index + 1).join("\n");
  highlight.innerHTML = highlightContestCode(textarea.value);
  autoSizeContestEditor();
}

function autoSizeContestEditor() {
  const editor = document.querySelector("[data-code-editor]");
  const textarea = document.querySelector("[data-contest-code]");
  const lines = document.querySelector("[data-editor-lines]");
  const highlight = document.querySelector("[data-editor-highlight]");
  if (!editor || !textarea || !lines || !highlight) return;

  textarea.style.height = "auto";
  highlight.style.height = "auto";
  lines.style.height = "auto";
  editor.style.height = "auto";

  const style = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(style.lineHeight) || 21;
  const verticalPadding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
  const minimum = Math.round(lineHeight * 6 + verticalPadding);
  const maximum = Math.max(260, Math.round(window.innerHeight * 0.62));
  const contentHeight = Math.max(textarea.scrollHeight, highlight.scrollHeight, lines.scrollHeight, minimum);
  const editorHeight = Math.min(contentHeight, maximum);
  const layerHeight = Math.max(contentHeight, editorHeight);

  editor.style.height = `${editorHeight}px`;
  textarea.style.height = `${layerHeight}px`;
  highlight.style.height = `${layerHeight}px`;
  lines.style.height = `${layerHeight}px`;
}

function highlightContestCode(code) {
  const escaped = code.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]));
  return escaped
    .replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span class="code-token-string">$1</span>')
    .replace(/\b(function|return|if|else|for|while|class|def|import|from|new|public|static|void|let|const|var)\b/g, '<span class="code-token-keyword">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="code-token-number">$1</span>');
}

function setContestLanguage(language) {
  saveContestCode();
  contestState.language = language;
  renderContestEditor();
}

function runContestCode(submit = false) {
  saveContestCode();
  const problem = getCurrentContestProblem();
  if (!problem || contestState.finished) return;
  const code = document.querySelector("[data-contest-code]").value;
  const checks = problem.checks[contestState.language] || [];
  const visiblePassed = checks.filter((token) => code.includes(token)).length;
  const hiddenPassed = checks.length && visiblePassed === checks.length ? problem.hidden.length : Math.max(0, visiblePassed - 1);
  const passed = visiblePassed === checks.length && hiddenPassed === problem.hidden.length;
  if (submit) submitContestProblem(passed, visiblePassed, checks.length, hiddenPassed, problem.hidden.length);
  renderContestResults({ passed, visiblePassed, visibleTotal: checks.length, hiddenPassed, hiddenTotal: problem.hidden.length, submit });
}

function submitContestProblem(passed, visiblePassed, visibleTotal, hiddenPassed, hiddenTotal) {
  const problem = getCurrentContestProblem();
  const previous = contestState.submissions[contestState.index];
  const elapsed = Math.floor((Date.now() - contestState.startedAt) / 1000);
  const speedBonus = passed ? Math.max(0, Math.round(problem.points * (contestState.remaining / (contestState.contest.duration * 60)) * 0.25)) : 0;
  if (passed && !previous?.solved) contestState.score += problem.points + speedBonus;
  contestState.submissions[contestState.index] = {
    solved: passed,
    visiblePassed,
    visibleTotal,
    hiddenPassed,
    hiddenTotal,
    speedBonus,
    elapsed,
    topic: problem.topic,
    difficulty: problem.difficulty,
  };
  renderContestHeader();
  renderContestProblemList();
  renderContestProblem();
  renderContestLeaderboard();
  if (Object.values(contestState.submissions).filter((item) => item?.solved).length === contestState.contest.problems.length) {
    finishContest("All problems solved. Contest submitted.");
  }
}

function renderContestResults(result = null) {
  const box = document.querySelector("[data-contest-results]");
  if (!box) return;
  const submission = contestState.submissions[contestState.index];
  if (!result && !submission) {
    box.innerHTML = '<div class="contest-result-line">Run code to check sample-style validators, then submit to include hidden tests.</div>';
    return;
  }
  const data = result || submission;
  const passed = data.passed ?? data.solved;
  box.innerHTML = `
    <div class="contest-result-line ${passed ? "pass" : "fail"}">
      <strong>${passed ? "Accepted signal" : "Needs work"}</strong>
      <p>Visible checks: ${data.visiblePassed}/${data.visibleTotal}. Hidden checks: ${data.hiddenPassed}/${data.hiddenTotal}.</p>
      <p>${passed ? "Submission matches the expected pattern and hidden-case requirements." : "Use the hints and expected complexity, then submit again."}</p>
    </div>
  `;
}

function finishContest(message) {
  if (contestState.finished) return;
  saveContestCode();
  contestState.contest.problems.forEach((problem, index) => {
    if (contestState.submissions[index]) return;
    contestState.submissions[index] = {
      solved: false,
      visiblePassed: 0,
      visibleTotal: (problem.checks[contestState.language] || []).length,
      hiddenPassed: 0,
      hiddenTotal: problem.hidden.length,
      speedBonus: 0,
      elapsed: Math.floor((Date.now() - contestState.startedAt) / 1000),
      topic: problem.topic,
      difficulty: problem.difficulty,
      autoSubmitted: true,
    };
  });
  contestState.finished = true;
  applyContestCompletion();
  clearInterval(contestState.timer);
  document.querySelector("[data-contest-exit]").hidden = true;
  renderContestHeader();
  renderContestProblemList();
  renderContestProblem();
  renderContestLeaderboard();
  renderContestAnalytics(message);
}

function applyContestCompletion() {
  const solved = Object.values(contestState.submissions).filter((item) => item.solved).length;
  const total = contestState.contest?.problems.length || 0;
  contestProfile.completedContests += 1;
  contestProfile.totalContests += 1;
  contestProfile.quitStreak = 0;
  if (total && solved === total) {
    contestProfile.wonContests += 1;
    contestProfile.streak += 1;
  }
  persistContestProfile();
  renderContestProfile();
}

function applyContestAbandonment() {
  const penalty = contestProfile.quitStreak > 0 || contestProfile.abandonedContests > 0 ? 20 : 10;
  contestProfile.hp = Math.max(0, contestProfile.hp - penalty);
  contestProfile.streak = Math.max(0, contestProfile.streak - 1);
  contestProfile.abandonedContests += 1;
  contestProfile.totalContests += 1;
  contestProfile.quitStreak += 1;
  persistContestProfile();
  renderContestProfile("hp-hit");
  setTimeout(() => renderContestProfile("streak-hit"), 260);
  return penalty;
}

function abandonContest() {
  if (!contestState.contest || contestState.finished) return;
  saveContestCode();
  contestState.contest.problems.forEach((problem, index) => {
    if (contestState.submissions[index]) return;
    contestState.submissions[index] = {
      solved: false,
      visiblePassed: 0,
      visibleTotal: (problem.checks[contestState.language] || []).length,
      hiddenPassed: 0,
      hiddenTotal: problem.hidden.length,
      speedBonus: 0,
      elapsed: Math.floor((Date.now() - contestState.startedAt) / 1000),
      topic: problem.topic,
      difficulty: problem.difficulty,
      abandoned: true,
    };
  });
  contestState.finished = true;
  clearInterval(contestState.timer);
  const penalty = applyContestAbandonment();
  document.querySelector("[data-contest-exit]").hidden = true;
  document.querySelector("[data-contest-arena]").hidden = true;
  renderContestLeaderboard();
  renderContestAnalytics(`Contest abandoned. HP -${penalty} and streak reduced.`);
  document.querySelector("[data-contest-analytics]")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderContestAnalytics(message) {
  const panel = document.querySelector("[data-contest-analytics]");
  if (!panel || !contestState.contest) return;
  const submissions = Object.values(contestState.submissions);
  const solved = submissions.filter((item) => item.solved).length;
  const attempts = submissions.length;
  const accuracy = attempts ? Math.round((solved / attempts) * 100) : 0;
  const completionRate = contestProfile.totalContests ? Math.round((contestProfile.completedContests / contestProfile.totalContests) * 100) : 100;
  const winRate = contestProfile.completedContests ? Math.round((contestProfile.wonContests / contestProfile.completedContests) * 100) : 0;
  const weakTopics = contestState.contest.problems
    .filter((_, index) => !contestState.submissions[index]?.solved)
    .map((problem) => problem.topic);
  const uniqueWeakTopics = [...new Set(weakTopics)];
  panel.hidden = false;
  panel.parentElement?.classList.add("analytics-open");
  panel.innerHTML = `
    <div class="contest-side-head">
      <span>Performance analytics</span>
      <strong>${message}</strong>
    </div>
    <div class="contest-analytics-grid">
      <div class="contest-analytics-card"><span>Total score</span><strong>${contestState.score}</strong></div>
      <div class="contest-analytics-card"><span>Accuracy</span><strong>${accuracy}%</strong></div>
      <div class="contest-analytics-card"><span>Solved</span><strong>${solved}/${contestState.contest.problems.length}</strong></div>
      <div class="contest-analytics-card"><span>Time left</span><strong>${formatContestTime(contestState.remaining)}</strong></div>
      <div class="contest-analytics-card"><span>HP</span><strong>${contestProfile.hp}/${contestProfile.maxHp}</strong></div>
      <div class="contest-analytics-card"><span>Streak</span><strong>${contestProfile.streak}</strong></div>
      <div class="contest-analytics-card"><span>Win rate</span><strong>${winRate}%</strong></div>
      <div class="contest-analytics-card"><span>Completion</span><strong>${completionRate}%</strong></div>
    </div>
    <p><strong>Weak topics:</strong> ${uniqueWeakTopics.length ? uniqueWeakTopics.join(", ") : "None. Strong contest run."}</p>
    <p><strong>Suggestion:</strong> ${uniqueWeakTopics.length ? `Retry this contest and drill ${uniqueWeakTopics[0]} from Practice Session before attempting a harder set.` : "Move to a harder contest and focus on speed."}</p>
    <div class="contest-run-row">
      <button type="button" data-contest-retry>Retry Contest</button>
      <button class="primary-action" type="button" data-contest-back>Back to Contest Lobby</button>
    </div>
  `;
  panel.querySelector("[data-contest-retry]").addEventListener("click", () => startContest(contestState.contest.id));
  panel.querySelector("[data-contest-back]").addEventListener("click", () => {
    document.querySelector("[data-contest-arena]").hidden = true;
    document.querySelector("[data-contest-exit]").hidden = true;
    panel.hidden = true;
    panel.parentElement?.classList.remove("analytics-open");
  });
}

function openContestExitModal() {
  if (!contestState.contest || contestState.finished) return;
  const modal = document.querySelector("[data-contest-exit-modal]");
  modal?.classList.add("open");
  modal?.setAttribute("aria-hidden", "false");
}

function closeContestExitModal() {
  const modal = document.querySelector("[data-contest-exit-modal]");
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
}

function getCurrentContestProblem() {
  return contestState.contest?.problems[contestState.index] || null;
}

function getContestCodeKey() {
  return `${contestState.index}:${contestState.language}`;
}

function saveContestCode() {
  const textarea = document.querySelector("[data-contest-code]");
  if (!textarea || !contestState.contest) return;
  contestState.codeByProblem[getContestCodeKey()] = textarea.value;
}

function resetContestCode() {
  if (!contestState.contest || contestState.finished) return;
  const textarea = document.querySelector("[data-contest-code]");
  if (!textarea) return;
  textarea.value = contestTemplates[contestState.language];
  saveContestCode();
  updateContestEditor();
  renderContestResults();
}

function formatContestTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function initContestSession() {
  if (!document.querySelector("[data-contest-shell]")) return;
  loadContestProfile();
  renderContestLobby();
  const editor = document.querySelector("[data-contest-code]");
  editor?.addEventListener("input", () => {
    saveContestCode();
    updateContestEditor();
  });
  editor?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = `${editor.value.slice(0, start)}    ${editor.value.slice(end)}`;
    editor.selectionStart = editor.selectionEnd = start + 4;
    saveContestCode();
    updateContestEditor();
  });
  document.querySelectorAll("[data-contest-language]").forEach((tab) => {
    tab.addEventListener("click", () => setContestLanguage(tab.dataset.contestLanguage));
  });
  document.querySelector("[data-contest-run]")?.addEventListener("click", () => runContestCode(false));
  document.querySelector("[data-contest-submit]")?.addEventListener("click", () => runContestCode(true));
  document.querySelector("[data-contest-reset]")?.addEventListener("click", resetContestCode);
  document.querySelector("[data-contest-exit]")?.addEventListener("click", openContestExitModal);
  document.querySelectorAll("[data-contest-exit-continue]").forEach((button) => {
    button.addEventListener("click", closeContestExitModal);
  });
  document.querySelector("[data-contest-exit-confirm]")?.addEventListener("click", () => {
    closeContestExitModal();
    abandonContest();
  });
  document.querySelector("[data-contest-next]")?.addEventListener("click", () => {
    if (!contestState.contest) return;
    saveContestCode();
    contestState.index = (contestState.index + 1) % contestState.contest.problems.length;
    renderContestArena();
  });
  window.addEventListener("resize", autoSizeContestEditor);
  window.addEventListener("beforeunload", (event) => {
    if (!contestState.contest || contestState.finished) return;
    event.preventDefault();
    event.returnValue = "Leaving now will abandon your contest progress.";
    return event.returnValue;
  });
}

function initPracticeSession() {
  const root = document.querySelector("[data-practice-session]");
  if (!root) return;

  const topicSelect = root.querySelector("[data-practice-topic]");
  const difficultySelect = root.querySelector("[data-practice-difficulty]");
  const showBookmarks = root.querySelector("[data-practice-show-bookmarks]");

  practiceTopics.forEach(([id, label]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    topicSelect.appendChild(option);
  });

  const routedTopic = new URLSearchParams(window.location.hash.split("?")[1] || "").get("topic");
  if (routedTopic && practiceQuestions[topicToPracticeTopic(routedTopic)]) {
    practiceState.topic = topicToPracticeTopic(routedTopic);
    practiceState.favoritesOnly = false;
  }

  topicSelect.value = practiceState.topic;
  topicSelect.addEventListener("change", () => {
    practiceState.topic = topicSelect.value;
    renderPracticeSession();
  });
  difficultySelect.addEventListener("change", () => {
    practiceState.difficulty = difficultySelect.value;
    renderPracticeSession();
  });
  showBookmarks.addEventListener("click", () => {
    practiceState.favoritesOnly = !practiceState.favoritesOnly;
    renderPracticeSession();
  });

  renderPracticeSession();
}

initPracticeSession();
initDynamicComplexityPanels();
initModuleActionButtons();
initQuizModal();
initContestSession();

// ===== GAMIFICATION SYSTEM =====

async function loadGamificationProfile() {
  try {
    const response = await fetch('/api/gamification/profile');
    return await response.json();
  } catch (e) {
    console.error('Error loading gamification profile:', e);
    return null;
  }
}

async function updateDasheboard() {
  const profile = await loadGamificationProfile();
  if (!profile) return;

  document.getElementById('dashboard-level').textContent = profile.level_name || 'Beginner';
  document.getElementById('dashboard-xp').textContent = Math.floor(profile.xp || 0).toLocaleString();
  document.getElementById('dashboard-streak').textContent = profile.streak || 0;
  document.getElementById('dashboard-solved').textContent = profile.solved_questions || 0;

  document.getElementById('current-level').textContent = profile.level || 1;
  document.getElementById('total-xp').textContent = Math.floor(profile.xp || 0).toLocaleString();
  document.getElementById('xp-current').textContent = profile.xp_progress || 0;
  document.getElementById('xp-next').textContent = profile.xp_needed || 100;

  const xpPercent = ((profile.xp_progress || 0) / (profile.xp_needed || 100)) * 100;
  const xpBar = document.getElementById('xp-bar');
  if (xpBar) {
    xpBar.style.width = Math.min(xpPercent, 100) + '%';
  }

  const levelBadge = document.querySelector('.level-badge');
  if (levelBadge) {
    levelBadge.textContent = profile.level_name || 'Beginner';
  }

  document.getElementById('streak-number').textContent = profile.streak || 0;
  document.getElementById('longest-streak').textContent = profile.longest_streak || 0;
  document.getElementById('practice-days').textContent = profile.total_practice_days || 0;
  document.getElementById('current-streak-display').textContent = profile.streak || 0;
  document.getElementById('best-streak-display').textContent = profile.longest_streak || 0;

  document.getElementById('stat-solved').textContent = profile.solved_questions || 0;
  document.getElementById('stat-quizzes').textContent = profile.completed_quizzes || 0;

  updateMilestones(profile.streak || 0);
}

function updateMilestones(streak) {
  document.querySelectorAll('.milestone').forEach(milestone => {
    const target = parseInt(milestone.dataset.target);
    const bar = milestone.querySelector('progress');
    if (bar) {
      bar.value = Math.min(streak, target);
    }
  });
}

async function loadDailyChallenges() {
  try {
    const response = await fetch('/api/gamification/daily-challenges');
    const data = await response.json();
    renderDailyChallenges(data.challenges);
  } catch (e) {
    console.error('Error loading daily challenges:', e);
  }
}

function renderDailyChallenges(challenges) {
  const container = document.getElementById('challenges-container');
  if (!container) return;

  container.innerHTML = challenges.map(challenge => `
    <div class="challenge-card">
      <span class="challenge-difficulty difficulty-${challenge.difficulty.toLowerCase()}">
        ${challenge.difficulty}
      </span>
      <h3 class="challenge-title">${challenge.title}</h3>
      <p class="challenge-description">${challenge.description}</p>
      <div class="challenge-xp">${challenge.xp_reward} XP</div>
      <div class="challenge-actions">
        <button class="challenge-btn challenge-start" onclick="startChallenge('${challenge.id}', '${challenge.title}')">
          Start Challenge
        </button>
        <button class="challenge-btn challenge-hint" onclick="showHint('${challenge.id}')">
          Hint
        </button>
      </div>
    </div>
  `).join('');
}

async function loadBadges() {
  try {
    const response = await fetch('/api/gamification/badges');
    const data = await response.json();
    renderBadges(data.badges, data.total_earned);
  } catch (e) {
    console.error('Error loading badges:', e);
  }
}

function renderBadges(badges, totalEarned) {
  const container = document.getElementById('achievements-display');
  if (!container) return;

  container.innerHTML = badges.map(badge => `
    <div class="achievement-badge ${badge.earned ? 'earned' : ''}" title="${badge.name}">
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-name">${badge.name}</div>
    </div>
  `).join('');

  const badgeCount = document.getElementById('badge-count');
  const totalBadges = document.getElementById('total-badges');
  if (badgeCount) badgeCount.textContent = totalEarned;
  if (totalBadges) totalBadges.textContent = badges.length;
}

async function addXP(amount, action = 'visualization') {
  try {
    const response = await fetch('/api/gamification/add-xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, action })
    });

    const data = await response.json();
    if (data.success) {
      showXPGain(amount);
      await updateDasheboard();
    }
  } catch (e) {
    console.error('Error adding XP:', e);
  }
}

function showXPGain(amount) {
  const xpNotif = document.createElement('div');
  xpNotif.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #087f7b, #06a6a3);
    color: white;
    padding: 24px 40px;
    border-radius: 12px;
    font-size: 1.5rem;
    font-weight: 900;
    z-index: 10000;
    box-shadow: 0 8px 24px rgba(8, 127, 123, 0.4);
    animation: popupFadeInOut 2s ease-out;
  `;
  xpNotif.textContent = `+${amount} XP!`;
  document.body.appendChild(xpNotif);

  setTimeout(() => xpNotif.remove(), 2000);
}

async function checkDailyLogin() {
  try {
    const response = await fetch('/api/gamification/update-streak', {
      method: 'POST'
    });

    const data = await response.json();
    if (data.success) {
      showStreakNotification(data.streak, data.streak_bonus_xp);
      await updateDasheboard();
    }
  } catch (e) {
    console.error('Error updating streak:', e);
  }
}

function showStreakNotification(streak, bonusXP) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b35, #ff8555);
    color: white;
    padding: 20px 28px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 800;
    z-index: 10000;
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
    animation: slideInRight 600ms ease-out;
    max-width: 300px;
  `;
  notif.innerHTML = `
    <div style="font-size: 1.5rem; margin-bottom: 8px;">🔥 Streak: ${streak} days!</div>
    <div style="font-size: 0.95rem;">+${bonusXP} XP Bonus</div>
  `;
  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

function startChallenge(challengeId, title) {
  const section = document.getElementById('visualize') || document.getElementById('searching');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    showChallengeStartNotif(title);
  }
}

function showChallengeStartNotif(challengeTitle) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--teal);
    color: white;
    padding: 16px 28px;
    border-radius: 8px;
    font-weight: 700;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(8, 127, 123, 0.3);
    animation: slideDown 500ms ease-out;
  `;
  notif.textContent = `📚 Challenge started: ${challengeTitle}`;
  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

function showHint(challengeId) {
  const hints = {
    '1': 'Try watching the Bubble Sort visualization first!',
    '2': 'Focus on how partitioning divides the problem.',
    '3': 'Watch how binary search eliminates half the search space.',
    '4': 'Linear search checks each element one by one.',
    '5': 'Notice how LIFO means Last In, First Out.',
    '6': 'FIFO means First In, First Out.',
    '7': 'Nodes connect via pointers, not direct indexing.',
    '8': 'Finding the minimum is the key operation.',
  };

  const hint = hints[challengeId] || 'Check the visualization for insights!';
  alert('💡 Hint: ' + hint);
}

// Add CSS animations
const gamStyle = document.createElement('style');
gamStyle.textContent = `
  @keyframes popupFadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -120%) scale(0.8); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(400px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(gamStyle);

// Initialize gamification on page load
document.addEventListener('DOMContentLoaded', async () => {
  await updateDasheboard();
  await loadDailyChallenges();
  await loadBadges();
  setInterval(updateDasheboard, 300000);
});

// Auto add XP when visualizations are run
document.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-start')) {
    setTimeout(() => { addXP(10, 'visualization_started'); }, 100);
  }
});

const quizBtn = document.querySelector("#quizBtn");

const quizAnswer = document.querySelector("#quizAnswer");

quizBtn?.addEventListener("click", () => {
  if (quizAnswer) quizAnswer.textContent = "Binary search, because it discards halves based on sorted order.";
});
