import json
from pathlib import Path
from datetime import datetime, timedelta
import random

from flask import Flask, jsonify, render_template, request

from algorithms import (
    binary_search_steps,
    bubble_sort_steps,
    circular_linked_list_steps,
    doubly_linked_list_steps,
    insertion_sort_steps,
    linear_search_steps,
    quick_sort_steps,
    selection_sort_steps,
    singly_linked_list_steps,
    stack_operation_steps,
    queue_operation_steps,
    circular_queue_operation_steps,
)



app = Flask(__name__)

CONTEST_PROFILE_PATH = Path(app.instance_path) / "contest_profile.json"
DEFAULT_CONTEST_PROFILE = {
    "hp": 100,
    "maxHp": 100,
    "streak": 7,
    "completedContests": 0,
    "abandonedContests": 0,
    "wonContests": 0,
    "totalContests": 0,
    "quitStreak": 0,
}


def load_contest_profile():
    try:
        if CONTEST_PROFILE_PATH.exists():
            with CONTEST_PROFILE_PATH.open("r", encoding="utf-8") as profile_file:
                stored = json.load(profile_file)
            return {**DEFAULT_CONTEST_PROFILE, **stored}
    except (OSError, json.JSONDecodeError):
        pass
    return DEFAULT_CONTEST_PROFILE.copy()


def save_contest_profile(profile):
    sanitized = DEFAULT_CONTEST_PROFILE.copy()
    for key in sanitized:
        value = profile.get(key, sanitized[key])
        if isinstance(sanitized[key], int):
            try:
                value = int(value)
            except (TypeError, ValueError):
                value = sanitized[key]
        sanitized[key] = value
    sanitized["maxHp"] = max(1, sanitized["maxHp"])
    sanitized["hp"] = min(max(0, sanitized["hp"]), sanitized["maxHp"])
    sanitized["streak"] = max(0, sanitized["streak"])
    sanitized["completedContests"] = max(0, sanitized["completedContests"])
    sanitized["abandonedContests"] = max(0, sanitized["abandonedContests"])
    sanitized["wonContests"] = max(0, sanitized["wonContests"])
    sanitized["totalContests"] = max(0, sanitized["totalContests"])
    sanitized["quitStreak"] = max(0, sanitized["quitStreak"])
    CONTEST_PROFILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CONTEST_PROFILE_PATH.open("w", encoding="utf-8") as profile_file:
        json.dump(sanitized, profile_file, indent=2)
    return sanitized


ALGORITHMS = {
    "bubble-sort": {
        "name": "Bubble Sort",
        "type": "sort",
        "difficulty": "Beginner",
        "summary": "Repeatedly compares adjacent values and bubbles the largest unsorted value to the end.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": """def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr""",
        "java": """static int[] bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}""",
    },
    "insertion-sort": {
        "name": "Insertion Sort",
        "type": "sort",
        "difficulty": "Beginner",
        "summary": "Builds a sorted prefix by inserting each new value into its correct position.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": """def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr""",
        "java": """static int[] insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}""",
    },
    "selection-sort": {
        "name": "Selection Sort",
        "type": "sort",
        "difficulty": "Beginner",
        "summary": "Selects the smallest value from the unsorted region and places it at the front.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": """def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_index = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr""",
        "java": """static int[] selectionSort(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
    return arr;
}""",
    },
    "quick-sort": {
        "name": "Quick Sort",
        "type": "sort",
        "difficulty": "Intermediate",
        "summary": "Partitions values around a pivot, then recursively sorts the left and right partitions.",
        "time": "O(n log n) average",
        "space": "O(log n)",
        "python": """def quick_sort(arr):
    def partition(low, high):
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        return i + 1

    def sort(low, high):
        if low < high:
            pivot_index = partition(low, high)
            sort(low, pivot_index - 1)
            sort(pivot_index + 1, high)

    sort(0, len(arr) - 1)
    return arr""",
        "java": """static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}""",
    },
    "linear-search": {
        "name": "Linear Search",
        "type": "search",
        "difficulty": "Beginner",
        "summary": "Checks each element from left to right until the target is found or the list ends.",
        "time": "O(n)",
        "best": "O(1)",
        "average": "O(n)",
        "worst": "O(n)",
        "space": "O(1)",
        "python": """def linear_search(arr, target):
    for index, value in enumerate(arr):
        if value == target:
            return index
    return -1""",
        "java": """static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}""",
    },
    "binary-search": {
        "name": "Binary Search",
        "type": "search",
        "difficulty": "Beginner",
        "summary": "Repeatedly halves a sorted search space by comparing the target with the middle value.",
        "time": "O(log n)",
        "best": "O(1)",
        "average": "O(log n)",
        "worst": "O(log n)",
        "space": "O(1)",
        "python": """def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1""",
        "java": """static int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}""",
    },
}


STEP_BUILDERS = {
    "bubble-sort": bubble_sort_steps,
    "insertion-sort": insertion_sort_steps,
    "selection-sort": selection_sort_steps,
    "quick-sort": quick_sort_steps,
    "linear-search": linear_search_steps,
    "binary-search": binary_search_steps,
}


LINKED_LISTS = {
    "singly-linked-list": {
        "name": "Singly Linked List",
        "summary": "Each node stores data and one next pointer to the following node.",
        "python": """class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def insert_beginning(head, value):
    node = Node(value)
    node.next = head
    return node

def insert_end(head, value):
    node = Node(value)
    if head is None:
        return node
    cur = head
    while cur.next:
        cur = cur.next
    cur.next = node
    return head

def delete_beginning(head):
    return None if head is None else head.next

def search(head, target):
    pos = 1
    cur = head
    while cur:
        if cur.data == target:
            return pos
        cur = cur.next
        pos += 1
    return -1

def reverse(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev""",
        "java": """class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
    }
}

Node insertBeginning(Node head, int value) {
    Node node = new Node(value);
    node.next = head;
    return node;
}

Node insertEnd(Node head, int value) {
    Node node = new Node(value);
    if (head == null) return node;
    Node cur = head;
    while (cur.next != null) cur = cur.next;
    cur.next = node;
    return head;
}

Node deleteBeginning(Node head) {
    return head == null ? null : head.next;
}

int search(Node head, int target) {
    int pos = 1;
    for (Node cur = head; cur != null; cur = cur.next, pos++) {
        if (cur.data == target) return pos;
    }
    return -1;
}

Node reverse(Node head) {
    Node prev = null, cur = head;
    while (cur != null) {
        Node next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}""",
    },
    "doubly-linked-list": {
        "name": "Doubly Linked List",
        "summary": "Each node stores data, a next pointer, and a prev pointer for two-way traversal.",
        "python": """class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None

first = Node(10)
second = Node(20)
first.next = second
second.prev = first""",
        "java": """class Node {
    int data;
    Node prev;
    Node next;

    Node(int data) {
        this.data = data;
    }
}""",
    },
    "circular-linked-list": {
        "name": "Circular Linked List",
        "summary": "The final node points back to the head, forming a continuous loop.",
        "python": """class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

head = Node(10)
tail = Node(30)
# Tail points back to the first node.
tail.next = head""",
        "java": """class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
    }
}

// Tail points back to the first node.
tail.next = head;""",
    },
}


LIST_STEP_BUILDERS = {
    "singly-linked-list": singly_linked_list_steps,
    "doubly-linked-list": doubly_linked_list_steps,
    "circular-linked-list": circular_linked_list_steps,
}


STACKS = {
    "stack-operations": {
        "name": "Stack Operations",
        "summary": "A stack follows LIFO order: push adds to the top, pop removes from the top, and helper operations inspect top, min, and max.",
        "python": """class MinMaxStack:
    def __init__(self):
        self.stack = []

    def push(self, value):
        self.stack.append(value)

    def pop(self):
        return self.stack.pop()

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return min(self.stack)

    def get_max(self):
        return max(self.stack)

    def is_empty(self):
        return len(self.stack) == 0

    def reset(self):
        self.stack.clear()""",
        "java": """import java.util.*;

class MinMaxStack {
    Stack<Integer> stack = new Stack<>();

    void push(int value) {
        stack.push(value);
    }

    int pop() {
        return stack.pop();
    }

    int top() {
        return stack.peek();
    }

    int getMin() {
        return Collections.min(stack);
    }

    int getMax() {
        return Collections.max(stack);
    }

    boolean isEmpty() {
        return stack.isEmpty();
    }

    void reset() {
        stack.clear();
    }
}""",
    }
}

QUEUE_VISUALS = {
    "queue-operations": {
        "name": "Queue",
        "summary": "FIFO: enqueue adds to the rear; dequeue removes from the front.",
        "capacityDefault": 8,
        "python": """class ArrayQueue:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = [None] * capacity
        self.front = 0
        self.rear = -1
        self.size = 0

    def enqueue(self, x):
        if self.size == self.cap:
            raise OverflowError("Queue overflow")
        self.rear += 1
        self.data[self.rear] = x
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise IndexError("Queue underflow")
        x = self.data[self.front]
        self.data[self.front] = None
        self.front += 1
        self.size -= 1
        if self.size == 0:
            self.rear = -1
        return x""",
        "java": """class ArrayQueue {
    int cap;
    Integer[] data;
    int front, rear, size;

    ArrayQueue(int capacity) {
        cap = capacity;
        data = new Integer[capacity];
        front = 0;
        rear = -1;
        size = 0;
    }

    void enqueue(int x) {
        if (size == cap) throw new RuntimeException("Overflow");
        rear++;
        data[rear] = x;
        size++;
    }

    int dequeue() {
        if (size == 0) throw new RuntimeException("Underflow");
        int x = data[front];
        data[front] = null;
        front++;
        size--;
        if (size == 0) rear = -1;
        return x;
    }
}""",
        "theory": """Queue (FIFO):
- Enqueue adds to the rear.
- Dequeue removes from the front.
- Overflow happens when size == capacity; underflow when size == 0.""",
    },
    "circular-queue-operations": {
        "name": "Circular Queue",
        "summary": "FIFO with wrap-around: reuse freed space using modulo indexing.",
        "capacityDefault": 8,
        "python": """class CircularQueue:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = [None] * capacity
        self.front = 0
        self.rear = -1
        self.size = 0

    def enqueue(self, x):
        if self.size == self.cap:
            raise OverflowError("Queue overflow")
        self.rear = (self.rear + 1) % self.cap
        self.data[self.rear] = x
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise IndexError("Queue underflow")
        x = self.data[self.front]
        self.data[self.front] = None
        self.front = (self.front + 1) % self.cap
        self.size -= 1
        if self.size == 0:
            self.rear = -1
        return x""",
        "java": """class CircularQueue {
    int cap;
    Integer[] data;
    int front, rear, size;

    CircularQueue(int capacity) {
        cap = capacity;
        data = new Integer[capacity];
        front = 0;
        rear = -1;
        size = 0;
    }

    void enqueue(int x) {
        if (size == cap) throw new RuntimeException("Overflow");
        rear = (rear + 1) % cap;
        data[rear] = x;
        size++;
    }

    int dequeue() {
        if (size == 0) throw new RuntimeException("Underflow");
        int x = data[front];
        data[front] = null;
        front = (front + 1) % cap;
        size--;
        if (size == 0) rear = -1;
        return x;
    }
}""",
        "theory": """Circular Queue:
- Front and rear wrap using modulo.
- Avoids unused space; enables continuous enqueue/dequeue.""",
    },
}



@app.route("/")
def index():
    return render_template(
        "index.html",
        algorithms=ALGORITHMS,
        linked_lists=LINKED_LISTS,
        stacks=STACKS,
        queues=QUEUE_VISUALS,
    )



@app.get("/api/algorithms")
def list_algorithms():
    return jsonify(ALGORITHMS)


@app.get("/api/linked-lists")
def list_linked_lists():
    return jsonify(LINKED_LISTS)


@app.get("/api/stacks")
def list_stacks():
    return jsonify(STACKS)


@app.post("/api/visualize/<algorithm_id>")
def visualize(algorithm_id):
    if algorithm_id not in STEP_BUILDERS:
        return jsonify({"error": "Unknown algorithm"}), 404

    payload = request.get_json(silent=True) or {}
    values = payload.get("values", [])
    target = payload.get("target")

    try:
        numbers = [int(value) for value in values]
    except (TypeError, ValueError):
        return jsonify({"error": "Values must be integers"}), 400

    if len(numbers) > 18:
        return jsonify({"error": "Use 18 or fewer values for clear visualization"}), 400

    if ALGORITHMS[algorithm_id]["type"] == "search":
        try:
            target = int(target)
        except (TypeError, ValueError):
            return jsonify({"error": "Search algorithms require an integer target"}), 400
        steps = STEP_BUILDERS[algorithm_id](numbers, target)
    else:
        steps = STEP_BUILDERS[algorithm_id](numbers)

    return jsonify(
        {
            "algorithm": ALGORITHMS[algorithm_id],
            "steps": steps,
            "totalSteps": len(steps),
        }
    )


@app.post("/api/linked-list/<list_id>")
def visualize_linked_list(list_id):
    if list_id not in LIST_STEP_BUILDERS:
        return jsonify({"error": "Unknown linked list type"}), 404

    payload = request.get_json(silent=True) or {}
    values = payload.get("values", [])

    try:
        numbers = [int(value) for value in values]
    except (TypeError, ValueError):
        return jsonify({"error": "Values must be integers"}), 400

    if len(numbers) > 10:
        return jsonify({"error": "Use 10 or fewer values for clear linked-list visualization"}), 400

    steps = LIST_STEP_BUILDERS[list_id](numbers)
    return jsonify({"linkedList": LINKED_LISTS[list_id], "steps": steps, "totalSteps": len(steps)})


@app.post("/api/queue/<queue_id>")
def visualize_queue(queue_id):
    if queue_id not in {"queue-operations", "circular-queue-operations"}:
        return jsonify({"error": "Unknown queue visualization"}), 404

    payload = request.get_json(silent=True) or {}
    values = payload.get("values", [])
    capacity = payload.get("capacity")

    try:
        numbers = [int(value) for value in values]
    except (TypeError, ValueError):
        return jsonify({"error": "Values must be integers"}), 400

    if len(numbers) > 10:
        return jsonify({"error": "Use 10 or fewer values for clear queue visualization"}), 400

    try:
        capacity = int(capacity) if capacity is not None else QUEUE_VISUALS[queue_id]["capacityDefault"]
    except (TypeError, ValueError):
        return jsonify({"error": "Capacity must be an integer"}), 400

    if capacity < 2 or capacity > 18:
        return jsonify({"error": "Capacity must be between 2 and 18"}), 400

    if queue_id == "queue-operations":
        steps = queue_operation_steps(capacity, numbers)
    else:
        steps = circular_queue_operation_steps(capacity, numbers)

    return jsonify({"queue": QUEUE_VISUALS[queue_id], "steps": steps, "totalSteps": len(steps), "capacity": capacity})


@app.post("/api/stack/<stack_id>")
def visualize_stack(stack_id):
    if stack_id != "stack-operations":
        return jsonify({"error": "Unknown stack visualization"}), 404


    payload = request.get_json(silent=True) or {}
    values = payload.get("values", [])

    try:
        numbers = [int(value) for value in values]
    except (TypeError, ValueError):
        return jsonify({"error": "Values must be integers"}), 400

    if len(numbers) > 10:
        return jsonify({"error": "Use 10 or fewer values for clear stack visualization"}), 400

    steps = stack_operation_steps(numbers)
    return jsonify({"stack": STACKS[stack_id], "steps": steps, "totalSteps": len(steps)})


def dsa_chatbot_reply(user_text: str) -> dict:
    text = (user_text or "").strip().lower()
    if not text:
        return {
            "reply": "Ask a DSA question (e.g., 'What is binary search?', 'Explain Big-O', 'How does a stack work?').",
            "tags": [],
        }

    # Comprehensive DSA Knowledge Base
    KNOWLEDGE_BASE = {
        # Data Structures
        "array": {
            "definition": "An array is a fixed-size, contiguous block of memory that stores elements of the same type.",
            "working": "Elements are accessed using indices (starting from 0). Arrays provide O(1) access time but fixed size.",
            "analogy": "Like a row of lockers in a gym - each has a number and holds one item.",
            "time_complexity": "Access: O(1), Search: O(n), Insert/Delete: O(n)",
            "space_complexity": "O(n)",
            "example": "int[] arr = {1, 2, 3, 4, 5}; // Access arr[2] = 3",
            "python": "arr = [1, 2, 3, 4, 5]\nprint(arr[2])  # Output: 3",
            "java": "int[] arr = {1, 2, 3, 4, 5};\nSystem.out.println(arr[2]);  // Output: 3"
        },
        "linked list": {
            "definition": "A linked list is a linear data structure where elements are stored in nodes, each containing data and a reference to the next node.",
            "working": "Nodes are connected via pointers. No random access - must traverse from head.",
            "analogy": "Like a treasure hunt where each clue points to the next location.",
            "time_complexity": "Access: O(n), Search: O(n), Insert/Delete at ends: O(1), Insert/Delete in middle: O(n)",
            "space_complexity": "O(n)",
            "example": "Head -> [1] -> [2] -> [3] -> null",
            "python": "class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nhead = Node(1)\nhead.next = Node(2)",
            "java": "class Node {\n    int data;\n    Node next;\n    Node(int data) { this.data = data; }\n}\n\nNode head = new Node(1);\nhead.next = new Node(2);"
        },
        "stack": {
            "definition": "A stack is a LIFO (Last In, First Out) data structure where elements are added and removed from the same end.",
            "working": "Push adds to top, pop removes from top. Like a stack of plates.",
            "analogy": "Like a stack of plates - you add/remove from the top.",
            "time_complexity": "Push/Pop/Peek: O(1)",
            "space_complexity": "O(n)",
            "example": "Push(1), Push(2), Push(3), Pop() returns 3",
            "python": "stack = []\nstack.append(1)  # push\nstack.append(2)\nprint(stack.pop())  # 2",
            "java": "Stack<Integer> stack = new Stack<>();\nstack.push(1);\nstack.push(2);\nSystem.out.println(stack.pop());  // 2"
        },
        "queue": {
            "definition": "A queue is a FIFO (First In, First Out) data structure where elements are added at rear and removed from front.",
            "working": "Enqueue adds to rear, dequeue removes from front. Like a line at a store.",
            "analogy": "Like people waiting in line - first person served first.",
            "time_complexity": "Enqueue/Dequeue: O(1)",
            "space_complexity": "O(n)",
            "example": "Enqueue(1), Enqueue(2), Dequeue() returns 1",
            "python": "from collections import deque\nq = deque()\nq.append(1)  # enqueue\nq.append(2)\nprint(q.popleft())  # 1",
            "java": "Queue<Integer> q = new LinkedList<>();\nq.add(1);  // enqueue\nq.add(2);\nSystem.out.println(q.remove());  // 1"
        },
        "binary search": {
            "definition": "Binary search repeatedly divides the search space in half by comparing with the middle element.",
            "working": "Requires sorted array. Compare target with middle, discard half each time.",
            "analogy": "Like guessing a number between 1-100 by halving the range each guess.",
            "time_complexity": "O(log n)",
            "space_complexity": "O(1)",
            "example": "Search 7 in [1,3,5,7,9] - check middle 5, go right, check 7",
            "python": "def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1",
            "java": "static int binarySearch(int[] arr, int target) {\n    int left = 0, right = arr.length - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}"
        },
        "bubble sort": {
            "definition": "Bubble sort repeatedly compares adjacent elements and swaps them if they're in wrong order.",
            "working": "Largest elements 'bubble' to the end. Multiple passes until no swaps needed.",
            "analogy": "Like bubbles rising in water - heavier elements sink to bottom.",
            "time_complexity": "O(n²) worst/average, O(n) best",
            "space_complexity": "O(1)",
            "example": "Sort [3,1,4,1,5] - compare adjacent pairs, swap if needed",
            "python": "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr",
            "java": "static void bubbleSort(int[] arr) {\n    for (int i = 0; i < arr.length; i++) {\n        for (int j = 0; j < arr.length - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n}"
        }
    }

    # Keywords mapping to topics
    KEYWORDS = {
        "array": ["array", "arrays", "list", "fixed size"],
        "linked list": ["linked list", "linked-list", "linkedlist", "node", "pointer"],
        "stack": ["stack", "lifo", "push", "pop", "last in first out"],
        "queue": ["queue", "fifo", "enqueue", "dequeue", "first in first out"],
        "binary search": ["binary search", "binary-search", "logarithmic search"],
        "bubble sort": ["bubble sort", "bubble-sort"]
    }

    # Match user input to topics
    matched_topic = None
    for topic, keywords in KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            matched_topic = topic
            break

    if matched_topic and matched_topic in KNOWLEDGE_BASE:
        info = KNOWLEDGE_BASE[matched_topic]
        reply = f"**{matched_topic.title()}**\n\n"
        reply += f"📖 **Definition:** {info['definition']}\n\n"
        reply += f"⚙️ **How it works:** {info['working']}\n\n"
        reply += f"🌟 **Real-world analogy:** {info['analogy']}\n\n"
        if info['time_complexity'] != "N/A":
            reply += f"⏱️ **Time Complexity:** {info['time_complexity']}\n\n"
        if info['space_complexity'] != "N/A":
            reply += f"💾 **Space Complexity:** {info['space_complexity']}\n\n"
        reply += f"📝 **Example:** {info['example']}\n\n"
        reply += f"🐍 **Python Code:**\n```python\n{info['python']}\n```\n\n"
        reply += f"☕ **Java Code:**\n```java\n{info['java']}\n```"

        suggestions = [
            f"Ask me about {matched_topic} implementation details!",
            f"Want to see a visualization of {matched_topic}?",
            "Compare this with another data structure/algorithm?",
            "Need help with a coding problem involving this?"
        ]
        reply += f"\n\n💡 {__import__('random').choice(suggestions)}"

        return {
            "reply": reply,
            "tags": [matched_topic],
        }

    # Fallback for unrecognized questions
    return {
        "reply": "Sorry, I currently support only DSA-related questions about data structures, algorithms, and complexity analysis. Try asking about arrays, linked lists, stacks, queues, sorting algorithms, searching algorithms, trees, graphs, or Big O notation!",
        "tags": ["fallback"],
    }

@app.post("/api/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message", "")

    response = dsa_chatbot_reply(message)
    return jsonify(response)


@app.get("/api/contest/profile")
def get_contest_profile():
    return jsonify(load_contest_profile())


# ===== GAMIFICATION SYSTEM =====

GAMIFICATION_PATH = Path(app.instance_path) / "gamification.json"

DEFAULT_GAMIFICATION = {
    "xp": 0,
    "level": 1,
    "streak": 0,
    "longest_streak": 0,
    "total_practice_days": 0,
    "last_login": None,
    "solved_questions": 0,
    "completed_quizzes": 0,
    "badges_earned": [],
    "achievements": [],
    "daily_practice_log": [],
}

DAILY_CHALLENGES = [
    {
        "id": 1,
        "title": "Master Bubble Sort",
        "difficulty": "Easy",
        "description": "Watch and understand how bubble sort compares adjacent elements.",
        "xp_reward": 50,
        "topic": "sorting"
    },
    {
        "id": 2,
        "title": "Quick Sort Challenge",
        "difficulty": "Medium",
        "description": "Learn the partition-based approach in quick sort.",
        "xp_reward": 75,
        "topic": "sorting"
    },
    {
        "id": 3,
        "title": "Binary Search Mastery",
        "difficulty": "Easy",
        "description": "Explore how binary search halves the search space.",
        "xp_reward": 50,
        "topic": "searching"
    },
    {
        "id": 4,
        "title": "Linear Search Basics",
        "difficulty": "Easy",
        "description": "Understand linear search from left to right.",
        "xp_reward": 40,
        "topic": "searching"
    },
    {
        "id": 5,
        "title": "Stack Operations",
        "difficulty": "Medium",
        "description": "Master LIFO concept with push and pop operations.",
        "xp_reward": 70,
        "topic": "data-structures"
    },
    {
        "id": 6,
        "title": "Queue Essentials",
        "difficulty": "Medium",
        "description": "Learn FIFO with enqueue and dequeue.",
        "xp_reward": 70,
        "topic": "data-structures"
    },
    {
        "id": 7,
        "title": "Linked List Magic",
        "difficulty": "Hard",
        "description": "Navigate node-based data structures.",
        "xp_reward": 100,
        "topic": "data-structures"
    },
    {
        "id": 8,
        "title": "Selection Sort Path",
        "difficulty": "Easy",
        "description": "Find the minimum and sort step by step.",
        "xp_reward": 50,
        "topic": "sorting"
    },
]

ALL_BADGES = {
    "first_solve": {"name": "First Problem Solved", "icon": "🎯", "condition": "Solve 1 problem"},
    "week_warrior": {"name": "7-Day Streak", "icon": "🔥", "condition": "Maintain 7-day streak"},
    "month_master": {"name": "30-Day Legend", "icon": "⭐", "condition": "Maintain 30-day streak"},
    "bubble_expert": {"name": "Bubble Sort Expert", "icon": "🫧", "condition": "Complete bubble sort"},
    "binary_pro": {"name": "Binary Search Pro", "icon": "🎲", "condition": "Complete binary search"},
    "stack_master": {"name": "Stack Master", "icon": "📚", "condition": "Complete stack operations"},
    "queue_guru": {"name": "Queue Guru", "icon": "🚀", "condition": "Complete queue operations"},
    "list_champion": {"name": "Linked List Champion", "icon": "⛓️", "condition": "Complete linked lists"},
    "problem_solver_10": {"name": "Problem Solver (10)", "icon": "💡", "condition": "Solve 10 problems"},
    "problem_solver_25": {"name": "Problem Solver (25)", "icon": "🧠", "condition": "Solve 25 problems"},
    "quiz_master": {"name": "Quiz Master", "icon": "📝", "condition": "Complete 5 quizzes"},
    "speed_demon": {"name": "Speed Demon", "icon": "⚡", "condition": "Complete 3 algorithms in 1 day"},
}

LEVEL_THRESHOLDS = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000,
    6: 1500,
    7: 2500,
    8: 3500,
    9: 5000,
    10: 7500,
}

LEVEL_NAMES = {
    1: "Beginner",
    2: "Learner",
    3: "Problem Solver",
    4: "DSA Explorer",
    5: "Algorithm Enthusiast",
    6: "Data Structure Pro",
    7: "Advanced Analyst",
    8: "Expert Engineer",
    9: "Algorithm Master",
    10: "DSA Legend",
}


def load_gamification():
    try:
        if GAMIFICATION_PATH.exists():
            with GAMIFICATION_PATH.open("r", encoding="utf-8") as f:
                stored = json.load(f)
            return {**DEFAULT_GAMIFICATION, **stored}
    except (OSError, json.JSONDecodeError):
        pass
    return DEFAULT_GAMIFICATION.copy()


def save_gamification(data):
    sanitized = DEFAULT_GAMIFICATION.copy()
    for key in sanitized:
        if key in data:
            sanitized[key] = data[key]
    sanitized["xp"] = max(0, int(sanitized.get("xp", 0)))
    sanitized["level"] = max(1, int(sanitized.get("level", 1)))
    sanitized["streak"] = max(0, int(sanitized.get("streak", 0)))
    sanitized["longest_streak"] = max(0, int(sanitized.get("longest_streak", 0)))
    sanitized["total_practice_days"] = max(0, int(sanitized.get("total_practice_days", 0)))
    sanitized["solved_questions"] = max(0, int(sanitized.get("solved_questions", 0)))
    sanitized["completed_quizzes"] = max(0, int(sanitized.get("completed_quizzes", 0)))
    
    GAMIFICATION_PATH.parent.mkdir(parents=True, exist_ok=True)
    with GAMIFICATION_PATH.open("w", encoding="utf-8") as f:
        json.dump(sanitized, f, indent=2)
    return sanitized


def calculate_level_from_xp(xp):
    level = 1
    for lv, threshold in sorted(LEVEL_THRESHOLDS.items(), reverse=True):
        if xp >= threshold:
            level = lv
            break
    return level


def get_xp_for_level(level):
    return LEVEL_THRESHOLDS.get(level, 0)


@app.get("/api/gamification/profile")
def get_gamification_profile():
    data = load_gamification()
    xp = data.get("xp", 0)
    level = calculate_level_from_xp(xp)
    data["level"] = level
    data["level_name"] = LEVEL_NAMES.get(level, "Unknown")
    
    # Calculate XP for current and next level
    current_level_xp = get_xp_for_level(level)
    next_level = min(level + 1, 10)
    next_level_xp = get_xp_for_level(next_level)
    data["xp_progress"] = xp - current_level_xp
    data["xp_needed"] = next_level_xp - current_level_xp
    
    save_gamification(data)
    return jsonify(data)


@app.post("/api/gamification/add-xp")
def add_xp():
    payload = request.get_json(silent=True) or {}
    amount = int(payload.get("amount", 0))
    action = payload.get("action", "visualization")
    
    if amount < 0 or amount > 500:
        return jsonify({"error": "Invalid XP amount"}), 400
    
    data = load_gamification()
    data["xp"] = data.get("xp", 0) + amount
    
    # Log the action
    log_entry = {
        "date": datetime.now().isoformat(),
        "action": action,
        "xp": amount
    }
    if "xp_log" not in data:
        data["xp_log"] = []
    data["xp_log"].append(log_entry)
    
    save_gamification(data)
    return jsonify({"success": True, "xp": data["xp"]})


@app.post("/api/gamification/update-streak")
def update_streak():
    data = load_gamification()
    today = datetime.now().date().isoformat()
    last_login = data.get("last_login")
    
    if last_login == today:
        return jsonify({"success": True, "streak": data.get("streak", 0), "message": "Already logged in today"})
    
    yesterday = (datetime.now().date() - timedelta(days=1)).isoformat()
    
    if last_login == yesterday:
        # Continue streak
        data["streak"] = data.get("streak", 0) + 1
    else:
        # Streak broken or first login
        data["streak"] = 1
    
    data["last_login"] = today
    data["longest_streak"] = max(data.get("longest_streak", 0), data["streak"])
    data["total_practice_days"] = data.get("total_practice_days", 0) + 1
    
    # Add streak bonus XP
    streak_bonus = min(data["streak"] * 5, 50)  # Max 50 XP bonus
    data["xp"] = data.get("xp", 0) + streak_bonus
    
    save_gamification(data)
    return jsonify({
        "success": True,
        "streak": data["streak"],
        "longest_streak": data["longest_streak"],
        "streak_bonus_xp": streak_bonus,
        "total_xp": data["xp"]
    })


@app.post("/api/gamification/solve-problem")
def solve_problem():
    payload = request.get_json(silent=True) or {}
    problem_id = payload.get("problem_id")
    difficulty = payload.get("difficulty", "Easy")
    
    # XP rewards by difficulty
    xp_by_difficulty = {
        "Easy": 50,
        "Medium": 75,
        "Hard": 100
    }
    
    xp_reward = xp_by_difficulty.get(difficulty, 50)
    
    data = load_gamification()
    data["xp"] = data.get("xp", 0) + xp_reward
    data["solved_questions"] = data.get("solved_questions", 0) + 1
    
    # Check for badges
    new_badges = []
    if data["solved_questions"] == 1:
        new_badges.append("first_solve")
    if data["solved_questions"] == 10:
        new_badges.append("problem_solver_10")
    if data["solved_questions"] == 25:
        new_badges.append("problem_solver_25")
    
    if new_badges:
        current_badges = data.get("badges_earned", [])
        for badge in new_badges:
            if badge not in current_badges:
                current_badges.append(badge)
        data["badges_earned"] = current_badges
    
    save_gamification(data)
    return jsonify({
        "success": True,
        "xp_reward": xp_reward,
        "total_xp": data["xp"],
        "problems_solved": data["solved_questions"],
        "new_badges": new_badges
    })


@app.post("/api/gamification/complete-quiz")
def complete_quiz():
    payload = request.get_json(silent=True) or {}
    score = int(payload.get("score", 0))
    
    if score < 0 or score > 100:
        return jsonify({"error": "Invalid score"}), 400
    
    # XP based on score
    xp_reward = int((score / 100) * 100)  # Up to 100 XP
    
    data = load_gamification()
    data["xp"] = data.get("xp", 0) + xp_reward
    data["completed_quizzes"] = data.get("completed_quizzes", 0) + 1
    
    # Check for quiz master badge
    new_badges = []
    if data["completed_quizzes"] == 5:
        badges = data.get("badges_earned", [])
        if "quiz_master" not in badges:
            new_badges.append("quiz_master")
            badges.append("quiz_master")
            data["badges_earned"] = badges
    
    save_gamification(data)
    return jsonify({
        "success": True,
        "xp_reward": xp_reward,
        "total_xp": data["xp"],
        "quizzes_completed": data["completed_quizzes"],
        "new_badges": new_badges
    })


@app.get("/api/gamification/daily-challenges")
def get_daily_challenges():
    today = datetime.now().date().toordinal()
    random.seed(today)
    
    # Select 3 random challenges (Easy, Medium, Hard)
    easy = [c for c in DAILY_CHALLENGES if c["difficulty"] == "Easy"]
    medium = [c for c in DAILY_CHALLENGES if c["difficulty"] == "Medium"]
    hard = [c for c in DAILY_CHALLENGES if c["difficulty"] == "Hard"]
    
    challenges = [
        random.choice(easy),
        random.choice(medium),
        random.choice(hard)
    ]
    
    return jsonify({"challenges": challenges, "date": str(datetime.now().date())})


@app.get("/api/gamification/badges")
def get_badges():
    data = load_gamification()
    earned_badges = data.get("badges_earned", [])
    
    badges_info = []
    for badge_id, badge_data in ALL_BADGES.items():
        earned = badge_id in earned_badges
        badges_info.append({
            "id": badge_id,
            "name": badge_data["name"],
            "icon": badge_data["icon"],
            "condition": badge_data["condition"],
            "earned": earned
        })
    
    return jsonify({"badges": badges_info, "total_earned": len(earned_badges)})


@app.get("/api/gamification/streaks")
def get_streaks():
    data = load_gamification()
    return jsonify({
        "current_streak": data.get("streak", 0),
        "longest_streak": data.get("longest_streak", 0),
        "total_practice_days": data.get("total_practice_days", 0),
        "last_login": data.get("last_login"),
        "solved_questions": data.get("solved_questions", 0),
        "completed_quizzes": data.get("completed_quizzes", 0)
    })


@app.post("/api/gamification/unlock-badge")
def unlock_badge():
    payload = request.get_json(silent=True) or {}
    badge_id = payload.get("badge_id")
    
    if badge_id not in ALL_BADGES:
        return jsonify({"error": "Unknown badge"}), 404
    
    data = load_gamification()
    badges = data.get("badges_earned", [])
    
    if badge_id in badges:
        return jsonify({"success": False, "message": "Badge already earned"})
    
    badges.append(badge_id)
    data["badges_earned"] = badges
    data["xp"] = data.get("xp", 0) + 25  # 25 XP bonus for unlocking badge
    
    save_gamification(data)
    return jsonify({
        "success": True,
        "badge": ALL_BADGES[badge_id],
        "total_badges": len(badges),
        "xp_bonus": 25,
        "total_xp": data["xp"]
    })


@app.post("/api/contest/profile")
def update_contest_profile():
    payload = request.get_json(silent=True) or {}
    return jsonify(save_contest_profile(payload))


if __name__ == "__main__":
    app.run(debug=True, port=8000)
