---
title: "SekaiCTF 2024 writeups"
date: "2024-08-25"
---

My writeups for SekaiCTF 2024

## CalcQL

> Use CodeQL to find the function that returns 42.
>
> Author: irogir

Nice, a chance to use CodeQL.

### Challenge

Write a CodeQL query that detects functions that return 42. The CodeQL
query must run on Sekai's challenge platform over 2 files, that are
randomly generated and ~3500 lines long.

The backend codebase and Dockerfile were provided to the participants
for simplicity's sake, and CodeQL is available publicly if you dare to
install it.

Here's a sample of one of those generated challenge files:

```python
def entry_c9d32a0799c677bada16():
    return fn_41b2662cc07e9d415aad() + fn_dc74661a89fa9d7b781c() + fn_a5069863a1ada4cf4f31() + fn_75ac78910b7fb9f71882() + fn_9137f86648eb1cd605c1() + fn_3f62afd14b26d481a243() + fn_1db0ac419dffc1ffbf19() + 2 + 1 + 2 + 1

def entry_b0a098a549a34c848bd2():
    return fn_b3e40891831cb0d37873() + fn_1f2290ad8a4960f0965b() + fn_a7cf0d75d6e192bcb819() + fn_f7037d3e4977b7e94d1c() + fn_3d1903c8851663911b6f() + fn_589da486391aaea98883() + fn_06311901fd087a41787b() + fn_19fb39766eeca40a2b07() + fn_20859e1436314cf04f76() + 5 + 1

def fn_7c4eb1a35da5224979b0():
    return fn_1727ecb33f8b858b5175() + 2 + fn_3f62afd14b26d481a243() + 1 + 2 + 2 + 1 + 2 + 2 + 2 + 1 + 1
...
```

### Solution

This is the solution that printed the flag in the live environment
around 30 seconds after the end time. Not because it was slow or
anything, just we got it working 5 minutes before the end of the CTF.

```codeql
/**
 * Alerts on functions that return 42 and whose name starts with "entry_".
 *
 * Assumes that:
 * - your functions are one-liners with a return statement
 * - your return statement's inner expression is a binary expression
 * - binary expressions are all add expressions
 * - operands are either function call expressions without indirection, other binary expressions, or integer literals
 *
 * @name summer2
 * @kind problem
 * @problem.severity warning
 * @id python/example/hello-world
 */

import python

int value(Expr e) {
  e instanceof IntegerLiteral and result = e.(IntegerLiteral).getValue()
  or
  e instanceof BinaryExpr and
  e.(BinaryExpr).getOp() instanceof Add and
  result = value(e.(BinaryExpr).getLeft()) + value(e.(BinaryExpr).getRight())
  or
  e instanceof Call and
  exists(Function f |
    f.getName() = e.(Call).getFunc().(Name).getId() and
    result = value(f.getBody().getItem(0).(Return).getASubExpression())
  )
}

from Function g
where
  value(g.getBody().getItem(0).(Return).getASubExpression()) = 42 and
  g.getName().matches("entry_%")
select g, "called " + g.getName()
```

Now, before arriving at the solution, here's where we started:

### Setting up VS Code to run CodeQL

1. Install the CodeQL VS Code extension
2. Write a small python test file with a few simple function definitions
3. Run `CodeQL: Create query`
4. It triggers an internal installation of CodeQL - use it
5. Find the path of ^ above CodeQL and use it to generate a code database into a nearby folder
6. Right click the folder in the file browser and select `CodeQL: Set current database`
6. Run `CodeQL: Create query` again
7. See that it dumps some files and an `example.ql` inside
8. Open `example.ql`, type Cmd-Shift-P and run `CodeQL: Run query on selected database`

Hey presto, it executes!

Use the CodeQL side button in the left sidebar to get about 20% of an ergonomic query editor.

### Editing the query

There are 2 types of queries that you can try for this challenge: queries, and path queries.
Queries look like logic programming meets SQL, and execute over the AST.

Path queries look similar but execute over the data flow graph. Importantly, path queries
are *not* the fit here - they can easily find you whether a start and end point meet, but
will not easily give you the path between them.

Throughout the challenge, you have to remember that this is a predicate logic based language, so
think of the entire system as a "narrowing down" of the possible values a variable can have.
It also helps to go iteratively, as the way to search some things can be quite upside down
when compared to "normal programming".

Here's the first try to get something working and test the IDE. Read it like this:

1. Look at all possible statements in the code file
  * Keep only statements that are instanceof Return
  * => goes into variable `s`
3. Look at all possible integer literals
  * Keep only integer literals that are inside the aforementioned statements `s`
  * ... and whose value is 42
4. Keep only such Return statements where we found one of those integer literals inside
5. Return 2 columns: (1) the code fragment that matched the alert, and (2) a message to go with it

```codeql
/**
 * This is an automatically generated file
 *
 * @name Hello world
 * @kind problem
 * @problem.severity warning
 * @id python/example/hello-world
 */

import python

from Stmt s
where
  s instanceof Return and
  exists(IntegerLiteral i | s.contains(i) and i.getValue() = 42)
select s, "lol found it"
```

Moving on, the next thing was to try and build a predicate logic function
that can evaluate those expressions. The VS Code CodeQL AST viewer can help a bit,
but it doesn't reload automatically when the source file changes.

1. Open a CodeQL file
2. Make it return at least 1 finding
3. Run the query on the current database
4. Click on the location of the finding in the CodeQL Query Results pane
5. You are now viewing a copy of the original script, mounted from a zip file
6. You can only run Cmd-Shift-P `CodeQL: View AST` on these mounted zipped source files
7. Now the left panel "AST Viewer" works
8. If you change the source file, you have to delete and regenerate the database, and
   run `CodeQL: Restart query server`, and click the clear button on the AST view. It sometimes
   still doesn't work.

This next one works but doesn't resolve function calls. Almost there.

```codeql
/**
 * This is an automatically generated file
 *
 * @name summer
 * @kind problem
 * @problem.severity warning
 * @id python/example/hello-world
 */

import python
import semmle.python.dataflow.new.DataFlow

int value(Expr e) {
  if e instanceof IntegerLiteral
  then result = e.(IntegerLiteral).getValue()
  else
    if e instanceof BinaryExpr and e.(BinaryExpr).getOp() instanceof Add
    then result = value(e.(BinaryExpr).getLeft()) + value(e.(BinaryExpr).getRight())
    else
      if e instanceof Call
      then result = 999
      else result = 0
}

from DataFlow::Node input
where
  input.asExpr().(BinaryExpr).getOp() instanceof Add and
  value(input.asExpr()) = 42
select input.asExpr(), "This is a binary addition expression."
```

After some attempts, it was possible to break the problem down to individual steps.

### Evaluating a BinaryExpr

This can be done simply by a recursive value-returning predicate:

```codeql
// BinaryExpr
//    Op (Add, ...)
//    Left
//       Expr
//    Right
//       Expr
int value(Expr e) {
  e instanceof IntegerLiteral and result = e.(IntegerLiteral).getValue()
  or
  e instanceof BinaryExpr and
  e.(BinaryExpr).getOp() instanceof Add and
  result = value(e.(BinaryExpr).getLeft()) + value(e.(BinaryExpr).getRight())
  // Function calls...??? Read more!
}
```

### Getting the Return Expression of a Function

This was tricky and makes a lot of assumptions but it worked fine for the chall:

```codeql
// Function f
//    Body
//      Stmt[]
//        [0]
//          Return
//             [Expr]
f.getBody().getItem(0).(Return).getASubExpression()
```

### Converting a Function Call to a Function

Took a while to figure out how to make function calls work in a
quick and dirty way:

*  a `Call` node appears to consist of a `Name` node and a `Arguments` node
* `e.(Call).getFunc()` gives you the `Name` of the function, as a type `Expr` so you need to downcast
* In Python mode, you can't dig through a call expression to the function it is referring to.
* Even `pointsTo` didn't help much sadly, not sure why it didn't work.
* Maybe we can look at all functions, get their names, and look at the call expression and figure out what
  the name of the function is, and put the two together?

Here's how this clause could look like:

```codeql
exists(Function f |
  f.getName() = e.(Call).getFunc().(Name).getId()
)
```

### Putting it all together

Now how to make it useful for us? It is possible to assign a result of a predicate inside
the aggregate clause for some reason. This lets us write the 3rd clause for our value() function:

```codeql
int value(Expr e) {
  //
  // Integer literals - easy
  e instanceof IntegerLiteral and result = e.(IntegerLiteral).getValue()
  or
  //
  // Binary expressions - left + right
  e instanceof BinaryExpr and
  e.(BinaryExpr).getOp() instanceof Add and
  result = value(e.(BinaryExpr).getLeft()) + value(e.(BinaryExpr).getRight())
  or
  //
  // Call expressions - a bit cursed
  // "func2()" == Call { Name { getId() = "func2" } }
  // "def func2(): return 2 + 3" == Function { getName() = "func2", Body { Stmt[0] { Return { Expr ... } } } }
  e instanceof Call and
  exists(Function f |
    f.getName() = e.(Call).getFunc().(Name).getId() and
    result = value(f.getBody().getItem(0).(Return).getASubExpression())
  )
}
```

And now nothing left to do than to utilise this function in our query.

```query
// find all functions
from Function g
where
  // get the return statement,
  // calculate the value,
  // check if it's 42
  // and that the function name matches entry_...
  value(g.getBody().getItem(0).(Return).getASubExpression()) = 42 and
  g.getName().matches("entry_%")
select g, "called " + g.getName()
```

The challenge check scripts were generating 2 arbitrary Python scripts
on boot, and allowed you to upload a CodeQL file that would be run over these scripts.
The CodeQL file was supposed to output a list of locations where the query matched,
and the right function name would trigger the flag to be displayed.

### Summary

A brain bending challenge for sure, due to the logic programming involved. Probably not
the best fit to coerce Java-like syntax onto a logic programming language, but after
getting over the initial hump, it was a fun challenge to solve.

Also, CodeQL will come in handy as a skill in the future.
