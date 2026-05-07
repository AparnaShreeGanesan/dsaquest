/*
====================================================================================
JAVASCRIPT DOCUMENTATION - DSA QUEST APPLICATION
====================================================================================
This JavaScript file contains the main logic for algorithm visualization,
complexity analysis, and interactive panel management.
Explains every function, variable, operator, and logic flow.
====================================================================================
*/

/*
============================================================================
SECTION 1: GLOBAL VARIABLES & STATE MANAGEMENT
============================================================================
Variables that are accessible throughout the entire application.
These store data that multiple functions need to access.
*/

/*
const algorithms = window.DSA_ALGORITHMS;
const = Create constant variable (cannot be reassigned)
algorithms = Variable name
window.DSA_ALGORITHMS = Access data from global window object
  - window = Global JavaScript object in browser
  - DSA_ALGORITHMS = Property containing all algorithm data
  - Data is coming from Flask backend template
  - Contains sorting algorithms, their implementations, etc.
*/
const algorithms = window.DSA_ALGORITHMS;

/*
const linkedLists = window.DSA_LINKED_LISTS;
Same pattern as above
linkedLists = Variable for linked list data structures
Stores singly, doubly, and circular linked list definitions
*/
const linkedLists = window.DSA_LINKED_LISTS;

/*
const stacks = window.DSA_STACKS;
Stores stack data structure implementations
Contains stack push/pop/peek operations
*/
const stacks = window.DSA_STACKS;

/*
const queues = window.DSA_QUEUES || {};
queues = Variable for queue data structures
window.DSA_QUEUES = Try to get queue data from window
|| {} = "Or" operator: if DSA_QUEUES doesn't exist, use empty object {}
  - || = Logical OR operator
  - Provides default value if undefined
If queues not available, creates empty object to prevent errors
*/
const queues = window.DSA_QUEUES || {};

/*
const panelStates = new Map();
panelStates = Variable holding panel state information
new Map() = Create a JavaScript Map data structure
  - Map = Like a dictionary/object for storing key-value pairs
  - Map() constructor = Creates new empty map
Maps sort algorithm panels to their state (steps, index, playing, etc.)
*/
const panelStates = new Map();

/*
const listStates = new Map();
Map for storing linked list panel states
Similar structure to panelStates
*/
const listStates = new Map();

/*
const stackStates = new Map();
Map for storing stack visualization panel states
*/
const stackStates = new Map();

/*
const queueStates = new Map();
Map for storing queue visualization panel states
*/
const queueStates = new Map();

/*
const searchStates = new Map();
Map for storing search algorithm panel states
*/
const searchStates = new Map();


/*
============================================================================
SECTION 2: UTILITY FUNCTIONS
============================================================================
Helper functions used throughout the application.
*/

/*
function parseValues(input) { ... }
function = Keyword to define a function
parseValues = Function name (describes what it does)
input = Parameter (the input value passed to function)
Converts user input string into array of numbers
*/
function parseValues(input) {
  /*
  return input.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
  
  return = Statement that exits function and returns a value
  
  input.value = Get the value property from HTML input element
    - input = Parameter (HTML input element)
    - .value = Property containing the input's text
  
  .split(",") = String method that splits text by delimiter
    - . = Dot notation (accessing method on object)
    - split = Method name
    - "," = Delimiter (split at comma)
    - Result: Array of strings ["42", "18", "7", ...]
  
  .map((value) => value.trim()) = Transform each array element
    - .map = Array method that transforms each element
    - (value) => value.trim() = Arrow function
      - (value) = Parameter of arrow function
      - => = Arrow function syntax ("goes to")
      - value.trim() = Remove whitespace from both ends
    - Result: ["42", "18", "7"] with whitespace removed
  
  .filter(Boolean) = Remove empty/false elements
    - .filter = Array method to keep only matching elements
    - Boolean = Function that converts to true/false
    - Removes empty strings from array
    - Result: Only non-empty values remain
  
  .map(Number) = Convert strings to numbers
    - .map = Array method again
    - Number = Constructor function that converts to number
    - Result: [42, 18, 7, ...] as actual numbers
  
  Chaining: Each method returns array, next method works on result
  */
  return input.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
}

/*
============================================================================
SECTION 3: COMPLEXITY DATABASE
============================================================================
Large object storing complexity information for all algorithms.
Maps algorithm names to their time/space complexity data.
*/

/*
const complexityDatabase = { ... }
complexityDatabase = Variable name
{ ... } = Object literal (key-value pairs)
Huge object with nested structure organizing all complexity data
*/
const complexityDatabase = {
  /*
  array: { ... }
  array = Key (property name)
  { ... } = Value (nested object with complexity entries)
  Groups complexity data for array operations
  */
  array: {
    /*
    access: complexityEntry("Array Access", "O(1)", ..., "Direct indexing..."),
    access = Key (operation name)
    complexityEntry(...) = Function call creating complexity entry
    Function takes: name, best case, average, worst, space, explanation
    Stores data about array access complexity
    */
    access: complexityEntry("Array Access", "O(1)", "O(1)", "O(1)", "O(1)", "O(1)", "Direct indexing jumps to the memory offset in constant time."),
    
    search: complexityEntry("Array Linear Search", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Unsorted arrays may require checking every element. Best case happens when the target is first."),
    
    insert: complexityEntry("Array Insert", "O(1)", "O(n)", "O(n)", "O(n)", "O(1)", "Inserting away from the end shifts later values, so the work grows with n."),
  },
  
  /*
  sort: { ... }
  sort = Key for sorting algorithms
  Contains bubble sort, quick sort, selection sort, etc.
  Each with their own complexity entry
  */
  sort: {
    /*
    "bubble-sort": complexityEntry(...),
    "bubble-sort" = Key (quoted because of hyphen)
    String keys allow special characters
    Maps algorithm ID to its complexity data
    */
    "bubble-sort": complexityEntry("Bubble Sort", "O(n)", "O(n^2)", "O(n^2)", "O(n^2)", "O(1)", "Adjacent comparisons push large values to the end. Nested passes make the worst case quadratic."),
    
    "quick-sort": complexityEntry("Quick Sort", "O(n log n)", "O(n log n)", "O(n^2)", "O(n log n) average", "O(log n)", "Partitioning is linear per level. Balanced pivots give log n levels; poor pivots can degrade to n levels."),
  },
  
  /* ... more entries for other data structures ... */
};

/*
function complexityEntry(title, best, average, worst, time, space, explanation) { ... }
complexityEntry = Function that creates a complexity entry object
Parameters:
  title = Name of operation (e.g., "Bubble Sort")
  best = Best case complexity (e.g., "O(n)")
  average = Average case complexity
  worst = Worst case complexity
  time = Overall time complexity
  space = Space complexity
  explanation = Human-readable explanation
Returns: Object with all these properties
*/
function complexityEntry(title, best, average, worst, time, space, explanation) {
  /*
  return { title, best, average, worst, time, space, explanation };
  
  return = Return from function
  { ... } = Object literal
  title, best, average, ... = Shorthand property syntax
    - { title } is same as { title: title }
    - JavaScript automatically uses variable values as values
  
  Returns object with all properties
  */
  return { title, best, average, worst, time, space, explanation };
}

/*
function complexityLevel(value) { ... }
complexityLevel = Function that categorizes complexity
value = Complexity string like "O(1)", "O(n)", etc.
Returns: Category level (efficient, moderate, expensive)
*/
function complexityLevel(value) {
  /*
  if (/O\(1\)|O\(log/.test(value)) return "efficient";
  
  if = Conditional statement (if true, execute block)
  (...) = Condition to test
  /O\(1\)|O\(log/ = Regular expression (regex pattern)
    - / / = Delimiters for regex
    - O\(1\) = Literal "O(1)" (\ escapes special characters)
    - | = OR operator in regex
    - O\(log = Literal "O(log"
    - Test if value contains "O(1)" or "O(log"
  .test(value) = Regex method that tests if pattern matches
    - . = Dot notation
    - test = Method name
    - Returns true if match found, false otherwise
  return "efficient" = Exit function and return string
  
  O(1) and O(log n) are efficient (constant/logarithmic time)
  */
  if (/O\(1\)|O\(log/.test(value)) return "efficient";
  
  /*
  if (/O\(n\)$|O\(n\)|O\(n log n\)/.test(value)) return "moderate";
  
  Same pattern as above
  O(n) and O(n log n) are moderate (linear/linearithmic time)
  $ = End of string anchor (matches "O(n)" at end)
  */
  if (/O\(n\)$|O\(n\)|O\(n log n\)/.test(value)) return "moderate";
  
  /*
  return "expensive";
  
  Default case: all other complexities are expensive
  (O(n^2), O(2^n), etc. are quadratic or worse)
  */
  return "expensive";
}

/*
============================================================================
SECTION 4: PANEL INITIALIZATION & RENDERING
============================================================================
Functions that create and update visualization panels.
*/

/*
function ensureComplexityCard(panel) { ... }
ensureComplexityCard = Function that ensures complexity card exists
panel = DOM element (the visualization panel)
Creates the complexity card if it doesn't exist
Returns: The complexity card element
*/
function ensureComplexityCard(panel) {
  /*
  if (!panel) return null;
  
  if = Conditional
  ! = NOT operator (negation)
  !panel = true if panel is falsy (null, undefined, false, 0, "")
  return null = Exit and return null (empty value)
  
  Guard clause: Check for invalid input early
  Prevents error if panel doesn't exist
  */
  if (!panel) return null;
  
  /*
  const existing = panel.querySelector("[data-dynamic-complexity]");
  
  const = Constant variable
  panel.querySelector(...) = Find element inside panel
    - . = Dot notation
    - querySelector = Method to find first matching element
    - "[data-dynamic-complexity]" = CSS selector for attribute
      - [...] = Attribute selector
      - data-dynamic-complexity = Custom HTML5 attribute
  Looks for complexity card that might already exist
  */
  const existing = panel.querySelector("[data-dynamic-complexity]");
  
  /*
  if (existing) return existing;
  
  If complexity card already exists, return it
  Avoids creating duplicate cards
  */
  if (existing) return existing;

  /*
  const card = document.createElement("aside");
  
  const = Constant variable
  document = Global browser object for manipulating HTML
  .createElement = Method to create new HTML element
  "aside" = Type of element to create (semantic HTML5 tag)
  card = Variable holding the new element
  
  Creates new <aside> element in JavaScript
  Element not yet added to page
  */
  const card = document.createElement("aside");
  
  /*
  card.className = "dynamic-complexity-card";
  
  card = The element we created
  .className = Property to set CSS class
  = = Assignment operator
  "dynamic-complexity-card" = Class name to apply
  
  Assigns CSS class to the element (affects styling)
  */
  card.className = "dynamic-complexity-card";
  
  /*
  card.dataset.dynamicComplexity = "true";
  
  card.dataset = Object for custom HTML5 data attributes
  .dynamicComplexity = Creates data-dynamic-complexity attribute
    - Automatic conversion: dynamicComplexity -> data-dynamic-complexity
  = "true" = Set value to "true"
  
  Adds custom data attribute for identification
  */
  card.dataset.dynamicComplexity = "true";
  
  /*
  card.innerHTML = `...`;
  
  card.innerHTML = Property for HTML content
  = ... = Assignment operator
  ` ... ` = Template literal (backticks allow variables and newlines)
  
  Sets the HTML content inside the card
  Creates structured HTML with complexity information
  */
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
  
  /*
  const head = panel.querySelector(".sort-head") || panel.firstElementChild;
  
  panel.querySelector(".sort-head") = Find header in panel
  || = OR operator
  panel.firstElementChild = If .sort-head not found, use first child
  head = Variable storing the header element
  
  Finds where to insert complexity card (before or after header)
  Allows flexibility if header structure varies
  */
  const head = panel.querySelector(".sort-head") || panel.firstElementChild;
  
  /*
  if (head?.nextSibling) {
    panel.insertBefore(card, head.nextSibling);
  } else {
    panel.prepend(card);
  }
  
  if (head?.nextSibling) = Conditional with optional chaining
    - head? = Optional chaining (safely access if head exists)
    - ?.nextSibling = If head exists, check its nextSibling property
  
  insertBefore(...) = Insert element before another element
  panel.prepend(...) = Insert element at very start of panel
  
  Inserts complexity card in appropriate position
  Either after header, or at start of panel
  */
  if (head?.nextSibling) {
    panel.insertBefore(card, head.nextSibling);
  } else {
    panel.prepend(card);
  }
  
  /*
  return card;
  
  return = Exit function
  card = Return the created card element
  Allows calling code to use this element
  */
  return card;
}

/*
function renderComplexity(panel, entry, stepText = "") { ... }
renderComplexity = Function that updates complexity card display
panel = DOM element (visualization panel)
entry = Object with complexity data
stepText = Optional text describing current step (default: empty string)

Updates all the text and styling in complexity card
*/
function renderComplexity(panel, entry, stepText = "") {
  /*
  const card = ensureComplexityCard(panel);
  
  const = Constant
  ensureComplexityCard(panel) = Call function to get/create card
  card = Variable with the card element
  */
  const card = ensureComplexityCard(panel);
  
  /*
  if (!card || !entry) return;
  
  Guard clause: return early if card or entry is missing
  Prevents errors from null/undefined values
  */
  if (!card || !entry) return;

  /*
  const level = complexityLevel(entry.worst || entry.time || "");
  
  entry.worst = Get worst-case complexity from entry object
  || = OR operator (use next if first is falsy)
  entry.time = If no worst case, use time complexity
  || "" = If no time, use empty string
  
  complexityLevel(...) = Call function to categorize complexity
  level = Variable with category (efficient, moderate, expensive)
  */
  const level = complexityLevel(entry.worst || entry.time || "");
  
  /*
  card.classList.remove("efficient", "moderate", "expensive", "complexity-pulse");
  
  card.classList = List of CSS classes on element
  .remove(...) = Method to remove classes
  Removes all old complexity level classes
  Prepares for adding new one
  */
  card.classList.remove("efficient", "moderate", "expensive", "complexity-pulse");
  
  /*
  card.classList.add(level);
  
  card.classList = List of CSS classes
  .add(level) = Add class based on complexity level
  Adds "efficient", "moderate", or "expensive" class
  This changes styling via CSS
  */
  card.classList.add(level);
  
  /*
  card.querySelector("[data-complexity-title]").textContent = entry.title;
  
  card.querySelector = Find element in card
  "[data-complexity-title]" = Selector for title element
  .textContent = Property to set display text
  = entry.title = Assign complexity operation name
  
  Updates the operation title text
  Example: "Bubble Sort", "Array Access", etc.
  */
  card.querySelector("[data-complexity-title]").textContent = entry.title;
  
  /*
  Repeated for other fields (score, best, average, worst, space, etc.)
  Each updates a specific data element in the card
  */
  card.querySelector("[data-complexity-score]").textContent = entry.time;
  card.querySelector("[data-complexity-best]").textContent = entry.best;
  card.querySelector("[data-complexity-average]").textContent = entry.average;
  card.querySelector("[data-complexity-worst]").textContent = entry.worst;
  card.querySelector("[data-complexity-space]").textContent = entry.space;
  card.querySelector("[data-complexity-explanation]").textContent = entry.explanation;
  card.querySelector("[data-complexity-step]").textContent = stepText;
  
  /*
  requestAnimationFrame(() => card.classList.add("complexity-pulse"));
  
  requestAnimationFrame = Method to schedule animation-friendly function call
  () => { ... } = Arrow function (anonymous function)
  card.classList.add("complexity-pulse") = Add animation class
  
  Schedules animation in next browser paint cycle
  Ensures animation performs smoothly (60fps)
  Adds pulse animation class to complexity card
  */
  requestAnimationFrame(() => card.classList.add("complexity-pulse"));
}

/*
============================================================================
SECTION 5: ALGORITHM VISUALIZATION LOGIC
============================================================================
Functions that control the visualization of sorting/searching algorithms.
*/

/*
function renderBars(panel) { ... }
renderBars = Function that renders bar visualization
panel = DOM element (sort/search panel)
Updates the visual bars based on current algorithm step
*/
function renderBars(panel) {
  /*
  const state = panelStates.get(panel);
  
  panelStates = Map we defined earlier
  .get(panel) = Get value (state) for this panel key
  state = Object with panel's current state
  
  Retrieves saved state for this specific panel
  State includes: steps, index, values, etc.
  */
  const state = panelStates.get(panel);
  
  /*
  if (!state) return;
  
  Guard clause: exit if state doesn't exist
  Prevents errors
  */
  if (!state) return;

  /*
  const steps = Array.isArray(state.steps) ? state.steps : [];
  
  Array.isArray(state.steps) = Check if state.steps is array
  ? state.steps = If true, use state.steps
  : [] = If false, use empty array []
  steps = Variable with array of visualization steps
  
  Ternary operator (conditional shorthand)
  Safely gets steps array, with fallback to empty array
  */
  const steps = Array.isArray(state.steps) ? state.steps : [];
  
  /*
  const idx = typeof state.index === "number" ? state.index : 0;
  
  typeof state.index === "number" = Check if index is a number
  ? state.index = If true, use index
  : 0 = If false, use 0 (default)
  idx = Current step index (which step we're on)
  
  Safely gets current step index
  */
  const idx = typeof state.index === "number" ? state.index : 0;
  
  /*
  const step = steps[idx];
  
  steps[idx] = Array bracket notation
  [ ] = Access array element at index
  idx = The index value
  step = Current step object
  
  Gets the current step from array
  */
  const step = steps[idx];

  /*
  if (state.bars) state.bars.innerHTML = "";
  
  state.bars = DOM element where bars render
  .innerHTML = HTML content
  = "" = Clear all HTML
  
  Empties the bars container to redraw
  */
  if (state.bars) state.bars.innerHTML = "";

  /*
  if (!step) {
    state.message.textContent = "Press Start to generate steps.";
    state.counter.textContent = "0 / 0";
    updateComplexityPanel(panel, null);
    return;
  }
  
  If no current step (array empty), show default message
  .textContent = Set text content
  updateComplexityPanel(...) = Update complexity display
  return = Exit function early
  */
  if (!step) {
    state.message.textContent = "Press Start to generate steps.";
    state.counter.textContent = "0 / 0";
    updateComplexityPanel(panel, null);
    return;
  }

  /*
  Extract arrays from current step (safely)
  */
  const values = Array.isArray(step.values) ? step.values : [];
  const compare = Array.isArray(step.compare) ? step.compare : [];
  const active = Array.isArray(step.active) ? step.active : [];
  const sorted = Array.isArray(step.sorted) ? step.sorted : [];
  const boundsArr = Array.isArray(step.bounds) ? step.bounds : [];

  /*
  Guard: return if no values to display
  */
  if (!values.length) {
    state.message.textContent = step.message || "No steps to display.";
    state.counter.textContent = "0 / 0";
    return;
  }

  /*
  const max = Math.max(...values, 1);
  
  Math.max(...values) = Find maximum value in array
  ...values = Spread operator (unpacks array elements as arguments)
  , 1 = Ensure max is at least 1 (avoid division by zero)
  max = Maximum value
  
  Maximum is used to scale bar heights
  */
  const max = Math.max(...values, 1);
  
  /*
  const bounded = new Set(boundsArr);
  
  new Set(...) = Create Set data structure
  boundsArr = Array of indices
  bounded = Set containing the array indices
  
  Set is like array but for checking membership
  */
  const bounded = new Set(boundsArr);
  
  /*
  const hasBounds = boundsArr.length > 0;
  
  boundsArr.length = Number of elements in array
  > 0 = Check if more than zero
  hasBounds = Boolean (true if has bounds, false otherwise)
  
  Determines if we should dim out-of-bounds bars
  */
  const hasBounds = boundsArr.length > 0;

  /*
  values.forEach((value, index) => {
    ...
  });
  
  values = Array of values to display
  .forEach = Array method that calls function for each element
  (value, index) => { ... } = Arrow function
    - value = Current array element
    - index = Current position in array
  
  Loop through each value and create a bar
  */
  values.forEach((value, index) => {
    /*
    const bar = document.createElement("div");
    
    Create new div element to represent a bar
    */
    const bar = document.createElement("div");
    
    /*
    const height = 42 + (value / max) * 190;
    
    42 = Minimum bar height (so even 0 shows)
    (value / max) = Ratio of this value to max (0 to 1)
    * 190 = Scale to 190 pixels max
    height = Total height (42 to 232 pixels)
    
    Calculate bar height based on value
    */
    const height = 42 + (value / max) * 190;
    
    /*
    bar.className = "bar";
    
    Assign CSS class for styling
    */
    bar.className = "bar";
    
    /*
    bar.style.setProperty("--bar-height", `${height}px`);
    
    bar.style.setProperty(...) = Set CSS custom property
    "--bar-height" = CSS variable name (starts with --)
    `${height}px` = Template literal with height value
    
    Sets CSS variable used in stylesheet
    CSS controls actual height display
    */
    bar.style.setProperty("--bar-height", `${height}px`);
    
    /*
    bar.textContent = value;
    
    Set text inside bar to show number
    */
    bar.textContent = value;

    /*
    Add CSS classes based on bar state
    These control colors and styling
    */
    if (compare.includes(index)) bar.classList.add("compare");
    if (active.includes(index)) bar.classList.add("active");
    if (sorted.includes(index)) bar.classList.add("sorted");
    if (step.pivot === index) bar.classList.add("pivot");
    if (hasBounds && !bounded.has(index)) bar.classList.add("dimmed");

    /*
    state.bars.appendChild(bar);
    
    state.bars = Container element
    .appendChild = Add element as child
    bar = The bar element to add
    
    Adds bar to visualization container
    */
    state.bars.appendChild(bar);
  });

  /*
  Update message and counter display
  */
  state.message.textContent = step.message || "";
  state.counter.textContent = `${idx + 1} / ${steps.length}`;
  
  /*
  Update complexity panel with current step info
  */
  updateComplexityPanel(panel, step);
}

/*
async function startPanel(panel) { ... }
async = Function that can use await (asynchronous)
startPanel = Generates steps for algorithm visualization
Fetches data from server and initializes visualization
*/
async function startPanel(panel) {
  /*
  const state = panelStates.get(panel);
  
  Get state for this panel
  */
  const state = panelStates.get(panel);
  
  /*
  stopPanel(panel);
  
  Call function to stop any running animation
  Resets playing state
  */
  stopPanel(panel);

  /*
  const values = parseValues(state.valuesInput);
  
  Get user input and parse to numbers
  parseValues = Function defined earlier
  values = Array of numbers from input
  */
  const values = parseValues(state.valuesInput);
  
  /*
  if (!values.length || values.some(Number.isNaN)) {
    state.message.textContent = "Enter comma-separated integer values.";
    return;
  }
  
  Guard: Check if input is valid
  !values.length = True if array is empty
  values.some(Number.isNaN) = True if any value is NaN
  some = Array method checking if any element matches
  return = Exit early
  
  Shows error message if input invalid
  */
  if (!values.length || values.some(Number.isNaN)) {
    state.message.textContent = "Enter comma-separated integer values.";
    return;
  }

  /*
  let payload;
  
  let = Variable that can be reassigned (unlike const)
  payload = Will hold server response data
  */
  let payload;
  
  /*
  try {
    ...
  } catch (e) {
    ...
  }
  
  try/catch = Error handling
  try = Code that might throw error
  catch = Handle error if thrown
  e = Error object
  */
  try {
    /*
    const response = await fetch(`/api/visualize/${state.algorithmId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });
    
    fetch = Global function to make HTTP request
    await = Wait for request to complete
    `/api/visualize/${state.algorithmId}` = Template literal with algorithm ID
    { method: "POST", ... } = Options object
      - method: "POST" = HTTP POST request
      - headers: { ... } = HTTP headers (metadata)
      - body: JSON.stringify({ values }) = Request body as JSON
    
    response = HTTP response from server
    Fetches visualization steps from backend
    */
    const response = await fetch(`/api/visualize/${state.algorithmId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });

    /*
    payload = await response.json();
    
    response.json() = Parse response body as JSON
    await = Wait for parsing to complete
    payload = Object with visualization steps
    */
    payload = await response.json();
    
    /*
    if (!response.ok) {
      ...
    }
    
    response.ok = Boolean (true if status 200-299)
    !response.ok = True if error response
    
    Check if server returned error
    */
    if (!response.ok) {
      state.message.textContent = payload?.error || "Unable to generate visualization.";
      state.steps = [];
      state.index = 0;
      renderBars(panel);
      return;
    }
  } catch (e) {
    /*
    catch block: Handle network/parsing errors
    */
    state.message.textContent = "Network/Server error while generating steps.";
    state.steps = [];
    state.index = 0;
    renderBars(panel);
    return;
  }

  /*
  state.steps = Array.isArray(payload?.steps) ? payload.steps : [];
  
  payload?.steps = Optional chaining (safely access steps)
  Array.isArray(...) = Check if it's array
  ? payload.steps : [] = Use steps or empty array
  
  Store steps from server response
  */
  state.steps = Array.isArray(payload?.steps) ? payload.steps : [];
  
  /*
  state.index = 0;
  
  Reset to first step
  */
  state.index = 0;
  
  /*
  renderBars(panel);
  
  Render the visualization
  */
  renderBars(panel);
}

/*
============================================================================
NOTE: FILE CONTINUES WITH MORE FUNCTIONS...
============================================================================

The rest of the file contains:
- movePanel: Navigate to previous/next steps
- togglePanel: Play/pause animation
- setCodeTab: Switch between Python/Java code
- Panel initialization with event listeners
- Search visualization functions
- List visualization functions
- Stack/Queue visualization functions
- And more...

EACH FUNCTION FOLLOWS SIMILAR PATTERNS:
1. Get/retrieve state for specific panel
2. Validate inputs and guard against errors
3. Manipulate DOM elements
4. Update display based on data
5. Attach event listeners

KEY JAVASCRIPT CONCEPTS DEMONSTRATED:
1. Variables: const, let, function scope
2. Data Types: Arrays, Objects, Maps, Sets
3. Operators: +, -, *, /, %, =, ==, ===, !, &&, ||, ?:, =>
4. Functions: function declaration, arrow functions, async/await
5. Arrays: forEach, map, filter, find, some, includes, slice
6. Objects: property access (dot, bracket), destructuring
7. DOM: querySelector, classList, innerHTML, appendChild, addEventListener
8. Promises: fetch, .then(), async/await
9. Regular Expressions: /pattern/.test()
10. Template Literals: backticks with ${variables}
11. Spread Operator: ...array
12. Optional Chaining: ?.
13. Nullish Coalescing: ??
14. Control Flow: if/else, try/catch, for/while loops
15. Event Handling: addEventListener, event.preventDefault()

====================================================================================
*/
