# 🛰️ Mars Rover

![](kata.png)

## Problem

NASA is landing a robotic rover on a rectangular plateau on Mars.  
This plateau must be explored systematically so that the rover’s on-board cameras can survey the terrain and send images back to Earth.

A rover’s position is represented by:

- Two integers (**X**, **Y**) indicating its coordinates, and
- A letter indicating its current heading:
  - **N** (North)
  - **E** (East)
  - **S** (South)
  - **W** (West)

The plateau is divided into a grid, and the rover moves across it based on simple navigation commands.

For example, a position of `0 0 N` means the rover is at the bottom-left corner, facing North.

---

## Instructions

NASA can send the following commands to the rover:

- `L` ➔ Turn 90 degrees **left** without moving from the current spot.
- `R` ➔ Turn 90 degrees **right** without moving from the current spot.
- `M` ➔ Move **forward** one grid point in the direction it is facing.

> **Important**:  
> Moving North from `(x, y)` goes to `(x, y+1)`.  
> Moving East from `(x, y)` goes to `(x+1, y)`, and so on.

---

## Input

The input consists of:

1. **First parameter**: The rover’s **starting position**: two integers and a letter (e.g., `1 2 N`).

2. **Second parameter**: A string of **movement instructions** (e.g., `LMLMLMLMM`).

The rover processes all instructions in sequence.

---

## Output

After executing all the commands, the rover reports its **final coordinates and heading**.

---

## Example

| Starting Position | Instructions | Expected Output |
| :---------------- | :----------- | :-------------- |
| 1 2 N             |              | 1 2 N           |
| 1 2 N             | L            | 1 2 W           |
| 1 2 W             | L            | 1 2 S           |
| 1 2 S             | L            | 1 2 E           |
| 1 2 E             | L            | 1 2 N           |
| 1 2 N             | R            | 1 2 E           |
| 1 2 E             | R            | 1 2 S           |
| 1 2 S             | R            | 1 2 W           |
| 1 2 W             | R            | 1 2 N           |
| 1 2 N             | M            | 1 3 N           |
| 1 2 E             | M            | 2 2 E           |
| 1 2 S             | M            | 1 1 S           |
| 1 2 W             | M            | 0 2 W           |
| 1 2 N             | LMLMLMLMM    | 1 3 N           |
| 3 3 E             | MMRMMRMRRM   | 5 1 E           |

---

# 🎯 Your Mission

You have been given a **working but fragile** codebase that controls a **single** rover.

Your goal:

- **Refactor** the code to make it clean, expressive, and easy to maintain.
- Prepare the code for **future enhancements**.
- Eliminate technical debt, improve readability, and structure it to allow **easily adding new features** later.

> 🧠 **Hint**:  
> Future missions may require **handling multiple rovers** at once.  
> Your design should naturally evolve toward making this possible.

✅ **Do not change the existing behavior.**  
✅ **All existing tests must continue to pass.**

---

# 🌟 Good luck, engineer of Mars!

Craft code that's ready for exploration... and evolution! 🚀
