# Tiny, tiny mazes

Alice found herself very tiny and wandering around Wonderland.
Even the grass around her seemed like a maze.

This is a tiny maze solver.

A maze is represented by a matrix

```python
[
 [S 0 1]
 [1 0 1]
 [1 0 E]
]
```


S : start of the maze
E : end of the maze
1 : This is a wall that you cannot pass through
0 : A free space that you can move through.

The goal is the get to the end of the maze.
A solved maze will have an x in the start, the path,
and the end of the maze, like this.

```python
[
    [x x 1]
    [1 x 1]
    [1 x x]
]
```

## Requirements

You should use [NodeJS v8](https://nodejs.org/en/download/) or above.

Install assignment dependencies:

```bash
npm install
```

## Linting your code

Check your code for style issues:

```bash
npm run lint
```

## Making the test suite pass

Run Jest in watch mode, with coverage info like this:

```bash
npm run watch:cover
```

In the test suite all tests but the first have been skipped.

Once you get a test passing, you can enable the next one by
changing `xtest` to `test`.
