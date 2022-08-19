---
title: "Words that don't share letters with US state names"
date: "2013-09-17"
tags: 
  - "fun"
  - "programming"
  - "ruby"
---

A while ago an interesting question was posed in a comment thread, to which I, being someone not from the US who couldn't remember state names, wanted an answer to in the easiest way possible.

So what do I do? I write a script for it. In Ruby.

The script follows:

\[gist https://gist.github.com/boxmein/6136291 /\]

Really basic. I go through each of the arguments passed in the command line, each of the state names and just try if something doesn't share letters with a state it outputs both strings.
