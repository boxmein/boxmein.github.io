---
title: "Using PID to drive like Vin Diesel"
date: "2017-08-06"
categories: 
  - "carnd"
---

I just finished the PID controller project of the Udacity Self-Driving Car Nanodegree!

https://www.youtube.com/watch?v=SrdFTXpXkR4

The challenge was simple - make this car go around the track, when the simulator will tell you how far off you are.

To do this, especially since the simulator tells us an error metric, I needed to build a PID controller.

A PID controller is a simple function that relates the error (how off we are from our trajectory) to a control variable (throttle/steering/...).

Here is how it works:

$latex f(e) = - \\tau\_p \\cdot e - \\tau\_i \\cdot \\sum e - \\tau\_d \\cdot \\frac{\\delta e}{\\delta t}$

To start off, the control variable should depend on the error with plain multiplication (**proportion**). This ensures the most basic requirement - the steering wheel's angle will depend on the error.

Secondly, the control variable should depend on all past errors combined. (**integral**). This ensures that when the car's steering system is imprecise, any persistent errors will be corrected.

Thirdly, the control variable should depend on the error's change over time. (**derivative**). This ensures that the steering wheel's correction smooths out the closer we get to zero error. This is a simple way to prevent over-correction and oscillation.

Together, their powers combined, they are captain Planet a PID controller.

The challenge now is to figure out what proportions to use - the different $latex \\tau $ values.

To do this, an easy way we were taught in Udacity was _twiddle_ (or coordinate ascent). Run the simulator, sum up the error over a few hundred cycles, then poke one of those taus up or down, and see if it brings the error down. It assumes that the three parameters will independently bring the whole run closer to optimal values.

In the case of this project, there's no easy way to trigger a run - its event oriented architecture meant that the code had to respond to upstream events. To still implement twiddle, I made the following changes architecturally:

- Keep track of Twiddle State (best error, sum-of-squares error for comparison, an "enabled" flag to keep throttle untwiddled, a step counter, and a "state" variable (what part of the loop should go next?) in the PID instance.
- Implement the twiddle algorithm in the UpdateError() PID method
- Run the twiddle algorithm only every \[events\] steps, but aggregate the error for all the steps
- After twiddle runs, reset the summed error, CTE variables, set the step number to 1, and reset the simulator (by sending it a "42\[\\"reset\\",{}\]".)

It took me about 450 runs to get to the parameters I used. A single run took around 5 seconds (300 telemetry events), then I upped it to 10 (1200 telemetry events), and then to 30 (2000 telemetry events). Note that during all that, the speed controller must stay the same - the parameters depend on the speed the car is moving.

This was a really fun project - implementing the optimization was interesting and very compelling. I had to think outside the box to come up with an architectural solution to fit twiddle in somewhere.

[Code is on GitHub](https://github.com/boxmein/CarND-PID-Control-Project)

As a bonus for making it, here's a video of the PID controller crashing the car and going nuts:

https://youtu.be/OwdC3O6RZc8
