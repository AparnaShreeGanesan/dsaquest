def make_step(values, message, active=None, compare=None, sorted_indices=None, pivot=None, found=None, bounds=None, left=None, mid=None, right=None, current=None):
    return {
        "values": values[:],
        "message": message,
        "active": active or [],
        "compare": compare or [],
        "sorted": sorted_indices or [],
        "pivot": pivot,
        "found": found,
        "bounds": bounds or [],
        "left": left,
        "mid": mid,
        "right": right,
        "current": current,
    }


def bubble_sort_steps(values):
    arr = values[:]
    steps = [make_step(arr, "Start with the unsorted array.")]
    n = len(arr)
    sorted_indices = []

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            steps.append(
                make_step(
                    arr,
                    f"Compare {arr[j]} and {arr[j + 1]}.",
                    compare=[j, j + 1],
                    sorted_indices=sorted_indices,
                )
            )
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
                steps.append(
                    make_step(
                        arr,
                        "Swap because the left value is larger.",
                        active=[j, j + 1],
                        sorted_indices=sorted_indices,
                    )
                )
        sorted_indices.append(n - i - 1)
        steps.append(make_step(arr, f"Position {n - i} is fixed.", sorted_indices=sorted_indices))
        if not swapped:
            break

    return steps + [make_step(arr, "Array sorted.", sorted_indices=list(range(n)))]


def insertion_sort_steps(values):
    arr = values[:]
    steps = [make_step(arr, "Start with the first value as the sorted region.", sorted_indices=[0] if arr else [])]

    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        steps.append(make_step(arr, f"Take {key} and insert it into the sorted left side.", active=[i]))
        while j >= 0 and arr[j] > key:
            steps.append(make_step(arr, f"{arr[j]} is greater than {key}, shift it right.", compare=[j, j + 1]))
            arr[j + 1] = arr[j]
            steps.append(make_step(arr, "Value shifted one position to the right.", active=[j + 1]))
            j -= 1
        arr[j + 1] = key
        steps.append(make_step(arr, f"Place {key} at index {j + 1}.", active=[j + 1], sorted_indices=list(range(i + 1))))

    return steps + [make_step(arr, "Array sorted.", sorted_indices=list(range(len(arr))))]


def selection_sort_steps(values):
    arr = values[:]
    steps = [make_step(arr, "Start with the full array as unsorted.")]
    sorted_indices = []

    for i in range(len(arr)):
        min_index = i
        steps.append(make_step(arr, f"Assume {arr[i]} is the minimum.", active=[i], sorted_indices=sorted_indices))
        for j in range(i + 1, len(arr)):
            steps.append(make_step(arr, f"Compare current minimum {arr[min_index]} with {arr[j]}.", compare=[min_index, j], sorted_indices=sorted_indices))
            if arr[j] < arr[min_index]:
                min_index = j
                steps.append(make_step(arr, f"New minimum found: {arr[min_index]}.", active=[min_index], sorted_indices=sorted_indices))
        arr[i], arr[min_index] = arr[min_index], arr[i]
        sorted_indices.append(i)
        steps.append(make_step(arr, f"Place the minimum at index {i}.", active=[i, min_index], sorted_indices=sorted_indices))

    return steps + [make_step(arr, "Array sorted.", sorted_indices=list(range(len(arr))))]


def quick_sort_steps(values):
    arr = values[:]
    steps = [make_step(arr, "Start quick sort on the full array.")]

    def partition(low, high):
        pivot = arr[high]
        steps.append(make_step(arr, f"Choose {pivot} as pivot.", pivot=high, bounds=list(range(low, high + 1))))
        i = low - 1
        for j in range(low, high):
            steps.append(make_step(arr, f"Compare {arr[j]} with pivot {pivot}.", compare=[j, high], pivot=high, bounds=list(range(low, high + 1))))
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                steps.append(make_step(arr, "Move value to the left partition.", active=[i, j], pivot=high, bounds=list(range(low, high + 1))))
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        steps.append(make_step(arr, f"Place pivot at index {i + 1}.", active=[i + 1, high], pivot=i + 1))
        return i + 1

    def sort(low, high):
        if low < high:
            steps.append(make_step(arr, f"Partition range index {low} to {high}.", bounds=list(range(low, high + 1))))
            pivot_index = partition(low, high)
            sort(low, pivot_index - 1)
            sort(pivot_index + 1, high)
        elif low == high:
            steps.append(make_step(arr, f"Single value {arr[low]} is already sorted.", sorted_indices=[low]))

    sort(0, len(arr) - 1)
    return steps + [make_step(arr, "Array sorted.", sorted_indices=list(range(len(arr))))]


def linear_search_steps(values, target):
    steps = [
        make_step(values, f"Linear Search: Check each element from left to right until target {target} is found."),
        make_step(values, f"Starting from index 0, we'll examine each element sequentially.")
    ]

    for index, value in enumerate(values):
        steps.append(make_step(
            values,
            f"Checking element at index {index}: value = {value}",
            compare=[index],
            active=[index],
            current=index
        ))

        if value == target:
            steps.append(make_step(
                values,
                f"✓ Found target {target} at index {index}!",
                found=index,
                active=[index],
                current=index
            ))
            return steps
        else:
            steps.append(make_step(
                values,
                f"✗ {value} ≠ {target}, moving to next element",
                active=[index],
                current=index
            ))

    steps.append(make_step(
        values,
        f"❌ Target {target} not found after checking all {len(values)} elements",
        found=-1
    ))
    return steps


def binary_search_steps(values, target):
    arr = sorted(values)
    steps = [
        make_step(arr, f"Binary Search requires sorted data. Input sorted: {arr}"),
        make_step(arr, f"Searching for target: {target}"),
        make_step(arr, "Initialize: left = 0, right = len(arr) - 1", left=0, right=len(arr)-1)
    ]

    left = 0
    right = len(arr) - 1
    iteration = 1

    while left <= right:
        mid = (left + right) // 2

        steps.append(make_step(
            arr,
            f"Iteration {iteration}: left={left}, right={right}, mid={mid} (value={arr[mid]})",
            compare=[mid],
            bounds=list(range(left, right + 1)),
            active=[mid],
            left=left,
            mid=mid,
            right=right
        ))

        if arr[mid] == target:
            steps.append(make_step(
                arr,
                f"✓ FOUND! {arr[mid]} == {target} at index {mid}",
                found=mid,
                active=[mid],
                bounds=list(range(left, right + 1)),
                left=left,
                mid=mid,
                right=right
            ))
            return steps

        elif arr[mid] < target:
            steps.append(make_step(
                arr,
                f"{arr[mid]} < {target}, so target is in RIGHT half. Set left = {mid + 1}",
                bounds=list(range(mid + 1, right + 1)) if mid + 1 <= right else [],
                active=[mid],
                left=left,
                mid=mid,
                right=right
            ))
            left = mid + 1

        else:  # arr[mid] > target
            steps.append(make_step(
                arr,
                f"{arr[mid]} > {target}, so target is in LEFT half. Set right = {mid - 1}",
                bounds=list(range(left, mid)) if left <= mid - 1 else [],
                active=[mid],
                left=left,
                mid=mid,
                right=right
            ))
            right = mid - 1

        iteration += 1

    steps.append(make_step(
        arr,
        f"❌ Target {target} not found. Search space exhausted (left > right)",
        found=-1,
        left=left,
        right=right
    ))
    return steps


def make_list_step(values, message, active=None, linked_until=-1, circular=False):
    return {
        "values": values[:],
        "message": message,
        "active": active or [],
        "linkedUntil": linked_until,
        "circular": circular,
    }


def singly_linked_list_steps(values):
    steps = [make_list_step([], "Start with head = null.")]
    current = []

    for index, value in enumerate(values):
        current.append(value)
        steps.append(make_list_step(current, f"Create node {value}.", active=[index], linked_until=index - 1))
        if index == 0:
            steps.append(make_list_step(current, f"Head now points to {value}.", active=[0], linked_until=0))
        else:
            steps.append(make_list_step(current, f"Set node {values[index - 1]}.next to {value}.", active=[index - 1, index], linked_until=index))

    return steps + [make_list_step(current, "Singly linked list is ready: each node points to the next node.", linked_until=len(current) - 1)]


def doubly_linked_list_steps(values):
    steps = [make_list_step([], "Start with head = null and tail = null.")]
    current = []

    for index, value in enumerate(values):
        current.append(value)
        steps.append(make_list_step(current, f"Create node {value} with prev and next pointers.", active=[index], linked_until=index - 1))
        if index == 0:
            steps.append(make_list_step(current, f"Head and tail both point to {value}.", active=[0], linked_until=0))
        else:
            steps.append(
                make_list_step(
                    current,
                    f"Connect {values[index - 1]}.next to {value} and {value}.prev back to {values[index - 1]}.",
                    active=[index - 1, index],
                    linked_until=index,
                )
            )

    return steps + [make_list_step(current, "Doubly linked list is ready: nodes can move forward and backward.", linked_until=len(current) - 1)]


def circular_linked_list_steps(values):
    steps = [make_list_step([], "Start with head = null. A circular list will not end at NULL after it is complete.")]
    current = []

    for index, value in enumerate(values):
        current.append(value)
        steps.append(make_list_step(current, f"Create node {value}.", active=[index], linked_until=index - 1))
        if index == 0:
            steps.append(make_list_step(current, f"Head points to {value}. With one node, tail.next can point back to head.", active=[0], linked_until=0, circular=True))
        else:
            steps.append(make_list_step(current, f"Set {values[index - 1]}.next to {value}; this builds the normal forward chain.", active=[index - 1, index], linked_until=index))

    if current:
        steps.append(make_list_step(current, f"Now connect tail {current[-1]}.next back to head {current[0]}. This creates the circle.", active=[0, len(current) - 1], linked_until=len(current) - 1, circular=True))

    return steps + [make_list_step(current, "Circular linked list is ready: following next from the tail returns to the head, so there is no NULL end.", linked_until=len(current) - 1, circular=True)]


def make_stack_step(stack, message, active=None, result=None):
    return {
        "stack": stack[:],
        "message": message,
        "active": active,
        "result": result,
        "top": len(stack) - 1 if stack else None,
        "min": min(stack) if stack else None,
        "max": max(stack) if stack else None,
    }


def queue_make_step(capacity, buffer, front, rear, size, message, active=None):
    return {
        "capacity": capacity,
        "buffer": buffer[:],
        "front": front,
        "rear": rear,
        "size": size,
        "active": active or [],
        "message": message,
    }


def queue_operation_steps(capacity, values):
    q = [None] * capacity
    front = 0
    rear = -1
    size = 0
    steps = [queue_make_step(capacity, q, front, rear, size, "Start with an empty queue.")]

    def current_indices():
        if size == 0:
            return []
        return list(range(front, front + size))

    for v in values:
        # Enqueue
        if size == capacity:
            steps.append(queue_make_step(capacity, q, front, rear, size, "Overflow: queue is full.", active=current_indices()))
            break

        rear += 1
        q[rear] = v
        size += 1
        steps.append(queue_make_step(capacity, q, front, rear, size, f"Enqueue {v}: place it at the rear.", active=[rear]))

    # Dequeue all to show behavior
    while size > 0:
        idx = front
        v = q[idx]
        steps.append(queue_make_step(capacity, q, front, rear, size, f"Dequeue: remove {v} from the front.", active=[idx]))
        q[idx] = None
        front += 1
        size -= 1
        rear = rear if size > 0 else -1
        steps.append(queue_make_step(capacity, q, front, rear, size, "After removal, update front/rear pointers."))

    return steps


def circular_queue_operation_steps(capacity, values):
    q = [None] * capacity
    front = -1  # EMPTY condition: front == -1
    rear = -1
    size = 0

    def is_full(front_i, rear_i, size_i):
        # FULL requirement: (rear + 1) % size == front
        # Note: for correctness, we use capacity in the modulo arithmetic.
        return size_i == capacity

    def display_active():
        if size == 0:
            return []
        return [((front + i) % capacity) for i in range(size)]

    steps = [
        {
            **queue_make_step(capacity, q, front, rear, size, "Start with an empty circular queue."),
            "op": "reset",
            "activeRear": None,
            "activeFront": None,
            "wrapAround": False,
        }
    ]

    for v in values:
        if is_full(front, rear, size):
            steps.append(
                {
                    **queue_make_step(
                        capacity, q, front, rear, size, "Queue full: cannot enqueue.", active=display_active()
                    ),
                    "op": "enqueue",
                    "activeRear": None,
                    "activeFront": None,
                    "wrapAround": False,
                }
            )
            break

        prev_rear = rear
        prev_front = front

        if size == 0:
            # first insert
            rear = 0
            front = 0
        else:
            rear = (rear + 1) % capacity
            # Wrap-around if rear lands at 0 while capacity>0
            # (required: animate rear moving last -> 0 when needed)

        q[rear] = v
        size += 1

        wrap = (prev_rear != -1) and (prev_rear == capacity - 1) and (rear == 0)
        msg = (
            f"Inserted {v} at rear index 0 after wrap-around"
            if wrap
            else f"Inserted {v} at rear index {rear}."
        )

        steps.append(
            {
                **queue_make_step(capacity, q, front, rear, size, msg, active=[rear]),
                "op": "enqueue",
                "activeRear": rear,
                "activeFront": None,
                "wrapAround": wrap,
            }
        )

    while size > 0:
        idx = front
        v = q[idx]
        steps.append(
            {
                **queue_make_step(
                    capacity,
                    q,
                    front,
                    rear,
                    size,
                    f"Removed element from front (dequeue): {v}",
                    active=[idx],
                ),
                "op": "dequeue",
                "activeRear": None,
                "activeFront": idx,
                "wrapAround": (front == capacity - 1),
            }
        )

        q[idx] = None
        size -= 1

        if size == 0:
            front = -1
            rear = -1
        else:
            prev_front = front
            front = (front + 1) % capacity
            wrap = (prev_front == capacity - 1) and (front == 0)
            steps.append(
                {
                    **queue_make_step(
                        capacity,
                        q,
                        front,
                        rear,
                        size,
                        "After removal, advanced front circularly." ,
                    ),
                    "op": "dequeue",
                    "activeRear": None,
                    "activeFront": idx,
                    "wrapAround": wrap,
                }
            )
            continue

    return steps



def queue_steps_from_payload(capacity, values):
    return queue_operation_steps(capacity, values)


def circular_queue_steps_from_payload(capacity, values):
    return circular_queue_operation_steps(capacity, values)


def stack_operation_steps(values):
    stack = []
    steps = [make_stack_step(stack, "Start with an empty stack.")]


    for value in values:
        steps.append(make_stack_step(stack, f"Prepare to push {value}.", result=value))
        stack.append(value)
        steps.append(make_stack_step(stack, f"Push {value} onto the top of the stack.", active=len(stack) - 1, result=value))
        steps.append(make_stack_step(stack, f"Current min is {min(stack)} and current max is {max(stack)}.", active=len(stack) - 1))

    if stack:
        steps.append(make_stack_step(stack, f"top() returns {stack[-1]}.", active=len(stack) - 1, result=stack[-1]))
        steps.append(make_stack_step(stack, f"getMin() returns {min(stack)}.", active=stack.index(min(stack)), result=min(stack)))
        steps.append(make_stack_step(stack, f"getMax() returns {max(stack)}.", active=stack.index(max(stack)), result=max(stack)))

        popped = stack.pop()
        steps.append(make_stack_step(stack + [popped], f"pop() removes the top value {popped}.", active=len(stack), result=popped))
        steps.append(make_stack_step(stack, f"After pop, the stack has {len(stack)} value(s).", active=len(stack) - 1 if stack else None))

    if stack:
        steps.append(make_stack_step(stack, f"top() now returns {stack[-1]}.", active=len(stack) - 1, result=stack[-1]))
        steps.append(make_stack_step(stack, f"getMin() now returns {min(stack)}.", active=stack.index(min(stack)), result=min(stack)))
        steps.append(make_stack_step(stack, f"getMax() now returns {max(stack)}.", active=stack.index(max(stack)), result=max(stack)))
    else:
        steps.append(make_stack_step(stack, "Stack is empty, so top, getMin, and getMax are unavailable."))

    return steps
