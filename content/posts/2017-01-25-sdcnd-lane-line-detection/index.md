---
title: "SDCND: Lane Line Detection"
date: "2017-01-25"
categories: 
  - "carnd"
coverImage: "solidyellowcurve.png"
---

The self-driving Car Engineer Nanodegree (I'll just use SDCND from here) is a huge Udacity course about self-driving cars starting from vision ending with robotics. I applied in October, having an incredible opportunity to participate since Jan 19.

The first project of the SDCND is about lane line detection. This is a simple experiment in computer vision using straight line detection and averaging to detect the left and right lane separators.

Given a video filmed from the front and center of the car, where are the left and right lane lines? The video is filmed on sunny Californian roads with clear and contrasting lane lines.

We used edge detection and Hough transforms to find the most possible points that align into a line, keeping the longest and straightest candidates for the lane lines. We also used a simple region-of-interest mask to cut off areas that don't really matter when finding lanes on the road, such as the sky.

There were a few pitfalls along the way: having a wide region meant that the edge of the road itself was picked up, as well as a reflection on the windshield. An easy way to clear out low-contrast areas was to run a low-radius Gaussian blur on the entire image.

After finding lines with the Hough transform, we can split them into two buckets: one with a positive rise (the right lane) and with a negative rise (the left lane). Notably, the Hough line will have a positive dy/dx because the y coordinate _increases_ as the line itself is lower.

With said buckets, we can fit straight lines to the coordinates using Numpy and draw some lines on the image itself.

The first project was a lot of fun, although very heuristic - pretty much all of the parameters of the model (edge detection thresholds, polar Hough transform parameters) I based on what looked good, because we weren't taught a more deterministic method of doing it. In future projects, I bet this will be far better however!

I can't wait!
