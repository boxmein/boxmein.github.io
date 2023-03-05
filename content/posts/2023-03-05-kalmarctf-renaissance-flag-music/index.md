---
title: "KalmarCTF 2023 - renaissance-flag-music - writeup"
date: "2023-03-05"
---

## What we did

It was mostly google-fu or having sufficient previous background knowledge (e.g.
someone who has studied music or has played guitar)

* Detect that WeirdTable.png maps chords to letters 
* Detect that FlagMusic.png is some musical notation 
  ... renaissance music? 
  ... look up renaissance notation 
    => find French lute tablature 
       so it's essentially a French lute tab 
       empty=X, A=open, B=1st fret, C=2nd, ...
       ok so... what is the tuning?

* French lutes are tuned how? 
  * Find different info on lute tuning 
    * Hint "10 course" takes us to a table
      https://www.lutesociety.org/pages/lute-tuning 10 course Renaissance lute 
      in G

* How you play 6 chord music on a 10 chord lute?
  * Turns out it's just the first 6, ez 

Start mapping letters 

Example: 

```
   Cm  "L"
G  a=0
D  b=1
A  d=3
F  c=2
C  a=0
G
F
Eb
D
C 
```

Spend time mapping letters (`@taka` mapped the letters)

LOOKMOMIAMAMUSICCOMPOSER

Add the flag format manually

kalmar{LOOKMOMIAMAMUSICCOMPOSER}

Just a few of the links we visited:

https://www.lutesociety.org/pages/lute-tuning
https://www.lutesociety.org/pages/about-the-lute
https://www.cs.dartmouth.edu/~wbc/lute/tab-intro.html
